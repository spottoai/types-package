import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const installed = process.argv[2] ? resolve(process.argv[2]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = require(`${installed}/package.json`);
const json = value => JSON.parse(JSON.stringify(value));
const context = {
  benefitId: 'ordinary : qualified / é '.repeat(140) + 'end',
  additive: false,
  coverage: 'partial',
  assumptions: [],
  limitations: ['source-window-not-certified'],
  sources: [
    {
      kind: 'billing',
      source: 'views-billing-inputs/current30Days',
      generatedAt: '2026-10-30T08:00:00.000Z',
      generationId: 'generation',
      fingerprint: undefined,
    },
    { kind: 'inventory', source: 'tenant-native-commitment-inventory', generatedAt: undefined },
    { kind: 'utilization', source: 'reservation-summary', observedAt: '2026-10-29T23:00:00+01:00' },
  ],
};
const native = {
  ...context,
  status: 'available',
  amount: 0,
  currency: 'AUD',
  method: 'native-unused-amortized',
  basis: 'amortized',
  provenance: 'billing-backed-native',
  sourceCharge: { amount: 0, dates: ['2026-10-05'], periodStart: '2026-10-05', periodEnd: '2026-10-05' },
};
const approximation = {
  ...context,
  status: 'available',
  amount: 4341.28,
  currency: 'AUD',
  method: 'recurring-charge-utilization-approximation',
  basis: 'billed',
  provenance: 'billing-backed-approximation',
  sourceCharge: { amount: 5474.5, dates: ['2026-10-05'], cadence: 'monthly' },
  utilizationWindow: {
    start: '2026-09-30',
    end: '2026-10-29',
    percentage: 20.7,
    observedDays: 30,
    reportedHoursPerUnit: undefined,
    finality: 'provider-reported-hours-unverified',
  },
};
const unavailable = { ...context, status: 'unavailable', reason: 'charge-unavailable' };
const invalid = [
  ['wrong basis', { ...native, basis: 'billed' }],
  ['wrong provenance', { ...approximation, provenance: 'billing-backed-native' }],
  ['wrong method', { ...approximation, method: 'native-unused-amortized' }],
  ...['amount', 'currency', 'method', 'basis', 'provenance', 'sourceCharge'].map(key => [
    `unavailable ${key}`,
    { ...unavailable, [key]: native[key] },
  ]),
  ['available reason', { ...native, reason: 'unknown' }],
  ['missing reason', { ...unavailable, reason: undefined }],
  ['unknown status', { ...native, status: 'unknown' }],
  ['missing amount', { ...native, amount: undefined }],
  ['negative amount', { ...native, amount: -1 }],
  ['missing currency', { ...native, currency: undefined }],
  ['bad currency', { ...native, currency: ' aud ' }],
  ['missing charge', { ...native, sourceCharge: undefined }],
  ['bad charge', { ...native, sourceCharge: [] }],
  ['missing dates', { ...native, sourceCharge: { amount: 0, dates: [] } }],
  ['bad date', { ...native, sourceCharge: { amount: 0, dates: ['2026-02-30'] } }],
  ['negative charge', { ...native, sourceCharge: { amount: -1, dates: ['2026-10-05'] } }],
  ['bad cadence', { ...native, sourceCharge: { ...native.sourceCharge, cadence: 'annual' } }],
  ['reverse service period', { ...native, sourceCharge: { ...native.sourceCharge, periodStart: '2026-10-06' } }],
  ['missing window', { ...approximation, utilizationWindow: undefined }],
  ['null window', { ...approximation, utilizationWindow: null }],
  ...[
    ['reverse window', { start: '2026-10-30' }],
    ['bad window date', { start: '2026-02-30' }],
    ['negative percentage', { percentage: -1 }],
    ['excess percentage', { percentage: 100.01 }],
    ['fractional days', { observedDays: 1.5 }],
    ['negative days', { observedDays: -1 }],
    ['unsafe days', { observedDays: Number.MAX_SAFE_INTEGER + 1 }],
    ['negative hours', { reportedHoursPerUnit: -1 }],
    ['wrong finality', { finality: 'final' }],
    ['reverse offset chronology', { start: '2026-10-01T00:00:00-02:00', end: '2026-10-01T01:00:00Z' }],
  ].map(([name, changes]) => [name, { ...approximation, utilizationWindow: { ...approximation.utilizationWindow, ...changes } }]),
  ['malformed source', { ...native, sources: [null] }],
  ['bad source kind', { ...native, sources: [{ kind: 'retail', source: 'x' }] }],
  ['bad source time', { ...native, sources: [{ kind: 'billing', source: 'x', generatedAt: '2026-02-30T00:00:00Z' }] }],
  ['bad source offset', { ...native, sources: [{ kind: 'billing', source: 'x', generatedAt: '2026-10-30T24:00:00Z' }] }],
  ['bad source metadata', { ...native, sources: [{ kind: 'billing', source: 'x', fingerprint: 42 }] }],
  ['bad assumptions', { ...native, assumptions: [null] }],
  ['bad limitations', { ...native, limitations: {} }],
  ['additive exposure', { ...native, additive: true }],
  ['bad coverage', { ...native, coverage: 'unknown' }],
  ['empty identity', { ...native, benefitId: '' }],
];
for (const subpath of ['.', './azure/recommendations']) {
  const entry = manifest.exports[subpath];
  for (const [mode, api] of [
    ['CJS', require(resolve(installed, entry.require))],
    ['ESM', await import(pathToFileURL(resolve(installed, entry.import)))],
  ]) {
    const guard = api.isCommitmentUnusedValueEvidence;
    assert.equal(typeof guard, 'function', `${subpath} ${mode} exports the evidence guard`);
    for (const value of [
      native,
      approximation,
      unavailable,
      { ...native, coverage: 'complete', sourceCharge: { amount: 0, dates: ['2026-10-05'], periodStart: '2026-10-01' } },
      {
        ...approximation,
        utilizationWindow: {
          ...approximation.utilizationWindow,
          start: '2026-09-30T00:00:00+12:00',
          end: '2026-10-29T00:00:00.0000000Z',
          percentage: 100,
          reportedHoursPerUnit: 0,
        },
      },
      {
        ...approximation,
        utilizationWindow: { ...approximation.utilizationWindow, start: '2026-10-01T01:00:00+02:00', end: '2026-10-01T00:00:00Z' },
      },
      { ...unavailable, sources: [], assumptions: [], limitations: [] },
    ]) {
      assert.equal(guard(json(value)), true, `${subpath} ${mode} valid ${value.status}/${value.method}`);
    }
    for (const [name, value] of invalid) assert.equal(guard(json(value)), false, `${subpath} ${mode}: ${name}`);
    for (const value of [
      null,
      [],
      0,
      undefined,
      { ...native, amount: Infinity },
      { ...native, sourceCharge: { ...native.sourceCharge, amount: NaN } },
      { ...approximation, utilizationWindow: { ...approximation.utilizationWindow, percentage: Infinity } },
    ])
      assert.equal(guard(value), false, `${subpath} ${mode} rejects non-JSON/finite evidence`);
  }
}
console.log(`Unused-value runtime JSON contracts passed: root/subpath CJS/ESM (${invalid.length} negative cases per surface).`);
