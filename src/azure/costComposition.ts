/** Controls whether a financial projection includes actual, estimated, or both source components. */
export type EstimateLens = 'actual-only' | 'actual-plus-estimated' | 'estimates-only';

/** Canonical successor vocabulary; legacy V2 baseline wire tokens remain unchanged. */
export type FinancialEstimateLensV1 = 'billing-only' | 'include-estimates' | 'estimates-only';

const CANONICAL_ESTIMATE_LENS_BY_LEGACY = {
  'actual-only': 'billing-only',
  'actual-plus-estimated': 'include-estimates',
  'estimates-only': 'estimates-only',
} as const satisfies Record<EstimateLens, FinancialEstimateLensV1>;

const LEGACY_ESTIMATE_LENS_BY_CANONICAL = {
  'billing-only': 'actual-only',
  'include-estimates': 'actual-plus-estimated',
  'estimates-only': 'estimates-only',
} as const satisfies Record<FinancialEstimateLensV1, EstimateLens>;

export const toCanonicalEstimateLensV1 = <Lens extends EstimateLens>(value: Lens): (typeof CANONICAL_ESTIMATE_LENS_BY_LEGACY)[Lens] =>
  CANONICAL_ESTIMATE_LENS_BY_LEGACY[value];

export const toLegacyEstimateLensV1 = <Lens extends FinancialEstimateLensV1>(value: Lens): (typeof LEGACY_ESTIMATE_LENS_BY_CANONICAL)[Lens] =>
  LEGACY_ESTIMATE_LENS_BY_CANONICAL[value];

/** Financial basis kept independent throughout composition and projection. */
export type CostBasis = 'billed' | 'amortized';

/** Reason a supported monetary component cannot be returned. */
export type MoneyUnavailableReason = 'billing-unavailable' | 'not-produced' | 'currency-unresolved' | 'coverage-unproven';

/** Versioned source-independent identity for one billable coverage interval. */
export interface BillableCoverageIdentity {
  schemaVersion: 1;
  identityVersion: string;
  scopeRef: string;
  periodRef: string;
  startDate: string;
  endDateExclusive: string;
  dateBasis: 'utc' | 'billing-calendar' | 'company-local';
  timeZone?: string;
  allocationOwnerResourceId: string;
  billableComponentKey: string;
  meterKey?: string;
  pricingDimensionKey?: string;
}

/** Auditable money value with explicit currency, coverage, and source generations. */
export interface MoneyComponent {
  amount: string;
  currencyCode: string;
  currencyResolutionRef: string;
  coverageRef: string;
  sourceGenerationRefs: string[];
  rowCount: number;
}

/** Money is either present with evidence or absent with a typed reason. */
export type ComponentAvailability =
  | { status: 'available'; component: MoneyComponent }
  | { status: 'unavailable'; reasonCode: MoneyUnavailableReason };

/** Declares support independently from current data availability. */
export interface ComponentState {
  support: 'supported' | 'unsupported' | 'unknown';
  availability: ComponentAvailability;
}

/** Links replaced estimate coverage to the actual generation that superseded it. */
export interface SupersessionRef {
  estimatedCoverageRef: string;
  actualSourceGenerationRef: string;
  disposition: 'fully-superseded' | 'partially-superseded';
}

/** Why an estimated monetary component is present instead of provider billing evidence. */
export type CostEstimateReason = 'billing-lag' | 'billing-unavailable-sponsorship' | 'other';

/** Composition for one billed or amortized basis. */
export interface CostBasisComposition {
  basis: CostBasis;
  actual: ComponentState;
  estimated: ComponentState;
  combined: ComponentAvailability;
  status: 'actual-only' | 'actual-plus-estimated' | 'estimated-only' | 'unavailable';
  estimateReason?: CostEstimateReason;
  estimateMethodRef?: string;
  estimateConfidence?: 'high' | 'medium' | 'low' | 'unknown';
  uncertaintyRef?: string;
  supersessionRefs: SupersessionRef[];
}

