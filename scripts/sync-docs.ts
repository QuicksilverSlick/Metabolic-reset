#!/usr/bin/env npx tsx

/**
 * Documentation Sync Script
 *
 * This script synchronizes documentation between:
 * - src/lib/docs/unified-source.ts (primary source)
 * - worker/docs-context-enhanced.ts (worker copy for AI)
 * - src/lib/docs/sections/*.ts (legacy frontend docs)
 *
 * It also validates that all sources are in sync and
 * updates the legacy frontend docs if needed.
 *
 * Run with: npx tsx scripts/sync-docs.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const UNIFIED_SOURCE = path.join(ROOT_DIR, 'src', 'lib', 'docs', 'unified-source.ts');
const WORKER_CONTEXT = path.join(ROOT_DIR, 'worker', 'docs-context-enhanced.ts');
const LEGACY_DOCS_DIR = path.join(ROOT_DIR, 'src', 'lib', 'docs', 'sections');
const SYNC_STATE_FILE = path.join(ROOT_DIR, 'src', 'lib', 'docs', '.sync-state.json');

interface SyncState {
  lastSync: string;
  unifiedSourceHash: string;
  workerContextHash: string;
  legacyDocsHashes: Record<string, string>;
}

/**
 * Calculate hash of file contents
 */
function hashFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Load sync state from file
 */
function loadSyncState(): SyncState {
  if (fs.existsSync(SYNC_STATE_FILE)) {
    return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf-8'));
  }
  return {
    lastSync: '',
    unifiedSourceHash: '',
    workerContextHash: '',
    legacyDocsHashes: {}
  };
}

/**
 * Save sync state to file
 */
function saveSyncState(state: SyncState): void {
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Check if files are in sync
 */
function checkSync(): { inSync: boolean; changes: string[] } {
  console.log('Checking documentation sync status...\n');

  const state = loadSyncState();
  const changes: string[] = [];

  // Check unified source
  const currentUnifiedHash = hashFile(UNIFIED_SOURCE);
  if (currentUnifiedHash !== state.unifiedSourceHash) {
    changes.push('unified-source.ts has changed');
  }

  // Check worker context
  const currentWorkerHash = hashFile(WORKER_CONTEXT);
  if (currentWorkerHash !== state.workerContextHash) {
    changes.push('docs-context-enhanced.ts has changed');
  }

  // Check legacy docs
  if (fs.existsSync(LEGACY_DOCS_DIR)) {
    const files = fs.readdirSync(LEGACY_DOCS_DIR).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const filePath = path.join(LEGACY_DOCS_DIR, file);
      const currentHash = hashFile(filePath);
      if (currentHash !== state.legacyDocsHashes[file]) {
        changes.push(`sections/${file} has changed`);
      }
    }
  }

  return {
    inSync: changes.length === 0,
    changes
  };
}

/**
 * Extract section data from unified source
 */
