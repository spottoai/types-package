import type {
  FrameworkRemediationAction,
  FrameworkRemediationControl,
  FrameworkRemediationEffort,
  FrameworkRemediationEffortBreakdown,
  FrameworkRemediationEffortProfile,
  FrameworkRemediationEffortTotal,
  FrameworkRemediationJob,
  FrameworkRemediationPlanDocument,
  FrameworkRemediationTier,
} from './remediationContracts';
import { FRAMEWORK_REMEDIATION_PLAN_LIMITS as limits } from './remediationContracts';
import { choice, identifier, input, invalid, list, number, shape, text, timestamp, unique } from './internal';
import { parseAssessmentNativeScope, requireAssessmentHash, requireFrameworkId, requireSourceVersion } from './validation';

const profileNames = ['clickops', 'devops', 'enterprise'] as const;
const profile = (value: unknown): FrameworkRemediationEffortProfile => choice(value, profileNames);
const tier = (value: unknown): FrameworkRemediationTier => choice(value, ['now', 'next', 'later']);
const identity = (value: unknown): string => identifier(value, limits.identityLength);
const ids = (value: unknown, maximumLength = 256): string[] => unique(list(value, limits.references).map(item => identifier(item, maximumLength)));
const reasons = (value: unknown): string[] => unique(list(value, limits.reasons).map(item => text(item, limits.reasonLength, false)));
const nonempty = <T>(values: T[]): T[] => (values.length ? values : invalid('empty remediation references'));
const company = (value: unknown): string => {
  const result = identifier(value, 105);
  return /^(?:comp-|cus_)[A-Za-z0-9_-]{1,100}$/u.test(result) ? result : invalid('companyId');
};

const breakdown = (value: unknown, resourceCount: number): FrameworkRemediationEffortBreakdown => {
  const row = shape(value, ['setupMinutes', 'perResourceMinutes', 'validationMinutes', 'resourceCount', 'totalMinutes']);
  const result = {
    setupMinutes: number(row.setupMinutes),
    perResourceMinutes: number(row.perResourceMinutes),
    validationMinutes: number(row.validationMinutes),
    resourceCount: number(row.resourceCount),
    totalMinutes: number(row.totalMinutes),
  };
  const computed = number(result.setupMinutes + result.perResourceMinutes * resourceCount + result.validationMinutes);
  if (result.resourceCount !== resourceCount || result.totalMinutes !== computed) return invalid('remediation effort formula');
  return result;
};
const effort = (
  value: unknown,
  targetKind: FrameworkRemediationAction['targetKind'],
  resources: string[],
  selected: FrameworkRemediationEffortProfile
): FrameworkRemediationEffort => {
  const row = shape(value, ['profiles', 'selectedProfile', 'provenance', 'targetCountBasis', 'assumptions']);
  if (targetKind === 'unknown' || (targetKind === 'resources' && !resources.length)) return invalid('remediation targets unavailable');
  const targetCountBasis = choice(row.targetCountBasis, ['scope-setting', 'distinct-native-resources']);
  if (targetCountBasis !== (targetKind === 'setting' ? 'scope-setting' : 'distinct-native-resources')) return invalid('remediation target basis');
  const resourceCount = targetKind === 'setting' ? 1 : resources.length;
  const profiles = shape(row.profiles, profileNames);
  const selectedProfile = profile(row.selectedProfile);
  if (selectedProfile !== selected) return invalid('remediation selected profile');
  return {
    profiles: {
      clickops: breakdown(profiles.clickops, resourceCount),
      devops: breakdown(profiles.devops, resourceCount),
      enterprise: breakdown(profiles.enterprise, resourceCount),
    },
    selectedProfile,
    provenance: choice(row.provenance, ['curated-estimate', 'company-override']),
    targetCountBasis,
    assumptions: reasons(row.assumptions),
  };
};

