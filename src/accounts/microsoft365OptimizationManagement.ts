import type {
  Microsoft365AgreementTerms,
  Microsoft365AgreementChannel,
  Microsoft365PricingOverride,
  Microsoft365PricingOverridesConfiguration,
} from './microsoft365PricingOverrides';
import type { Microsoft365CapabilityDefinition } from './microsoft365Capabilities';
import type {
  Microsoft365ObservedCommercialSubscription,
  Microsoft365OptimizationAccountDetail,
  Microsoft365OptimizationCoverage,
  Microsoft365OptimizationFinding,
  Microsoft365OptimizationSnapshot,
  Microsoft365OptimizationSummary,
} from './microsoft365Optimization';

/** Manager-recorded commercial context; does not change source-owned seats or perform a provider operation. */
export interface Microsoft365RecordedSubscriptionTerms {
  subscriptionId: string;
  skuId: string;
  term: 'monthly' | 'annual' | 'three_year' | 'unknown';
  billingFrequency: 'monthly' | 'annual' | 'upfront' | 'unknown';
  reductionOn: string | null;
  autoRenew: boolean | null;
}

/** A customer quote is separate from the legacy SKU-only monthly rate. Zero is explicit; omission uses reference pricing. */
export interface Microsoft365OptimizationPriceOverride extends Microsoft365PricingOverride {
  /** Null applies to all matching subscriptions; a specific subscription wins at read time. */
  subscriptionId: string | null;
  term: 'monthly' | 'annual' | 'three_year';
  billingFrequency: 'monthly' | 'annual' | 'upfront';
}

export type Microsoft365ProtectionCoverageScope =
  | { kind: 'tenant'; unit: 'accounts' | 'devices' }
  | { kind: 'accounts'; accountIds: string[] }
  | { kind: 'devices'; identitySource: 'entra' | 'intune' | 'customer'; deviceIds: string[] };

/** Customer confirmation only. Discovery hints cannot enter this input as proof; API validates provider/capability/scope ownership. */
export interface Microsoft365ProtectionCoverageInput {
  id: string;
  providerId: string;
  capabilityIds: string[];
  scope: Microsoft365ProtectionCoverageScope;
  basis: 'customer_confirmed';
  observedAt: string;
  /** Exclusive UTC instant. Null is an explicitly undated expiry, not measured continuing deployment. */
  validUntil: string | null;
  /** Private company-owned evidence reference; never forwarded into anonymous findings. */
  sourceReference: string | null;
}

export interface Microsoft365OptimizationConfigurationInput {
  subscriptionTerms: Microsoft365RecordedSubscriptionTerms[];
  termPrices: Microsoft365OptimizationPriceOverride[];
  protectionCoverage: Microsoft365ProtectionCoverageInput[];
}

/** Single conditional document makes agreed rates, terms and protection context one atomic Manage Pricing save. */
export interface Microsoft365PricingOverridesConfigurationV2 extends Omit<Microsoft365PricingOverridesConfiguration, 'schemaVersion'> {
  schemaVersion: 'microsoft-365-pricing-overrides/v2';
  companyId: string;
  optimization: Microsoft365OptimizationConfigurationInput;
}
export type Microsoft365PricingConfigurationDocument = Microsoft365PricingOverridesConfiguration | Microsoft365PricingOverridesConfigurationV2;

/** Requires manage permission and If-Match; company/tenant identity and attribution come from the authenticated route. */
export interface Microsoft365OptimizationConfigurationWriteRequest {
  schemaVersion: 'microsoft-365-pricing-write/v2';
  overrides: Microsoft365PricingOverride[];
  /** Omitted preserves; null clears. */
  agreementTerms?: Microsoft365AgreementTerms | null;
  optimization: Microsoft365OptimizationConfigurationInput;
}

/** Reviewed reference metadata, including unheld targets; never inferred customer purchasing eligibility. */
export interface Microsoft365OptimizationReferenceOffer {
  id: string;
  skuId: string;
  countryCode: string;
  currency: string;
  term: 'monthly' | 'annual' | 'three_year' | 'unknown';
  billingFrequency: 'monthly' | 'annual' | 'upfront' | 'unknown';
  channel: Microsoft365AgreementChannel;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  monthlyPremiumAssumptionAllowed: boolean;
  /** Normalized monthly tax-exclusive quote. Unknown term/payment basis cannot qualify a term comparison. */
  unitPriceMonthly: number | null;
  confidence: 'verified' | 'reference' | 'unknown';
  sourceUrl: string | null;
  checkedAt: string | null;
}

export interface Microsoft365OptimizationCatalogue {
  schemaVersion: 'microsoft-365-optimization-catalogue/v1';
  catalogueVersion: string;
  coverage: Microsoft365OptimizationCoverage;
  products: { skuId: string; skuPartNumber: string; productName: string }[];
  capabilities: Microsoft365CapabilityDefinition[];
  servicePlans: { servicePlanId: string; name: string }[];
  providers: { id: string; name: string; capabilityIds: string[] }[];
  referenceOffers: Microsoft365OptimizationReferenceOffer[];
  omittedProductCount: number;
  omittedOfferCount: number;
}

