import type { CostComposition, EstimateLens, PublicCostComposition } from './costComposition';

const selectedLens: EstimateLens = 'actual-plus-estimated';

const unavailableComposition: CostComposition = {
  schemaVersion: 1,
  compositionId: 'month:2026-03',
  coverageIdentity: {
    schemaVersion: 1,
    identityVersion: 'billing-component-day/v1',
    scopeRef: 'subscription:sub',
    periodRef: 'month:2026-03',
    startDate: '2026-03-01',
    endDateExclusive: '2026-04-01',
    dateBasis: 'billing-calendar',
    allocationOwnerResourceId: '/subscriptions/sub/resourceGroups/rg/providers/microsoft.test/widgets/w1',
    billableComponentKey: 'widgets|standard|capacity|gb-month',
  },
  selectedLens,
  billed: {
    basis: 'billed',
    actual: {
      support: 'supported',
      availability: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
    estimated: {
      support: 'supported',
      availability: { status: 'unavailable', reasonCode: 'not-produced' },
    },
    combined: { status: 'unavailable', reasonCode: 'not-produced' },
    status: 'unavailable',
    supersessionRefs: [],
  },
  amortized: {
    basis: 'amortized',
    actual: {
      support: 'unknown',
      availability: { status: 'unavailable', reasonCode: 'billing-unavailable' },
    },
    estimated: {
      support: 'unknown',
      availability: { status: 'unavailable', reasonCode: 'not-produced' },
    },
    combined: { status: 'unavailable', reasonCode: 'not-produced' },
    status: 'unavailable',
    supersessionRefs: [],
  },
  coverageCompletenessRef: 'coverage:month:2026-03',
  allocationRef: 'allocation:resource-owner/v1',
};

void unavailableComposition;

const publicComposition: PublicCostComposition = {
  schemaVersion: 1,
  selectedLens,
  billed: {
    basis: 'billed',
    actual: { support: 'supported', availability: { status: 'available', component: { amount: '10.25', currencyCode: 'NZD' } } },
    estimated: { support: 'supported', availability: { status: 'unavailable' } },
    combined: { status: 'available', component: { amount: '10.25', currencyCode: 'NZD' } },
    status: 'actual-only',
    estimateConfidence: 'high',
  },
  amortized: {
    basis: 'amortized',
    actual: { support: 'unknown', availability: { status: 'unavailable' } },
    estimated: { support: 'unknown', availability: { status: 'unavailable' } },
    combined: { status: 'unavailable' },
    status: 'unavailable',
  },
};

void publicComposition;
