import type {
  CloudGovernanceAccessGrant,
  CloudGovernanceAccessReport,
  CloudGovernanceCheck,
  CloudGovernanceObservation,
  CloudGovernanceReport,
  CloudGovernanceScope,
  CloudGovernanceSourceCoverage,
} from './cloudGovernance';
import { CLOUD_GOVERNANCE_SCHEMA_VERSION } from './cloudGovernance';

const scope: CloudGovernanceScope = {
  providerName: 'aws',
  scopeType: 'account',
  providerScopeId: '123456789012',
  companyId: 'company-1',
  cloudAccountId: 'connection-1',
};
const account = { scopeType: 'account', providerScopeId: scope.providerScopeId } as const;
const evidence = [{ coverageId: 'credential-report', nativeId: 'arn:aws:iam::123456789012:root' }] as const;
const coverage: CloudGovernanceSourceCoverage[] = [
  {
    id: 'credential-report',
    source: 'iam-credential-report',
    scope: account,
    state: 'complete',
    observedAt: '2026-10-04T00:00:00.000Z',
    freshness: 'current',
  },
  {
    id: 'iam-authorization',
    source: 'iam-authorization',
    scope: account,
    state: 'partial',
    observedAt: '2026-10-04T00:00:00.000Z',
    freshness: 'current',
    reason: 'policy-read-denied',
  },
  {
    id: 'workforce',
    source: 'workforce-assignments',
    scope: { scopeType: 'organization', providerScopeId: 'o-example123' },
    state: 'not-collected',
    freshness: 'unknown',
    reason: 'organization-connection-required',
  },
];

const report: CloudGovernanceReport = {
  schemaVersion: CLOUD_GOVERNANCE_SCHEMA_VERSION,
  generatedAt: '2026-10-04T00:01:00.000Z',
  scope,
  coverage,
  rootAccounts: {
    totalCount: 1,
    omittedCount: 0,
    rows: [
      {
        scope: account,
        credentialState: { state: 'known', value: 'present', evidence },
        credentials: {
          activeAccessKeyCount: { state: 'known', value: 0, evidence },
          mfaRegistration: { state: 'known', value: true, evidence },
          mfaEnforcement: { state: 'unknown', reason: 'credential-report-does-not-prove-enforcement' },
        },
      },
    ],
  },
  checklists: {
    totalCount: 1,
    omittedCount: 0,
    rows: [
      {
        id: 'aws-root-account-hardening',
        name: 'Root account hardening',
        scope: account,
        checks: {
          totalCount: 1,
          omittedCount: 0,
          rows: [{ id: 'root-account-access-keys', title: 'Root has no active access keys', status: 'passed', severity: 'high', evidence }],
        },
      },
    ],
  },
};

const assignmentEvidence = [{ coverageId: 'iam-authorization', nativeId: 'arn:aws:iam::aws:policy/AdministratorAccess' }] as const;
const userCredentialEvidence = [{ coverageId: 'credential-report', nativeId: 'arn:aws:iam::123456789012:user/example' }] as const;
const grant: CloudGovernanceAccessGrant = {
  id: 'assignment-1',
  principalId: 'iam-user-1',
  scope: account,
  role: { id: 'administrator-policy', name: 'AdministratorAccess', nativeId: 'arn:aws:iam::aws:policy/AdministratorAccess' },
  privilege: { state: 'known', value: 'administrator', evidence: assignmentEvidence },
  assignment: { mode: 'standing', evidence: assignmentEvidence },
  accessPath: [{ kind: 'direct-assignment', principalId: 'iam-user-1', evidence: assignmentEvidence }],
  assessment: {
    basis: 'assigned-permissions',
    confidence: 'high',
    limitations: ['Organization policies were not collected; this is not a guarantee of effective access.'],
    restrictions: [{ kind: 'organization-policy', status: 'unknown', reason: 'organization-connection-required' }],
  },
};
const access: CloudGovernanceAccessReport = {
  schemaVersion: CLOUD_GOVERNANCE_SCHEMA_VERSION,
  generatedAt: report.generatedAt,
  scope,
  coverage,
  principals: {
    totalCount: 1,
    omittedCount: 0,
    rows: [
      {
        id: 'iam-user-1',
        kind: 'user',
        scope: account,
        nativeId: 'arn:aws:iam::123456789012:user/example',
        credentials: {
          mfaRegistration: { state: 'known', value: true, evidence: userCredentialEvidence },
          mfaEnforcement: { state: 'unknown', reason: 'credential-report-does-not-prove-enforcement' },
        },
      },
    ],
  },
  grants: { totalCount: 1, omittedCount: 0, rows: [grant] },
};

