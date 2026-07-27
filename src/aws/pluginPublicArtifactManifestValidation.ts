import {
  AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPluginResourceLogicalName,
  buildAwsPluginSubscriptionLogicalName,
  type AwsPluginActiveSetMember,
  type AwsPluginArtifactTarget,
  type AwsPluginGenerationManifest,
  type AwsPluginLogicalName,
  type AwsPluginSectionSourceBinding,
} from './pluginPublicArtifacts';
import { validateSourceBinding, validateTarget } from './pluginPublicArtifactBodyValidation';
import { validateSourceBindingForTarget } from './pluginPublicArtifactSectionValidation';
import {
  asRecord,
  assertAccount,
  assertExactKeys,
  assertJsonEqual,
  assertValue,
  isoTimestamp,
  requiredArray,
  requiredEnum,
  requiredString,
  sha256,
  validateDescriptor,
} from './pluginPublicArtifactValidationHelpers';

/** Validates complete active-set identity and targeted carry-forward semantics. */
export function validateAwsPluginGenerationManifest(value: unknown): AwsPluginGenerationManifest {
  const manifest = asRecord(value, 'manifest');
  assertExactKeys(
    manifest,
    [
      'schemaVersion',
      'status',
      'provider',
      'accountId',
      'artifactGeneration',
      'requestBinding',
      'operation',
      'previousGeneration',
      'members',
      'counts',
      'completedAt',
    ],
    'manifest'
  );
  assertValue(manifest.schemaVersion, AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'manifest.schemaVersion');
  assertValue(manifest.status, 'completed', 'manifest.status');
  assertValue(manifest.provider, 'aws', 'manifest.provider');
  const accountId = requiredString(manifest.accountId, 'manifest.accountId');
  assertAccount(accountId, accountId, 'manifest.accountId');
  const generation = validateGeneration(manifest.artifactGeneration);
  const request = validateRequestBinding(manifest.requestBinding);
  assertValue(request.requestedAt, generation.generatedAt, 'manifest.requestBinding.requestedAt');
  const completedAt = isoTimestamp(manifest.completedAt, 'manifest.completedAt');
  if (completedAt < generation.generatedAt) throw new Error('manifest.completedAt cannot precede the output generation time.');

  const operation = validateOperation(manifest.operation, accountId);
  const previous = validatePreviousGeneration(manifest.previousGeneration, accountId);
  const members = requiredArray(manifest.members, 'manifest.members').map((member, index) =>
    validateMember(member, accountId, generation.generatedAt, `manifest.members[${index}]`)
  );
  assertUniqueLogicalNames(members);
  validateCounts(manifest.counts, members);
  validateTransition(operation, previous, members);
  return value as AwsPluginGenerationManifest;
}

function validateGeneration(value: unknown): { runId: string; generatedAt: string } {
  const generation = asRecord(value, 'manifest.artifactGeneration');
  assertExactKeys(generation, ['runId', 'generatedAt'], 'manifest.artifactGeneration');
  return {
    runId: requiredString(generation.runId, 'manifest.artifactGeneration.runId'),
    generatedAt: isoTimestamp(generation.generatedAt, 'manifest.artifactGeneration.generatedAt'),
  };
}

function validateRequestBinding(value: unknown): { requestId: string; requestedAt: string } {
  const request = asRecord(value, 'manifest.requestBinding');
  assertExactKeys(request, ['requestId', 'requestedAt'], 'manifest.requestBinding');
  return {
    requestId: requiredString(request.requestId, 'manifest.requestBinding.requestId'),
    requestedAt: isoTimestamp(request.requestedAt, 'manifest.requestBinding.requestedAt'),
  };
}

