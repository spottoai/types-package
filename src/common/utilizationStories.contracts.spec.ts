import {
  STORY_KEYS,
  STORY_LIMITS,
  type CommitmentRow,
  type HybridBenefitRow,
  type MetricSparkline,
  type OversizedResourceRow,
  type ProtectionProfile,
  type ReportingStories,
  type StoryFingerprint,
  type ResilienceProfileConfig,
  type ResilienceRow,
  type RightSkuRow,
  type ScheduleCandidateRow,
  type StoryArtifact,
  type StoryCell,
  type StoryColumn,
  type StoryKey,
  type StoryRowByKey,
  type StorySample,
  type StorySection,
  type UtilizationProfile,
  type UtilizationProfileConfig,
  type UtilizationSignal,
} from './utilizationStories';
import type { SubscriptionReportEvidencePack } from '../azure/reportEvidence';
import {
  isReportingStories,
  isStoryFingerprintRows,
  isStoryArtifact,
  isStorySample,
  isUtilizationProfile,
  isUtilizationSignal,
  storyRowGuard,
} from './utilizationStoriesValidation';

const windowDays: number = STORY_LIMITS.windowDays;
const storyKeys: readonly StoryKey[] = STORY_KEYS;
void [windowDays, storyKeys];

const cpu: MetricSparkline = {
  key: 'cpu',
  metricName: 'Percentage CPU',
  role: 'primary',
  visual: 'sparkline',
  unit: '%',
  axisMax: 100,
  axisMaxSource: 'config',
  start: '2026-08-13T00:00:00.000Z',
  bucket: 'P1D',
  avg: [1.3, null],
  p95: [2.3, null],
  max: [12.2, null],
  stats: {
    average: 1.42,
    median: 1.3,
    p50: 1.3,
    p75: 1.4,
    p90: 2.9,
    p95: 3.27,
    p99: 12,
    min: 0,
    max: 21.2,
    frequency: 60,
    trend: 0,
    variance: 0.1,
    count: 720,
    totalDataPoints: 720,
    runningDataPoints: 180,
    nonRunningDataPoints: 540,
    runningTimePercentage: 25,
    longestRunningStreak: 4,
    longestDowntimeStreak: 20,
    averageUptimeStreak: 2,
    averageDowntimeStreak: 10,
  },
  sourcePoints: 96,
};

const profile: UtilizationProfile = {
  provider: 'azure',
  family: 'compute',
  capacity: { sku: 'Standard_E4_v5', tier: 'Standard', units: 4, unitName: 'vCPU', memoryGB: 32, scaleMode: 'fixed', label: '4 vCPU · 32 GB RAM' },
  runMode: 'stop-start',
  metrics: [cpu],
  running: {
    signalMetric: 'cpu',
    basis: 'metric-presence',
    corroboration: ['billing-hours'],
    daily: [0.58, 0],
    share: 0.25,
  },
  verdict: 'mostly-off',
  verdictReasons: [{ rule: 'running-share-below', values: { share: 0.25, threshold: 0.5 } }],
  evidence: ['cpu-low'],
  scheduleFit: 'done',
  evidenceWindow: {
    windowStart: '2026-08-13T00:00:00.000Z',
    windowEnd: '2026-09-12T00:00:00.000Z',
    days: 30,
    sampleCount: 96,
    telemetry: 'collected',
    confidence: 'high',
  },
  fingerprint: '/subscriptions/x/resourcegroups/y/providers/microsoft.compute/virtualmachines/z|mostly-off',
};
/** Legacy shape without the running profile is still a valid profile (running is optional). */
const profileWithoutRunning: UtilizationProfile = { ...profile, running: undefined, verdict: 'oversized', scheduleFit: 'insufficient-data' };
void profileWithoutRunning;

const signal: UtilizationSignal = {
  verdict: 'oversized',
  scheduleFit: 'fair',
  primary: { key: 'cpu', p95: 3.27, sparkline: [2.3, null] },
  secondary: { key: 'memory', p95: 29.1, sparkline: [28.8, null] },
  coverage: { coveragePercent: 100, benefitTypes: ['savings-plan'] },
  betterSku: { kind: 'same-shape', label: 'E8as v4', savingsPercent: 13.5 },
  telemetry: 'collected',
};

const protection: ProtectionProfile = {
  provider: 'azure',
  capabilities: [
    {
      key: 'backup',
      state: 'disabled',
      required: true,
      label: 'Azure Backup',
      costIfEnabled: 16.81,
      evidence: { source: 'data-protection.json.gz', observedAt: '2026-09-12T01:40:00.000Z' },
    },
    { key: 'replication', state: 'unknown', required: false, label: 'Site Recovery', evidence: { source: 'recoveryservicesresources' } },
  ],
  missingRequired: ['backup'],
  slaPercent: null,
};

