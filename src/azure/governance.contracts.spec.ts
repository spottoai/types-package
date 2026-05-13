import type {
  GovernanceAccessArtifact,
  GovernanceGraphArtifact,
  GovernanceReport,
  TenantGovernanceGraphArtifact,
  TenantGovernanceReport,
} from './governance';
import {
  GOVERNANCE_ACCESS_SCHEMA_VERSION,
  GOVERNANCE_GRAPH_SCHEMA_VERSION,
  GOVERNANCE_REPORT_SCHEMA_VERSION,
  TENANT_GOVERNANCE_GRAPH_SCHEMA_VERSION,
  TENANT_GOVERNANCE_REPORT_SCHEMA_VERSION,
} from './governance';

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
        label: 'Root',
        pathLabel: 'Root',
        resourceType: 'microsoft.management/managementgroups',
      },
    ],
    generatedAt: '2026-05-02T00:00:00.000Z',
  },
  coverage: {
    mode: 'tenant',
    hierarchy: {
      state: 'complete',
      source: 'tenant',
      message: 'Tenant hierarchy was collected.',
      diagnostics: [
        {
          code: 'HierarchyReadComplete',
          message: 'Management group hierarchy read completed.',
          source: 'tenant',
        },
      ],
    },
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
        displayName: 'Root',
        pathLabel: 'Root',
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
        assignmentScopeReference: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          label: 'Production',
          pathLabel: 'Root > Production',
          resourceType: 'microsoft.resources/subscriptions',
          tenantId: 'tenant-1',
          subscriptionId: 'sub-1',
          subscriptionName: 'Production',
          managementGroupPath: [
            {
              id: '/providers/microsoft.management/managementgroups/root',
              name: 'root',
              displayName: 'Root',
            },
          ],
        },
        scopeType: 'subscription',
        inherited: false,
        excludedScopes: [],
        excludedScopeReferences: [],
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
          effectSummary: {
            raw: "[parameters('effect')]",
            value: 'audit',
            displayName: 'Audit',
            source: 'assignmentParameter',
            parameterName: 'effect',
            defaultValue: 'audit',
            allowedValues: ['audit', 'deny', 'disabled'],
          },
        },
        enforcementMode: 'Default',
        remediation: {
          effect: 'audit',
          effectSummary: {
            value: 'audit',
            displayName: 'Audit',
            source: 'assignmentParameter',
            parameterName: 'effect',
          },
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
        resource: {
          id: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1',
          scopeType: 'resource',
          displayName: 'vm1',
          label: 'vm1',
          pathLabel: 'Production > rg > vm1',
          resourceType: 'microsoft.compute/virtualmachines',
          subscriptionId: 'sub-1',
          subscriptionName: 'Production',
          resourceGroupName: 'rg',
          resourceName: 'vm1',
        },
        resourceType: 'microsoft.compute/virtualmachines',
        policyAssignmentId: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
        policyAssignment: {
          id: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
          displayName: 'Security assignment',
        },
        policyDefinition: {
          id: '/providers/microsoft.authorization/policydefinitions/pol-1',
          type: 'policyDefinition',
          displayName: 'Audit policy',
          effect: 'audit',
        },
        effect: 'audit',
        effectSummary: {
          value: 'audit',
          displayName: 'Audit',
          source: 'assignmentParameter',
        },
        assignmentScope: '/subscriptions/sub-1',
        assignmentScopeReference: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          label: 'Production',
          resourceType: 'microsoft.resources/subscriptions',
          subscriptionId: 'sub-1',
        },
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
        roleDefinition: {
          id: '/providers/microsoft.authorization/roledefinitions/owner',
          name: 'owner',
          roleName: 'Owner',
          roleType: 'BuiltInRole',
        },
        roleName: 'Owner',
        roleType: 'BuiltInRole',
        principalId: 'principal-1',
        principal: {
          id: 'principal-1',
          appId: 'app-1',
          displayName: 'Automation App',
          principalType: 'ServicePrincipal',
          resolved: true,
        },
        principalType: 'ServicePrincipal',
        scope: '/subscriptions/sub-1',
        scopeReference: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          label: 'Production',
          resourceType: 'microsoft.resources/subscriptions',
          subscriptionId: 'sub-1',
        },
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
      display: {
        label: 'Production',
        subtitle: 'Subscription',
        resourceType: 'microsoft.resources/subscriptions',
        scope: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          resourceType: 'microsoft.resources/subscriptions',
          subscriptionId: 'sub-1',
        },
      },
      data: {
        subscriptionId: 'sub-1',
      },
    },
    {
      id: 'policyAssignment:/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
      type: 'policyAssignment',
      sourceId: '/subscriptions/sub-1/providers/microsoft.authorization/policyassignments/assignment-1',
      label: 'Security assignment',
      display: {
        label: 'Security assignment',
        subtitle: 'Assigned at Production',
        scope: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          resourceType: 'microsoft.resources/subscriptions',
          subscriptionId: 'sub-1',
        },
        effect: {
          value: 'audit',
          displayName: 'Audit',
          source: 'assignmentParameter',
        },
      },
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

