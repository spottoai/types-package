import { REGULATORY_CONTROL_RESOURCE_PAGE_SIZE, regulatoryPolicyEvidenceOutcome, } from './regulatoryComplianceControlEvidence.js';
const order = { failed: 0, notAssessed: 1, passed: 2 };
const lower = (value) => value.toLowerCase();
export function resolveRegulatoryStandardDisplayName(family, catalog, assigned = [], preferredDefinitionId) {
    const matching = catalog.filter(row => lower(row.standardFamilyKey) === lower(family));
    const preferred = matching.find(row => lower(row.definitionId) === lower(preferredDefinitionId ?? ''));
    const selected = preferred ?? [...matching].sort((a, b) => Number(a.isDeprecated) - Number(b.isDeprecated) || a.definitionId.localeCompare(b.definitionId))[0];
    return (selected?.displayName ||
        assigned.find(row => lower(row.standardFamilyKey) === lower(family))?.displayName ||
        family
            .split(/[-_]+/)
            .map(word => /^(?:iso|iec|cis|nist|pci|dss|soc|nzism|ism|hipaa|cspm)$/i.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '));
}
export function projectRegulatoryControlEvidence({ control, inputs, unavailableSubscriptionIds = [], resourceSubscriptionId, resourcePage = 1, }) {
    if (!Number.isSafeInteger(resourcePage) || resourcePage < 1 || (resourcePage > 1 && !resourceSubscriptionId))
        throw new Error('Invalid resource page');
    if (resourceSubscriptionId && !control.subscriptions.some(row => lower(row.subscriptionId) === lower(resourceSubscriptionId)))
        throw new Error('Resource subscription is outside the control scope');
    const checks = new Map();
    const resources = new Map();
    const countsByCheck = new Map();
    const partial = new Set();
    const observed = new Map();
    const targets = new Map();
    for (const input of inputs) {
        const subscriptionId = lower(input.subscriptionId);
        if (!control.subscriptions.some(row => lower(row.subscriptionId) === subscriptionId &&
            row.policyEvidence.some(link => link.assignmentKey === input.assignmentKey && link.policyControlKey === input.policyControlKey)))
            throw new Error('Unlinked control evidence');
        if (input.control.controlKey !== input.policyControlKey)
            throw new Error('Control evidence identity mismatch');
        if (input.state === 'partial')
            partial.add(subscriptionId);
        observed.set(subscriptionId, [observed.get(subscriptionId) ?? input.observedAt, input.observedAt].sort()[0]);
        const reference = {
            subscriptionId,
            assignmentKey: input.assignmentKey,
            policyControlKey: input.policyControlKey,
            policyAssignmentId: input.policyAssignmentId,
        };
        const { policies, resources: evaluations, description: _description, requirements: _requirements, additionalContentUrl: _url, ...summary } = input.control;
        targets.set(`${subscriptionId}:${input.assignmentKey}:${input.policyControlKey}`, {
            ...reference,
            control: summary,
            policies: policies.map(row => ({ policyDefinitionReferenceId: row.policyDefinitionReferenceId, displayName: row.displayName })),
        });
        const policiesByReference = new Map(policies.map(row => [lower(row.policyDefinitionReferenceId), row]));
        const observedByReference = new Map();
        for (const policy of policies) {
            const key = lower(policy.policyDefinitionId);
            const outcome = regulatoryPolicyEvidenceOutcome(policy.evaluationState);
            const existing = checks.get(key);
            const check = existing ?? {
                policyDefinitionId: policy.policyDefinitionId,
                displayName: policy.displayName,
                outcome,
                subscriptionIds: [],
                references: [],
                failingResourceCount: 0,
                resourceTypes: [],
            };
            if (order[outcome] < order[check.outcome])
                check.outcome = outcome;
            if (!check.subscriptionIds.includes(subscriptionId))
                check.subscriptionIds.push(subscriptionId);
            if (!check.references.some(row => row.subscriptionId === subscriptionId &&
                row.assignmentKey === input.assignmentKey &&
                row.policyDefinitionReferenceId === policy.policyDefinitionReferenceId))
                check.references.push({ ...reference, policyDefinitionReferenceId: policy.policyDefinitionReferenceId });
            if (input.state === 'partial')
                check.failingResourceCountIsMinimum = true;
            checks.set(key, check);
        }
        const group = resources.get(subscriptionId) ?? new Map();
        for (const evaluation of evaluations) {
            if (evaluation.evaluationState !== 'nonCompliant')
                continue;
            if (lower(evaluation.policyAssignmentId) !== lower(input.policyAssignmentId) ||
                !lower(evaluation.resourceId).startsWith(`/subscriptions/${subscriptionId}/`))
                throw new Error('Resource evidence identity mismatch');
            const policy = policiesByReference.get(lower(evaluation.policyDefinitionReferenceId));
            if (!policy || lower(policy.policyDefinitionId) !== lower(evaluation.policyDefinitionId))
                throw new Error('Unlinked resource check');
            const referenceResources = observedByReference.get(lower(policy.policyDefinitionReferenceId)) ?? new Set();
            referenceResources.add(lower(evaluation.resourceId));
            observedByReference.set(lower(policy.policyDefinitionReferenceId), referenceResources);
            const key = lower(policy.policyDefinitionId);
            const check = checks.get(key);
            if (!check)
                throw new Error('Missing resource check');
            check.outcome = 'failed';
            if (evaluation.resourceType && !check.resourceTypes.includes(evaluation.resourceType))
                check.resourceTypes.push(evaluation.resourceType);
            const failing = countsByCheck.get(key) ?? new Set();
            failing.add(lower(evaluation.resourceId));
            countsByCheck.set(key, failing);
            const resource = group.get(lower(evaluation.resourceId)) ?? {
                resourceId: evaluation.resourceId,
                displayName: evaluation.resourceName || evaluation.resourceId.split('/').pop() || evaluation.resourceId,
                resourceType: evaluation.resourceType,
                resourceGroupName: evaluation.resourceGroupName,
                failingChecks: [],
            };
            if (!resource.failingChecks.some(row => row.assignmentKey === input.assignmentKey && lower(row.policyDefinitionReferenceId) === lower(policy.policyDefinitionReferenceId)))
                resource.failingChecks.push({
                    policyDefinitionId: policy.policyDefinitionId,
                    displayName: policy.displayName,
                    policyDefinitionReferenceId: policy.policyDefinitionReferenceId,
                    assignmentKey: input.assignmentKey,
                });
            group.set(lower(evaluation.resourceId), resource);
        }
        resources.set(subscriptionId, group);
        for (const policy of policies) {
            const distinctCount = observedByReference.get(lower(policy.policyDefinitionReferenceId))?.size ?? 0;
            if (policy.counts.nonCompliant > distinctCount) {
                partial.add(subscriptionId);
                const check = checks.get(lower(policy.policyDefinitionId));
                if (check)
                    check.failingResourceCountIsMinimum = true;
            }
        }
    }
    const unavailable = new Set(unavailableSubscriptionIds.map(lower));
    const projectedChecks = [...checks.entries()]
        .map(([key, check]) => ({
        ...check,
        failingResourceCount: countsByCheck.get(key)?.size ?? 0,
        subscriptionIds: check.subscriptionIds.sort(),
        resourceTypes: check.resourceTypes.sort(),
        ...(unavailable.size ? { failingResourceCountIsMinimum: true } : {}),
    }))
        .sort((a, b) => order[a.outcome] - order[b.outcome] || b.failingResourceCount - a.failingResourceCount || a.displayName.localeCompare(b.displayName));
    const resourcePages = control.subscriptions.map(row => {
        const id = lower(row.subscriptionId);
        const sorted = [...(resources.get(id)?.values() ?? [])].sort((a, b) => a.displayName.localeCompare(b.displayName) || lower(a.resourceId).localeCompare(lower(b.resourceId)));
        const linked = row.policyEvidence.length > 0;
        const available = observed.has(id);
        const state = !linked ? 'notLinked' : !available ? 'unavailable' : partial.has(id) || unavailable.has(id) ? 'partial' : 'complete';
        const page = lower(resourceSubscriptionId ?? '') === id ? resourcePage : 1;
        const totalPages = available ? Math.max(1, Math.ceil(sorted.length / REGULATORY_CONTROL_RESOURCE_PAGE_SIZE)) : undefined;
        if (totalPages !== undefined && page > totalPages)
            throw new Error('Resource page is outside available evidence');
        return {
            subscriptionId: row.subscriptionId,
            state,
            observedAt: observed.get(id),
            page,
            pageSize: REGULATORY_CONTROL_RESOURCE_PAGE_SIZE,
            ...(available ? { totalItems: sorted.length, totalPages, ...(state === 'partial' ? { totalItemsIsMinimum: true } : {}) } : {}),
            resources: sorted.slice((page - 1) * REGULATORY_CONTROL_RESOURCE_PAGE_SIZE, page * REGULATORY_CONTROL_RESOURCE_PAGE_SIZE),
        };
    });
    return {
        checks: projectedChecks,
        otherCheckCount: unavailable.size || resourcePages.some(row => ['partial', 'unavailable'].includes(row.state))
            ? undefined
            : projectedChecks.filter(row => row.outcome !== 'failed').length,
        assignmentTargets: [...targets.values()],
        resourcePages,
    };
}
