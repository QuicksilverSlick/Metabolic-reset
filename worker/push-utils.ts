/**
 * Web Push Notification Utilities
 * Uses VAPID for authentication with push services
 */

import type { Env } from './core-utils';
import { PushSubscriptionEntity } from './entities';

// VAPID public key - this is shared with the frontend
// Generate new keys if needed: npx web-push generate-vapid-keys
export const VAPID_PUBLIC_KEY = 'BAjJ5_J0ioGdqtPuKCjY8ANOE_OrqL1sZ_FfGOneTn_UpklxhZ7jI2K_VP_GaA4JGkHW2QuVcWyVGUkzDZzBdbk';

// Interface for push payload
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to a specific subscription endpoint
 * Uses the Web Push protocol with VAPID authentication
 */
async function sendPushToEndpoint(
  env: Env,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    // Get VAPID private key from environment
    const vapidPrivateKey = (env as any).VAPID_PRIVATE_KEY;
    if (!vapidPrivateKey) {
      console.warn('[Push] VAPID_PRIVATE_KEY not configured - push disabled');
      return { success: false, error: 'Push notifications not configured' };
    }

    // Web Push requires specific encryption - we'll use a simplified approach
    // For production, consider using a library like web-push

    // Create JWT for VAPID authentication
    const vapidToken = await createVapidToken(
      subscription.endpoint,
      'mailto:admin@28dayreset.com',
      vapidPrivateKey
    );

    // Encrypt the payload
    const encryptedPayload = await encryptPayload(
      JSON.stringify(payload),
      subscription.keys.p256dh,
      subscription.keys.auth
    );

    // Send to push service
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${vapidToken.token}, k=${VAPID_PUBLIC_KEY}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400', // 24 hours
        'Urgency': 'normal'
      },
      body: encryptedPayload
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }

    // Handle errors
    if (response.status === 404 || response.status === 410) {
      // Subscription is gone - should be removed
      return { success: false, statusCode: response.status, error: 'Subscription expired' };
    }

    const errorText = await response.text();
    return { success: false, statusCode: response.status, error: errorText };
  } catch (error: any) {
    console.error('[Push] Error sending push:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create VAPID JWT token for push service authentication
 */
async function createVapidToken(
  endpoint: string,
  subject: string,
  privateKeyBase64: string
): Promise<{ token: string }> {
  const audience = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

  const header = { alg: 'ES256', typ: 'JWT' };
  const payload = { aud: audience, exp, sub: subject };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const keyData = base64UrlToArrayBuffer(privateKeyBase64);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = arrayBufferToBase64Url(signature);

  return { token: `${unsignedToken}.${signatureB64}` };
}

/**
 * Encrypt payload using Web Push encryption (aes128gcm) per RFC 8291
 * Implements the full encryption required by push services
 */
async function encryptPayload(
  payload: string,
  p256dhKeyBase64: string,
  authSecretBase64: string
): Promise<ArrayBuffer> {
  const payloadBytes = new TextEncoder().encode(payload);

  // Decode subscriber's public key (p256dh) and auth secret
  const subscriberPublicKeyBytes = base64UrlToArrayBuffer(p256dhKeyBase64);
  const authSecret = base64UrlToArrayBuffer(authSecretBase64);

  // Import subscriber's public key
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );

  // Generate ephemeral key pair for this message
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export local public key for the header
  const localPublicKeyBytes = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);

  // Derive shared secret using ECDH
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Generate a random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive IKM (Input Keying Material) from auth secret and shared secret
  // info = "WebPush: info" || 0x00 || subscriber_public_key || local_public_key
  const ikm = await hkdfDerive(
    new Uint8Array(authSecret),
    new Uint8Array(sharedSecret),
    buildInfo('WebPush: info', new Uint8Array(subscriberPublicKeyBytes), new Uint8Array(localPublicKeyBytes)),
    32
  );

  // Derive content encryption key (CEK) and nonce using the salt
  // PRK from salt + IKM
  const prk = await hkdfExtract(salt, ikm);

  // CEK: HKDF-Expand(PRK, "Content-Encoding: aes128gcm" || 0x00, 16)
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cek = await hkdfExpand(prk, cekInfo, 16);

  // Nonce: HKDF-Expand(PRK, "Content-Encoding: nonce" || 0x00, 12)
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonce = await hkdfExpand(prk, nonceInfo, 12);

  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Add padding delimiter (0x02) to payload per RFC 8291
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 0x02; // Padding delimiter

  // Encrypt with AES-128-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    paddedPayload
  );

  // Build the aes128gcm content coding header:
  // salt (16 bytes) || rs (4 bytes, record size) || idlen (1 byte) || keyid (local public key, 65 bytes)
  const recordSize = 4096;
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  // Record size as 4-byte big-endian
  header[16] = (recordSize >> 24) & 0xff;
  header[17] = (recordSize >> 16) & 0xff;
  header[18] = (recordSize >> 8) & 0xff;
  header[19] = recordSize & 0xff;
  // Key ID length
  header[20] = 65;
  // Local public key as key ID
  header.set(new Uint8Array(localPublicKeyBytes), 21);

  // Combine header and ciphertext
  const result = new Uint8Array(header.length + ciphertext.byteLength);
  result.set(header);
  result.set(new Uint8Array(ciphertext), header.length);

  return result.buffer;
}

