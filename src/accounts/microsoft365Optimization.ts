/** Additive contracts only. Collection, eligibility, optimization, pricing and authorization belong to consumers. */
export interface Microsoft365OptimizationSnapshot {
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId: string;
}

export interface Microsoft365OptimizationCoverage {
  state: 'complete' | 'partial' | 'unavailable';
  /** Complete has no reasons; partial/unavailable require at least one bounded reason code. */
  reasonCodes: string[];
}

export interface Microsoft365OptimizationCoverageByKind {
  combineLicenses: Microsoft365OptimizationCoverage;
  addProtection: Microsoft365OptimizationCoverage;
  changeTerm: Microsoft365OptimizationCoverage;
}

/** An observation or customer-recorded input, not a guarantee of cancellation or realized savings. */
export interface Microsoft365CommercialSubscription {
  /** Exact source identity; never join independent contracts by SKU or display name alone. */
  subscriptionId: string;
  skuId: string;
  quantity: number | null;
  term: 'monthly' | 'annual' | 'three_year' | 'unknown';
  billingFrequency: 'monthly' | 'annual' | 'upfront' | 'unknown';
  termSource: 'recorded' | 'billing' | 'inferred' | 'unknown';
  observedAt: string;
  /** A provider lifecycle transition is not necessarily renewal or a reduction opportunity. */
  nextLifecycleAt: string | null;
  reductionTiming: Microsoft365OptimizationTiming;
  inference: { method: 'renewal_history'; confidence: 'inferred'; observationMonths: string[] } | null;
  /** Conflicting source observations remain visible until resolved by the company projection. */
  conflicts: {
    source: 'recorded' | 'billing' | 'inferred';
    term: 'monthly' | 'annual' | 'three_year';
    billingFrequency: 'monthly' | 'annual' | 'upfront' | 'unknown';
  }[];
  autoRenew: boolean | null;
}

export interface Microsoft365StableDemandEvidence {
  skuId: string;
  /** Last complete qualifying observation of each completed UTC month, not a continuous within-month minimum. */
  basis: 'monthly_observations';
  coverage: Microsoft365OptimizationCoverage;
  currentAssignedSeats: number | null;
  /** At most six ascending months. Complete requires six consecutive known observations. No tenure-date fallback. */
  observations: { month: string; assignedSeats: number | null; complete: boolean }[];
}

/** Tenant-shared observations cannot contain any company's recorded commercial context, including nested timing/conflicts. */
export interface Microsoft365ObservedCommercialSubscription
  extends Omit<Microsoft365CommercialSubscription, 'termSource' | 'reductionTiming' | 'conflicts'> {
  termSource: 'billing' | 'inferred' | 'unknown';
  reductionTiming: Omit<Microsoft365OptimizationTiming, 'source'> & { source: 'billing' | 'lifecycle' | 'unknown' };
  conflicts: (Omit<Microsoft365CommercialSubscription['conflicts'][number], 'source'> & { source: 'billing' | 'inferred' })[];
}

/** IDs use the existing reviewed capability catalogue, not a second numerical tier model. */
export interface Microsoft365ProtectionObservation {
  capabilityId: string;
  rights: 'included' | 'missing' | 'unknown';
  /** Not observed is not proof of non-use. Registration is independent of policy enforcement. */
  deployment: 'observed' | 'not_observed' | 'unknown';
}

export type Microsoft365OptimizationQualification = 'eligible' | 'conditional' | 'blocked';

export interface Microsoft365OptimizationCandidate {
  id: string;
  kind: 'combine_licenses' | 'add_protection';
  mode: 'replace' | 'add_on';
  /** Only products removed by the option; empty for add-on-only options. Opaque retained products stay outside this set. */
  fromSkuIds: string[];
  /** Products acquired by the option, including a required Teams/add-on product. */
  toSkuIds: string[];
  qualification: Microsoft365OptimizationQualification;
  blockedBy: string[];
  requiredCapabilityIds: string[];
  /** Includes reviewed hierarchy expansion, so a gain can explicitly cover a lower-tier missing requirement. */
  gainedCapabilityIds: string[];
  lostServicePlanIds: string[];
  unverifiedServicePlanIds: string[];
}

export interface Microsoft365OptimizationAccountEvidence {
  accountId: string;
  /** Stable link to a full-population anonymous cohort; company exceptions can subtract specific accounts without loading everyone. */
  cohortId: string;
  heldSkuIds: string[];
  reviewDisposition: 'retained' | 'review_first';
  /** Not observed does not establish complete all-role absence. */
  privilege: 'observed' | 'not_observed' | 'unknown';
  mfaRegistration: 'capable' | 'not_capable' | 'unknown';
  coverage: Microsoft365OptimizationCoverage;
  protection: Microsoft365ProtectionObservation[];
  candidates: Microsoft365OptimizationCandidate[];
  omittedCandidateCount: number;
}

