/**
 * SYNTARA AI — Automated CLI Acceptance Test Suite (TEST 1 -> TEST 15)
 * Run via: npm test
 */

import { runProductAcceptanceSuite } from '../src/server/engines.ts';

const summary = runProductAcceptanceSuite();
console.log('================================================================');
console.log('SYNTARA AI — RAPPORT DE VALIDATION DES 15 CRITÈRES D’ACCEPTATION');
console.log('================================================================');
for (const item of summary.results) {
  const badge = item.passed ? '[PASS]' : '[FAIL]';
  console.log(`${badge} ${item.code} (${item.durationMs}ms) — ${item.title}`);
  console.log(`       Preuve : ${item.evidence}`);
}
console.log('----------------------------------------------------------------');
console.log(`Résultat Global : ${summary.passedCount}/${summary.totalCount} tests réussis.`);
if (!summary.allPassed) {
  process.exit(1);
}
