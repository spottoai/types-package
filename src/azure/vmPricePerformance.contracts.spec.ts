import type { VmPricePerformanceInsights, VmPricePerformancePricingBasis } from './views';

const retailPricingWithUnavailableReservationEvaluation: VmPricePerformanceInsights = {
  comparisonScope: 'same-region',
  comparisonBasis: 'reservation-coverage',
  pricingBasis: 'payg-retail',
  displayCurrencyCode: 'AUD',
  displayCurrencySymbol: '$',
  current: {
    armSkuName: 'Standard_E16as_v5',
    region: 'australiaeast',
    currencyCode: 'USD',
    osType: 'linux',
    tier: 'standard',
    purchaseOption: 'payg',
    localCurrencyCode: 'AUD',
    localCurrencySymbol: '$',
    localMonthlyPrice: 1147,
  },
  reservationCoverage: {
    benefitType: 'reservation',
    coveragePercent: 12.63,
    instanceFlexibility: 'on',
    evidenceSource: 'billing-coverage-only',
  },
  reservationEvaluation: {
    status: 'unavailable',
    reason: 'missing-flexibility-evidence',
  },
  alternatives: [
    {
      armSkuName: 'Standard_E16ps_v6',
      region: 'australiaeast',
      currencyCode: 'USD',
      osType: 'linux',
      tier: 'standard',
      purchaseOption: 'payg',
      localCurrencyCode: 'AUD',
      localCurrencySymbol: '$',
      localMonthlyPrice: 916.72,
      rank: 1,
      localSavingsMonthly: 230.28,
      localSavingsPercent: 20.1,
      reservationCoverageImpact: {
        compatibility: 'unknown',
        reason: 'missing-flexibility-evidence',
      },
    },
  ],
  source: {
    fileName: 'vm-usd-australiaeast.csv',
    region: 'australiaeast',
    currencyCode: 'USD',
    displayCurrencyCode: 'AUD',
    displayPricingSource: 'Azure Retail Prices API',
  },
};

// @ts-expect-error reservation coverage is not a monetary pricing basis.
const invalidPricingBasis: VmPricePerformancePricingBasis = 'reservation-coverage';

const invalidReservationEvaluation: VmPricePerformanceInsights = {
  ...retailPricingWithUnavailableReservationEvaluation,
  reservationEvaluation: {
    // @ts-expect-error evaluation status uses a closed vocabulary.
    status: 'unknown',
  },
};

void retailPricingWithUnavailableReservationEvaluation;
void invalidPricingBasis;
void invalidReservationEvaluation;
