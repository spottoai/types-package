import type { GovernanceGraphArtifact, GovernanceReport } from './governance';
import { GOVERNANCE_GRAPH_SCHEMA_VERSION, GOVERNANCE_REPORT_SCHEMA_VERSION } from './governance';

const governanceReport: GovernanceReport = {
  schemaVersion: GOVERNANCE_REPORT_SCHEMA_VERSION,
  scope: {
    tenantId: 'tenant-1',
    subscriptionId: 'sub-1',
    managementGroupPath: [
      {
        id: '/providers/microsoft.management/managementgroups/root',
        name: 'root',
        displayName: 'Root',
      },
    ],
    generatedAt: '2026-05-02T00:00:00.000Z',
  },
  coverage: {
    mode: 'tenant',
    hierarchy: { state: 'complete', source: 'tenant' },
    policy: { state: 'complete', source: 'tenant' },
    rbac: { state: 'complete', source: 'tenant' },
    principals: { state: 'complete', source: 'tenant' },
    findings: { state: 'complete', source: 'derived' },
  },
  hierarchy: {
    managementGroupPath: [
      {
        id: '/providers/microsoft.management/managementgroups/root',
        name: 'root',
      },
    ],
    subscription: {
      id: 'sub-1',
      displayName: 'Production',
      quotaId: 'payg',
      state: 'Enabled',
    },
    counts: {
      managementGroups: 1,
      subscriptions: 1,
    },
  },
  policy: {
    summary: {
      definitions: 10,
      setDefinitions: 1,
      assignments: 1,
      exemptions: 0,
      complianceExpiryExemptions: 0,
      locks: 0,
      tags: 0,
      securityContacts: 0,
      nonCompliantResources: 1,
    },
    definitionCatalog: {
      definitions: 10,
      setDefinitions: 1,
      byPolicyType: [{ name: 'BuiltIn', count: 10 }],
      byCategory: [{ name: 'Security', count: 10 }],
      referencedDefinitions: [
        {
          id: '/providers/microsoft.authorization/policydefinitions/pol-1',
          type: 'policyDefinition',
          displayName: 'Audit policy',
          effect: 'audit',
        },
      ],
    },
    assignments: [
      {
        id: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
        name: 'assignment-1',
        displayName: 'Security assignment',
        assignmentScope: '/subscriptions/sub-1',
        scopeType: 'subscription',
        inherited: false,
        excludedScopes: [],
        excludedScopeCount: 0,
        hasExcludedScopes: false,
        exemptionCount: 0,
        expiringExemptionCount: 0,
        hasExemptions: false,
        nonCompliantResourceCount: 1,
        complianceEvidenceAvailable: true,
        complianceState: 'NonCompliant',
        parameterNames: ['effect'],
        parameterCount: 1,
        hasParameters: true,
        parametersUsed: [{ name: 'effect', valueType: 'string', hasValue: true }],
        definition: {
          id: '/providers/microsoft.authorization/policydefinitions/pol-1',
          type: 'policyDefinition',
          displayName: 'Audit policy',
          effect: 'audit',
        },
        enforcementMode: 'Default',
        remediation: {
          effect: 'audit',
          supportsRemediation: false,
          hasManagedIdentity: false,
          hasServicePrincipalIdentity: false,
          roleAssignmentCount: 0,
          roleAssignmentIds: [],
        },
        systemMetadata: {
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      },
    ],
    exemptions: [],
    complianceExpiryExemptions: [],
    locks: [],
    tags: [],
    securityContacts: [],
    nonCompliantResources: [
      {
        id: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1',
        resourceId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1',
        resourceType: 'microsoft.compute/virtualmachines',
        policyAssignmentId: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
        effect: 'audit',
      },
    ],
    nonComplianceSummary: {
      byAssignment: [{ name: 'Security assignment', count: 1 }],
      byDefinition: [{ name: 'Audit policy', count: 1 }],
      byEffect: [{ name: 'audit', count: 1 }],
      byResourceType: [{ name: 'microsoft.compute/virtualmachines', count: 1 }],
    },
  },
  rbac: {
    summary: {
      roleDefinitions: 1,
      roleAssignments: 1,
      privilegedAssignments: 1,
      customRoles: 0,
    },
    roleDefinitionCatalog: {
      roleDefinitions: 1,
      customRoles: 0,
      byRoleType: [{ name: 'BuiltInRole', count: 1 }],
      referencedRoles: [
        {
          id: '/providers/microsoft.authorization/roledefinitions/owner',
          name: 'owner',
          roleName: 'Owner',
          roleType: 'BuiltInRole',
          assignableScopes: ['/'],
          grantsRoleAssignmentWrite: true,
          permissionSummary: {
            actionCount: 1,
            dataActionCount: 0,
            hasWildcardAction: true,
            hasWildcardDataAction: false,
          },
        },
      ],
    },
    roleAssignments: [
      {
        id: '/subscriptions/sub-1/providers/microsoft.authorization/roleassignments/ra-1',
        name: 'ra-1',
        roleDefinitionId: '/providers/microsoft.authorization/roledefinitions/owner',
        roleName: 'Owner',
        roleType: 'BuiltInRole',
        principalId: 'principal-1',
        principalType: 'ServicePrincipal',
        scope: '/subscriptions/sub-1',
        scopeType: 'subscription',
        broadScope: true,
        privileged: true,
      },
    ],
    privilegedAssignments: [
      {
        id: '/subscriptions/sub-1/providers/microsoft.authorization/roleassignments/ra-1',
        roleName: 'Owner',
        scopeType: 'subscription',
        broadScope: true,
        privileged: true,
      },
    ],
    customRoles: [],
  },
  principals: {
    servicePrincipals: [
      {
        id: 'principal-1',
        appId: 'app-1',
        displayName: 'Automation App',
        principalType: 'ServicePrincipal',
      },
    ],
    applications: [],
    managedIdentities: [],
  },
  findings: [
    {
      id: 'policy-noncompliant-resources',
      category: 'policy',
      severity: 'high',
      title: 'Non-compliant resources detected',
      summary: '1 non-compliant resource detected.',
      scopeType: 'subscription',
      scopeId: '/subscriptions/sub-1',
      relatedIds: ['/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1'],
      evidence: {
        nonCompliantResources: 1,
      },
    },
  ],
  sourceMetadata: {
    tenantFiles: ['governance/policy-assignments.json.gz'],
    subscriptionFiles: ['governance/governance-raw.json.gz'],
    queryFiles: ['graphqueries/policyresources_non-compliant.json'],
  },
};

const governanceGraph: GovernanceGraphArtifact = {
  schemaVersion: GOVERNANCE_GRAPH_SCHEMA_VERSION,
  scope: {
    tenantId: 'tenant-1',
    subscriptionId: 'sub-1',
    displayName: 'Production',
    generatedAt: '2026-05-02T00:00:00.000Z',
  },
  coverage: governanceReport.coverage,
  sourceMetadata: {
    tenantFiles: ['governance/policy-assignments.json.gz'],
    subscriptionFiles: ['governance/governance-raw.json.gz'],
  },
  nodes: [
    {
      id: 'subscription:/subscriptions/sub-1',
      type: 'subscription',
      sourceId: '/subscriptions/sub-1',
      label: 'Production',
      data: {
        subscriptionId: 'sub-1',
      },
    },
    {
      id: 'policyAssignment:/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
      type: 'policyAssignment',
      sourceId: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
      label: 'Security assignment',
    },
  ],
  edges: [
    {
      id: 'assignedAt:policyAssignment:/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1->subscription:/subscriptions/sub-1',
      type: 'assignedAt',
      from: 'policyAssignment:/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
      to: 'subscription:/subscriptions/sub-1',
      data: {
        scope: '/subscriptions/sub-1',
      },
    },
  ],
  stats: {
    nodes: 2,
    edges: 1,
    nodesByType: {
      subscription: 1,
      policyAssignment: 1,
    },
    edgesByType: {
      assignedAt: 1,
    },
  },
};

void governanceReport;
void governanceGraph;

const invalidReportSchemaVersion: GovernanceReport = {
  ...governanceReport,
  // @ts-expect-error governance report schema version must match the published report contract.
  schemaVersion: '2026-05-02.graph-v1',
};

const invalidGraphNodeType: GovernanceGraphArtifact = {
  ...governanceGraph,
  nodes: [
    {
      ...governanceGraph.nodes[0],
      // @ts-expect-error governance graph nodes use the governance-specific node vocabulary.
      type: 'resource',
    },
  ],
};

void invalidReportSchemaVersion;
void invalidGraphNodeType;