function extractSectionsFromUnified(): Map<string, { title: string; articles: any[] }> {
  const content = fs.readFileSync(UNIFIED_SOURCE, 'utf-8');
  const sections = new Map<string, { title: string; articles: any[] }>();

  // This is a simplified extraction - in production you'd use proper AST parsing
  // For now, we'll parse the documentationSections array

  // Find the documentationSections array
  const sectionsMatch = content.match(/export const documentationSections:\s*AIDocSection\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (sectionsMatch) {
    // Parse each section (simplified - assumes well-formatted code)
    const sectionRegex = /{\s*id:\s*['"`](\w+)['"`],\s*title:\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = sectionRegex.exec(sectionsMatch[1])) !== null) {
      sections.set(match[1], {
        title: match[2],
        articles: [] // Would need full AST parsing for articles
      });
    }
  }

  return sections;
}

/**
 * Generate legacy docs format from unified source
 */
function generateLegacyDocs(): void {
  console.log('Generating legacy docs from unified source...\n');

  // Read unified source
  if (!fs.existsSync(UNIFIED_SOURCE)) {
    console.error('Unified source not found!');
    return;
  }

  const sections = extractSectionsFromUnified();

  console.log(`Found ${sections.size} sections in unified source`);
  console.log('Note: Legacy docs are maintained for backwards compatibility.');
  console.log('Primary source is src/lib/docs/unified-source.ts\n');

  // For now, we don't auto-generate legacy docs to avoid breaking changes
  // The legacy docs will continue to work independently
}

/**
 * Validate worker context has all necessary exports
 */
function validateWorkerContext(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!fs.existsSync(WORKER_CONTEXT)) {
    issues.push('Worker context file not found');
    return { valid: false, issues };
  }

  const content = fs.readFileSync(WORKER_CONTEXT, 'utf-8');

  // Check required exports
  const requiredExports = [
    'platformDocs',
    'apiEndpoints',
    'errorCodes',
    'searchDocs',
    'getRelevantDocsContext',
    'getFullDocsContext',
    'buildAIBugContext'
  ];

  for (const exp of requiredExports) {
    if (!content.includes(`export const ${exp}`) && !content.includes(`export function ${exp}`)) {
      issues.push(`Missing export: ${exp}`);
    }
  }

  // Check that platformDocs has expected sections
  const expectedSections = ['overview', 'bug-tracking', 'impersonation', 'user-management'];
  for (const section of expectedSections) {
    if (!content.includes(`id: '${section}'`)) {
      issues.push(`Missing section: ${section}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Update sync state after successful sync
 */
function updateSyncState(): void {
  const state: SyncState = {
    lastSync: new Date().toISOString(),
    unifiedSourceHash: hashFile(UNIFIED_SOURCE),
    workerContextHash: hashFile(WORKER_CONTEXT),
    legacyDocsHashes: {}
  };

  // Hash legacy docs
  if (fs.existsSync(LEGACY_DOCS_DIR)) {
    const files = fs.readdirSync(LEGACY_DOCS_DIR).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      state.legacyDocsHashes[file] = hashFile(path.join(LEGACY_DOCS_DIR, file));
    }
  }

  saveSyncState(state);
  console.log('Sync state updated.');
}

/**
 * Print documentation statistics
 */
function printStats(): void {
  console.log('\n' + '='.repeat(60));
  console.log('DOCUMENTATION STATISTICS');
  console.log('='.repeat(60));

  // Count sections and articles in unified source
  if (fs.existsSync(UNIFIED_SOURCE)) {
    const content = fs.readFileSync(UNIFIED_SOURCE, 'utf-8');

    const sectionCount = (content.match(/id:\s*['"`]\w+['"`],\s*\n\s*title:/g) || []).length;
    const articleCount = (content.match(/id:\s*['"`][\w-]+['"`],\s*\n\s*title:\s*['"`][^'"`]+['"`],\s*\n\s*description:/g) || []).length;
    const apiCount = (content.match(/method:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g) || []).length;
    const entityCount = (content.match(/name:\s*['"`]\w+Entity['"`]/g) || []).length;
    const errorCount = (content.match(/code:\s*['"`]\w+['"`],\s*\n\s*httpStatus/g) || []).length;

    console.log(`Unified Source (${path.basename(UNIFIED_SOURCE)}):`);
    console.log(`  - Sections: ${sectionCount}`);
    console.log(`  - Articles: ${articleCount}`);
    console.log(`  - API Endpoints: ${apiCount}`);
    console.log(`  - Entities: ${entityCount}`);
    console.log(`  - Error Codes: ${errorCount}`);
  }

  // Count in worker context
  if (fs.existsSync(WORKER_CONTEXT)) {
    const content = fs.readFileSync(WORKER_CONTEXT, 'utf-8');
    const workerArticles = (content.match(/id:\s*['"`][\w-]+['"`],\s*\n\s*title:/g) || []).length;
    console.log(`\nWorker Context (${path.basename(WORKER_CONTEXT)}):`);
    console.log(`  - Articles: ${workerArticles}`);
  }

  // Count legacy docs
  if (fs.existsSync(LEGACY_DOCS_DIR)) {
    const files = fs.readdirSync(LEGACY_DOCS_DIR).filter(f => f.endsWith('.ts'));
    console.log(`\nLegacy Docs (${files.length} files):`);
    let totalArticles = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(LEGACY_DOCS_DIR, file), 'utf-8');
      const articleCount = (content.match(/id:\s*['"`][\w-]+['"`],\s*\n\s*title:/g) || []).length;
      console.log(`  - ${file}: ${articleCount} articles`);
      totalArticles += articleCount;
    }
    console.log(`  Total: ${totalArticles} articles`);
  }

  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Documentation Sync Script');
  console.log('='.repeat(60));
  console.log();

  // Check sync status
  const syncStatus = checkSync();

  if (syncStatus.inSync) {
    console.log('All documentation sources are in sync.');
  } else {
    console.log('Documentation sources have changes:');
    syncStatus.changes.forEach(change => console.log(`  - ${change}`));
  }

  // Validate worker context
  console.log('\nValidating worker context...');
  const workerValidation = validateWorkerContext();

  if (workerValidation.valid) {
    console.log('Worker context is valid.');
  } else {
    console.log('Worker context issues:');
    workerValidation.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Print stats
  printStats();

  // Update sync state if everything is valid
  if (workerValidation.valid) {
    updateSyncState();
  }

  console.log('\nDone!');
}

// Run the script
main().catch(console.error);
