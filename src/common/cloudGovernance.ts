import type { ArtifactProvider } from './artifactGeneration';
import type { ArtifactFreshnessVerdict } from './artifactEvidence';
import type { ReportBoundedRows } from './boundedRows';

/** Public projections only. Native collection, authorization and storage belong to their owning repos. */
export const CLOUD_GOVERNANCE_SCHEMA_VERSION = 1 as const;

/** Native ID within the envelope's provider; container covers OU/management-group ancestry. */
export interface CloudGovernanceScopeReference {
  scopeType: 'account' | 'organization' | 'directory' | 'subscription' | 'container';
  providerScopeId: string;
  displayName?: string;
}

/** API readers must independently authorize this binding and every nested scope. */
export interface CloudGovernanceScope extends CloudGovernanceScopeReference {
  providerName: ArtifactProvider;
  companyId: string;
  cloudAccountId: string;
}

interface CloudGovernanceSourceCoverageBase {
  /** Unique document-local key, including scope when one source is collected across accounts. */
  id: string;
  /** Open producer catalogue identifier. No provider API or permission catalogue is defined here. */
  source: string;
  scope: CloudGovernanceScopeReference;
}

/** Collection completeness and evidence freshness are independent; empty rows never establish completeness. */
export type CloudGovernanceSourceCoverage = CloudGovernanceSourceCoverageBase &
  (
    | { state: 'complete'; observedAt: string; freshness: ArtifactFreshnessVerdict; reason?: never }
    | { state: 'partial'; observedAt?: string; freshness: ArtifactFreshnessVerdict; reason: string }
    | { state: 'unavailable'; observedAt?: string; freshness: 'stale' | 'expired' | 'unknown'; reason: string }
    | { state: 'not-collected' | 'not-applicable'; observedAt?: never; freshness: 'unknown'; reason: string }
  );

/** Safe provider references only; never include raw SDK responses, policy documents or credential values. */
export interface CloudGovernanceEvidenceReference {
  /** Must resolve to a coverage entry in the same document, including the source's collection scope. */
  coverageId: string;
  nativeId?: string;
}

export type CloudGovernanceEvidence = readonly [CloudGovernanceEvidenceReference, ...CloudGovernanceEvidenceReference[]];

/** Zero and false are known values. Unknown/not-applicable cannot carry a fabricated value. */
export type CloudGovernanceObservation<Value> =
  | { state: 'known'; value: Value; evidence: CloudGovernanceEvidence }
  | { state: 'unknown' | 'not-applicable'; reason: string; evidence?: readonly CloudGovernanceEvidenceReference[]; value?: never };

/** IAM/root registration does not prove enforcement or workforce identity-provider MFA. */
export interface CloudGovernanceCredentialPosture {
  mfaRegistration: CloudGovernanceObservation<boolean>;
  mfaEnforcement: CloudGovernanceObservation<boolean>;
  passwordEnabled?: CloudGovernanceObservation<boolean>;
  /** Nonnegative integer, never access key identifiers or values. */
  activeAccessKeyCount?: CloudGovernanceObservation<number>;
  /** ISO-8601 UTC; absent/unknown never means the principal has never signed in. */
  lastSignInAt?: CloudGovernanceObservation<string>;
  /** ISO-8601 UTC; distinct from a role activation or a human sign-in. */
  lastCredentialUseAt?: CloudGovernanceObservation<string>;
}

export interface CloudGovernanceRootAccount {
  scope: CloudGovernanceScopeReference & { scopeType: 'account' };
  /** Centralized removal is explicit; MFA can be not-applicable when root credentials are removed. */
  credentialState: CloudGovernanceObservation<'present' | 'removed'>;
  credentials: CloudGovernanceCredentialPosture;
}

interface CloudGovernanceCheckBase {
  /** Open producer catalogue identifier, not a hardcoded public enum of provider checks. */
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  summary?: string;
  /** Safe affected identities, with observed totals retained when the published list is bounded. */
  affectedPrincipals?: ReportBoundedRows<CloudGovernancePrincipal>;
}

export type CloudGovernanceCheck = CloudGovernanceCheckBase &
  (
    | { status: 'passed' | 'attention'; evidence: CloudGovernanceEvidence; reason?: never }
    | { status: 'not-assessed' | 'not-applicable'; reason: string; evidence?: readonly CloudGovernanceEvidenceReference[] }
  );

export interface CloudGovernanceChecklist {
  id: string;
  name: string;
  scope: CloudGovernanceScopeReference;
  /** Counts describe observed checks; source gaps remain in envelope coverage. */
  checks: ReportBoundedRows<CloudGovernanceCheck>;
}

