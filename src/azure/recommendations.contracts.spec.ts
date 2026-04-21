import type {
  HddOsRetirementRecommendationRenderStrategy,
  Recommendation,
  RecommendationEffortEstimates,
} from './recommendations';
import { RecommendationCategory } from './recommendations';

const effortEstimates: RecommendationEffortEstimates = {
  profiles: {
    clickops: {
      effortHours: 12,
      breakdown: {
        discovery: 2,
        implementation: 4,
        validation: 3,
        rollbackPlanning: 1,
        coordination: 2,
      },
      reason:
        'Manual metric review, portal-based scaling setup, non-production testing, and staged rollout create several hands-on steps across the affected compute platform.',
    },
    devops: {
      effortHours: 10,
      breakdown: {
        discovery: 2,
        implementation: 3,
        validation: 3,
        rollbackPlanning: 1,
        coordination: 1,
      },
      reason:
        'Infrastructure as code and scripted rollout reduce repeated configuration work, but threshold tuning, load testing, and telemetry validation still take time.',
    },
    enterprise: {
      effortHours: 15,
      breakdown: {
        discovery: 2,
        implementation: 4,
        validation: 4,
        rollbackPlanning: 2,
        coordination: 3,
      },
      reason:
        'Formal change control, approval gates, dependency reviews, and production rollout coordination add overhead beyond the technical scaling work.',
    },
  },
  bulk: {
    supported: true,
    threshold: 5,
    profiles: {
      clickops: {
        setupHours: 2,
        perResourceHours: 1.5,
        validationHours: 3,
      },
      devops: {
        setupHours: 5,
        perResourceHours: 0.5,
        validationHours: 3,
      },
      enterprise: {
        setupHours: 6,
        perResourceHours: 0.75,
        validationHours: 4,
      },
    },
  },
};

const recommendationWithEffortEstimates: Recommendation = {
  id: 'rec-123',
  name: 'Stable Overutilization without Autoscaling',
  category: RecommendationCategory.Performance,
  service: 'Any Compute Resource (App Service, Virtual Machines, Container Apps, SQL Databases, etc)',
  impact: 'High',
  headline: 'Your app is stuck in traffic with no spare lane',
  bottomLine: 'Enable automatic scaling or add baseline capacity -> Reduce slowdown and timeout risk -> Medium effort, about 12 hours',
  plainSummary:
    'This workload runs close to its limit for long periods, so normal demand changes can turn into slow pages, errors, or missed service targets.',
  quickSteps: [
    'Open Azure Monitor and check CPU and memory trends over the last 30 days',
    'Confirm with service owners that the sustained high usage is not expected',
  ],
  businessOwner: 'Application portfolio manager',
  keyConstraint: 'Scaling can cause brief restarts or move the bottleneck elsewhere, so test first and use a planned change window.',
  validationEvidence:
    'Check Azure Monitor metrics showing CPU or memory above 80% for 7+ days and Application Insights showing rising latency or failures.',
  effort: 'Medium',
  effortHours: 12,
  effortReason: 'Requires baseline review, platform-specific scaling design, non-production testing, rollout planning, and post-change validation.',
  effortEstimates,
};

const legacyRecommendationWithoutEffortEstimates: Recommendation = {
  ...recommendationWithEffortEstimates,
  id: 'rec-124',
  effortEstimates: undefined,
};

