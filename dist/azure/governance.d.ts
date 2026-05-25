export declare const GOVERNANCE_REPORT_SCHEMA_VERSION: "2026-05-01.slim-v1";
export declare const GOVERNANCE_GRAPH_SCHEMA_VERSION: "2026-05-02.graph-v1";
export declare const GOVERNANCE_ACCESS_SCHEMA_VERSION: "2026-05-14.identity-access-v2";
export declare const TENANT_GOVERNANCE_REPORT_SCHEMA_VERSION: "2026-05-02.tenant-slim-v1";
export declare const TENANT_GOVERNANCE_GRAPH_SCHEMA_VERSION: "2026-05-02.tenant-graph-v1";
export declare const GOVERNANCE_REPORT_PORTAL_FILE: "governance.json.gz";
export declare const GOVERNANCE_GRAPH_PORTAL_FILE: "governance-graph.json.gz";
export declare const GOVERNANCE_ACCESS_PORTAL_FILE: "governance-access.json.gz";
export declare const TENANT_GOVERNANCE_REPORT_PORTAL_FILE: "governance.json.gz";
export declare const TENANT_GOVERNANCE_GRAPH_PORTAL_FILE: "governance-graph.json.gz";
export type GovernanceJsonPrimitive = string | number | boolean | null;
export type GovernanceJsonValue = GovernanceJsonPrimitive | GovernanceJsonValue[] | {
    [key: string]: GovernanceJsonValue;
};
export type GovernanceJsonObject = {
    [key: string]: GovernanceJsonValue;
};
export type GovernanceCoverageState = 'complete' | 'partial' | 'unavailable' | 'skipped';
export type GovernanceCoverageSource = 'tenant' | 'subscription' | 'query' | 'derived';
export interface GovernanceCoverageSection {
    state: GovernanceCoverageState;
    source: GovernanceCoverageSource;
    message?: string;
    reason?: string;
    requiredPermissions?: string[];
    diagnostics?: GovernanceCoverageDiagnostic[];
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
    label?: string;
    pathLabel?: string;
    resourceType?: string;
}
export type GovernanceScopeType = 'tenant' | 'managementGroup' | 'subscription' | 'resourceGroup' | 'resource' | 'unknown';
export interface GovernanceCoverageDiagnostic {
    code?: string;
    message?: string;
    status?: number;
    requestMethod?: string;
    requestUrl?: string;
    source?: GovernanceCoverageSource;
}
export interface GovernanceScopeReference {
    id: string;
    scopeType: GovernanceScopeType;
    displayName?: string;
    label?: string;
    pathLabel?: string;
    resourceType?: string;
    tenantId?: string;
    subscriptionId?: string;
    subscriptionName?: string;
    managementGroupId?: string;
    managementGroupName?: string;
    managementGroupDisplayName?: string;
    managementGroupPath?: GovernanceManagementGroupPathEntry[];
    resourceGroupName?: string;
    resourceName?: string;
}
export interface GovernancePrincipalReference {
    id: string;
    displayName?: string;
    principalType?: string;
    appId?: string;
    servicePrincipalType?: string;
    userPrincipalName?: string;
    userType?: string;
    resolved?: boolean;
}
export interface GovernanceRoleDefinitionReference {
    id?: string;
    name?: string;
    roleName?: string;
    roleType?: string;
}
export interface GovernancePolicyAssignmentReference {
    id?: string;
    name?: string;
    displayName?: string;
    scope?: GovernanceScopeReference;
}
export type GovernancePolicyEffectResolutionSource = 'fixed' | 'assignmentParameter' | 'definitionParameterDefault' | 'definitionParameterAllowedValues' | 'raw' | 'unknown';
export interface GovernancePolicyEffectSummary {
    raw?: string;
    value?: string;
    displayName?: string;
    source: GovernancePolicyEffectResolutionSource;
    parameterName?: string;
    defaultValue?: string;
    allowedValues?: string[];
}
export interface GovernanceFinding {
    id: string;
    category: 'hierarchy' | 'policy' | 'rbac' | 'identity' | 'coverage';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    summary: string;
    scopeType: Exclude<GovernanceScopeType, 'unknown'>;
    scopeId: string;
    scopeReference?: GovernanceScopeReference;
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
    effectSummary?: GovernancePolicyEffectSummary;
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
    effectSummary?: GovernancePolicyEffectSummary;
}
export interface GovernancePolicyAssignmentRemediation {
    effect?: string;
    effectSummary?: GovernancePolicyEffectSummary;
    supportsRemediation: boolean;
    hasManagedIdentity: boolean;
    hasServicePrincipalIdentity: boolean;
    principalId?: string;
    principal?: GovernancePrincipalReference;
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
    assignmentScopeReference?: GovernanceScopeReference;
    scopeType?: GovernanceScopeType;
    inherited?: boolean;
    inheritedFrom?: string;
    inheritedFromReference?: GovernanceScopeReference;
    excludedScopes: string[];
    excludedScopeReferences?: GovernanceScopeReference[];
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
    scopeReference?: GovernanceScopeReference;
    exemptionCategory?: string;
    policyAssignmentId?: string;
    policyAssignment?: GovernancePolicyAssignmentReference;
    policyDefinitionReferenceIds: string[];
    expiresOn?: string;
    expired?: boolean;
    daysUntilExpiry?: number;
    systemMetadata?: GovernanceSystemMetadata;
}
export interface GovernanceComplianceExpiryExemption {
    id?: string;
    resourceId?: string;
    resource?: GovernanceScopeReference;
    policyAssignmentId?: string;
    policyAssignment?: GovernancePolicyAssignmentReference;
    policyAssignmentDisplayName?: string;
    policyDefinitionDisplayName?: string;
    policyDefinition?: GovernancePolicyDefinitionReference;
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
    scopeReference?: GovernanceScopeReference;
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
    resource?: GovernanceScopeReference;
    resourceType?: string;
    policyAssignmentId?: string;
    policyAssignment?: GovernancePolicyAssignmentReference;
    policyDefinitionGuid?: string;
    policyDefinitionReferenceId?: string;
    policyAssignmentDisplayName?: string;
    policyDefinitionDisplayName?: string;
    policyDefinition?: GovernancePolicyDefinitionReference;
    policySetDisplayName?: string;
    policySetDefinition?: GovernancePolicyDefinitionReference;
    effect?: string;
    effectSummary?: GovernancePolicyEffectSummary;
    assignmentScope?: string;
    assignmentScopeReference?: GovernanceScopeReference;
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
    roleDefinition?: GovernanceRoleDefinitionReference;
    roleName?: string;
    roleType?: string;
    principalId?: string;
    principal?: GovernancePrincipalReference;
    principalType?: string;
    scope?: string;
    scopeReference?: GovernanceScopeReference;
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
    users?: GovernancePrincipal[];
    groups?: GovernancePrincipal[];
    groupMemberships?: GovernanceGroupMembership[];
}
export type GovernanceAccessCoverageKey = 'roleAssignments' | 'roleDefinitions' | 'rolePermissionActions' | 'principals' | 'users' | 'groups' | 'groupMemberships' | 'nestedGroupMemberships' | 'resources' | 'denyAssignments' | 'denyAssignmentActions' | 'pimAssignments' | 'pimActiveAssignments' | 'pimEligibleAssignments';
export type GovernanceAccessCoverageSource = GovernanceCoverageSource | 'azure-rbac' | 'microsoft-graph' | 'portal' | 'portal:resources.json' | 'governance';
export interface GovernanceAccessCoverageSection {
    state: GovernanceCoverageState;
    source: GovernanceAccessCoverageSource | string;
    reason?: string;
    message?: string;
    requiredPermissions?: string[];
}
export type GovernanceAccessCoverage = Partial<Record<GovernanceAccessCoverageKey, GovernanceAccessCoverageSection>>;
export type GovernanceAccessIdentityType = 'User' | 'Group' | 'ServicePrincipal' | 'ManagedIdentity' | 'Application' | string;
export type GovernanceAccessType = 'direct' | 'groupDerived' | 'pimActive' | 'pimEligible';
export type GovernanceAccessCollectionConfidence = 'high' | 'medium' | 'partial' | 'unknown';
export type GovernanceAccessPimAssignmentType = 'active' | 'eligible';
export type GovernanceAccessPimSource = 'roleAssignmentScheduleInstance' | 'roleEligibilityScheduleInstance' | 'roleAssignmentSchedule' | 'roleEligibilitySchedule' | 'roleAssignmentScheduleRequest' | 'roleEligibilityScheduleRequest' | string;
export type GovernanceAccessDenyAssignmentEffect = 'enforced' | 'audit' | string;
export interface GovernanceGroupMembership {
    groupId: string;
    memberId: string;
    memberType?: GovernanceAccessIdentityType;
    member?: GovernancePrincipalReference;
    transitive?: boolean;
}
export interface GovernanceAccessScope {
    tenantId: string;
    subscriptionId: string;
    displayName?: string;
    quotaId?: string;
    state?: string;
    managementGroupPath?: GovernanceManagementGroupPathEntry[];
}
export interface GovernanceAccessIdentity {
    id: string;
    displayName?: string;
    principalType?: GovernanceAccessIdentityType;
    appId?: string;
    servicePrincipalType?: string;
    userPrincipalName?: string;
    userType?: string;
    resolved: boolean;
    assignmentCount: number;
    directAssignmentCount: number;
    groupDerivedAssignmentCount: number;
    privilegedAssignmentCount: number;
}
export interface GovernanceAccessPermissionBlock {
    actions: string[];
    notActions: string[];
    dataActions: string[];
    notDataActions: string[];
}
export interface GovernanceAccessRoleDefinition extends Omit<GovernanceRoleDefinition, 'permissionSummary'> {
    permissions: GovernanceAccessPermissionBlock[];
    permissionSummary: GovernancePermissionSummary;
}
export type GovernanceAccessAssignment = GovernanceRoleAssignment;
export interface GovernanceAccessDenyAssignmentPrincipal {
    id: string;
    type?: GovernanceAccessIdentityType;
    principal?: GovernancePrincipalReference;
    allPrincipals?: boolean;
}
export interface GovernanceAccessDenyAssignment {
    id?: string;
    name?: string;
    denyAssignmentName?: string;
    description?: string;
    scope?: string;
    scopeType?: GovernanceScopeType;
    scopeReference?: GovernanceScopeReference;
    broadScope: boolean;
    permissions: GovernanceAccessPermissionBlock[];
    principals: GovernanceAccessDenyAssignmentPrincipal[];
    excludePrincipals: GovernanceAccessDenyAssignmentPrincipal[];
    doNotApplyToChildScopes?: boolean;
    isSystemProtected?: boolean;
    denyAssignmentEffect?: GovernanceAccessDenyAssignmentEffect;
    condition?: string;
    conditionVersion?: string;
    createdOn?: string;
    updatedOn?: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface GovernanceAccessSchedule {
    startDateTime?: string;
    endDateTime?: string;
    duration?: string;
    expirationType?: string;
}
export interface GovernanceAccessPimAssignment {
    id?: string;
    name?: string;
    assignmentType: GovernanceAccessPimAssignmentType;
    source: GovernanceAccessPimSource;
    principalId?: string;
    principal?: GovernancePrincipalReference;
    principalType?: GovernanceAccessIdentityType;
    roleDefinitionId?: string;
    roleDefinition?: GovernanceRoleDefinitionReference;
    roleName?: string;
    roleType?: string;
    scope?: string;
    scopeType?: GovernanceScopeType;
    scopeReference?: GovernanceScopeReference;
    broadScope: boolean;
    privileged: boolean;
    condition?: string;
    conditionVersion?: string;
    schedule?: GovernanceAccessSchedule;
    status?: string;
    memberType?: string;
    assignmentState?: string;
    createdOn?: string;
    updatedOn?: string;
    createdBy?: string;
    updatedBy?: string;
    activatedUsingEligibilityId?: string;
    linkedEligibleAssignmentId?: string;
}
export type GovernanceAccessResourceExpansionMode = 'none' | 'summary' | 'sample' | 'full';
export interface GovernanceAccessExpandedResources {
    count: number;
    expansionMode?: GovernanceAccessResourceExpansionMode;
    sampleResourceIds?: string[];
    sampleLimit?: number;
    hasMore?: boolean;
}
export interface GovernanceAccessEffectiveAccessRow {
    accessType: GovernanceAccessType;
    assignmentId?: string;
    pimAssignmentId?: string;
    pimAssignmentType?: GovernanceAccessPimAssignmentType;
    pimSource?: GovernanceAccessPimSource;
    pimSchedule?: GovernanceAccessSchedule;
    pimStatus?: string;
    identityId?: string;
    identityType?: GovernanceAccessIdentityType;
    principalType?: GovernanceAccessIdentityType;
    identity?: GovernancePrincipalReference;
    viaGroupIds: string[];
    viaGroup?: GovernancePrincipalReference;
    roleDefinitionId?: string;
    roleName?: string;
    roleType?: string;
    permissionSummary?: GovernancePermissionSummary;
    scope?: string;
    scopeType?: GovernanceScopeType;
    scopeReference?: GovernanceScopeReference;
    broadScope: boolean;
    privileged: boolean;
    condition?: string;
    conditionVersion?: string;
    collectionConfidence: GovernanceAccessCollectionConfidence;
    limitations: string[];
    appliedDenyAssignmentIds?: string[];
    excludedDenyAssignmentIds?: string[];
    expandedResources: GovernanceAccessExpandedResources;
}
export interface GovernanceAccessResourceReference {
    id: string;
    name?: string;
    type?: string;
    resourceGroup?: string;
    location?: string;
    subscriptionId?: string;
}
export interface GovernanceAccessLimitation {
    code: string;
    severity: 'info' | 'warning';
    message: string;
    affects: string[];
}
export interface GovernanceAccessSourceMetadata {
    tenantFiles: string[];
    subscriptionFiles: string[];
    portalFiles?: string[];
    rawFallbackFiles?: string[];
}
export interface GovernanceAccessArtifact {
    schemaVersion: typeof GOVERNANCE_ACCESS_SCHEMA_VERSION;
    generatedAt: string;
    scope: GovernanceAccessScope;
    coverage: GovernanceAccessCoverage;
    identities: GovernanceAccessIdentity[];
    roleDefinitions: GovernanceAccessRoleDefinition[];
    assignments: GovernanceAccessAssignment[];
    denyAssignments?: GovernanceAccessDenyAssignment[];
    pimAssignments?: GovernanceAccessPimAssignment[];
    effectiveAccess: GovernanceAccessEffectiveAccessRow[];
    resourceIndex: GovernanceAccessResourceReference[];
    limitations: GovernanceAccessLimitation[];
    sourceMetadata: GovernanceAccessSourceMetadata;
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
export type GovernanceGraphNodeType = 'managementGroup' | 'subscription' | 'policyDefinition' | 'policySetDefinition' | 'policyAssignment' | 'policyExemption' | 'roleDefinition' | 'roleAssignment' | 'principal';
export type GovernanceGraphEdgeType = 'contains' | 'assignedAt' | 'referencesDefinition' | 'setContainsPolicy' | 'groupedByControl' | 'exemptsAssignment' | 'grantsRole' | 'assignedToPrincipal' | 'remediationIdentity';
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
    display?: GovernanceGraphNodeDisplay;
    data?: GovernanceJsonObject;
}
export interface GovernanceGraphNodeDisplay {
    label: string;
    subtitle?: string;
    resourceType?: string;
    scope?: GovernanceScopeReference;
    principal?: GovernancePrincipalReference;
    roleDefinition?: GovernanceRoleDefinitionReference;
    effect?: GovernancePolicyEffectSummary;
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
export interface TenantGovernanceScope {
    tenantId: string;
    displayName?: string;
    primaryDomain?: string;
    generatedAt: string;
}
export interface TenantGovernanceArtifactReference {
    container?: string;
    path: string;
}
export interface TenantGovernanceSubscriptionRollup {
    policyAssignments: number;
    policyExemptions: number;
    roleAssignments: number;
    privilegedAssignments: number;
    customRoles: number;
    findings: number;
    criticalFindings: number;
    highFindings: number;
    nonCompliantResources: number;
}
export interface TenantGovernanceSubscriptionSummary {
    subscriptionId: string;
    displayName?: string;
    state?: string;
    quotaId?: string;
    managementGroupPath?: GovernanceManagementGroupPathEntry[];
    scopeReference?: GovernanceScopeReference;
    governanceReportPath: string;
    governanceGraphPath: string;
    coverage?: GovernanceCoverage;
    summary: TenantGovernanceSubscriptionRollup;
}
export interface TenantGovernanceManagementGroup {
    id: string;
    name?: string;
    displayName?: string;
    parentId?: string;
    path?: GovernanceManagementGroupPathEntry[];
    scopeReference?: GovernanceScopeReference;
    childManagementGroupIds: string[];
    subscriptionIds: string[];
    summary?: TenantGovernanceScopeRollup;
}
export interface TenantGovernanceHierarchyCounts extends GovernanceHierarchyCounts {
    tenantRootManagementGroups?: number;
}
export interface TenantGovernanceHierarchySection {
    counts: TenantGovernanceHierarchyCounts;
    managementGroups: TenantGovernanceManagementGroup[];
    subscriptions: TenantGovernanceSubscriptionSummary[];
}
export interface TenantGovernanceScopeRollup {
    scopeId: string;
    scopeType: Exclude<GovernanceScopeType, 'resourceGroup' | 'resource' | 'unknown'>;
    displayName?: string;
    scopeReference?: GovernanceScopeReference;
    policyAssignments: number;
    policyExemptions: number;
    roleAssignments: number;
    privilegedAssignments: number;
    findings: number;
    nonCompliantResources: number;
}
export interface TenantGovernancePolicySummary extends GovernancePolicySummary {
    tenantScopedAssignments: number;
    managementGroupScopedAssignments: number;
    subscriptionScopedAssignments: number;
}
export interface TenantGovernancePolicySection {
    summary: TenantGovernancePolicySummary;
    definitionCatalog?: GovernancePolicyDefinitionCatalog;
    assignments: GovernancePolicyAssignment[];
    exemptions: GovernancePolicyExemption[];
    byScope: TenantGovernanceScopeRollup[];
}
export interface TenantGovernanceRbacSummary extends GovernanceRbacSummary {
    tenantScopedAssignments: number;
    managementGroupScopedAssignments: number;
    subscriptionScopedAssignments: number;
}
export interface TenantGovernanceRbacSection {
    summary: TenantGovernanceRbacSummary;
    roleDefinitionCatalog?: GovernanceRoleDefinitionCatalog;
    roleAssignments: GovernanceRoleAssignment[];
    privilegedAssignments: GovernanceRoleAssignment[];
    customRoles: GovernanceRoleDefinition[];
    byScope: TenantGovernanceScopeRollup[];
}
export interface TenantGovernanceFindingsSummary {
    total: number;
    bySeverity: GovernanceNamedCount[];
    byCategory: GovernanceNamedCount[];
    byScopeType: GovernanceNamedCount[];
    bySubscription: GovernanceNamedCount[];
    byManagementGroup: GovernanceNamedCount[];
}
export interface TenantGovernanceSourceMetadata {
    tenantFiles: string[];
    subscriptionReports: TenantGovernanceArtifactReference[];
    subscriptionGraphs: TenantGovernanceArtifactReference[];
    queryFiles: string[];
}
export interface TenantGovernanceReport {
    schemaVersion: typeof TENANT_GOVERNANCE_REPORT_SCHEMA_VERSION;
    scope: TenantGovernanceScope;
    coverage: GovernanceCoverage;
    hierarchy: TenantGovernanceHierarchySection;
    policy: TenantGovernancePolicySection;
    rbac: TenantGovernanceRbacSection;
    principals: GovernancePrincipalsSection;
    findings: GovernanceFinding[];
    findingSummary: TenantGovernanceFindingsSummary;
    sourceMetadata: TenantGovernanceSourceMetadata;
}
export type TenantGovernanceGraphNodeType = 'tenant' | GovernanceGraphNodeType;
export type TenantGovernanceGraphEdgeType = GovernanceGraphEdgeType | 'inheritsFrom' | 'summarizes';
export interface TenantGovernanceGraphScope {
    tenantId: string;
    displayName?: string;
    primaryDomain?: string;
    generatedAt: string;
}
export interface TenantGovernanceGraphNode {
    id: string;
    type: TenantGovernanceGraphNodeType;
    sourceId: string;
    label?: string;
    display?: GovernanceGraphNodeDisplay;
    data?: GovernanceJsonObject;
}
export interface TenantGovernanceGraphEdge {
    id: string;
    type: TenantGovernanceGraphEdgeType;
    from: string;
    to: string;
    data?: GovernanceJsonObject;
}
export interface TenantGovernanceGraphStats {
    nodes: number;
    edges: number;
    nodesByType: Partial<Record<TenantGovernanceGraphNodeType, number>>;
    edgesByType: Partial<Record<TenantGovernanceGraphEdgeType, number>>;
}
export interface TenantGovernanceGraphSourceMetadata {
    tenantFiles: string[];
    subscriptionReports: TenantGovernanceArtifactReference[];
    subscriptionGraphs: TenantGovernanceArtifactReference[];
}
export interface TenantGovernanceGraphArtifact {
    schemaVersion: typeof TENANT_GOVERNANCE_GRAPH_SCHEMA_VERSION;
    scope: TenantGovernanceGraphScope;
    coverage?: GovernanceCoverage;
    sourceMetadata?: TenantGovernanceGraphSourceMetadata;
    nodes: TenantGovernanceGraphNode[];
    edges: TenantGovernanceGraphEdge[];
    stats: TenantGovernanceGraphStats;
}
//# sourceMappingURL=governance.d.ts.map