/** Canonical source composition plus the lens applied by a projection boundary. */
export interface CostComposition {
  schemaVersion: 1;
  compositionId: string;
  coverageIdentity: BillableCoverageIdentity;
  selectedLens: EstimateLens;
  billed: CostBasisComposition;
  amortized: CostBasisComposition;
  coverageCompletenessRef: string;
  allocationRef: string;
}

/** Monetary value safe for customer responses. */
export interface PublicMoneyComponent {
  amount: string;
  currencyCode: string;
}

/** Customer availability omits internal source, coverage, row-count, and reason references. */
export type PublicComponentAvailability = { status: 'available'; component: PublicMoneyComponent } | { status: 'unavailable' };

/** Customer support and availability for one actual or estimated component. */
export interface PublicComponentState {
  support: ComponentState['support'];
  availability: PublicComponentAvailability;
}

/** Customer projection for one billed or amortized basis. */
export interface PublicCostBasisComposition {
  basis: CostBasis;
  actual: PublicComponentState;
  estimated: PublicComponentState;
  combined: PublicComponentAvailability;
  status: CostBasisComposition['status'];
  estimateConfidence?: CostBasisComposition['estimateConfidence'];
}

/** Customer-facing cost composition with no authority, identity, generation, or evidence references. */
export interface PublicCostComposition {
  schemaVersion: 1;
  selectedLens: EstimateLens;
  billed: PublicCostBasisComposition;
  amortized: PublicCostBasisComposition;
}

/** Declares that a published artifact contains public, rather than authority, cost compositions. */
export const PUBLIC_COST_COMPOSITION_PROJECTION_CONTRACT_V1 = 'public-cost-composition/v1' as const;