function validateOperation(value: unknown, accountId: string): Record<string, unknown> {
  const operation = asRecord(value, 'manifest.operation');
  if (operation.kind === 'full') {
    assertExactKeys(operation, ['kind'], 'manifest.operation');
    return operation;
  }
  const kind = requiredEnum(operation.kind, ['targeted-replacement', 'targeted-retirement'], 'manifest.operation.kind');
  assertExactKeys(operation, ['kind', 'target'], 'manifest.operation');
  const targetRecord = asRecord(operation.target, 'manifest.operation.target');
  const target =
    targetRecord.kind === 'subscription-detail'
      ? validateTarget(operation.target, 'subscription-detail')
      : validateTarget(operation.target, 'resource-detail');
  if (targetRecord.kind !== 'subscription-detail' && targetRecord.kind !== 'resource-detail')
    throw new Error('manifest.operation.target.kind is not declared.');
  assertAccount(target.accountId, accountId, 'manifest.operation.target.accountId');
  return { kind, target };
}

function validateMember(value: unknown, accountId: string, outputGeneratedAt: string, field: string): AwsPluginActiveSetMember {
  const member = asRecord(value, field);
  const common = ['state', 'publication', 'provider', 'accountId', 'logicalName', 'artifactType', 'target'];
  assertValue(member.provider, 'aws', `${field}.provider`);
  assertAccount(member.accountId, accountId, `${field}.accountId`);
  const artifactType = requiredEnum(member.artifactType, ['plugin-subscription', 'plugin-resource'], `${field}.artifactType`);
  const target =
    artifactType === 'plugin-subscription' ? validateTarget(member.target, 'subscription-detail') : validateTarget(member.target, 'resource-detail');
  assertAccount(target.accountId, accountId, `${field}.target.accountId`);
  const logicalName = validateLogicalName(member.logicalName, target, `${field}.logicalName`);

  if (member.state === 'active') {
    assertExactKeys(member, [...common, 'artifact', 'sourceGenerations'], field);
    requiredEnum(member.publication, ['replaced', 'carried-forward'], `${field}.publication`);
    validateDescriptor(member.artifact, `${field}.artifact`);
    const descriptor = asRecord(member.artifact, `${field}.artifact`);
    assertValue(descriptor.name, logicalName, `${field}.artifact.name`);
    const sourceIdentities = new Set<string>();
    const sourceBindings: AwsPluginSectionSourceBinding[] = [];
    requiredArray(member.sourceGenerations, `${field}.sourceGenerations`).forEach((source, index) => {
      const sourceRecord = asRecord(source, `${field}.sourceGenerations[${index}]`);
      const binding = validateSourceBinding(
        source,
        accountId,
        requiredString(sourceRecord.section, `${field}.sourceGenerations[${index}].section`),
        `${field}.sourceGenerations[${index}]`
      );
      if (binding.generatedAt > outputGeneratedAt) throw new Error(`${field}.sourceGenerations[${index}].generatedAt cannot exceed output time.`);
      validateSourceBindingForTarget(binding, target, `${field}.sourceGenerations[${index}]`);
      const identity = [binding.section, binding.sourceArtifactType, binding.generationId, binding.targetKey, binding.artifactSha256].join('|');
      if (sourceIdentities.has(identity)) throw new Error(`${field}.sourceGenerations contains duplicate source bindings.`);
      sourceIdentities.add(identity);
      sourceBindings.push(binding);
    });
    validateCompleteSourceSet(sourceBindings, target, field);
  } else if (member.state === 'retired') {
    assertExactKeys(member, [...common, 'priorArtifactSha256', 'retiredAt'], field);
    assertValue(member.publication, 'retired', `${field}.publication`);
    sha256(member.priorArtifactSha256, `${field}.priorArtifactSha256`);
    isoTimestamp(member.retiredAt, `${field}.retiredAt`);
  } else {
    throw new Error(`${field}.state is not declared.`);
  }
  return value as AwsPluginActiveSetMember;
}