const action = (value: unknown, selected: FrameworkRemediationEffortProfile): FrameworkRemediationAction => {
  const row = shape(
    value,
    [
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
    ],
    ['effortUnavailableReason', 'changeNote']
  );
  const targetKind = choice(row.targetKind, ['setting', 'resources', 'unknown']);
  const resourceIds = ids(row.resourceIds, limits.resourceIdLength);
  const risk = shape(row.risk, ['level', 'source']);
  const riskSource = choice(risk.source, ['threatscore', 'severity', 'unknown']);
  const level = risk.level === null ? null : number(risk.level, 5);
  if (level === 0 || (level === null) !== (riskSource === 'unknown')) return invalid('remediation risk provenance');
  const result: FrameworkRemediationAction = {
    id: identity(row.id),
    actionKey: identity(row.actionKey),
    checkIds: ids(row.checkIds),
    controlIds: nonempty(ids(row.controlIds)),
    resourceIds,
    jobKey: identity(row.jobKey),
    targetKind,
    targetIdentity: identity(row.targetIdentity),
    risk: { level: level as FrameworkRemediationAction['risk']['level'], source: riskSource },
    verification: choice(row.verification, ['verified', 'unverified']),
    effort: row.effort === null ? null : effort(row.effort, targetKind, resourceIds, selected),
    changeRisk: choice(row.changeRisk, ['none', 'low', 'disruptive', 'unknown']),
    downtime: choice(row.downtime, ['required', 'not-required', 'unknown']),
    costState: choice(row.costState, ['no-added-cost', 'adds-cost', 'unknown']),
    tier: tier(row.tier),
    reasons: reasons(row.reasons),
  };
  if (result.effort === null) result.effortUnavailableReason = text(row.effortUnavailableReason, limits.reasonLength, false);
  else if ('effortUnavailableReason' in row) return invalid('unexpected unavailable effort reason');
  if (!result.checkIds.length && (result.targetKind !== 'unknown' || result.effort !== null)) return invalid('remediation check mapping');
  if (
    result.tier === 'now' &&
    (result.effort === null ||
      result.verification !== 'verified' ||
      !['none', 'low'].includes(result.changeRisk) ||
      result.downtime !== 'not-required' ||
      result.costState !== 'no-added-cost')
  )
    return invalid('unsafe remediation now state');
  if ('changeNote' in row) result.changeNote = text(row.changeNote, limits.reasonLength, false);
  return result;
};