/**
 * Build info parameter for HKDF
 */
function buildInfo(type: string, subscriberKey: Uint8Array, localKey: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const info = new Uint8Array(typeBytes.length + 1 + subscriberKey.length + localKey.length);
  info.set(typeBytes);
  info[typeBytes.length] = 0x00;
  info.set(subscriberKey, typeBytes.length + 1);
  info.set(localKey, typeBytes.length + 1 + subscriberKey.length);
  return info;
}

/**
 * HKDF-Extract: PRK = HMAC-SHA256(salt, IKM)
 */
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const prk = await crypto.subtle.sign('HMAC', key, ikm);
  return new Uint8Array(prk);
}

/**
 * HKDF-Expand: OKM = HMAC-SHA256(PRK, info || 0x01) truncated to length
 */
async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    prk,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const input = new Uint8Array(info.length + 1);
  input.set(info);
  input[info.length] = 0x01;

  const okm = await crypto.subtle.sign('HMAC', key, input);
  return new Uint8Array(okm).slice(0, length);
}

/**
 * Full HKDF derive (extract + expand)
 */
async function hkdfDerive(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const prk = await hkdfExtract(salt, ikm);
  return hkdfExpand(prk, info, length);
}

// Helper: Convert base64url to ArrayBuffer
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binaryString = atob(base64 + padding);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper: Convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Send push notification to all subscriptions for a user
 * Returns count of successful/failed deliveries
 */
export async function sendPushToUser(
  env: Env,
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await PushSubscriptionEntity.findByUser(env, userId);

  if (subscriptions.length === 0) {
    console.log(`[Push] No subscriptions for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  // Add default icon if not provided
  const fullPayload: PushPayload = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    ...payload
  };

  await Promise.all(subscriptions.map(async (sub) => {
    const result = await sendPushToEndpoint(env, sub, fullPayload);

    if (result.success) {
      await PushSubscriptionEntity.recordSuccess(env, sub.endpoint);
      sent++;
    } else {
      console.error(`[Push] Failed to send to ${sub.endpoint}:`, result.error);

      // Remove expired subscriptions
      if (result.statusCode === 404 || result.statusCode === 410) {
        await PushSubscriptionEntity.deleteByEndpoint(env, sub.endpoint);
      } else {
        await PushSubscriptionEntity.recordFailure(env, sub.endpoint);
      }
      failed++;
    }
  }));

  console.log(`[Push] Sent to user ${userId}: ${sent} success, ${failed} failed`);
  return { sent, failed };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  env: Env,
  userIds: string[],
  payload: PushPayload
): Promise<{ totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  await Promise.all(userIds.map(async (userId) => {
    const { sent, failed } = await sendPushToUser(env, userId, payload);
    totalSent += sent;
    totalFailed += failed;
  }));

  return { totalSent, totalFailed };
}