// An organization projection resolves workforce membership into exact account grants.
const workforceEvidence = [{ coverageId: 'workforce' }] as const;
const workforceGrant: CloudGovernanceAccessGrant = {
  ...grant,
  id: 'workforce-assignment-1',
  principalId: 'workforce-user-1',
  role: { id: 'permission-set-1', name: 'Administrator' },
  privilege: { state: 'known', value: 'administrator', evidence: workforceEvidence },
  assignment: { mode: 'standing', evidence: workforceEvidence },
  accessPath: [
    { kind: 'group-membership', principalId: 'workforce-group-1', evidence: workforceEvidence },
    { kind: 'federation', principalId: 'account-role-1', evidence: workforceEvidence },
  ],
};
const organizationScope = { scopeType: 'organization', providerScopeId: 'o-example123' } as const;
const organizationAccess: CloudGovernanceAccessReport = {
  ...access,
  scope: { ...scope, ...organizationScope },
  coverage: [
    {
      id: 'workforce',
      source: 'workforce-assignments',
      scope: organizationScope,
      state: 'complete',
      observedAt: report.generatedAt,
      freshness: 'current',
    },
    {
      id: 'organization-policies',
      source: 'organization-policies',
      scope: organizationScope,
      state: 'unavailable',
      reason: 'access-denied',
      freshness: 'unknown',
    },
  ],
  principals: {
    totalCount: 3,
    omittedCount: 0,
    rows: [
      {
        id: 'workforce-user-1',
        kind: 'user',
        scope: organizationScope,
        credentials: {
          mfaRegistration: { state: 'unknown', reason: 'external-identity-provider-not-collected' },
          mfaEnforcement: { state: 'unknown', reason: 'external-identity-provider-not-collected' },
        },
      },
      { id: 'workforce-group-1', kind: 'group', scope: organizationScope },
      { id: 'account-role-1', kind: 'role', scope: account },
    ],
  },
  grants: { totalCount: 1, omittedCount: 0, rows: [workforceGrant] },
};

// Existing Azure contracts remain separate; the new projection also admits Azure scopes/PIM evidence.
const azureGrant: CloudGovernanceAccessGrant = {
  ...grant,
  id: 'entra-eligible-1',
  principalId: 'directory-user-1',
  scope: { scopeType: 'directory', providerScopeId: 'tenant-1' },
  role: { id: 'global-administrator', name: 'Global Administrator' },
  privilege: { state: 'known', value: 'administrator', evidence: [{ coverageId: 'directory-roles' }] },
  assignment: { mode: 'eligible', evidence: [{ coverageId: 'directory-roles' }] },
  accessPath: [{ kind: 'direct-assignment', principalId: 'directory-user-1', evidence: [{ coverageId: 'directory-roles' }] }],
};
const azureAccess: CloudGovernanceAccessReport = {
  ...access,
  scope: { ...scope, providerName: 'azure', scopeType: 'directory', providerScopeId: 'tenant-1' },
  coverage: [
    {
      id: 'directory-roles',
      source: 'directory-roles',
      scope: azureGrant.scope,
      state: 'complete',
      observedAt: report.generatedAt,
      freshness: 'stale',
    },
  ],
  principals: { totalCount: 1, omittedCount: 0, rows: [{ id: 'directory-user-1', kind: 'user', scope: azureGrant.scope }] },
  grants: { totalCount: 1, omittedCount: 0, rows: [azureGrant] },
};

const removedRoot: CloudGovernanceReport['rootAccounts']['rows'][number] = {
  scope: account,
  credentialState: { state: 'known', value: 'removed', evidence },
  credentials: {
    mfaRegistration: { state: 'not-applicable', reason: 'root-credentials-removed', evidence },
    mfaEnforcement: { state: 'not-applicable', reason: 'root-credentials-removed', evidence },
  },
};
const unavailable: CloudGovernanceSourceCoverage = {
  id: 'denied',
  source: 'authorization',
  scope: account,
  state: 'unavailable',
  freshness: 'unknown',
  reason: 'access-denied',
};
const unassessed: CloudGovernanceCheck = {
  id: 'mfa-check',
  title: 'Administrator MFA',
  severity: 'high',
  status: 'not-assessed',
  reason: 'identity-provider-not-collected',
};

