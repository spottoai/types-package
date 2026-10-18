/** Shared assessment contracts. Company authorization and scanner execution remain application-owned. */
export type AssessmentProvider = 'azure' | 'aws';
export type AssessmentScopeType = 'subscription' | 'tenant' | 'account';
export type AssessmentJsonValue = null | boolean | number | string | AssessmentJsonValue[] | { [key: string]: AssessmentJsonValue };
export interface AssessmentNativeScope {
  providerName: AssessmentProvider;
  scopeType: AssessmentScopeType;
  scopeId: string;
}
export interface AssessmentPageReference {
  sha256: string;
  count: number;
  decodedBytes: number;
}
export interface FrameworkCatalogueControl {
  controlId: string;
  title: string;
  description: string;
  checkIds: string[];
  attributes: AssessmentJsonValue[];
  metadata: { [key: string]: AssessmentJsonValue };
}
export interface FrameworkCatalogueCheck {
  checkId: string;
  title: string;
  description: string;
  risk: string;
  severity: string;
  service: string;
  resourceType: string;
  categories: string[];
  references: string[];
  scopeTypes: AssessmentScopeType[];
  remediation: {
    recommendation: { text: string; url: string };
    code: { cli: string; nativeIaC: string; other: string; terraform: string };
  };
}
export interface FrameworkCatalogueDocument {
  schemaVersion: 2;
  sourceVersion: string;
  frameworkId: string;
  name: string;
  version: string;
  description: string;
  catalogueSha256: string;
  attribution: { project: 'Prowler'; url: string };
  controls: FrameworkCatalogueControl[];
  checks: FrameworkCatalogueCheck[];
  unavailableCheckIds: string[];
}
export interface FrameworkCatalogueIndexEntry {
  frameworkId: string;
  aliases: string[];
  name: string;
  version: string;
  description: string;
  catalogueSha256: string;
  catalogueContentSha256: string;
  scopeTypes: AssessmentScopeType[];
}
export interface FrameworkCatalogueIndexDocument {
  schemaVersion: 2;
  providerName: AssessmentProvider;
  sourceVersion: string;
  bundleSha256: string;
  frameworks: FrameworkCatalogueIndexEntry[];
}
export interface FrameworkCatalogueReference {
  sourceVersion: string;
  bundleSha256: string;
  frameworkId: string;
  catalogueSha256: string;
  catalogueContentSha256: string;
}
export type FrameworkFindingStatus = 'PASS' | 'FAIL' | 'MANUAL';
export interface FrameworkFindingStatusCounts {
  PASS: number;
  FAIL: number;
  MANUAL: number;
}
export interface FrameworkFinding {
  id: string;
  checkId: string;
  resourceId: string;
  status: FrameworkFindingStatus;
  collectionStatus: 'verified' | 'unverified';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational' | 'unknown';
  message: string;
  controlIds: string[];
  resourceMatch: 'matched' | 'unmatched' | 'subscription-scope' | 'ancestor-scope' | 'directory' | 'inventory-unavailable';
  resource?: { name?: string; type?: string; resourceGroup?: string };
}
export type FrameworkControlStatus = 'failed' | 'passed' | 'partial' | 'manual' | 'not-applicable' | 'not-assessed';
export type FrameworkControlStatusCounts = Record<FrameworkControlStatus, number>;
export interface FrameworkControlAssessment {
  controlId: string;
  status: FrameworkControlStatus;
  reason: string;
  requiredScopes: AssessmentScopeType[];
  statusCounts: FrameworkFindingStatusCounts;
  checkCounts: { evaluated: number; blocked: number; manual: number; notApplicable: number; notAssessed: number };
}
export interface FrameworkAssessmentSource {
  name: 'prowler';
  version: string;
  requestId: string;
  eventId: string;
  requestedAt: string;
  assessedAt: string;
}
export type FrameworkAssessmentCoverage = 'complete' | 'partial' | 'blocked' | 'unassessed';
export interface FrameworkAssessmentDocument {
  schemaVersion: 2;
  /** Exact publication generation shared with the scope summary commit marker. */
  generationSha256: string;
  scope: AssessmentNativeScope;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  catalogue: FrameworkCatalogueReference;
  source: FrameworkAssessmentSource;
  coverage: FrameworkAssessmentCoverage;
  summary: { findingCount: number; statusCounts: FrameworkFindingStatusCounts };
  /** Legacy access details are bounded plain JSON pending a separate access-contract migration. */
  access: { [key: string]: AssessmentJsonValue };
  controls: FrameworkControlAssessment[];
  findingPages: AssessmentPageReference[];
}
export interface FrameworkAssessmentSummaryEntry {
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  catalogue: FrameworkCatalogueReference;
  source: FrameworkAssessmentSource;
  coverage: FrameworkAssessmentCoverage;
  findingCount: number;
  controlStatusCounts: FrameworkControlStatusCounts;
}
export interface FrameworkAssessmentSummaryDocument {
  schemaVersion: 2;
  scope: AssessmentNativeScope;
  sourceVersion: string;
  generationSha256: string;
  frameworks: FrameworkAssessmentSummaryEntry[];
}
export interface FrameworkFindingPageDocument {
  schemaVersion: 2;
  items: FrameworkFinding[];
}

