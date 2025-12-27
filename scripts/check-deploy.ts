/**
 * Pre-deployment checker script
 *
 * This script validates that all required environment variables and configurations
 * are present before allowing a deployment to proceed. This prevents deploying
 * a broken build that could take down live payments or other critical features.
 *
 * Usage: npx tsx scripts/check-deploy.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message: string) {
  console.error(`${colors.red}${colors.bold}ERROR: ${message}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}${colors.bold}✓ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}${colors.bold}⚠ ${message}${colors.reset}`);
}

interface CheckResult {
  passed: boolean;
  message: string;
  critical: boolean;
}

const checks: CheckResult[] = [];

// ============================================================
// CHECK 1: Stripe Live Publishable Key
// ============================================================
function checkStripeLiveKey(): CheckResult {
  const envPath = path.join(process.cwd(), '.env');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    return {
      passed: false,
      message: 'No .env file found. Create one with VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...',
      critical: true,
    };
  }

  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  let stripeKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) continue;

    const match = trimmed.match(/^VITE_STRIPE_PUBLISHABLE_KEY\s*=\s*(.+)$/);
    if (match) {
      stripeKey = match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
      break;
    }
  }

  if (!stripeKey) {
    return {
      passed: false,
      message: 'VITE_STRIPE_PUBLISHABLE_KEY not found in .env file',
      critical: true,
    };
  }

  // Check if it's a live key (pk_live_) vs test key (pk_test_)
  if (stripeKey.startsWith('pk_test_')) {
    return {
      passed: false,
      message: `Stripe key is a TEST key (pk_test_...). For production, use a LIVE key (pk_live_...).\n` +
               `   Current key: ${stripeKey.substring(0, 12)}...${stripeKey.substring(stripeKey.length - 4)}\n` +
               `   \n` +
               `   To fix: Update .env with your live publishable key:\n` +
               `   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE`,
      critical: true,
    };
  }

  if (!stripeKey.startsWith('pk_live_')) {
    return {
      passed: false,
      message: `Invalid Stripe publishable key format. Key should start with 'pk_live_' for production.\n` +
               `   Current key: ${stripeKey.substring(0, 20)}...`,
      critical: true,
    };
  }

  // Valid live key
  return {
    passed: true,
    message: `Stripe LIVE key configured: ${stripeKey.substring(0, 12)}...${stripeKey.substring(stripeKey.length - 4)}`,
    critical: true,
  };
}

// ============================================================
// CHECK 2: Build Output Exists (optional pre-check)
// ============================================================
function checkBuildOutput(): CheckResult {
  const distPath = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    return {
      passed: true, // Not critical - build will create it
      message: 'No dist folder yet (will be created during build)',
      critical: false,
    };
  }

  return {
    passed: true,
    message: 'Build output directory exists',
    critical: false,
  };
}

// ============================================================
// CHECK 3: Wrangler Configuration
// ============================================================
function checkWranglerConfig(): CheckResult {
  const wranglerJsonc = path.join(process.cwd(), 'wrangler.jsonc');
  const wranglerJson = path.join(process.cwd(), 'wrangler.json');
  const wranglerToml = path.join(process.cwd(), 'wrangler.toml');

  if (fs.existsSync(wranglerJsonc) || fs.existsSync(wranglerJson) || fs.existsSync(wranglerToml)) {
    return {
      passed: true,
      message: 'Wrangler configuration found',
      critical: false,
    };
  }

  return {
    passed: false,
    message: 'No wrangler configuration file found (wrangler.jsonc, wrangler.json, or wrangler.toml)',
    critical: true,
  };
}

// ============================================================
// RUN ALL CHECKS
// ============================================================
function runChecks(): boolean {
  log('\n============================================================', 'cyan');
  log('  DEPLOYMENT PRE-FLIGHT CHECKS', 'cyan');
  log('============================================================\n', 'cyan');

  // Run all checks and collect results
  const results = [
    { name: 'Stripe Live Key', result: checkStripeLiveKey() },
    { name: 'Wrangler Config', result: checkWranglerConfig() },
    { name: 'Build Output', result: checkBuildOutput() },
  ];

  // Display results in order
  let hasErrors = false;
  let hasWarnings = false;

  for (const { result: check } of results) {
    if (check.passed) {
      logSuccess(check.message);
    } else if (check.critical) {
      logError(check.message);
      hasErrors = true;
    } else {
      logWarning(check.message);
      hasWarnings = true;
    }
  }

  log('\n============================================================', 'cyan');

  if (hasErrors) {
    log('\n  DEPLOYMENT BLOCKED - Critical issues found above', 'red');
    log('  Please fix the errors and try again.\n', 'red');

    log('  Quick fix for Stripe key:', 'yellow');
    log('  1. Get your live publishable key from https://dashboard.stripe.com/apikeys', 'yellow');
    log('  2. Create/update .env file with:', 'yellow');
    log('     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE\n', 'yellow');

    return false;
  }

  if (hasWarnings) {
    log('\n  PRE-FLIGHT CHECKS PASSED WITH WARNINGS', 'yellow');
    log('  Proceeding with deployment...\n', 'yellow');
  } else {
    log('\n  ALL PRE-FLIGHT CHECKS PASSED', 'green');
    log('  Proceeding with deployment...\n', 'green');
  }

  return true;
}

// ============================================================
// MAIN
// ============================================================
const passed = runChecks();

if (!passed) {
  process.exit(1);
}

process.exit(0);