/** Uniform price-independent alternatives over the full observed population, not a bounded page of people. */
export interface Microsoft365OptimizationCohort extends Omit<Microsoft365OptimizationAccountEvidence, 'accountId' | 'cohortId'> {
  id: string;
  accountCount: number;
}

/** Internal engine facts for bounded API repricing. Applications enforce 4 MiB decoded bytes; never expose this as a public summary. */
export interface Microsoft365OptimizationCohortEvidence extends Microsoft365OptimizationSnapshot {
  schemaVersion: 'microsoft-365-optimization-cohorts/v1';
  catalogueVersion: string;
  coverage: Microsoft365OptimizationCoverage;
  coverageByKind: Microsoft365OptimizationCoverageByKind;
  observedAccountCount: number;
  omittedAccountCount: number;
  cohorts: Microsoft365OptimizationCohort[];
}

/** Private, company-independent engine evidence; never return this as a public summary or AI projection. */
export interface Microsoft365OptimizationEvidence extends Microsoft365OptimizationSnapshot {
  schemaVersion: 'microsoft-365-optimization-evidence/v1';
  catalogueVersion: string;
  coverage: Microsoft365OptimizationCoverage;
  coverageByKind: Microsoft365OptimizationCoverageByKind;
  /** Zero based. All pages share scan identity and full observed population metadata. Omitted excludes other published pages. */
  pageIndex: number;
  pageCount: number;
  /** At most 2,000 page counts; byte budgets can yield pages smaller than 5,000 accounts. */
  pageAccountCounts: number[];
  observedAccountCount: number;
  /** At most 5,000 per private page. Consumers enforce a 24 MiB decoded-byte limit and safe page/stamp binding. */
  accounts: Microsoft365OptimizationAccountEvidence[];
  omittedAccountCount: number;
  /** Customer-recorded terms belong in company context, never tenant-shared engine evidence. */
  subscriptions: Microsoft365ObservedCommercialSubscription[];
  omittedSubscriptionCount: number;
  demandBySku: Microsoft365StableDemandEvidence[];
}

export interface Microsoft365OptimizationTiming {
  date: string | null;
  source: 'recorded' | 'billing' | 'lifecycle' | 'unknown';
  /** Lifecycle observations alone can never confirm a commercial action date. */
  confirmed: boolean;
}

/** All amounts are selected-currency monthly tax-exclusive estimates, never invoice evidence. */
export interface Microsoft365OptimizationPriceReceipt {
  offerId: string | null;
  countryCode: string | null;
  confidence: 'verified' | 'reference' | 'customer' | 'unknown';
  channel: import('./microsoft365PricingOverrides').Microsoft365AgreementChannel | null;
  /** Reviewed applicability, never inferred from currency or an agreed monthly rate. */
  monthlyPremiumAssumptionAllowed: boolean;
}

export interface Microsoft365OptimizationPricedOption {
  id: string;
  mode: 'replace' | 'add_on';
  fromSkuIds: string[];
  toSkuIds: string[];
  qualification: Microsoft365OptimizationQualification;
  blockedBy: string[];
  requiredCapabilityIds: string[];
  gainedCapabilityIds: string[];
  lostServicePlanIds: string[];
  unverifiedServicePlanIds: string[];
  priceBasis: 'list' | 'agreed' | 'mixed' | 'unavailable';
  /** Total proposed minus replaced monthly cost for this group/account. Signed and non-additive; null is unknown. */
  monthlyCostChange: number | null;
  /** One row per distinct source/target SKU. Explicit zero is known; unknown cannot receive a source label. */
  unitPrices: {
    skuId: string;
    unitPriceMonthly: number | null;
    source: 'list' | 'agreed' | 'unavailable';
    receipt: Microsoft365OptimizationPriceReceipt;
  }[];
}

export interface Microsoft365OptimizationFindingBase {
  id: string;
  /** Exact is null for incomplete scope. Observed counts are confirmed minimums; no monetary exact total is invented. */
  population: { unit: 'accounts' | 'seats'; exactCount: number | null; observedCount: number };
  qualification: Microsoft365OptimizationQualification;
  blockedBy: string[];
  timing: Microsoft365OptimizationTiming;
}

