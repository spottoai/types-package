import type { InventoryAnalysisResult, InventoryStatusOrResult, InventoryThresholds, ThresholdPreset } from '../index';

const thresholdPreset: ThresholdPreset = {
  key: 'balanced',
  label: 'Balanced',
  thresholds: {
    coolAfterDays: 60,
    coldAfterDays: 180,
    archiveAfterDays: 365,
  },
  tierTargets: {
    hot: { count: 1, bytes: 1 },
    cool: { count: 0, bytes: 0 },
    cold: { count: 0, bytes: 0 },
    archive: { count: 0, bytes: 0 },
  },
};

const analysisResult: InventoryAnalysisResult = {
  analyzedAt: '2026-09-03T00:00:00.000Z',
  inventorySource: 'automatic',
  storageAccountMetadata: {
    accountKind: 'StorageV2',
    skuName: 'Standard_GRS',
    redundancy: 'GRS',
  },
  tierTargets: thresholdPreset.tierTargets,
  thresholdPresets: [thresholdPreset],
  summary: {
    totalBlobs: 1,
    totalBytes: 1,
    tierBreakdown: {},
    ageBuckets: {
      '365d+': {
        count: 1,
        bytes: 1,
        perType: {
          block: { count: 1, bytes: 1 },
          page: { count: 0, bytes: 0 },
          append: { count: 0, bytes: 0 },
        },
      },
    },
  },
  issues: [],
  recommendations: [],
  warnings: [],
};

const statusOrResult: InventoryStatusOrResult = analysisResult;

// @ts-expect-error The canonical threshold contract requires an Archive threshold.
const missingArchiveAfterDays: InventoryThresholds = {
  coolAfterDays: 30,
  coldAfterDays: 90,
};

const obsoleteArchiveField: InventoryThresholds = {
  coolAfterDays: 30,
  coldAfterDays: 90,
  archiveAfterDays: 180,
  // @ts-expect-error Append blobs cannot be tiered; the obsolete field is not part of the contract.
  archiveAppendAfterDays: 180,
};

void statusOrResult;
void missingArchiveAfterDays;
void obsoleteArchiveField;