const hddRetirementRenderStrategy: HddOsRetirementRecommendationRenderStrategy =
  {
    key: 'azure_hdd_os_retirement',
    version: 1,
    payload: {
      retirementDate: '2028-09-08',
      retirementLink:
        'https://learn.microsoft.com/en-us/azure/virtual-machines/disks-hdd-os-retirement',
      currencyCode: 'NZD',
      currencySymbol: '$',
      defaultTargetTier: 'standardSsd',
      impactedDiskCount: 1,
      currentMonthlyActual: 31.5,
      currentMonthlyRetail: 31.48033,
      standardSsdMonthlyRetail: 45.353018,
      premiumSsdMonthlyRetail: 66.021957,
      standardSsdMonthlyDelta: 13.872688,
      premiumSsdMonthlyDelta: 34.541627,
      disks: [
        {
          resourceId:
            '/subscriptions/sub-dev/resourcegroups/rg-dev-003/providers/microsoft.compute/disks/disk-dev-hdd-db1-os',
          resourceName: 'disk-dev-hdd-db1-os',
          resourceType: 'microsoft.compute/disks',
          current: {
            storageTier: 'standardHdd',
            skuName: 'S15 LRS',
            sizeGiB: 256,
            monthlyActual: 31.5,
            monthlyRetail: 31.48033,
          },
          standardSsd: {
            storageTier: 'standardSsd',
            skuName: 'E15 LRS',
            sizeGiB: 256,
            monthlyRetail: 45.353018,
          },
          premiumSsd: {
            storageTier: 'premiumSsd',
            skuName: 'P15 LRS',
            sizeGiB: 256,
            monthlyRetail: 66.021957,
          },
          defaultSelection: 'standardSsd',
        },
      ],
    },
  };

const recommendationWithRenderStrategy: Recommendation = {
  ...recommendationWithEffortEstimates,
  id: 'rec-125',
  renderStrategy: hddRetirementRenderStrategy,
};

void effortEstimates;
void recommendationWithEffortEstimates;
void legacyRecommendationWithoutEffortEstimates;
void hddRetirementRenderStrategy;
void recommendationWithRenderStrategy;

const missingEnterpriseProfile: RecommendationEffortEstimates = {
  // @ts-expect-error enterprise profile is required.
  profiles: {
    clickops: effortEstimates.profiles.clickops,
    devops: effortEstimates.profiles.devops,
  },
  bulk: effortEstimates.bulk,
};

const invalidBreakdownShape: RecommendationEffortEstimates = {
  profiles: {
    clickops: {
      effortHours: 12,
      // @ts-expect-error rollbackPlanning is required in the breakdown.
      breakdown: {
        discovery: 2,
        implementation: 4,
        validation: 3,
        coordination: 2,
      },
      reason: 'Broken breakdown shape.',
    },
    devops: effortEstimates.profiles.devops,
    enterprise: effortEstimates.profiles.enterprise,
  },
  bulk: effortEstimates.bulk,
};

const invalidBulkProfileField: RecommendationEffortEstimates = {
  profiles: effortEstimates.profiles,
  bulk: {
    supported: true,
    threshold: 5,
    profiles: {
      clickops: {
        setupHours: 2,
        perResourceHours: 1.5,
        // @ts-expect-error validationHours must be numeric.
        validationHours: '3',
      },
      devops: effortEstimates.bulk.profiles.devops,
      enterprise: effortEstimates.bulk.profiles.enterprise,
    },
  },
};

const invalidHddRenderStrategyKey: HddOsRetirementRecommendationRenderStrategy =
  {
    // @ts-expect-error HDD retirement render strategy key is fixed.
    key: 'other_strategy',
    version: 1,
    payload: hddRetirementRenderStrategy.payload,
  };

const invalidHddCurrentStorageTier: HddOsRetirementRecommendationRenderStrategy =
  {
    key: 'azure_hdd_os_retirement',
    version: 1,
    payload: {
      ...hddRetirementRenderStrategy.payload,
      disks: [
        {
          ...hddRetirementRenderStrategy.payload.disks[0],
          current: {
            ...hddRetirementRenderStrategy.payload.disks[0].current,
            // @ts-expect-error current disk in HDD retirement must be standardHdd.
            storageTier: 'standardSsd',
          },
        },
      ],
    },
  };

void missingEnterpriseProfile;
void invalidBreakdownShape;
void invalidBulkProfileField;
void invalidHddRenderStrategyKey;
void invalidHddCurrentStorageTier;
