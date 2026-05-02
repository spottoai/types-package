export const GOVERNANCE_REPORT_SCHEMA_VERSION = '2026-05-01.slim-v1' as const;
export const GOVERNANCE_GRAPH_SCHEMA_VERSION = '2026-05-02.graph-v1' as const;

export const GOVERNANCE_REPORT_PORTAL_FILE = 'governance.json.gz' as const;
export const GOVERNANCE_GRAPH_PORTAL_FILE = 'governance-graph.json.gz' as const;

export type GovernanceJsonPrimitive = string | number | boolean | null;
export type GovernanceJsonValue = GovernanceJsonPrimitive | GovernanceJsonValue[] | { [key: string]: GovernanceJsonValue };

export type GovernanceJsonObject = { [key: string]: GovernanceJsonValue };

export type GovernanceCoverageState = 'complete' | 'partial' | 'unavailable' | 'skipped';

export type GovernanceCoverageSource = 'tenant' | 'subscription' | 'query' | 'derived';

export interface GovernanceCoverageSection {
  state: GovernanceCoverageState;
  source: GovernanceCoverageSource;
  reason?: string;
  requiredPermissions?: string[];
}

export interface GovernanceCoverage {
  mode: 'tenant' | 'subscription';
  hierarchy: GovernanceCoverageSection;
  policy: GovernanceCoverageSection;
  rbac: GovernanceCoverageSection;
  principals: GovernanceCoverageSection;
  findings: GovernanceCoverageSection;
}

export interface GovernanceManagementGroupPathEntry {
  id: string;
  name?: string;
  displayName?: string;
}

export type GovernanceScopeType = 'tenant' | 'managementGroup' | 'subscription' | 'resourceGroup' | 'resource' | 'unknown';

export interface GovernanceFinding {
  id: string;
  category: 'hierarchy' | 'policy' | 'rbac' | 'identity' | 'coverage';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  summary: string;
  scopeType: Exclude<GovernanceScopeType, 'unknown'>;
  scopeId: string;
  relatedIds?: string[];
  evidence?: GovernanceJsonObject;
}

export interface GovernanceReportScope {
  tenantId: string;
  subscriptionId: string;
  managementGroupPath?: GovernanceManagementGroupPathEntry[];
  generatedAt: string;
}

export interface GovernanceHierarchySubscription {
  id: string;
  displayName?: string;
  quotaId?: string;
  state?: string;
}

export interface GovernanceHierarchyCounts {
  managementGroups?: number;
  subscriptions?: number;
}

export interface GovernanceHierarchySection {
  managementGroupPath?: GovernanceManagementGroupPathEntry[];
  subscription?: GovernanceHierarchySubscription;
  counts: GovernanceHierarchyCounts;
}

export interface GovernanceNamedCount {
  name: string;
  count: number;
}

export interface GovernancePolicySummary {
  definitions: number;
  setDefinitions: number;
  assignments: number;
  exemptions: number;
  complianceExpiryExemptions: number;
  locks: number;
  tags: number;
  securityContacts: number;
  nonCompliantResources: number;
}

export interface GovernancePolicyDefinitionReference {
  id?: string;
  name?: string;
  displayName?: string;
  type?: 'policyDefinition' | 'policySetDefinition' | 'unknown';
  category?: string;
  version?: string;
  effect?: string;
}

export interface GovernancePolicyDefinitionCatalog {
  definitions: number;
  setDefinitions: number;
  byPolicyType: GovernanceNamedCount[];
  byCategory: GovernanceNamedCount[];
  referencedDefinitions: GovernancePolicyDefinitionReference[];
}

export type GovernanceComplianceState = 'Compliant' | 'NonCompliant' | 'Unknown';

export interface GovernancePolicyAssignmentParameterUsage {
  name: string;
  valueType: 'array' | 'object' | 'string' | 'number' | 'boolean' | 'null' | 'undefined';
  hasValue: boolean;
}

export interface GovernancePolicyAssignmentDefinition {
  id?: string;
  type: 'policyDefinition' | 'policySetDefinition' | 'unknown';
  name?: string;
  displayName?: string;
  category?: string;
  version?: string;
  effect?: string;
}

