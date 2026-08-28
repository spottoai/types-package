export const FINANCIAL_EVIDENCE_BUNDLE_CONTRACT_VERSION_V1 = 'financial-evidence-bundle/v1' as const;
export const FINANCIAL_EVIDENCE_ASSESSMENT_CONTRACT_VERSION_V1 = 'financial-evidence-assessment/v1' as const;

export type FinancialEvidenceRoleV1 =
  | 'billing'
  | 'billing-currency-declaration'
  | 'estimate'
  | 'inventory-configuration'
  | 'retail-rate'
  | 'commitment-quote'
  | 'fx-conversion'
  | 'commercial-arrangement'
  | 'provider-access-observation'
  | 'configuration-timeline'
  | 'provider-price-schedule'
  | 'pricing-function'
  | 'charge-inclusion-policy'
  | 'settlement-revision'
  | 'eligibility-rule'
  | 'recommendation-scenario-set'
  | 'recommendation-lifecycle';

export interface FinancialEvidenceIntervalV1 {
  startDate: string;
  endDateExclusive: string;
  dateBasis: 'utc' | 'billing-calendar' | 'company-local';
  timeZone?: string;
}

export interface FinancialEvidenceIntrinsicTimeV1 {
  kind: 'observed-at' | 'published-at' | 'quoted-at';
  at: string;
}

export interface FinancialEvidenceReferenceV1 {
  evidenceRefId: string;
  role: FinancialEvidenceRoleV1;
  sourceKind: string;
  generationId?: string;
  revisionId?: string;
  digestAlgorithm: 'sha256';
  evidenceDigest: string;
  intrinsicTime: FinancialEvidenceIntrinsicTimeV1;
  effectivePeriod?: FinancialEvidenceIntervalV1;
}

export interface FinancialEvidenceBundleV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_EVIDENCE_BUNDLE_CONTRACT_VERSION_V1;
  bundleId: string;
  references: [FinancialEvidenceReferenceV1, ...FinancialEvidenceReferenceV1[]];
}

export type FinancialEvidenceBundleIdentityPreimageV1 = Omit<FinancialEvidenceBundleV1, 'bundleId'>;

export type FinancialScopeKindV2 =
  | 'canonical-resource-owner'
  | 'composite-resource'
  | 'commitment-instrument'
  | 'subscription-residual'
  | 'subscription-aggregate'
  | 'portfolio-currency-group';

export interface FinancialEvidenceAssessmentRequestV1 {
  provider: 'azure';
  providerAccountRefs: [string, ...string[]];
  scopeKind: FinancialScopeKindV2;
  scopeId: string;
  requestedEvidenceRoles: FinancialEvidenceRoleV1[];
}

export interface FinancialEvidenceRoleAssessmentV1 {
  role: FinancialEvidenceRoleV1;
  support: 'supported' | 'unsupported' | 'unknown';
  requestState: 'requested' | 'not-requested';
  productionState: 'produced' | 'not-produced';
  matchState: 'matched' | 'not-matched' | 'not-applicable';
  evidenceRefId?: string;
}

export interface FinancialEvidenceAssessmentSummaryV1 {
  requestedRoleCount: number;
  producedRoleCount: number;
  matchedRoleCount: number;
}

export type FinancialEvidenceAssessmentReasonV1 =
  | 'evidence-accepted'
  | 'evidence-not-produced'
  | 'evidence-not-matched'
  | 'evidence-incomplete'
  | 'evidence-stale'
  | 'reconciliation-failed'
  | 'currency-unresolved'
  | 'currency-conflicting'
  | 'ownership-unresolved'
  | 'unsupported-scope';

export interface FinancialEvidenceAssessmentV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_EVIDENCE_ASSESSMENT_CONTRACT_VERSION_V1;
  assessmentId: string;
  policyVersion: string;
  evaluatedAt: string;
  request: FinancialEvidenceAssessmentRequestV1;
  roleAssessments: FinancialEvidenceRoleAssessmentV1[];
  completeness: 'complete' | 'partial' | 'unavailable' | 'not-applicable';
  reconciliation: 'reconciled' | 'failed' | 'not-applicable';
  freshness: 'current' | 'stale' | 'unknown' | 'not-applicable';
  result: 'available' | 'unavailable';
  primaryReason: FinancialEvidenceAssessmentReasonV1;
  supportingReasons: FinancialEvidenceAssessmentReasonV1[];
  evidenceBundleId?: string;
  summary: FinancialEvidenceAssessmentSummaryV1;
}

export type FinancialEvidenceAssessmentIdentityPreimageV1 = Omit<FinancialEvidenceAssessmentV1, 'assessmentId'>;