// @ts-expect-error Every envelope must bind the company, not only an AWS account.
const unboundScope: CloudGovernanceScope = {
  providerName: 'aws',
  scopeType: 'account',
  providerScopeId: '123456789012',
  cloudAccountId: 'connection-1',
};
// @ts-expect-error Known values require nonempty evidence.
const unsupportedValue: CloudGovernanceObservation<boolean> = { state: 'known', value: true, evidence: [] };
// @ts-expect-error Unknown is not false or zero.
const fabricatedValue: CloudGovernanceObservation<number> = { state: 'unknown', reason: 'not-collected', value: 0 };
// @ts-expect-error Not-applicable observations cannot carry a value.
const inapplicableValue: CloudGovernanceObservation<boolean> = { state: 'not-applicable', reason: 'root-credentials-removed', value: false };
// @ts-expect-error Complete coverage requires its observation timestamp.
const undatedCoverage: CloudGovernanceSourceCoverage = {
  id: 'source',
  source: 'authorization',
  scope: account,
  state: 'complete',
  freshness: 'current',
};
// @ts-expect-error Partial collection requires a reason.
const unexplainedGap: CloudGovernanceSourceCoverage = {
  id: 'source',
  source: 'authorization',
  scope: account,
  state: 'partial',
  freshness: 'unknown',
};
// @ts-expect-error An assessed check requires evidence.
const unsupportedPass: CloudGovernanceCheck = { id: 'check', title: 'MFA', severity: 'high', status: 'passed', evidence: [] };
// @ts-expect-error Unassessed is an explicit result with a reason.
const unexplainedCheck: CloudGovernanceCheck = { id: 'check', title: 'MFA', severity: 'high', status: 'not-assessed' };
const effectiveAccess: CloudGovernanceAccessGrant['assessment'] = {
  // @ts-expect-error Static policy grants must not claim proven effective access.
  basis: 'effective-access',
  confidence: 'high',
  restrictions: [],
  limitations: ['Synthetic static analysis limitation.'],
};
// @ts-expect-error Root posture is account-scoped, not organization-scoped.
const organizationRoot: typeof removedRoot = { ...removedRoot, scope: { scopeType: 'organization', providerScopeId: 'o-example123' } };
// @ts-expect-error Observed restrictions require evidence, not only a summary.
const unsupportedRestriction: CloudGovernanceAccessGrant['assessment']['restrictions'][number] = { kind: 'permissions-boundary', status: 'observed' };
// @ts-expect-error Unknown assignment mode needs an explanation.
const unknownAssignment: CloudGovernanceAccessGrant['assignment'] = { mode: 'unknown' };
// @ts-expect-error Access grants retain at least one derivation step.
const emptyPath: CloudGovernanceAccessGrant = { ...grant, accessPath: [] };
const unexplainedAssessment: CloudGovernanceAccessGrant['assessment'] = {
  basis: 'assigned-permissions',
  confidence: 'high',
  restrictions: [],
  // @ts-expect-error Static analysis must explain its limitations.
  limitations: [],
};
const secretBearingPrincipal: CloudGovernanceAccessReport['principals']['rows'][number] = {
  id: 'principal-1',
  kind: 'user',
  scope: account,
  // @ts-expect-error Public identity projections never carry credential values.
  secretAccessKey: 'synthetic-secret',
};
const rawPolicyGrant: CloudGovernanceAccessGrant = {
  ...grant,
  // @ts-expect-error Native policy documents belong to engine collection, not public projections.
  policyDocument: { Statement: [{ Effect: 'Allow', Action: '*', Resource: '*' }] },
};

void [
  report,
  access,
  organizationAccess,
  azureAccess,
  workforceGrant,
  azureGrant,
  removedRoot,
  unavailable,
  unassessed,
  unboundScope,
  unsupportedValue,
  fabricatedValue,
  inapplicableValue,
  undatedCoverage,
  unexplainedGap,
  unsupportedPass,
  unexplainedCheck,
  effectiveAccess,
  organizationRoot,
  secretBearingPrincipal,
  rawPolicyGrant,
  unsupportedRestriction,
  unknownAssignment,
  emptyPath,
  unexplainedAssessment,
];