const governanceAccessArtifact: GovernanceAccessArtifact = {
  schemaVersion: GOVERNANCE_ACCESS_SCHEMA_VERSION,
  generatedAt: '2026-05-13T00:00:00.000Z',
  scope: {
    tenantId: 'tenant-1',
    subscriptionId: 'sub-1',
    displayName: 'Production',
  },
  coverage: {
    roleAssignments: { state: 'complete', source: 'tenant' },
    roleDefinitions: { state: 'complete', source: 'tenant' },
    rolePermissionActions: { state: 'complete', source: 'tenant' },
    principals: { state: 'complete', source: 'tenant' },
    groupMemberships: { state: 'complete', source: 'microsoft-graph' },
    resources: { state: 'complete', source: 'portal:resources.json' },
    pimAssignments: { state: 'complete', source: 'azure-rbac' },
    pimActiveAssignments: { state: 'complete', source: 'azure-rbac' },
    pimEligibleAssignments: { state: 'complete', source: 'azure-rbac' },
    denyAssignments: { state: 'complete', source: 'azure-rbac' },
    denyAssignmentActions: { state: 'complete', source: 'azure-rbac' },
  },
  identities: [
    {
      id: 'principal-1',
      displayName: 'Automation App',
      principalType: 'ServicePrincipal',
      resolved: true,
      assignmentCount: 1,
      directAssignmentCount: 1,
      groupDerivedAssignmentCount: 0,
      privilegedAssignmentCount: 1,
    },
  ],
  roleDefinitions: [
    {
      id: '/providers/microsoft.authorization/roledefinitions/owner',
      roleName: 'Owner',
      roleType: 'BuiltInRole',
      assignableScopes: ['/'],
      permissions: [{ actions: ['*'], notActions: [], dataActions: [], notDataActions: [] }],
      grantsRoleAssignmentWrite: true,
      permissionSummary: {
        actionCount: 1,
        dataActionCount: 0,
        hasWildcardAction: true,
        hasWildcardDataAction: false,
      },
    },
  ],
  assignments: governanceReport.rbac.roleAssignments,
  denyAssignments: [
    {
      id: '/subscriptions/sub-1/providers/microsoft.authorization/denyassignments/deny-1',
      name: 'deny-1',
      denyAssignmentName: 'Deployment stack protection',
      description: 'Blocks writes to protected resources.',
      scope: '/subscriptions/sub-1',
      scopeType: 'subscription',
      broadScope: true,
      permissions: [
        {
          actions: ['Microsoft.Authorization/*/write'],
          notActions: ['Microsoft.Authorization/roleAssignments/read'],
          dataActions: [],
          notDataActions: [],
        },
      ],
      principals: [
        {
          id: '00000000-0000-0000-0000-000000000000',
          type: 'SystemDefined',
          allPrincipals: true,
        },
      ],
      excludePrincipals: [
        {
          id: 'principal-1',
          type: 'ServicePrincipal',
          principal: {
            id: 'principal-1',
            displayName: 'Automation App',
            principalType: 'ServicePrincipal',
            resolved: true,
          },
        },
      ],
      doNotApplyToChildScopes: false,
      isSystemProtected: true,
      denyAssignmentEffect: 'enforced',
    },
  ],
  pimAssignments: [
    {
      id: '/subscriptions/sub-1/providers/microsoft.authorization/roleeligibilityscheduleinstances/pim-eligible-1',
      name: 'pim-eligible-1',
      assignmentType: 'eligible',
      source: 'roleEligibilityScheduleInstance',
      principalId: 'principal-1',
      principal: {
        id: 'principal-1',
        appId: 'app-1',
        displayName: 'Automation App',
        principalType: 'ServicePrincipal',
        resolved: true,
      },
      principalType: 'ServicePrincipal',
      roleDefinitionId: '/providers/microsoft.authorization/roledefinitions/owner',
      roleName: 'Owner',
      roleType: 'BuiltInRole',
      scope: '/subscriptions/sub-1',
      scopeType: 'subscription',
      broadScope: true,
      privileged: true,
      schedule: {
        startDateTime: '2026-05-13T00:00:00.000Z',
        endDateTime: '2026-06-13T00:00:00.000Z',
        expirationType: 'AfterDateTime',
      },
      status: 'Provisioned',
      memberType: 'Direct',
    },
  ],
  effectiveAccess: [
    {
      accessType: 'direct',
      assignmentId: 'ra-1',
      identityId: 'principal-1',
      identityType: 'ServicePrincipal',
      principalType: 'ServicePrincipal',
      viaGroupIds: [],
      roleDefinitionId: '/providers/microsoft.authorization/roledefinitions/owner',
      roleName: 'Owner',
      roleType: 'BuiltInRole',
      permissionSummary: {
        actionCount: 1,
        dataActionCount: 0,
        hasWildcardAction: true,
        hasWildcardDataAction: false,
      },
      scope: '/subscriptions/sub-1',
      scopeType: 'subscription',
      broadScope: true,
      privileged: true,
      collectionConfidence: 'high',
      limitations: [],
      appliedDenyAssignmentIds: ['/subscriptions/sub-1/providers/microsoft.authorization/denyassignments/deny-1'],
      excludedDenyAssignmentIds: ['/subscriptions/sub-1/providers/microsoft.authorization/denyassignments/deny-1'],
      expandedResources: {
        count: 1,
        expansionMode: 'sample',
        sampleResourceIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1'],
        sampleLimit: 25,
        hasMore: false,
      },
    },
    {
      accessType: 'pimEligible',
      assignmentId: 'pim-eligible-1',
      pimAssignmentId: '/subscriptions/sub-1/providers/microsoft.authorization/roleeligibilityscheduleinstances/pim-eligible-1',
      pimAssignmentType: 'eligible',
      pimSource: 'roleEligibilityScheduleInstance',
      pimSchedule: {
        startDateTime: '2026-05-13T00:00:00.000Z',
        endDateTime: '2026-06-13T00:00:00.000Z',
        expirationType: 'AfterDateTime',
      },
      pimStatus: 'Provisioned',
      identityId: 'principal-1',
      identityType: 'ServicePrincipal',
      principalType: 'ServicePrincipal',
      viaGroupIds: [],
      roleDefinitionId: '/providers/microsoft.authorization/roledefinitions/owner',
      roleName: 'Owner',
      roleType: 'BuiltInRole',
      permissionSummary: {
        actionCount: 1,
        dataActionCount: 0,
        hasWildcardAction: true,
        hasWildcardDataAction: false,
      },
      scope: '/subscriptions/sub-1',
      scopeType: 'subscription',
      broadScope: true,
      privileged: true,
      collectionConfidence: 'high',
      limitations: ['requires-pim-activation'],
      expandedResources: {
        count: 1,
        expansionMode: 'sample',
        sampleResourceIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1'],
        sampleLimit: 25,
        hasMore: false,
      },
    },
  ],
  resourceIndex: [
    {
      id: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm1',
      name: 'vm1',
      type: 'microsoft.compute/virtualmachines',
      resourceGroup: 'rg',
      subscriptionId: 'sub-1',
    },
  ],
  limitations: [
    {
      code: 'pim-assignments-not-collected',
      severity: 'warning',
      message: 'Privileged Identity Management eligible assignments and activation state are not included.',
      affects: ['effectiveAccess'],
    },
  ],
  sourceMetadata: {
    tenantFiles: ['governance/principals.json.gz'],
    subscriptionFiles: ['governance/governance-raw.json.gz'],
    portalFiles: ['resources.json'],
  },
};

