/**
 * Phone number utilities for formatting and validation
 * - E.164 format for Twilio API (+1XXXXXXXXXX)
 * - User-friendly display format ((XXX) XXX-XXXX)
 */

/**
 * Converts any phone input to E.164 format for Twilio
 * Assumes US numbers if no country code provided
 * @param phone - Phone number in any format
 * @returns E.164 formatted phone number (+1XXXXXXXXXX)
 */
export function toE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If already has country code (11 digits starting with 1), add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If already in E.164 format with +, return as-is
  if (phone.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  // Return with +1 prefix as best guess
  return `+1${digits.slice(-10)}`;
}

/**
 * Formats phone number for user-friendly display
 * @param phone - Phone number in any format
 * @returns Formatted phone number ((XXX) XXX-XXXX)
 */
export function formatPhoneDisplay(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Get last 10 digits (ignore country code for display)
  const last10 = digits.slice(-10);

  if (last10.length !== 10) {
    return phone; // Return original if can't format
  }

  const areaCode = last10.slice(0, 3);
  const prefix = last10.slice(3, 6);
  const lineNumber = last10.slice(6, 10);

  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

/**
 * Formats phone number as user types (live formatting)
 * @param value - Current input value
 * @returns Formatted value for display in input
 */
export function formatPhoneInput(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Get the last 10 digits (handles E.164 format like +19185205115)
  // If 11+ digits and starts with 1, it's likely a country code
  const last10 = digits.length > 10 ? digits.slice(-10) : digits.slice(0, 10);

  // Progressive formatting as user types
  if (last10.length === 0) {
    return '';
  }
  if (last10.length <= 3) {
    return `(${last10}`;
  }
  if (last10.length <= 6) {
    return `(${last10.slice(0, 3)}) ${last10.slice(3)}`;
  }
  return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
}

/**
 * Validates phone number has enough digits
 * @param phone - Phone number to validate
 * @returns true if valid US phone number
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Accept 10 digits or 11 digits starting with 1
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

/**
 * Extracts digits from phone number
 * @param phone - Phone number in any format
 * @returns Just the digits
 */
export function getDigitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Compare two phone numbers (handles different formats)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if phones match (last 10 digits)
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  const digits1 = phone1.replace(/\D/g, '').slice(-10);
  const digits2 = phone2.replace(/\D/g, '').slice(-10);
  return digits1 === digits2 && digits1.length === 10;
}