/** Manager-only read: includes private scopes, source references and document attribution. Ordinary viewers receive projections. */
export interface Microsoft365OptimizationManagementResponse {
  schemaVersion: 'microsoft-365-optimization-management/v1';
  companyId: string;
  tenantId: string;
  configuration: Microsoft365PricingConfigurationDocument;
  catalogue: Microsoft365OptimizationCatalogue;
  subscriptions: Microsoft365ObservedCommercialSubscription[];
  coverage: Microsoft365OptimizationCoverage;
  omittedSubscriptionCount: number;
  /** Empty v1 recovery projection retains the raw ETag for an explicit full v2 replacement. Transport failures are not absence. */
  unavailableReason?: 'invalid_configuration';
}

export interface Microsoft365OptimizationValidationIssue {
  path: string;
  code: string;
  message: string;
}

/** A preview never writes. Valid configuration can be saved while optional monetary comparisons remain unavailable. */
export interface Microsoft365OptimizationConfigurationPreview {
  schemaVersion: 'microsoft-365-optimization-preview/v1';
  companyId: string;
  tenantId: string;
  revision: string;
  canSave: boolean;
  normalized: Microsoft365OptimizationConfigurationWriteRequest | null;
  errors: Microsoft365OptimizationValidationIssue[];
  warnings: string[];
  summary: Microsoft365OptimizationSummary | null;
}

/** Price-independent monthly observations retain subscription identities/lifecycle movements for future term inference. No people or prices. */
export interface Microsoft365OptimizationHistorySnapshot extends Microsoft365OptimizationSnapshot {
  schemaVersion: 'microsoft-365-optimization-history/v1';
  month: string;
  catalogueVersion: string;
  /** Assignment-qualification rules must match before observations are combined. */
  ruleVersion: string;
  coverage: Microsoft365OptimizationCoverage;
  subscriptions: Microsoft365ObservedCommercialSubscription[];
  omittedSubscriptionCount: number;
  quantities: { skuId: string; assignedSeats: number | null; coverage: Microsoft365OptimizationCoverage }[];
  omittedProductCount: number;
}

export interface Microsoft365OptimizationProjectionBinding extends Microsoft365OptimizationSnapshot {
  companyId: string;
  currency: string | null;
  pricingRevision: string;
  contextRevision: string;
  catalogueVersion: string;
}

/** Used by account/list reads to reject a result belonging to a different displayed projection. */
export interface Microsoft365OptimizationAccountReadRequest {
  accountId: string;
  expected: Microsoft365OptimizationProjectionBinding;
}

export interface Microsoft365OptimizationAccountListRequest {
  findingId: string | null;
  pageIndex: number;
  expected: Microsoft365OptimizationProjectionBinding;
}

export interface Microsoft365OptimizationAccountListPage extends Microsoft365OptimizationProjectionBinding {
  schemaVersion: 'microsoft-365-optimization-account-list/v1';
  coverage: Microsoft365OptimizationCoverage;
  pageIndex: number;
  pageCount: number;
  pageAccountCounts: number[];
  observedAccountCount: number;
  exactAccountCount: number | null;
  findingId: string | null;
  /** Names/profiles remain in the existing scan-bound account pages. No group-average monetary attribution. */
  accounts: {
    accountId: string;
    findings: {
      findingId: string;
      kind: Exclude<Microsoft365OptimizationFinding['kind'], 'change_term'>;
      qualification: 'eligible' | 'conditional' | 'blocked';
    }[];
  }[];
}

export interface Microsoft365OptimizationUnavailableRead {
  state: 'not_collected' | 'stale' | 'unavailable';
  companyId: string;
  tenantId: string;
  reasonCodes: string[];
  current: Microsoft365OptimizationProjectionBinding | null;
}

export type Microsoft365OptimizationSummaryResponse =
  | {
      schemaVersion: 'microsoft-365-optimization-summary-response/v1';
      state: 'ready';
      summary: Microsoft365OptimizationSummary;
      catalogue: Microsoft365OptimizationCatalogue;
    }
  | (Microsoft365OptimizationUnavailableRead & { schemaVersion: 'microsoft-365-optimization-summary-response/v1' });
export type Microsoft365OptimizationAccountResponse =
  | { schemaVersion: 'microsoft-365-optimization-account-response/v1'; state: 'ready'; account: Microsoft365OptimizationAccountDetail }
  | (Microsoft365OptimizationUnavailableRead & { schemaVersion: 'microsoft-365-optimization-account-response/v1' });
export type Microsoft365OptimizationAccountListResponse =
  | { schemaVersion: 'microsoft-365-optimization-account-list-response/v1'; state: 'ready'; page: Microsoft365OptimizationAccountListPage }
  | (Microsoft365OptimizationUnavailableRead & { schemaVersion: 'microsoft-365-optimization-account-list-response/v1' });

/** Application byte limits apply before parsing. Guards also bound every collection and reject actor/scope injection. */
export const MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS = {
  configurationBytes: 1024 * 1024,
  catalogueBytes: 4 * 1024 * 1024,
  summaryResponseBytes: 6 * 1024 * 1024,
  managementResponseBytes: 8 * 1024 * 1024,
  previewBytes: 3 * 1024 * 1024,
  historyBytes: 2 * 1024 * 1024,
  accountListBytes: 4 * 1024 * 1024,
  accountResponseBytes: 512 * 1024,
  subscriptionTerms: 1000,
  termPrices: 1000,
  protectionCoverage: 200,
  scopeIdentities: 1000,
  catalogueProducts: 1000,
  catalogueOffers: 4000,
  catalogueServicePlans: 4000,
  accountPageSize: 5000,
  accountPages: 2000,
} as const;