void governanceAccessArtifact;

const tenantGovernanceReport: TenantGovernanceReport = {
  schemaVersion: TENANT_GOVERNANCE_REPORT_SCHEMA_VERSION,
  scope: {
    tenantId: 'tenant-1',
    displayName: 'Example Tenant',
    primaryDomain: 'example.com',
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
    counts: {
      managementGroups: 1,
      tenantRootManagementGroups: 1,
      subscriptions: 1,
    },
    managementGroups: [
      {
        id: '/providers/microsoft.management/managementgroups/root',
        name: 'root',
        displayName: 'Root',
        scopeReference: {
          id: '/providers/microsoft.management/managementgroups/root',
          scopeType: 'managementGroup',
          displayName: 'Root',
          label: 'Root',
          resourceType: 'microsoft.management/managementgroups',
          managementGroupId: 'root',
          managementGroupName: 'root',
          managementGroupDisplayName: 'Root',
        },
        childManagementGroupIds: [],
        subscriptionIds: ['sub-1'],
        summary: {
          scopeId: '/providers/microsoft.management/managementgroups/root',
          scopeType: 'managementGroup',
          displayName: 'Root',
          scopeReference: {
            id: '/providers/microsoft.management/managementgroups/root',
            scopeType: 'managementGroup',
            displayName: 'Root',
            label: 'Root',
            resourceType: 'microsoft.management/managementgroups',
            managementGroupId: 'root',
          },
          policyAssignments: 1,
          policyExemptions: 0,
          roleAssignments: 1,
          privilegedAssignments: 1,
          findings: 1,
          nonCompliantResources: 1,
        },
      },
    ],
    subscriptions: [
      {
        subscriptionId: 'sub-1',
        displayName: 'Production',
        state: 'Enabled',
        quotaId: 'payg',
        managementGroupPath: [
          {
            id: '/providers/microsoft.management/managementgroups/root',
            name: 'root',
            displayName: 'Root',
          },
        ],
        scopeReference: {
          id: '/subscriptions/sub-1',
          scopeType: 'subscription',
          displayName: 'Production',
          label: 'Production',
          resourceType: 'microsoft.resources/subscriptions',
          subscriptionId: 'sub-1',
          subscriptionName: 'Production',
        },
        governanceReportPath: 'subscriptions/sub-1/governance.json.gz',
        governanceGraphPath: 'subscriptions/sub-1/governance-graph.json.gz',
        coverage: governanceReport.coverage,
        summary: {
          policyAssignments: 1,
          policyExemptions: 0,
          roleAssignments: 1,
          privilegedAssignments: 1,
          customRoles: 0,
          findings: 1,
          criticalFindings: 0,
          highFindings: 1,
          nonCompliantResources: 1,
        },
      },
    ],
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
      tenantScopedAssignments: 0,
      managementGroupScopedAssignments: 1,
      subscriptionScopedAssignments: 0,
    },
    definitionCatalog: governanceReport.policy.definitionCatalog,
    assignments: governanceReport.policy.assignments,
    exemptions: governanceReport.policy.exemptions,
    byScope: [
      {
        scopeId: '/providers/microsoft.management/managementgroups/root',
        scopeType: 'managementGroup',
        displayName: 'Root',
        scopeReference: {
          id: '/providers/microsoft.management/managementgroups/root',
          scopeType: 'managementGroup',
          displayName: 'Root',
          label: 'Root',
          resourceType: 'microsoft.management/managementgroups',
          managementGroupId: 'root',
        },
        policyAssignments: 1,
        policyExemptions: 0,
        roleAssignments: 0,
        privilegedAssignments: 0,
        findings: 1,
        nonCompliantResources: 1,
      },
    ],
  },
  rbac: {
    summary: {
      roleDefinitions: 1,
      roleAssignments: 1,
      privilegedAssignments: 1,
      customRoles: 0,
      tenantScopedAssignments: 0,
      managementGroupScopedAssignments: 1,
      subscriptionScopedAssignments: 0,
    },
    roleDefinitionCatalog: governanceReport.rbac.roleDefinitionCatalog,
    roleAssignments: governanceReport.rbac.roleAssignments,
    privilegedAssignments: governanceReport.rbac.privilegedAssignments,
    customRoles: governanceReport.rbac.customRoles,
    byScope: [
      {
        scopeId: '/providers/microsoft.management/managementgroups/root',
        scopeType: 'managementGroup',
        displayName: 'Root',
        scopeReference: {
          id: '/providers/microsoft.management/managementgroups/root',
          scopeType: 'managementGroup',
          displayName: 'Root',
          label: 'Root',
          resourceType: 'microsoft.management/managementgroups',
          managementGroupId: 'root',
        },
        policyAssignments: 0,
        policyExemptions: 0,
        roleAssignments: 1,
        privilegedAssignments: 1,
        findings: 0,
        nonCompliantResources: 0,
      },
    ],
  },
  principals: governanceReport.principals,
  findings: governanceReport.findings,
  findingSummary: {
    total: 1,
    bySeverity: [{ name: 'high', count: 1 }],
    byCategory: [{ name: 'policy', count: 1 }],
    byScopeType: [{ name: 'subscription', count: 1 }],
    bySubscription: [{ name: 'Production', count: 1 }],
    byManagementGroup: [{ name: 'Root', count: 1 }],
  },
  sourceMetadata: {
    tenantFiles: ['governance/policy-assignments.json.gz'],
    subscriptionReports: [
      {
        container: 'azure-portal',
        path: 'subscriptions/sub-1/governance.json.gz',
      },
    ],
    subscriptionGraphs: [
      {
        container: 'azure-portal',
        path: 'subscriptions/sub-1/governance-graph.json.gz',
      },
    ],
    queryFiles: [],
  },
};