const ESTIMATE_LENSES = new Set<string>(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const SUPPORT_STATES = new Set<string>(['supported', 'unsupported', 'unknown']);
const BASIS_STATUSES = new Set<string>(['actual-only', 'actual-plus-estimated', 'estimated-only', 'unavailable']);
const ESTIMATE_CONFIDENCE_VALUES = new Set<string>(['high', 'medium', 'low', 'unknown']);
const MONEY_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactFields = (value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean => {
  const allowed = new Set([...required, ...optional]);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};
const isPublicMoneyComponent = (value: unknown): value is PublicMoneyComponent =>
  isRecord(value) &&
  hasExactFields(value, ['amount', 'currencyCode']) &&
  typeof value.amount === 'string' &&
  MONEY_PATTERN.test(value.amount) &&
  typeof value.currencyCode === 'string' &&
  value.currencyCode.length > 0 &&
  value.currencyCode === value.currencyCode.trim();
const isPublicAvailability = (value: unknown): value is PublicComponentAvailability => {
  if (!isRecord(value)) return false;
  if (value.status === 'unavailable') return hasExactFields(value, ['status']);
  return value.status === 'available' && hasExactFields(value, ['status', 'component']) && isPublicMoneyComponent(value.component);
};
const isPublicComponentState = (value: unknown): value is PublicComponentState =>
  isRecord(value) &&
  hasExactFields(value, ['support', 'availability']) &&
  typeof value.support === 'string' &&
  SUPPORT_STATES.has(value.support) &&
  isPublicAvailability(value.availability);
const isPublicBasis = (value: unknown, expectedBasis: CostBasis): value is PublicCostBasisComposition =>
  isRecord(value) &&
  hasExactFields(value, ['basis', 'actual', 'estimated', 'combined', 'status'], ['estimateConfidence']) &&
  value.basis === expectedBasis &&
  isPublicComponentState(value.actual) &&
  isPublicComponentState(value.estimated) &&
  isPublicAvailability(value.combined) &&
  typeof value.status === 'string' &&
  BASIS_STATUSES.has(value.status) &&
  (value.estimateConfidence === undefined ||
    (typeof value.estimateConfidence === 'string' && ESTIMATE_CONFIDENCE_VALUES.has(value.estimateConfidence)));

/** Exact dependency-free validator for the public cost-composition boundary. */
export const isPublicCostComposition = (value: unknown): value is PublicCostComposition =>
  isRecord(value) &&
  hasExactFields(value, ['schemaVersion', 'selectedLens', 'billed', 'amortized']) &&
  value.schemaVersion === 1 &&
  typeof value.selectedLens === 'string' &&
  ESTIMATE_LENSES.has(value.selectedLens) &&
  isPublicBasis(value.billed, 'billed') &&
  isPublicBasis(value.amortized, 'amortized');

const isCostCompositionProjectionSource = (value: unknown): value is CostComposition => {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === 1 &&
    typeof value.compositionId === 'string' &&
    isRecord(value.coverageIdentity) &&
    typeof value.coverageCompletenessRef === 'string' &&
    typeof value.allocationRef === 'string' &&
    isRecord(value.billed) &&
    value.billed.basis === 'billed' &&
    isRecord(value.amortized) &&
    value.amortized.basis === 'amortized'
  );
};

const projectPublicAvailability = (availability: ComponentAvailability | PublicComponentAvailability): PublicComponentAvailability =>
  availability.status === 'available'
    ? {
        status: 'available',
        component: {
          amount: availability.component.amount,
          currencyCode: availability.component.currencyCode,
        },
      }
    : { status: 'unavailable' };

const projectPublicComponentState = (state: ComponentState | PublicComponentState): PublicComponentState => ({
  support: state.support,
  availability: projectPublicAvailability(state.availability),
});

const projectPublicBasis = (
  basis: CostBasisComposition | PublicCostBasisComposition,
  lens: EstimateLens
): PublicCostBasisComposition => {
  const combined =
    lens === 'actual-only' ? basis.actual.availability : lens === 'estimates-only' ? basis.estimated.availability : basis.combined;
  return {
    basis: basis.basis,
    actual: projectPublicComponentState(basis.actual),
    estimated: projectPublicComponentState(basis.estimated),
    combined: projectPublicAvailability(combined),
    status: basis.status,
    ...(basis.estimateConfidence === undefined ? {} : { estimateConfidence: basis.estimateConfidence }),
  };
};

/** Projects one authority composition to its exact customer-safe representation. */
export const projectPublicCostCompositionV1 = (
  composition: CostComposition | PublicCostComposition,
  lens: EstimateLens = composition.selectedLens
): PublicCostComposition => ({
  schemaVersion: 1,
  selectedLens: lens,
  billed: projectPublicBasis(composition.billed, lens),
  amortized: projectPublicBasis(composition.amortized, lens),
});

const visitPublicCostCompositions = (value: unknown, lens?: EstimateLens): unknown => {
  if (isCostCompositionProjectionSource(value)) return projectPublicCostCompositionV1(value, lens ?? value.selectedLens);
  if (isPublicCostComposition(value)) {
    return lens === undefined || lens === value.selectedLens ? value : projectPublicCostCompositionV1(value, lens);
  }
  if (Array.isArray(value)) {
    let changed = false;
    const projected = value.map(item => {
      const next = visitPublicCostCompositions(item, lens);
      changed ||= next !== item;
      return next;
    });
    return changed ? projected : value;
  }
  if (!isRecord(value)) return value;
  let changed = false;
  const projected = Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const next = visitPublicCostCompositions(item, lens);
      changed ||= next !== item;
      return [key, next];
    })
  );
  return changed ? projected : value;
};

/** Recursively removes authority/evidence fields from every cost composition in a JSON document. */
export const projectPublicCostCompositionsV1 = <T>(document: T): T => visitPublicCostCompositions(document) as T;

/** Applies a display lens to authority or already-public compositions without reconstructing money. */
export const applyPublicCostCompositionEstimateLensV1 = <T>(document: T, lens: EstimateLens): T => {
  const projected = visitPublicCostCompositions(document, lens);
  if (!isRecord(projected)) return projected as T;
  return { ...projected, selectedLens: lens } as T;
};