const total = (value: unknown): FrameworkRemediationEffortTotal => {
  const row = shape(value, ['totalMinutes', 'knownMinutes', 'unknownActions']);
  const totalMinutes = row.totalMinutes === null ? null : number(row.totalMinutes);
  const knownMinutes = number(row.knownMinutes);
  const unknownActions = number(row.unknownActions, limits.actions);
  if ((unknownActions > 0 && totalMinutes !== null) || (unknownActions === 0 && totalMinutes !== knownMinutes))
    return invalid('remediation total completeness');
  return { totalMinutes, knownMinutes, unknownActions };
};
const control = (value: unknown): FrameworkRemediationControl => {
  const row = shape(value, ['controlId', 'actionIds', 'tier', 'reasons']);
  const result = {
    controlId: identifier(row.controlId),
    actionIds: nonempty(ids(row.actionIds, limits.identityLength)),
    tier: tier(row.tier),
    reasons: reasons(row.reasons),
  };
  return result;
};
const job = (value: unknown): FrameworkRemediationJob => {
  const row = shape(value, ['jobKey', 'actionIds', 'controlIds', 'resourceIds', 'tier', 'effort']);
  return {
    jobKey: identity(row.jobKey),
    actionIds: nonempty(ids(row.actionIds, limits.identityLength)),
    controlIds: nonempty(ids(row.controlIds)),
    resourceIds: ids(row.resourceIds, limits.resourceIdLength),
    tier: tier(row.tier),
    effort: total(row.effort),
  };
};
const sameIds = (actual: string[], expected: string[]): boolean => {
  const expectedSet = new Set(expected);
  return actual.length === expectedSet.size && actual.every(id => expectedSet.has(id));
};
const validateTotal = (actual: FrameworkRemediationEffortTotal, actions: FrameworkRemediationAction[]): void => {
  let knownMinutes = 0;
  let unknownActions = 0;
  for (const action of actions) {
    if (action.effort === null) unknownActions++;
    else knownMinutes = number(knownMinutes + action.effort.profiles[action.effort.selectedProfile].totalMinutes);
  }
  if (actual.knownMinutes !== knownMinutes || actual.unknownActions !== unknownActions) invalid('remediation deduplicated total');
};
const validateReferences = (plan: FrameworkRemediationPlanDocument): void => {
  unique(plan.actions.map(action => action.id));
  unique(plan.actions.map(action => JSON.stringify([action.actionKey, action.targetKind, action.targetIdentity])));
  unique(plan.controls.map(control => control.controlId));
  unique(plan.jobs.map(job => job.jobKey));
  const actions = new Map(plan.actions.map(action => [action.id, action]));
  const actionControls = new Map(plan.actions.map(action => [action.id, new Set(action.controlIds)]));
  const controlActions = new Map(plan.controls.map(control => [control.controlId, new Set(control.actionIds)]));
  const jobActions = new Map(plan.jobs.map(job => [job.jobKey, new Set(job.actionIds)]));
  for (const action of plan.actions) {
    if (action.effort?.provenance === 'company-override' && plan.inputs.overridesSha256 === null) invalid('remediation override input digest');
    if (!jobActions.get(action.jobKey)?.has(action.id)) invalid('remediation action job');
    for (const id of action.controlIds) if (!controlActions.get(id)?.has(action.id)) invalid('remediation action control');
  }
  for (const control of plan.controls)
    for (const id of control.actionIds) if (!actionControls.get(id)?.has(control.controlId)) invalid('remediation control action');
  for (const job of plan.jobs) {
    const members = job.actionIds.map(id => {
      const member = actions.get(id);
      return member && member.jobKey === job.jobKey ? member : invalid('remediation job action');
    });
    if (
      !sameIds(
        job.controlIds,
        members.flatMap(action => action.controlIds)
      )
    )
      invalid('remediation job controls');
    if (
      !sameIds(
        job.resourceIds,
        members.flatMap(action => action.resourceIds)
      )
    )
      invalid('remediation job resources');
    validateTotal(job.effort, members);
  }
  validateTotal(plan.totals, plan.actions);
};

/** Strict, bounded, detached plan parsing; authorization and comparison with committed generation stay reader-owned. */
export const parseFrameworkRemediationPlanDocument = (value: unknown): FrameworkRemediationPlanDocument => {
  const row = shape(input(value), [
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
  if (row.schemaVersion !== 1) return invalid('remediation schemaVersion');
  const inputs = shape(row.inputs, ['plannerVersion', 'profilesVersion', 'effortProfile', 'profileSource', 'overridesSha256']);
  const effortProfile = profile(inputs.effortProfile);
  const plan: FrameworkRemediationPlanDocument = {
    schemaVersion: 1,
    companyId: company(row.companyId),
    scope: parseAssessmentNativeScope(row.scope),
    frameworkId: requireFrameworkId(row.frameworkId),
    sourceVersion: requireSourceVersion(row.sourceVersion),
    catalogueBundleSha256: requireAssessmentHash(row.catalogueBundleSha256),
    generationSha256: requireAssessmentHash(row.generationSha256),
    computedAt: timestamp(row.computedAt),
    inputs: {
      plannerVersion: identifier(inputs.plannerVersion),
      profilesVersion: identifier(inputs.profilesVersion),
      effortProfile,
      profileSource: choice(inputs.profileSource, ['account-setting', 'default']),
      overridesSha256: inputs.overridesSha256 === null ? null : requireAssessmentHash(inputs.overridesSha256),
    },
    actions: list(row.actions, limits.actions).map(value => action(value, effortProfile)),
    controls: list(row.controls, limits.controls).map(control),
    jobs: list(row.jobs, limits.jobs).map(job),
    totals: total(row.totals),
  };
  validateReferences(plan);
  return plan;
};