const tenantGovernanceGraph: TenantGovernanceGraphArtifact = {
  schemaVersion: TENANT_GOVERNANCE_GRAPH_SCHEMA_VERSION,
  scope: {
    tenantId: 'tenant-1',
    displayName: 'Example Tenant',
    primaryDomain: 'example.com',
    generatedAt: '2026-05-02T00:00:00.000Z',
  },
  coverage: tenantGovernanceReport.coverage,
  sourceMetadata: {
    tenantFiles: ['governance/policy-assignments.json.gz'],
    subscriptionReports: [
      {
        container: 'azure-portal',
        path: 'subscriptions/sub-1/governance.json.gz',
      },
    ],
    subscriptionGraphs: [
      {
        container: 'azure-portal',
        path: 'subscriptions/sub-1/governance-graph.json.gz',
      },
    ],
  },
  nodes: [
    {
      id: 'tenant:tenant-1',
      type: 'tenant',
      sourceId: 'tenant-1',
      label: 'Example Tenant',
      display: {
        label: 'Example Tenant',
        subtitle: 'Tenant',
        scope: {
          id: 'tenant-1',
          scopeType: 'tenant',
          displayName: 'Example Tenant',
          tenantId: 'tenant-1',
        },
      },
      data: {
        primaryDomain: 'example.com',
      },
    },
    {
      id: 'managementGroup:/providers/microsoft.management/managementgroups/root',
      type: 'managementGroup',
      sourceId: '/providers/microsoft.management/managementgroups/root',
      label: 'Root',
    },
    {
      id: 'subscription:/subscriptions/sub-1',
      type: 'subscription',
      sourceId: '/subscriptions/sub-1',
      label: 'Production',
      data: {
        governanceReportPath: 'subscriptions/sub-1/governance.json.gz',
        governanceGraphPath: 'subscriptions/sub-1/governance-graph.json.gz',
      },
    },
  ],
  edges: [
    {
      id: 'contains:tenant:tenant-1->managementGroup:/providers/microsoft.management/managementgroups/root',
      type: 'contains',
      from: 'tenant:tenant-1',
      to: 'managementGroup:/providers/microsoft.management/managementgroups/root',
    },
    {
      id: 'contains:managementGroup:/providers/microsoft.management/managementgroups/root->subscription:/subscriptions/sub-1',
      type: 'contains',
      from: 'managementGroup:/providers/microsoft.management/managementgroups/root',
      to: 'subscription:/subscriptions/sub-1',
    },
  ],
  stats: {
    nodes: 3,
    edges: 2,
    nodesByType: {
      tenant: 1,
      managementGroup: 1,
      subscription: 1,
    },
    edgesByType: {
      contains: 2,
    },
  },
};