export interface Microsoft365CombineLicensesFinding extends Microsoft365OptimizationFindingBase {
  kind: 'combine_licenses';
  options: Microsoft365OptimizationPricedOption[];
  omittedOptionCount: number;
  /** Select only a qualified, fully priced option. Unknown alternatives prevent a cheapest-option claim. */
  selectedOptionId: string | null;
  /** Standalone estimate, never additive. */
  scenarioMonthlySaving: number | null;
  /** Compatible allocated contribution after removal/duplicate precedence, never an additional legacy credit. */
  portfolioMonthlySaving: number | null;
}

export interface Microsoft365AddProtectionFinding extends Microsoft365OptimizationFindingBase {
  kind: 'add_protection';
  options: Microsoft365OptimizationPricedOption[];
  omittedOptionCount: number;
  selectedOptionId: string | null;
  missingCapabilityIds: string[];
  configurationReviewCapabilityIds: string[];
  /** Projected only after company-context scope, evidence and validity have been checked. Hints do not qualify. */
  thirdPartyCoverage: {
    capabilityId: string;
    providerId: string;
    scopeReference: string;
    unit: 'accounts' | 'devices';
    coveredCount: number;
    observedAt: string;
    validUntil: string | null;
  }[];
  privilegedAccountCount: number | null;
  mfaGapAccountCount: number | null;
  /** Nonnegative investment; zero can mean configuration-only review. Never a savings field or offset. */
  monthlyInvestment: number | null;
}

export interface Microsoft365OptimizationTermPrice {
  term: 'monthly' | 'annual' | 'three_year';
  billingFrequency: 'monthly' | 'annual' | 'upfront' | 'unknown';
  unitPriceMonthly: number | null;
  source: 'list' | 'agreed' | 'unavailable';
  receipt: Microsoft365OptimizationPriceReceipt;
}

export interface Microsoft365ChangeTermFinding extends Microsoft365OptimizationFindingBase {
  kind: 'change_term';
  skuId: string;
  subscriptions: {
    subscriptionId: string;
    termSource: Microsoft365CommercialSubscription['termSource'];
    term: Microsoft365CommercialSubscription['term'];
    quantity: number | null;
    hasConflict: boolean;
  }[];
  /** Up to 1,000 rows. Any omission makes the comparison conditional and unvalued. */
  omittedSubscriptionCount: number;
  monthlySeats: number | null;
  /** Retained annual plus three-year capacity. */
  committedSeats: number | null;
  stableSeats: number | null;
  convertibleSeats: number | null;
  historyMonths: string[];
  priceMethod: 'matched_offers' | 'assumed_20_percent' | 'unavailable';
  sourcePrice: Microsoft365OptimizationTermPrice;
  targetPrice: Microsoft365OptimizationTermPrice;
  scenarioMonthlySaving: number | null;
  portfolioMonthlySaving: number | null;
}

export type Microsoft365OptimizationFinding = Microsoft365CombineLicensesFinding | Microsoft365AddProtectionFinding | Microsoft365ChangeTermFinding;

/** Anonymous selected-currency groups. API/AI authorization and identity-free AI allowlisting remain application responsibilities. */
export interface Microsoft365OptimizationSummary extends Microsoft365OptimizationSnapshot {
  schemaVersion: 'microsoft-365-optimization-summary/v1';
  companyId: string;
  pricingRevision: string;
  contextRevision: string;
  catalogueVersion: string;
  projectedAt: string;
  currency: string | null;
  coverage: Microsoft365OptimizationCoverage;
  coverageByKind: Microsoft365OptimizationCoverageByKind;
  /** At most 256 groups. Consumers enforce 1 MiB decoded bytes; omitted/unknown groups withhold exact totals. */
  groups: Microsoft365OptimizationFinding[];
  omittedGroupCount: number;
  /** This projection's compatible contributions only. Never add to legacy unused/downgrade totals without joint allocation. */
  portfolioMonthlySaving: number | null;
  protectionMonthlyInvestment: number | null;
}

/** One authorized account. Consumers must match all scan, currency and company pricing/context revisions before merging. */
export interface Microsoft365OptimizationAccountDetail extends Microsoft365OptimizationSnapshot {
  schemaVersion: 'microsoft-365-optimization-account/v1';
  companyId: string;
  pricingRevision: string;
  contextRevision: string;
  catalogueVersion: string;
  projectedAt: string;
  currency: string | null;
  coverage: Microsoft365OptimizationCoverage;
  accountId: string;
  reviewDisposition: 'retained' | 'review_first' | 'kept';
  privilege: 'observed' | 'not_observed' | 'unknown';
  mfaRegistration: 'capable' | 'not_capable' | 'unknown';
  /** Nested finding IDs bind options to their kind. Amounts are for this account, not group averages. Limit: 256 KiB. */
  findings: (Microsoft365CombineLicensesFinding | Microsoft365AddProtectionFinding)[];
}
