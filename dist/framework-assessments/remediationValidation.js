"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrameworkRemediationPlanDocument = void 0;
const remediationContracts_1 = require("./remediationContracts");
const internal_1 = require("./internal");
const validation_1 = require("./validation");
const profileNames = ['clickops', 'devops', 'enterprise'];
const profile = (value) => (0, internal_1.choice)(value, profileNames);
const tier = (value) => (0, internal_1.choice)(value, ['now', 'next', 'later']);
const identity = (value) => (0, internal_1.identifier)(value, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.identityLength);
const ids = (value, maximumLength = 256) => (0, internal_1.unique)((0, internal_1.list)(value, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.references).map(item => (0, internal_1.identifier)(item, maximumLength)));
const reasons = (value) => (0, internal_1.unique)((0, internal_1.list)(value, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.reasons).map(item => (0, internal_1.text)(item, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.reasonLength, false)));
const nonempty = (values) => (values.length ? values : (0, internal_1.invalid)('empty remediation references'));
const company = (value) => {
    const result = (0, internal_1.identifier)(value, 105);
    return /^(?:comp-|cus_)[A-Za-z0-9_-]{1,100}$/u.test(result) ? result : (0, internal_1.invalid)('companyId');
};
const breakdown = (value, resourceCount) => {
    const row = (0, internal_1.shape)(value, ['setupMinutes', 'perResourceMinutes', 'validationMinutes', 'resourceCount', 'totalMinutes']);
    const result = {
        setupMinutes: (0, internal_1.number)(row.setupMinutes),
        perResourceMinutes: (0, internal_1.number)(row.perResourceMinutes),
        validationMinutes: (0, internal_1.number)(row.validationMinutes),
        resourceCount: (0, internal_1.number)(row.resourceCount),
        totalMinutes: (0, internal_1.number)(row.totalMinutes),
    };
    const computed = (0, internal_1.number)(result.setupMinutes + result.perResourceMinutes * resourceCount + result.validationMinutes);
    if (result.resourceCount !== resourceCount || result.totalMinutes !== computed)
        return (0, internal_1.invalid)('remediation effort formula');
    return result;
};
const effort = (value, targetKind, resources, selected) => {
    const row = (0, internal_1.shape)(value, ['profiles', 'selectedProfile', 'provenance', 'targetCountBasis', 'assumptions']);
    if (targetKind === 'unknown' || (targetKind === 'resources' && !resources.length))
        return (0, internal_1.invalid)('remediation targets unavailable');
    const targetCountBasis = (0, internal_1.choice)(row.targetCountBasis, ['scope-setting', 'distinct-native-resources']);
    if (targetCountBasis !== (targetKind === 'setting' ? 'scope-setting' : 'distinct-native-resources'))
        return (0, internal_1.invalid)('remediation target basis');
    const resourceCount = targetKind === 'setting' ? 1 : resources.length;
    const profiles = (0, internal_1.shape)(row.profiles, profileNames);
    const selectedProfile = profile(row.selectedProfile);
    if (selectedProfile !== selected)
        return (0, internal_1.invalid)('remediation selected profile');
    return {
        profiles: {
            clickops: breakdown(profiles.clickops, resourceCount),
            devops: breakdown(profiles.devops, resourceCount),
            enterprise: breakdown(profiles.enterprise, resourceCount),
        },
        selectedProfile,
        provenance: (0, internal_1.choice)(row.provenance, ['curated-estimate', 'company-override']),
        targetCountBasis,
        assumptions: reasons(row.assumptions),
    };
};
const action = (value, selected) => {
    const row = (0, internal_1.shape)(value, [
        'id',
        'actionKey',
        'checkIds',
        'controlIds',
        'resourceIds',
        'jobKey',
        'targetKind',
        'targetIdentity',
        'risk',
        'verification',
        'effort',
        'changeRisk',
        'downtime',
        'costState',
        'tier',
        'reasons',
    ], ['effortUnavailableReason', 'changeNote']);
    const targetKind = (0, internal_1.choice)(row.targetKind, ['setting', 'resources', 'unknown']);
    const resourceIds = ids(row.resourceIds, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.resourceIdLength);
    const risk = (0, internal_1.shape)(row.risk, ['level', 'source']);
    const riskSource = (0, internal_1.choice)(risk.source, ['threatscore', 'severity', 'unknown']);
    const level = risk.level === null ? null : (0, internal_1.number)(risk.level, 5);
    if (level === 0 || (level === null) !== (riskSource === 'unknown'))
        return (0, internal_1.invalid)('remediation risk provenance');
    const result = {
        id: identity(row.id),
        actionKey: identity(row.actionKey),
        checkIds: ids(row.checkIds),
        controlIds: nonempty(ids(row.controlIds)),
        resourceIds,
        jobKey: identity(row.jobKey),
        targetKind,
        targetIdentity: identity(row.targetIdentity),
        risk: { level: level, source: riskSource },
        verification: (0, internal_1.choice)(row.verification, ['verified', 'unverified']),
        effort: row.effort === null ? null : effort(row.effort, targetKind, resourceIds, selected),
        changeRisk: (0, internal_1.choice)(row.changeRisk, ['none', 'low', 'disruptive', 'unknown']),
        downtime: (0, internal_1.choice)(row.downtime, ['required', 'not-required', 'unknown']),
        costState: (0, internal_1.choice)(row.costState, ['no-added-cost', 'adds-cost', 'unknown']),
        tier: tier(row.tier),
        reasons: reasons(row.reasons),
    };
    if (result.effort === null)
        result.effortUnavailableReason = (0, internal_1.text)(row.effortUnavailableReason, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.reasonLength, false);
    else if ('effortUnavailableReason' in row)
        return (0, internal_1.invalid)('unexpected unavailable effort reason');
    if (!result.checkIds.length && (result.targetKind !== 'unknown' || result.effort !== null))
        return (0, internal_1.invalid)('remediation check mapping');
    if (result.tier === 'now' &&
        (result.effort === null ||
            result.verification !== 'verified' ||
            !['none', 'low'].includes(result.changeRisk) ||
            result.downtime !== 'not-required' ||
            result.costState !== 'no-added-cost'))
        return (0, internal_1.invalid)('unsafe remediation now state');
    if ('changeNote' in row)
        result.changeNote = (0, internal_1.text)(row.changeNote, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.reasonLength, false);
    return result;
};
const total = (value) => {
    const row = (0, internal_1.shape)(value, ['totalMinutes', 'knownMinutes', 'unknownActions']);
    const totalMinutes = row.totalMinutes === null ? null : (0, internal_1.number)(row.totalMinutes);
    const knownMinutes = (0, internal_1.number)(row.knownMinutes);
    const unknownActions = (0, internal_1.number)(row.unknownActions, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.actions);
    if ((unknownActions > 0 && totalMinutes !== null) || (unknownActions === 0 && totalMinutes !== knownMinutes))
        return (0, internal_1.invalid)('remediation total completeness');
    return { totalMinutes, knownMinutes, unknownActions };
};
const control = (value) => {
    const row = (0, internal_1.shape)(value, ['controlId', 'actionIds', 'tier', 'reasons']);
    const result = {
        controlId: (0, internal_1.identifier)(row.controlId),
        actionIds: nonempty(ids(row.actionIds, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.identityLength)),
        tier: tier(row.tier),
        reasons: reasons(row.reasons),
    };
    return result;
};
const job = (value) => {
    const row = (0, internal_1.shape)(value, ['jobKey', 'actionIds', 'controlIds', 'resourceIds', 'tier', 'effort']);
    return {
        jobKey: identity(row.jobKey),
        actionIds: nonempty(ids(row.actionIds, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.identityLength)),
        controlIds: nonempty(ids(row.controlIds)),
        resourceIds: ids(row.resourceIds, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.resourceIdLength),
        tier: tier(row.tier),
        effort: total(row.effort),
    };
};
const sameIds = (actual, expected) => {
    const expectedSet = new Set(expected);
    return actual.length === expectedSet.size && actual.every(id => expectedSet.has(id));
};
const validateTotal = (actual, actions) => {
    let knownMinutes = 0;
    let unknownActions = 0;
    for (const action of actions) {
        if (action.effort === null)
            unknownActions++;
        else
            knownMinutes = (0, internal_1.number)(knownMinutes + action.effort.profiles[action.effort.selectedProfile].totalMinutes);
    }
    if (actual.knownMinutes !== knownMinutes || actual.unknownActions !== unknownActions)
        (0, internal_1.invalid)('remediation deduplicated total');
};
const validateReferences = (plan) => {
    (0, internal_1.unique)(plan.actions.map(action => action.id));
    (0, internal_1.unique)(plan.actions.map(action => JSON.stringify([action.actionKey, action.targetKind, action.targetIdentity])));
    (0, internal_1.unique)(plan.controls.map(control => control.controlId));
    (0, internal_1.unique)(plan.jobs.map(job => job.jobKey));
    const actions = new Map(plan.actions.map(action => [action.id, action]));
    const actionControls = new Map(plan.actions.map(action => [action.id, new Set(action.controlIds)]));
    const controlActions = new Map(plan.controls.map(control => [control.controlId, new Set(control.actionIds)]));
    const jobActions = new Map(plan.jobs.map(job => [job.jobKey, new Set(job.actionIds)]));
    for (const action of plan.actions) {
        if (action.effort?.provenance === 'company-override' && plan.inputs.overridesSha256 === null)
            (0, internal_1.invalid)('remediation override input digest');
        if (!jobActions.get(action.jobKey)?.has(action.id))
            (0, internal_1.invalid)('remediation action job');
        for (const id of action.controlIds)
            if (!controlActions.get(id)?.has(action.id))
                (0, internal_1.invalid)('remediation action control');
    }
    for (const control of plan.controls)
        for (const id of control.actionIds)
            if (!actionControls.get(id)?.has(control.controlId))
                (0, internal_1.invalid)('remediation control action');
    for (const job of plan.jobs) {
        const members = job.actionIds.map(id => {
            const member = actions.get(id);
            return member && member.jobKey === job.jobKey ? member : (0, internal_1.invalid)('remediation job action');
        });
        if (!sameIds(job.controlIds, members.flatMap(action => action.controlIds)))
            (0, internal_1.invalid)('remediation job controls');
        if (!sameIds(job.resourceIds, members.flatMap(action => action.resourceIds)))
            (0, internal_1.invalid)('remediation job resources');
        validateTotal(job.effort, members);
    }
    validateTotal(plan.totals, plan.actions);
};
/** Strict, bounded, detached plan parsing; authorization and comparison with committed generation stay reader-owned. */
const parseFrameworkRemediationPlanDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), [
        'schemaVersion',
        'companyId',
        'scope',
        'frameworkId',
        'sourceVersion',
        'catalogueBundleSha256',
        'generationSha256',
        'computedAt',
        'inputs',
        'actions',
        'controls',
        'jobs',
        'totals',
    ]);
    if (row.schemaVersion !== 1)
        return (0, internal_1.invalid)('remediation schemaVersion');
    const inputs = (0, internal_1.shape)(row.inputs, ['plannerVersion', 'profilesVersion', 'effortProfile', 'profileSource', 'overridesSha256']);
    const effortProfile = profile(inputs.effortProfile);
    const plan = {
        schemaVersion: 1,
        companyId: company(row.companyId),
        scope: (0, validation_1.parseAssessmentNativeScope)(row.scope),
        frameworkId: (0, validation_1.requireFrameworkId)(row.frameworkId),
        sourceVersion: (0, validation_1.requireSourceVersion)(row.sourceVersion),
        catalogueBundleSha256: (0, validation_1.requireAssessmentHash)(row.catalogueBundleSha256),
        generationSha256: (0, validation_1.requireAssessmentHash)(row.generationSha256),
        computedAt: (0, internal_1.timestamp)(row.computedAt),
        inputs: {
            plannerVersion: (0, internal_1.identifier)(inputs.plannerVersion),
            profilesVersion: (0, internal_1.identifier)(inputs.profilesVersion),
            effortProfile,
            profileSource: (0, internal_1.choice)(inputs.profileSource, ['account-setting', 'default']),
            overridesSha256: inputs.overridesSha256 === null ? null : (0, validation_1.requireAssessmentHash)(inputs.overridesSha256),
        },
        actions: (0, internal_1.list)(row.actions, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.actions).map(value => action(value, effortProfile)),
        controls: (0, internal_1.list)(row.controls, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.controls).map(control),
        jobs: (0, internal_1.list)(row.jobs, remediationContracts_1.FRAMEWORK_REMEDIATION_PLAN_LIMITS.jobs).map(job),
        totals: total(row.totals),
    };
    validateReferences(plan);
    return plan;
};
exports.parseFrameworkRemediationPlanDocument = parseFrameworkRemediationPlanDocument;
//# sourceMappingURL=remediationValidation.js.map