void tenantGovernanceReport;
void tenantGovernanceGraph;

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

const invalidAccessSchemaVersion: GovernanceAccessArtifact = {
  ...governanceAccessArtifact,
  // @ts-expect-error governance access schema version must match the published access contract.
  schemaVersion: '2026-05-01.slim-v1',
};

const invalidAccessType: GovernanceAccessArtifact = {
  ...governanceAccessArtifact,
  effectiveAccess: [
    {
      ...governanceAccessArtifact.effectiveAccess[0],
      // @ts-expect-error access rows use the governance access type vocabulary.
      accessType: 'nestedGroup',
    },
  ],
};

const invalidPimAssignmentType: GovernanceAccessArtifact = {
  ...governanceAccessArtifact,
  pimAssignments: [
    {
      ...governanceAccessArtifact.pimAssignments![0],
      // @ts-expect-error PIM assignments distinguish only active and eligible assignment records.
      assignmentType: 'permanent',
    },
  ],
};

void invalidAccessSchemaVersion;
void invalidAccessType;
void invalidPimAssignmentType;

const invalidTenantReportSchemaVersion: TenantGovernanceReport = {
  ...tenantGovernanceReport,
  // @ts-expect-error tenant governance report schema version must match the tenant report contract.
  schemaVersion: '2026-05-01.slim-v1',
};

const invalidTenantGraphNodeType: TenantGovernanceGraphArtifact = {
  ...tenantGovernanceGraph,
  nodes: [
    {
      ...tenantGovernanceGraph.nodes[0],
      // @ts-expect-error tenant governance graph nodes do not include resource-centric node types.
      type: 'resource',
    },
  ],
};

const invalidTenantScopeRollup: TenantGovernanceReport = {
  ...tenantGovernanceReport,
  policy: {
    ...tenantGovernanceReport.policy,
    byScope: [
      {
        ...tenantGovernanceReport.policy.byScope[0],
        // @ts-expect-error tenant rollups are only tenant, management group, or subscription scoped.
        scopeType: 'resource',
      },
    ],
  },
};

void invalidTenantReportSchemaVersion;
void invalidTenantGraphNodeType;
void invalidTenantScopeRollup;