function validateCompleteSourceSet(sources: AwsPluginSectionSourceBinding[], target: AwsPluginArtifactTarget, field: string): void {
  const expected: string[] = [];
  const add = (section: string, sourceType: string, targetKey: string | undefined): void => {
    if (targetKey) expected.push(`${section}|${sourceType}|${targetKey}`);
  };
  if (target.kind === 'subscription-detail') {
    add('account-summary', 'account-summary', target.accountSummaryTargetKey);
    add('resources', 'resource-collection', target.resourceCollectionTargetKey);
    add('service-retirement', 'lifecycle', target.serviceRetirementTargetKey);
    add('ai-cost-summary', 'ai-cost-summary', target.aiCostSummaryTargetKey);
    add('commitment-analysis', 'commitment-analysis', target.commitmentAnalysisTargetKey);
    add('reliability', 'reliability', target.reliabilityTargetKey);
    add('account-governance', 'account-governance', target.accountGovernanceTargetKey);
  } else {
    add('resource', 'resource-collection', target.resourceCollectionTargetKey);
    add('relationships', 'relationships', target.relationshipTargetKey);
    add('service-retirement', 'lifecycle', target.serviceRetirementTargetKey);
  }
  target.recommendationScopes.forEach(scope => {
    add('recommendations', 'recommendations', scope.targetKey);
    add('recommendations', 'recommendation-actionability', scope.actionabilityTargetKey);
  });
  const actual = sources.map(source => `${source.section}|${source.sourceArtifactType}|${source.targetKey}`);
  assertJsonEqual([...actual].sort(), [...expected].sort(), `${field}.sourceGenerations complete source set`);
}

type PriorMemberMap = Map<string, Record<string, unknown>>;

function validatePreviousGeneration(value: unknown, accountId: string): PriorMemberMap {
  if (value === undefined) return new Map();
  const previous = asRecord(value, 'manifest.previousGeneration');
  assertExactKeys(previous, ['provider', 'accountId', 'runId', 'manifestSha256', 'members'], 'manifest.previousGeneration');
  assertValue(previous.provider, 'aws', 'manifest.previousGeneration.provider');
  assertAccount(previous.accountId, accountId, 'manifest.previousGeneration.accountId');
  requiredString(previous.runId, 'manifest.previousGeneration.runId');
  sha256(previous.manifestSha256, 'manifest.previousGeneration.manifestSha256');
  const result: PriorMemberMap = new Map();
  requiredArray(previous.members, 'manifest.previousGeneration.members').forEach((value, index) => {
    const field = `manifest.previousGeneration.members[${index}]`;
    const member = asRecord(value, field);
    assertExactKeys(member, ['provider', 'accountId', 'logicalName', 'artifactType', 'targetKeySha256', 'stableKeySha256', 'artifactSha256'], field);
    assertValue(member.provider, 'aws', `${field}.provider`);
    assertAccount(member.accountId, accountId, `${field}.accountId`);
    const name = requiredString(member.logicalName, `${field}.logicalName`);
    if (result.has(name)) throw new Error('manifest.previousGeneration.members has duplicate logicalName values.');
    requiredEnum(member.artifactType, ['plugin-subscription', 'plugin-resource'], `${field}.artifactType`);
    sha256(member.targetKeySha256, `${field}.targetKeySha256`);
    if (member.stableKeySha256 !== undefined) sha256(member.stableKeySha256, `${field}.stableKeySha256`);
    sha256(member.artifactSha256, `${field}.artifactSha256`);
    result.set(name, member);
  });
  return result;
}