const cells: Record<string, StoryCell> = {
  resource: { kind: 'text', value: 'vm-dev-01', detail: 'australiasoutheast' },
  cpu: { kind: 'sparkline', role: 'primary', values: [2.3, null], axisMax: 100, unit: '%', p95: 3.27, label: 'CPU %' },
  usage: {
    kind: 'dual',
    primary: { kind: 'sparkline', role: 'primary', values: [2.3, null], axisMax: 100, unit: '%', p95: 3.27, label: 'CPU %' },
    secondary: null,
  },
  verdict: { kind: 'mark', state: 'mostly-off', label: 'Mostly off', tone: 'warn', icon: 'moon' },
  betterSku: { kind: 'dot', present: true, tone: 'good', label: 'E8as v4' },
  coverage: { kind: 'percent', value: 100 },
  spend: { kind: 'money', value: 368.43, currency: 'NZD' },
  weekly: { kind: 'weekly-grid', timezone: 'Pacific/Auckland', running: [], businessHoursShare: 0.9, offHoursShare: 0.2 },
  runs: { kind: 'event-strip', events: ['ok', 'failed', null], start: '2026-08-13T00:00:00.000Z' },
  tiers: { kind: 'mix-bar', parts: [{ key: 'hot', label: 'Hot', value: 55.7 }], unit: 'GB', total: 55.7 },
  storage: { kind: 'capacity-bar', used: 0.4, total: 32, unit: 'GB', label: '0.4 of 32 GB' },
  lost: { kind: 'number', value: 3, decimals: 0 },
};
const columns: StoryColumn[] = [
  { key: 'resource', label: 'Resource', cell: 'text', priority: 1, roleClass: 'res' },
  { key: 'cpu', label: 'CPU p95 (30d)', cell: 'sparkline', priority: 1, roleClass: 'prim' },
  { key: 'usage', label: 'Usage (30d)', cell: 'dual', priority: 1, roleClass: 'dual' },
  { key: 'verdict', label: 'Read', cell: 'mark', priority: 1, roleClass: 'read', hint: 'One-word verdict' },
];

const base = {
  resourceId: '/subscriptions/x/resourcegroups/y/providers/microsoft.compute/virtualmachines/z',
  name: 'vm-dev-01',
  type: 'microsoft.compute/virtualmachines',
  location: 'australiasoutheast',
  subscriptionId: 'x',
  tenantId: 't',
  companyId: 'c',
  currency: 'NZD',
  spend30d: 368.43,
  savingsMax: 18.75,
  fingerprint: '/subscriptions/x/resourcegroups/y/providers/microsoft.compute/virtualmachines/z|mostly-off',
  cells,
};
const oversizedRow: OversizedResourceRow = { ...base, profile, betterSku: { kind: 'same-shape', label: 'E8as v4', savingsPercent: 13.5 } };
const rightSkuRow: RightSkuRow = {
  ...base,
  current: {
    kind: 'same-shape',
    sku: 'Standard_E4_v5',
    label: 'E4 v5',
    monthlyCost: 628.43,
    currency: 'NZD',
    savingsPercent: null,
    savingsMonthly: null,
    lostCapabilities: [],
  },
  options: [
    {
      kind: 'trade-off',
      sku: 'Standard_E4a_v4',
      label: 'E4a v4',
      capacity: { units: 4, memoryGB: 32 },
      monthlyCost: 600,
      currency: 'NZD',
      savingsPercent: 4.5,
      savingsMonthly: 28.43,
      lostCapabilities: ['supportsPremiumDisk'],
      confidence: 'high',
    },
  ],
  verdict: 'consider',
  usage: { primaryP95: 3.27, secondaryP95: 29.1, telemetry: 'collected' },
};
const scheduleRow: ScheduleCandidateRow = { ...base, profile, action: 'stop' };
const resilienceRow: ResilienceRow = {
  ...base,
  protection,
  backupRuns: ['ok', 'failed', null],
  lastRecoveryPointAt: null,
  uptimeDays: 12,
  activeHealthEvents: 0,
};
const hybridRow: HybridBenefitRow = {
  ...base,
  productFamily: 'windows-server',
  serviceModel: 'virtual-machine',
  edition: 'standard',
  vCpuCount: 4,
  configurationStatus: 'disabled',
  technicalEligibilityStatus: 'eligible',
  coverageStatus: 'uncovered',
  entitlementStatus: 'unknown',
  decision: { status: 'worth-getting-quote', headline: 'Indicative savings estimate — worth investigating', paybackMonths: 8.21, confidence: 'low' },
  reasonCodes: ['hybrid-benefit-disabled'],
  licenceObservedStableDays: 24,
};
const commitmentRow: CommitmentRow = {
  ...base,
  coverage: {
    coveragePercent: 100,
    benefitTypes: ['savings-plan'],
    benefitNames: ['sp-compute-fixture'],
    coveredCost: 93.05,
    uncoveredCost: 0,
    windowStart: '2026-08-13T00:00:00.000Z',
    windowEnd: '2026-09-12T00:00:00.000Z',
  },
  utilization: { primaryKey: 'cpu', p95: 3.27 },
};
const rowsByKey: { [K in StoryKey]: StoryRowByKey[K] } = {
  'oversized-resources': oversizedRow,
  'right-sku': rightSkuRow,
  'schedule-candidates': scheduleRow,
  'resilience-recovery': resilienceRow,
  'hybrid-benefit': hybridRow,
  commitments: commitmentRow,
};
void rowsByKey;