export interface GovernancePolicyAssignmentRemediation {
  effect?: string;
  supportsRemediation: boolean;
  hasManagedIdentity: boolean;
  hasServicePrincipalIdentity: boolean;
  principalId?: string;
  roleAssignmentCount: number;
  roleAssignmentIds: string[];
}

export interface GovernanceSystemMetadata {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GovernancePolicyAssignment {
  id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  assignmentScope?: string;
  scopeType?: GovernanceScopeType;
  inherited?: boolean;
  inheritedFrom?: string;
  excludedScopes: string[];
  excludedScopeCount: number;
  hasExcludedScopes: boolean;
  exemptionCount: number;
  expiringExemptionCount: number;
  hasExemptions: boolean;
  nonCompliantResourceCount: number;
  complianceEvidenceAvailable: boolean;
  complianceState?: GovernanceComplianceState;
  parameterNames: string[];
  parameterCount: number;
  hasParameters: boolean;
  parametersUsed: GovernancePolicyAssignmentParameterUsage[];
  definition?: GovernancePolicyAssignmentDefinition;
  enforcementMode?: string;
  remediation?: GovernancePolicyAssignmentRemediation;
  systemMetadata?: GovernanceSystemMetadata;
}

export interface GovernancePolicyExemption {
  id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  scope?: string;
  exemptionCategory?: string;
  policyAssignmentId?: string;
  policyDefinitionReferenceIds: string[];
  expiresOn?: string;
  expired?: boolean;
  daysUntilExpiry?: number;
  systemMetadata?: GovernanceSystemMetadata;
}

export interface GovernanceComplianceExpiryExemption {
  id?: string;
  resourceId?: string;
  policyAssignmentId?: string;
  policyAssignmentDisplayName?: string;
  policyDefinitionDisplayName?: string;
  policyDefinitionReferenceId?: string;
  expiresOn?: string;
  expired?: boolean;
  daysUntilExpiry?: number;
}

export interface GovernanceLock {
  id?: string;
  name?: string;
  level?: string;
  notes?: string;
  scope?: string;
}

export interface GovernanceTagValue {
  tagValue?: string;
  count?: number;
}

export interface GovernanceTag {
  id?: string;
  name?: string;
  count?: number;
  values?: GovernanceTagValue[];
}

export interface GovernanceSecurityContact {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  alertNotifications?: string;
  alertsToAdmins?: string;
}

export interface GovernanceNonCompliantResource {
  id?: string;
  resourceId?: string;
  resourceType?: string;
  policyAssignmentId?: string;
  policyDefinitionGuid?: string;
  policyDefinitionReferenceId?: string;
  policyAssignmentDisplayName?: string;
  policyDefinitionDisplayName?: string;
  policySetDisplayName?: string;
  effect?: string;
  assignmentScope?: string;
}

export interface GovernanceNonComplianceSummary {
  byAssignment: GovernanceNamedCount[];
  byDefinition: GovernanceNamedCount[];
  byEffect: GovernanceNamedCount[];
  byResourceType: GovernanceNamedCount[];
}

export interface GovernancePolicySection {
  summary: GovernancePolicySummary;
  definitionCatalog?: GovernancePolicyDefinitionCatalog;
  assignments: GovernancePolicyAssignment[];
  exemptions: GovernancePolicyExemption[];
  complianceExpiryExemptions?: GovernanceComplianceExpiryExemption[];
  locks?: GovernanceLock[];
  tags?: GovernanceTag[];
  securityContacts?: GovernanceSecurityContact[];
  nonCompliantResources?: GovernanceNonCompliantResource[];
  nonComplianceSummary?: GovernanceNonComplianceSummary;
}

export interface GovernancePermissionSummary {
  actionCount: number;
  dataActionCount: number;
  hasWildcardAction: boolean;
  hasWildcardDataAction: boolean;
}

export interface GovernanceRoleDefinition {
  id?: string;
  name?: string;
  roleName?: string;
  roleType?: string;
  description?: string;
  assignableScopes: string[];
  grantsRoleAssignmentWrite: boolean;
  permissionSummary: GovernancePermissionSummary;
  systemMetadata?: GovernanceSystemMetadata;
}

export interface GovernanceRoleDefinitionCatalog {
  roleDefinitions: number;
  customRoles: number;
  byRoleType: GovernanceNamedCount[];
  referencedRoles: GovernanceRoleDefinition[];
}

export interface GovernanceRoleAssignment {
  id?: string;
  name?: string;
  roleDefinitionId?: string;
  roleName?: string;
  roleType?: string;
  principalId?: string;
  principalType?: string;
  scope?: string;
  scopeType?: GovernanceScopeType;
  broadScope: boolean;
  privileged: boolean;
  condition?: string;
  conditionVersion?: string;
  delegatedManagedIdentityResourceId?: string;
  description?: string;
  createdOn?: string;
  updatedOn?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface GovernanceRbacSummary {
  roleDefinitions: number;
  roleAssignments: number;
  privilegedAssignments: number;
  customRoles: number;
}

export interface GovernanceRbacSection {
  summary: GovernanceRbacSummary;
  roleDefinitionCatalog?: GovernanceRoleDefinitionCatalog;
  roleAssignments: GovernanceRoleAssignment[];
  privilegedAssignments: GovernanceRoleAssignment[];
  customRoles: GovernanceRoleDefinition[];
}

export interface GovernancePrincipal {
  id?: string;
  appId?: string;
  displayName?: string;
  servicePrincipalType?: string;
  principalType?: string;
  userType?: string;
  accountEnabled?: boolean;
  createdDateTime?: string;
}

export interface GovernancePrincipalsSection {
  servicePrincipals?: GovernancePrincipal[];
  applications?: GovernancePrincipal[];
  managedIdentities?: GovernancePrincipal[];
}

export interface GovernanceReportSourceMetadata {
  tenantFiles: string[];
  subscriptionFiles: string[];
  queryFiles: string[];
}

export interface GovernanceReportRelationshipsSummary {
  managementGroupEdges?: number;
  governanceEdgesAdded?: number;
}

export interface GovernanceReport {
  schemaVersion: typeof GOVERNANCE_REPORT_SCHEMA_VERSION;
  scope: GovernanceReportScope;
  coverage: GovernanceCoverage;
  hierarchy: GovernanceHierarchySection;
  policy: GovernancePolicySection;
  rbac: GovernanceRbacSection;
  principals: GovernancePrincipalsSection;
  findings: GovernanceFinding[];
  relationships?: GovernanceReportRelationshipsSummary;
  sourceMetadata: GovernanceReportSourceMetadata;
}

export type GovernanceGraphNodeType =
  | 'managementGroup'
  | 'subscription'
  | 'policyDefinition'
  | 'policySetDefinition'
  | 'policyAssignment'
  | 'policyExemption'
  | 'roleDefinition'
  | 'roleAssignment'
  | 'principal';

export type GovernanceGraphEdgeType =
  | 'contains'
  | 'assignedAt'
  | 'referencesDefinition'
  | 'setContainsPolicy'
  | 'groupedByControl'
  | 'exemptsAssignment'
  | 'grantsRole'
  | 'assignedToPrincipal'
  | 'remediationIdentity';

export interface GovernanceGraphScope {
  tenantId?: string;
  subscriptionId: string;
  displayName?: string;
  generatedAt: string;
  managementGroupPath?: GovernanceManagementGroupPathEntry[];
}

export interface GovernanceGraphNode {
  id: string;
  type: GovernanceGraphNodeType;
  sourceId: string;
  label?: string;
  data?: GovernanceJsonObject;
}

export interface GovernanceGraphEdge {
  id: string;
  type: GovernanceGraphEdgeType;
  from: string;
  to: string;
  data?: GovernanceJsonObject;
}

export interface GovernanceGraphStats {
  nodes: number;
  edges: number;
  nodesByType: Partial<Record<GovernanceGraphNodeType, number>>;
  edgesByType: Partial<Record<GovernanceGraphEdgeType, number>>;
}

export interface GovernanceGraphSourceMetadata {
  tenantFiles: string[];
  subscriptionFiles: string[];
}

export interface GovernanceGraphArtifact {
  schemaVersion: typeof GOVERNANCE_GRAPH_SCHEMA_VERSION;
  scope: GovernanceGraphScope;
  coverage?: GovernanceCoverage;
  sourceMetadata?: GovernanceGraphSourceMetadata;
  nodes: GovernanceGraphNode[];
  edges: GovernanceGraphEdge[];
  stats: GovernanceGraphStats;
}