interface CloudGovernanceEnvelope {
  schemaVersion: typeof CLOUD_GOVERNANCE_SCHEMA_VERSION;
  /** ISO-8601 UTC publication time. Never substitute it for a source observation timestamp. */
  generatedAt: string;
  scope: CloudGovernanceScope;
  /** Include every required source, including those not collected; absence is not success. */
  coverage: CloudGovernanceSourceCoverage[];
}

/** Overview of observed root/credential checks; does not replace native regulatory-compliance reports. */
export interface CloudGovernanceReport extends CloudGovernanceEnvelope {
  rootAccounts: ReportBoundedRows<CloudGovernanceRootAccount>;
  checklists: ReportBoundedRows<CloudGovernanceChecklist>;
}

export interface CloudGovernancePrincipal {
  /** Unique within this document, qualified by origin scope/directory to avoid cross-account collisions. */
  id: string;
  /** Account principals support organization management/delegated administration. */
  kind: 'user' | 'group' | 'role' | 'application' | 'account' | 'root' | 'external' | 'unknown';
  /** Origin scope; workforce identities may originate in a directory/organization outside the target account. */
  scope: CloudGovernanceScopeReference;
  nativeId?: string;
  displayName?: string;
  /** Collect only posture applicable to this principal; role MFA conditions are assignment restrictions. */
  credentials?: CloudGovernanceCredentialPosture;
}

export interface CloudGovernanceRoleReference {
  id: string;
  name?: string;
  nativeId?: string;
}

/** Each step references a retained principal and source evidence, not a raw role trust policy. */
export interface CloudGovernanceAccessPathStep {
  kind: 'direct-assignment' | 'group-membership' | 'role-assumption' | 'federation';
  principalId: string;
  evidence: CloudGovernanceEvidence;
}

interface CloudGovernanceAssignmentBase {
  /** ISO-8601 UTC bounds when supplied by the assignment source. No fabricated end date for standing access. */
  startsAt?: string;
  expiresAt?: string;
  /** ISO-8601 UTC, collected activation evidence only; session duration is not PIM eligibility. */
  lastActivatedAt?: CloudGovernanceObservation<string>;
}

export type CloudGovernanceAssignment = CloudGovernanceAssignmentBase &
  (
    | { mode: 'standing' | 'eligible' | 'temporary'; evidence: CloudGovernanceEvidence; reason?: never }
    | { mode: 'unknown'; reason: string; evidence?: readonly CloudGovernanceEvidenceReference[] }
  );

interface CloudGovernanceAccessRestrictionBase {
  kind: 'explicit-deny' | 'permissions-boundary' | 'organization-policy' | 'resource-policy' | 'session-policy' | 'trust-condition' | 'other';
  summary?: string;
  /** Collection scope or ancestor where the restriction was observed. */
  scope?: CloudGovernanceScopeReference;
}

/** Observed restrictions can be conditional. A source gap never establishes an absence of restrictions. */
export type CloudGovernanceAccessRestriction = CloudGovernanceAccessRestrictionBase &
  (
    | { status: 'observed' | 'not-observed'; evidence: CloudGovernanceEvidence; reason?: never }
    | { status: 'unknown'; reason: string; evidence?: readonly CloudGovernanceEvidenceReference[] }
  );

/** Static assigned-permission evidence is not a universal effective-authorization decision. */
export interface CloudGovernanceAccessAssessment {
  basis: 'assigned-permissions';
  /** Confidence in the assignment/classification evidence, not confidence in unrestricted effective access. */
  confidence: 'high' | 'medium' | 'low';
  restrictions: CloudGovernanceAccessRestriction[];
  /** Always explain the static-analysis boundary and any uncollected policy/trust/membership evidence. */
  limitations: readonly [string, ...string[]];
}

export interface CloudGovernanceAccessGrant {
  id: string;
  /** Must resolve to a retained principal. A person may have several grants across roles and accounts. */
  principalId: string;
  /** Exact target scope; permission-set display names alone never prove destination-account permissions. */
  scope: CloudGovernanceScopeReference;
  role: CloudGovernanceRoleReference;
  privilege: CloudGovernanceObservation<'administrator' | 'privileged'>;
  assignment: CloudGovernanceAssignment;
  /** Ordered derivation steps ending at the assigned principal/role; all references resolve in this document. */
  accessPath: readonly [CloudGovernanceAccessPathStep, ...CloudGovernanceAccessPathStep[]];
  assessment: CloudGovernanceAccessAssessment;
}

/**
 * Bounded privileged-access projection. totalCount describes observed rows, not
 * a complete provider population unless coverage proves it. Count distinct
 * principal IDs, never grant rows, when summarizing administrators. Retain all
 * principals referenced by published grants/paths even when other rows are omitted.
 */
export interface CloudGovernanceAccessReport extends CloudGovernanceEnvelope {
  principals: ReportBoundedRows<CloudGovernancePrincipal>;
  grants: ReportBoundedRows<CloudGovernanceAccessGrant>;
}
