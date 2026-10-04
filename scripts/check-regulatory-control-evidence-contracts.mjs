import assert from 'node:assert/strict';
import { projectRegulatoryControlEvidence, resolveRegulatoryStandardDisplayName } from '../dist/index.js';
const id = '11111111-1111-1111-1111-111111111111';
const other = '22222222-2222-2222-2222-222222222222';
const key = 'a'.repeat(64);
const assignmentId = `/subscriptions/${id}/providers/Microsoft.Authorization/policyAssignments/default`;
const counts = { compliant: 0, nonCompliant: 26, exempt: 0, error: 0, conflicting: 0, unknown: 0, protected: 0, notStarted: 0, notRegistered: 0 };
const policy = {
  policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/check',
  policyDefinitionReferenceId: 'check',
  displayName: 'Restrict network access',
  evaluationState: 'nonCompliant',
  counts,
  affectedResourceCount: 26,
};
const evaluation = n => ({
  resourceId: `/subscriptions/${id}/resourceGroups/example/providers/Microsoft.Storage/storageAccounts/store${String(n).padStart(2, '0')}`,
  resourceName: `store${String(n).padStart(2, '0')}`,
  resourceType: 'Microsoft.Storage/storageAccounts',
  resourceGroupName: 'example',
  evaluationState: 'nonCompliant',
  policyAssignmentId: assignmentId,
  policyDefinitionId: policy.policyDefinitionId,
  policyDefinitionReferenceId: 'check',
});
const input = {
  subscriptionId: id,
  assignmentKey: key,
  policyControlKey: 'ns-2',
  policyAssignmentId: assignmentId,
  observedAt: '2026-10-03T00:00:00Z',
  state: 'complete',
  control: {
    controlKey: 'ns-2',
    name: 'NS-2',
    displayName: 'Secure network services',
    responsibility: 'customer',
    evaluationState: 'nonCompliant',
    counts,
    policyCount: 1,
    affectedResourceCount: 26,
    policyDefinitionReferenceIds: ['check'],
    policies: [policy],
    resources: [...Array.from({ length: 26 }, (_, n) => evaluation(n)), evaluation(0)],
  },
};
const control = {
  controlKey: 'ns-2',
  displayName: 'Secure network services',
  outcome: 'passed',
  subscriptions: [{ subscriptionId: id, outcome: 'passed', policyEvidence: [{ assignmentKey: key, policyControlKey: 'ns-2', outcome: 'failed' }] }],
};
const first = projectRegulatoryControlEvidence({ control, inputs: [input] });
assert.equal(control.outcome, 'passed', 'Policy evidence cannot override the scored Defender outcome');
assert.equal(first.checks[0].outcome, 'failed');
assert.equal(first.checks[0].failingResourceCount, 26, 'distinct resource identities, not evaluation rows');
assert.equal(first.resourcePages[0].totalItems, 26);
assert.equal(first.resourcePages[0].resources.length, 25);
assert.equal(first.resourcePages[0].resources[0].failingChecks.length, 1);
assert.equal(first.resourcePages[0].state, 'complete');
assert.equal(first.assignmentTargets[0].control.resources, undefined, 'actions never include the artifact resource list');
assert.equal(
  projectRegulatoryControlEvidence({ control, inputs: [input], resourceSubscriptionId: id, resourcePage: 2 }).resourcePages[0].resources.length,
  1
);
assert.throws(() => projectRegulatoryControlEvidence({ control, inputs: [input], resourceSubscriptionId: id, resourcePage: 3 }));
assert.throws(() => projectRegulatoryControlEvidence({ control, inputs: [], resourcePage: 2 }));
assert.throws(() => projectRegulatoryControlEvidence({ control, inputs: [], resourceSubscriptionId: other }));
assert.throws(() => projectRegulatoryControlEvidence({ control, inputs: [{ ...input, assignmentKey: 'b'.repeat(64) }] }));
assert.throws(() =>
  projectRegulatoryControlEvidence({
    control,
    inputs: [
      {
        ...input,
        control: {
          ...input.control,
          resources: [
            { ...evaluation(0), resourceId: `/subscriptions/${other}/resourceGroups/leak/providers/Microsoft.Storage/storageAccounts/leak` },
          ],
        },
      },
    ],
  })
);
assert.throws(() =>
  projectRegulatoryControlEvidence({
    control,
    inputs: [{ ...input, control: { ...input.control, resources: [{ ...evaluation(0), policyAssignmentId: '/foreign' }] } }],
  })
);
const partial = projectRegulatoryControlEvidence({ control, inputs: [{ ...input, control: { ...input.control, resources: [evaluation(0)] } }] });
assert.equal(partial.resourcePages[0].state, 'partial');
assert.equal(partial.resourcePages[0].totalItemsIsMinimum, true);
assert.equal(partial.checks[0].failingResourceCountIsMinimum, true);
assert.equal(partial.otherCheckCount, undefined);
assert.equal(projectRegulatoryControlEvidence({ control, inputs: [] }).resourcePages[0].state, 'unavailable');
assert.equal(
  projectRegulatoryControlEvidence({
    control: { ...control, subscriptions: [{ subscriptionId: id, outcome: 'passed', policyEvidence: [] }] },
    inputs: [],
  }).resourcePages[0].state,
  'notLinked'
);
assert.equal(resolveRegulatoryStandardDisplayName('iso-27001', []), 'ISO 27001');
const catalog = [
  { standardFamilyKey: 'iso-27001', definitionId: 'v1', displayName: 'ISO/IEC 27001', isDeprecated: true },
  { standardFamilyKey: 'iso-27001', definitionId: 'v2', displayName: 'ISO/IEC 27001:2022', isDeprecated: false },
];
assert.equal(resolveRegulatoryStandardDisplayName('iso-27001', catalog), 'ISO/IEC 27001:2022');
assert.equal(resolveRegulatoryStandardDisplayName('iso-27001', catalog, [], 'v1'), 'ISO/IEC 27001');
console.log('Regulatory control evidence contracts passed.');