function validateTransition(operation: Record<string, unknown>, previous: PriorMemberMap, members: AwsPluginActiveSetMember[]): void {
  if (operation.kind === 'full') return;
  if (previous.size === 0) throw new Error('Targeted publication requires previousGeneration.members.');
  const target = operation.target as AwsPluginArtifactTarget;
  const targetName = logicalNameForTarget(target);
  const current = new Map<string, AwsPluginActiveSetMember>(members.map(member => [member.logicalName, member]));

  for (const [name, prior] of previous) {
    const member = current.get(name);
    if (!member) throw new Error(`Targeted publication omitted prior member ${name}.`);
    if (name === targetName) {
      assertTargetPublication(operation.kind, member);
      assertPriorIdentity(member, prior, name);
      continue;
    }
    if (member.state !== 'active' || member.publication !== 'carried-forward') throw new Error(`Untargeted member ${name} must be carried forward.`);
    assertPriorIdentity(member, prior, name);
  }

  const targetMember = current.get(targetName);
  if (!targetMember) throw new Error('Targeted publication omitted its target member.');
  if (!previous.has(targetName)) {
    if (operation.kind === 'targeted-retirement') throw new Error('Cannot retire a target absent from the previous active set.');
    assertTargetPublication(operation.kind, targetMember);
  }
  for (const member of members) {
    if (!previous.has(member.logicalName) && member.logicalName !== targetName)
      throw new Error(`Targeted publication contains undeclared member ${member.logicalName}.`);
  }
}

function assertPriorIdentity(member: AwsPluginActiveSetMember, prior: Record<string, unknown>, name: string): void {
  assertValue(member.artifactType, prior.artifactType, `${name}.artifactType`);
  assertValue(member.target.targetKeySha256, prior.targetKeySha256, `${name}.target.targetKeySha256`);
  if (member.target.kind === 'resource-detail') {
    assertValue(member.target.stableKeySha256, prior.stableKeySha256, `${name}.target.stableKeySha256`);
  } else if (prior.stableKeySha256 !== undefined) {
    throw new Error(`${name}.stableKeySha256 is ambiguous for a subscription artifact.`);
  }
  if (member.state === 'active') {
    if (member.publication === 'carried-forward') {
      assertValue(member.artifact.sha256, prior.artifactSha256, `${name}.artifact.sha256`);
    }
  } else {
    assertValue(member.priorArtifactSha256, prior.artifactSha256, `${name}.priorArtifactSha256`);
  }
}

function assertTargetPublication(kind: unknown, member: AwsPluginActiveSetMember): void {
  const expected = kind === 'targeted-retirement' ? 'retired' : 'replaced';
  if (member.publication !== expected) throw new Error(`Target member publication must be ${expected}.`);
}

function validateCounts(value: unknown, members: AwsPluginActiveSetMember[]): void {
  const counts = asRecord(value, 'manifest.counts');
  assertExactKeys(counts, ['active', 'replaced', 'carriedForward', 'retired'], 'manifest.counts');
  const expected = {
    active: members.filter(member => member.state === 'active').length,
    replaced: members.filter(member => member.publication === 'replaced').length,
    carriedForward: members.filter(member => member.publication === 'carried-forward').length,
    retired: members.filter(member => member.state === 'retired').length,
  };
  for (const [key, count] of Object.entries(expected)) assertValue(counts[key], count, `manifest.counts.${key}`);
}

function validateLogicalName(value: unknown, target: AwsPluginArtifactTarget, field: string): AwsPluginLogicalName {
  const expected = logicalNameForTarget(target);
  assertValue(value, expected, field);
  if (/[\\/]/.test(expected) || expected.includes('..')) throw new Error(`${field} must be path-free.`);
  return expected;
}

function logicalNameForTarget(target: AwsPluginArtifactTarget): AwsPluginLogicalName {
  return target.kind === 'subscription-detail'
    ? buildAwsPluginSubscriptionLogicalName(target.targetKeySha256)
    : buildAwsPluginResourceLogicalName(target.stableKeySha256, target.targetKeySha256);
}

function assertUniqueLogicalNames(members: AwsPluginActiveSetMember[]): void {
  const names = members.map(member => member.logicalName);
  if (new Set(names).size !== names.length) throw new Error('manifest.members contains duplicate logicalName values.');
}