export interface EvidenceObservation {
  id: string;
  upstreamId: string;
  checkId: string;
  resourceId: string;
  status: FrameworkFindingStatus;
  collectionStatus: 'verified' | 'unverified';
  severity: string;
  message: string;
  reviewNotes: string[];
  frameworkMappings: Record<string, string[]>;
  evidenceCount?: number;
}
export interface ScopeScanManifest {
  schemaVersion: 2;
  scope: AssessmentNativeScope;
  sourceVersion: string;
  catalogueBundleSha256: string;
  request: { requestId: string; requestedAt: string };
  /** Requesting company is audit context only; it never contributes to native artifact identity. */
  audit: { companyId: string; bootstrapSubscriptionId?: string };
  attemptId: string;
  generatedAt: string;
  exitCode: 0 | 3;
  rawFindingCount: number;
  findingCount: number;
  quarantinedFindingCount: number;
  statusCounts: FrameworkFindingStatusCounts;
  access: Record<string, AssessmentJsonValue>;
  selectedCheckIds: string[];
  rawPages: AssessmentPageReference[];
  observationPages: AssessmentPageReference[];
}
export interface ScopeScanRawPageDocument {
  schemaVersion: 2;
  items: AssessmentJsonValue[];
}
export interface ScopeScanEvidencePageDocument {
  schemaVersion: 2;
  items: EvidenceObservation[];
}
export interface ScopeScanCompletion {
  schemaVersion: 2;
  type: 'prowler.scope-scan.completed.v2';
  eventId: string;
  scope: AssessmentNativeScope;
  requestId: string;
  attemptId: string;
  sourceVersion: string;
  manifestSha256: string;
  observedAt: string;
}
export interface ScopeScanStatusDocument {
  schemaVersion: 2;
  scope: AssessmentNativeScope;
  sourceVersion: string;
  requestId: string;
  requestedAt: string;
  updatedAt: string;
  state: 'running' | 'collected' | 'processing' | 'completed' | 'failed' | 'superseded';
  reason?: string;
  retryable: boolean;
  attempt: number;
}
export const SUPPORTED_ASSESSMENT_SOURCE_VERSIONS: readonly string[] = Object.freeze(['5.45.0']);

export const FRAMEWORK_ASSESSMENT_LIMITS = Object.freeze({
  pageDecodedBytes: 1024 * 1024,
  pageItems: 1000,
  documentDecodedBytes: 8 * 1024 * 1024,
  catalogueItems: 10000,
  frameworks: 1000,
  pages: 10000,
  textLength: 65536,
  jsonDepth: 12,
  jsonNodes: 500000,
});