const section: StorySection<OversizedResourceRow> = {
  resourceType: 'microsoft.compute/virtualmachines',
  family: 'compute',
  columns,
  totalCount: 11,
  rows: [oversizedRow],
  omittedCount: 10,
};
const artifact: StoryArtifact<OversizedResourceRow> = {
  storyKey: 'oversized-resources',
  scope: { companyId: 'c', tenantId: 't', subscriptionId: 'x', displayName: 'Fixture Dev', currency: 'NZD' },
  generation: { sourceRunId: 'run-1', generatedAt: '2026-09-12T02:15:00.000Z' },
  window: { start: '2026-08-13T00:00:00.000Z', end: '2026-09-12T00:00:00.000Z', days: 30, timezone: 'Pacific/Auckland' },
  summary: { counts: { 'verdict:mostly-off': 9 }, spend: { total30d: 4000 }, currency: 'NZD', note: 'sample' },
  sections: [section],
};
const sample: StorySample<OversizedResourceRow> = { summary: artifact.summary, sections: artifact.sections };
const stories: ReportingStories = { 'oversized-resources': sample };
/** The evidence pack carries stories as an optional, additive projection. */
const reportingWithStories: Pick<SubscriptionReportEvidencePack['reporting'], 'stories'> = { stories };
const reportingWithoutStories: Pick<SubscriptionReportEvidencePack['reporting'], 'stories'> = {};
void [reportingWithStories, reportingWithoutStories];

const profilesConfig: UtilizationProfileConfig = {
  version: 1,
  defaults: { windowDays: 30, bucket: 'P1D', weeklyProfile: true, verdictRules: { oversized: 'primary.p95 < 20' } },
  profiles: {
    'microsoft.compute/virtualmachines': {
      family: 'compute',
      producer: 'parser',
      runMode: 'stop-start',
      runningSignal: 'cpu',
      scheduleFit: 'stop',
      metrics: [{ key: 'cpu', metricName: 'Percentage CPU', role: 'primary', visual: 'sparkline', unit: '%', axisMax: 100, priority: 1 }],
      skuAlternatives: { source: 'vmPricePerformance', capabilityKeys: ['maxNics'] },
    },
    'microsoft.sql/servers/databases': {
      family: 'database',
      runMode: 'auto-pause',
      variants: [{ when: "sku.tier = 'Basic'", metrics: [{ key: 'dtu', metricName: 'dtu_consumption_percent', role: 'primary' }] }],
    },
  },
};
const resilienceConfig: ResilienceProfileConfig = {
  version: 1,
  profiles: { 'microsoft.compute/virtualmachines': { capabilities: [{ key: 'backup', required: true, source: 'data-protection', sla: '99.9' }] } },
};
void [profilesConfig, resilienceConfig];

// Guards narrow to the contract types.
const unknownArtifact: unknown = artifact;
if (isStoryArtifact(unknownArtifact, 'oversized-resources')) {
  const key: StoryKey = unknownArtifact.storyKey;
  void key;
}
const unknownSample: unknown = sample;
const sampleValid: boolean = isStorySample(unknownSample, 'oversized-resources');
const storiesValid: boolean = isReportingStories(stories);

// History period extension: fingerprints across the six stories, bounded by STORY_LIMITS.historyFingerprints.
const fingerprint: StoryFingerprint = {
  storyKey: 'oversized-resources',
  resourceId: oversizedRow.resourceId,
  fingerprint: oversizedRow.fingerprint,
  savingsMax: oversizedRow.savingsMax,
};
const fingerprintsValid: boolean = isStoryFingerprintRows({ totalCount: 1, rows: [fingerprint], omittedCount: 0 });
void fingerprintsValid;
const profileValid: boolean = isUtilizationProfile(profile, 30);
const signalValid: boolean = isUtilizationSignal(signal);
const rowGuard = storyRowGuard('resilience-recovery');
const rowValid: boolean = rowGuard(resilienceRow);
void [sampleValid, storiesValid, profileValid, signalValid, rowValid];

// Summary-view projection (API `view=summary`): marked, rows removed, produced counts kept.
const summaryView: StoryArtifact<OversizedResourceRow> = {
  ...artifact,
  view: 'summary',
  sections: artifact.sections.map(section => ({ ...section, rows: [] })),
};
const summaryViewValid: boolean = isStoryArtifact(summaryView, 'oversized-resources');
// @ts-expect-error only the summary projection is a known view marker.
const unknownView: StoryArtifact<OversizedResourceRow> = { ...artifact, view: 'compact' };
void [summaryViewValid, unknownView];
