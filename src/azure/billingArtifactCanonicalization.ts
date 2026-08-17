import type { ArtifactOwnershipBinding, ArtifactRevisionVector } from '../common/artifactEvidence.js';
import {
  ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES,
  allowedArtifactReferenceField,
  containsForbiddenArtifactControlData,
} from '../common/artifactControlData.js';
import { type BillingArtifactPublicationDecision } from './billingArtifactEvidence.js';
import type {
  BillingAnalysisPromotionObservationV1,
  BillingAnalyzerInputManifestV2,
  BillingAnalyzerOutputManifestV2,
} from './billingArtifactGeneration.js';
import type { BillingCostAnalysisMetadataV2 } from './billingPlots.js';

/** Stable identity/evidence projection shared by billing output manifests and metadata. */
export interface BillingOutputBindingV1 {
  kind: 'billing-analysis-output';
  schemaVersion: 1;
  subscriptionId: string;
  generationId: string;
  ownership: ArtifactOwnershipBinding<'azure'>;
  revision: ArtifactRevisionVector;
  inputManifestDigest: string;
  publicationDecision: BillingArtifactPublicationDecision;
}

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const hasOwn = (value: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(value, key);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const requirePlainRecord = (value: unknown, name: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new TypeError(`${name} must be an object.`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError(`${name} must be a plain JSON object.`);
  if (Object.getOwnPropertySymbols(value).length > 0) throw new TypeError(`${name} cannot contain symbol properties.`);
  return value;
};

const hasUnpairedSurrogate = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
};

const readDataProperty = (value: Record<string, unknown>, key: string, optional = false): unknown => {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) {
    if (optional) return undefined;
    throw new TypeError(`Missing canonical billing field: ${key}`);
  }
  if (!('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
    throw new TypeError(`Canonical billing field must be an enumerable JSON value: ${key}`);
  }
  return descriptor.value;
};

const selectOptional = (source: Record<string, unknown>, target: Record<string, unknown>, key: string): void => {
  if (hasOwn(source, key)) target[key] = readDataProperty(source, key, true);
};

const readArrayEntries = (value: unknown, name: string): unknown[] => {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new TypeError(`${name} must be a plain JSON array.`);
  }
  const ownKeys = Reflect.ownKeys(value);
  if (
    ownKeys.some(key => typeof key === 'symbol') ||
    ownKeys.some(key => typeof key === 'string' && key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))
  ) {
    throw new TypeError(`${name} cannot contain custom properties.`);
  }
  const entries: unknown[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
      throw new TypeError(`${name} entries must be enumerable JSON values.`);
    }
    entries.push(descriptor.value);
  }
  return entries;
};

const projectOwnership = (value: unknown): ArtifactOwnershipBinding<'azure'> => {
  const source = requirePlainRecord(value, 'Billing output ownership');
  const projected: Record<string, unknown> = {
    provider: readDataProperty(source, 'provider'),
    tenantId: readDataProperty(source, 'tenantId'),
    companyId: readDataProperty(source, 'companyId'),
    cloudAccountId: readDataProperty(source, 'cloudAccountId'),
    accountId: readDataProperty(source, 'accountId'),
  };
  selectOptional(source, projected, 'ownershipEpochRevision');
  return projected as unknown as ArtifactOwnershipBinding<'azure'>;
};

const projectRevision = (value: unknown): ArtifactRevisionVector => {
  const source = requirePlainRecord(value, 'Billing output revision');
  const projected: Record<string, unknown> = {
    sourceRevision: readDataProperty(source, 'sourceRevision'),
    policyRevision: readDataProperty(source, 'policyRevision'),
  };
  selectOptional(source, projected, 'ownershipEpochRevision');
  return projected as unknown as ArtifactRevisionVector;
};

const projectIssue = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing publication issue');
  const projected: Record<string, unknown> = {
    code: readDataProperty(source, 'code'),
    blocking: readDataProperty(source, 'blocking'),
  };
  selectOptional(source, projected, 'dependency');
  return projected;
};

const projectObservedRange = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing observed range');
  const projected: Record<string, unknown> = {
    fromInclusive: readDataProperty(source, 'fromInclusive'),
    throughExclusive: readDataProperty(source, 'throughExclusive'),
    dateBasis: readDataProperty(source, 'dateBasis'),
  };
  selectOptional(source, projected, 'timeZone');
  return projected;
};

const projectDependency = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing publication dependency');
  const projected: Record<string, unknown> = {
    name: readDataProperty(source, 'name'),
    required: readDataProperty(source, 'required'),
    support: readDataProperty(source, 'support'),
    applicability: readDataProperty(source, 'applicability'),
    attempt: readDataProperty(source, 'attempt'),
    coverage: readDataProperty(source, 'coverage'),
    emptyEvidence: readDataProperty(source, 'emptyEvidence'),
    freshness: readDataProperty(source, 'freshness'),
    evidence: readDataProperty(source, 'evidence'),
    publication: readDataProperty(source, 'publication'),
  };
  for (const key of [
    'generationId',
    'digest',
    'sourceRevision',
    'policyRevision',
    'completeThrough',
    'emptyProofRef',
    'reasonCode',
    'acceptedRowCount',
  ]) {
    selectOptional(source, projected, key);
  }
  if (hasOwn(source, 'observedRange')) projected.observedRange = projectObservedRange(readDataProperty(source, 'observedRange', true));
  return projected;
};

const projectClaim = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing publication claim');
  const sectionPaths = readArrayEntries(readDataProperty(source, 'sectionPaths'), 'Billing claim section paths');
  const requiredDependencies = readArrayEntries(readDataProperty(source, 'requiredDependencies'), 'Billing claim dependencies');
  const issues = readArrayEntries(readDataProperty(source, 'issues'), 'Billing claim issues');
  return {
    claimId: readDataProperty(source, 'claimId'),
    sectionPaths: [...sectionPaths],
    requiredDependencies: [...requiredDependencies],
    evidence: readDataProperty(source, 'evidence'),
    publication: readDataProperty(source, 'publication'),
    issues: issues.map(projectIssue),
  };
};

const projectPublicationDecision = (value: unknown): BillingArtifactPublicationDecision => {
  const source = requirePlainRecord(value, 'Billing publication decision');
  const dependencies = readArrayEntries(readDataProperty(source, 'dependencies'), 'Billing publication dependencies');
  const claims = readArrayEntries(readDataProperty(source, 'claims'), 'Billing publication claims');
  const issues = readArrayEntries(readDataProperty(source, 'issues'), 'Billing publication issues');
  return {
    processing: readDataProperty(source, 'processing'),
    evidence: readDataProperty(source, 'evidence'),
    publication: readDataProperty(source, 'publication'),
    dependencies: dependencies.map(projectDependency),
    claims: claims.map(projectClaim),
    issues: issues.map(projectIssue),
  } as unknown as BillingArtifactPublicationDecision;
};

const projectPromotionEvaluation = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing promotion observation evaluation');
  const projected: Record<string, unknown> = {
    comparison: readDataProperty(source, 'comparison'),
    projectedOutcome: readDataProperty(source, 'projectedOutcome'),
  };
  selectOptional(source, projected, 'outputDigestRelation');
  return projected;
};

const projectPromotionObservation = (value: unknown): Record<string, unknown> => {
  const source = requirePlainRecord(value, 'Billing promotion observation');
  const observationDigest = readDataProperty(source, 'observationDigest');
  if (typeof observationDigest !== 'string') throw new TypeError('Billing promotion observation requires an observationDigest string.');
  const projected: Record<string, unknown> = {
    schemaVersion: readDataProperty(source, 'schemaVersion'),
    documentType: readDataProperty(source, 'documentType'),
    authority: readDataProperty(source, 'authority'),
    publicationMode: readDataProperty(source, 'publicationMode'),
    processingState: readDataProperty(source, 'processingState'),
    subscriptionId: readDataProperty(source, 'subscriptionId'),
    generationId: readDataProperty(source, 'generationId'),
    ownership: projectOwnership(readDataProperty(source, 'ownership')),
    revision: projectRevision(readDataProperty(source, 'revision')),
    messageId: readDataProperty(source, 'messageId'),
    correlationId: readDataProperty(source, 'correlationId'),
    inputManifestPath: readDataProperty(source, 'inputManifestPath'),
    inputManifestDigest: readDataProperty(source, 'inputManifestDigest'),
    outputManifestPath: readDataProperty(source, 'outputManifestPath'),
    outputManifestDigest: readDataProperty(source, 'outputManifestDigest'),
    evaluation: projectPromotionEvaluation(readDataProperty(source, 'evaluation')),
    observedAt: readDataProperty(source, 'observedAt'),
  };
  if (
    containsForbiddenArtifactControlData(projected, [
      ...allowedArtifactReferenceField(projected, 'inputManifestPath'),
      ...allowedArtifactReferenceField(projected, 'outputManifestPath'),
    ])
  ) {
    throw new TypeError('Billing promotion observation contains forbidden control data.');
  }
  return projected;
};

const projectBinding = (
  subscriptionId: unknown,
  generationId: unknown,
  ownership: unknown,
  revision: unknown,
  inputManifestDigest: unknown,
  publicationDecision: unknown
): BillingOutputBindingV1 => ({
  kind: 'billing-analysis-output',
  schemaVersion: 1,
  subscriptionId: subscriptionId as string,
  generationId: generationId as string,
  ownership: projectOwnership(ownership),
  revision: projectRevision(revision),
  inputManifestDigest: inputManifestDigest as string,
  publicationDecision: projectPublicationDecision(publicationDecision),
});

/** Selects the exact binding-v1 identity/evidence fields from an output manifest. */
export const projectBillingOutputBindingV1FromManifest = (manifest: BillingAnalyzerOutputManifestV2): BillingOutputBindingV1 => {
  const value = requirePlainRecord(manifest, 'Billing output manifest');
  return projectBinding(
    readDataProperty(value, 'subscriptionId'),
    readDataProperty(value, 'generationId'),
    readDataProperty(value, 'ownership'),
    readDataProperty(value, 'revision'),
    readDataProperty(value, 'inputManifestDigest'),
    readDataProperty(value, 'publicationDecision')
  );
};

/** Selects the exact binding-v1 identity/evidence fields from billing metadata. */
export const projectBillingOutputBindingV1FromMetadata = (metadata: BillingCostAnalysisMetadataV2): BillingOutputBindingV1 => {
  const value = requirePlainRecord(metadata, 'Billing cost metadata');
  return projectBinding(
    readDataProperty(value, 'subscriptionId'),
    readDataProperty(value, 'billingGenerationId'),
    readDataProperty(value, 'ownership'),
    readDataProperty(value, 'revision'),
    readDataProperty(value, 'inputManifestDigest'),
    readDataProperty(value, 'artifactEvidence')
  );
};

const canonicalizeJson = (value: unknown): string => {
  const active = new Set<object>();
  const fragments: string[] = [];
  const pending: Array<
    | { kind: 'value'; value: unknown }
    | { kind: 'fragment'; value: string }
    | { kind: 'leave'; value: object }
  > = [{ kind: 'value', value }];
  let visitedContainerCount = 0;

  while (pending.length > 0) {
    const frame = pending.pop();
    if (frame === undefined) break;
    if (frame.kind === 'fragment') {
      fragments.push(frame.value);
      continue;
    }
    if (frame.kind === 'leave') {
      active.delete(frame.value);
      continue;
    }

    const candidate = frame.value;
    if (candidate === null || typeof candidate === 'boolean') {
      fragments.push(JSON.stringify(candidate));
      continue;
    }
    if (typeof candidate === 'string') {
      if (hasUnpairedSurrogate(candidate)) throw new TypeError('Canonical JSON rejects invalid Unicode surrogate data.');
      fragments.push(JSON.stringify(candidate));
      continue;
    }
    if (typeof candidate === 'number') {
      if (!Number.isFinite(candidate) || Object.is(candidate, -0) || (Number.isInteger(candidate) && !Number.isSafeInteger(candidate))) {
        throw new TypeError('Canonical JSON requires finite, safe, non-negative-zero numbers.');
      }
      fragments.push(JSON.stringify(candidate));
      continue;
    }
    if (typeof candidate !== 'object' || candidate === undefined) throw new TypeError('Canonical JSON rejects non-JSON values.');
    visitedContainerCount += 1;
    if (visitedContainerCount > ARTIFACT_CONTROL_DATA_MAX_VISITED_NODES) {
      throw new TypeError('Canonical JSON exceeds its 100000-container limit.');
    }
    if (active.has(candidate)) throw new TypeError('Canonical JSON rejects cyclic values.');
    active.add(candidate);

    pending.push({ kind: 'leave', value: candidate });
    if (Array.isArray(candidate)) {
      if (Object.getPrototypeOf(candidate) !== Array.prototype) throw new TypeError('Canonical JSON requires plain arrays.');
      const ownKeys = Reflect.ownKeys(candidate);
      if (
        ownKeys.some(key => typeof key === 'symbol') ||
        ownKeys.some(key => typeof key === 'string' && key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))
      ) {
        throw new TypeError('Canonical JSON arrays cannot contain custom properties.');
      }
      const values: unknown[] = [];
      for (let index = 0; index < candidate.length; index += 1) {
        if (!hasOwn(candidate, index)) throw new TypeError('Canonical JSON rejects sparse arrays.');
        const descriptor = Object.getOwnPropertyDescriptor(candidate, String(index));
        if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
          throw new TypeError('Canonical JSON array entries must be enumerable JSON values.');
        }
        values.push(descriptor.value);
      }
      fragments.push('[');
      pending.push({ kind: 'fragment', value: ']' });
      for (let index = values.length - 1; index >= 0; index -= 1) {
        pending.push({ kind: 'value', value: values[index] });
        if (index > 0) pending.push({ kind: 'fragment', value: ',' });
      }
      continue;
    }

    const prototype = Object.getPrototypeOf(candidate);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError('Canonical JSON requires plain objects.');
    if (Object.getOwnPropertySymbols(candidate).length > 0) throw new TypeError('Canonical JSON rejects symbol properties.');
    const entries: Array<{ key: string; value: unknown }> = [];
    for (const key of Object.getOwnPropertyNames(candidate).sort()) {
      if (hasUnpairedSurrogate(key)) throw new TypeError('Canonical JSON rejects invalid Unicode property names.');
      const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
      if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
        throw new TypeError('Canonical JSON object fields must be enumerable JSON values.');
      }
      entries.push({ key, value: descriptor.value });
    }
    fragments.push('{');
    pending.push({ kind: 'fragment', value: '}' });
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      pending.push({ kind: 'value', value: entry.value });
      pending.push({
        kind: 'fragment',
        value: `${index > 0 ? ',' : ''}${JSON.stringify(entry.key)}:`,
      });
    }
  }

  return fragments.join('');
};

const withoutManifestDigest = (manifest: object): Record<string, unknown> => {
  const prototype = Object.getPrototypeOf(manifest);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError('Canonical manifests must be plain objects.');
  const digestDescriptor = Object.getOwnPropertyDescriptor(manifest, 'manifestDigest');
  if (digestDescriptor === undefined || !('value' in digestDescriptor) || typeof digestDescriptor.value !== 'string') {
    throw new TypeError('Canonical manifests require a top-level manifestDigest string.');
  }
  const preimage: Record<string, unknown> = {};
  for (const key of Reflect.ownKeys(manifest)) {
    if (typeof key !== 'string') throw new TypeError('Canonical manifests reject symbol properties.');
    if (key === 'manifestDigest') continue;
    const descriptor = Object.getOwnPropertyDescriptor(manifest, key);
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
      throw new TypeError('Canonical manifest fields must be enumerable JSON values.');
    }
    preimage[key] = descriptor.value;
  }
  return preimage;
};

/** Returns the RFC 8785/JCS-compatible UTF-8 preimage for billing output binding SHA-256 B. */
export const canonicalizeBillingOutputBindingV1 = (binding: BillingOutputBindingV1): string => {
  const value = requirePlainRecord(binding, 'Billing output binding');
  if (readDataProperty(value, 'kind') !== 'billing-analysis-output' || readDataProperty(value, 'schemaVersion') !== 1) {
    throw new TypeError('Billing output binding requires its version-1 domain separator.');
  }
  return canonicalizeJson(
    projectBinding(
      readDataProperty(value, 'subscriptionId'),
      readDataProperty(value, 'generationId'),
      readDataProperty(value, 'ownership'),
      readDataProperty(value, 'revision'),
      readDataProperty(value, 'inputManifestDigest'),
      readDataProperty(value, 'publicationDecision')
    )
  );
};

/** Returns the canonical input-manifest digest preimage, excluding only top-level manifestDigest. */
export const canonicalizeBillingAnalyzerInputManifestV2ForDigest = (manifest: BillingAnalyzerInputManifestV2): string =>
  canonicalizeJson(withoutManifestDigest(manifest));

/** Returns the canonical output-manifest digest preimage, excluding only top-level manifestDigest. */
export const canonicalizeBillingAnalyzerOutputManifestV2ForDigest = (manifest: BillingAnalyzerOutputManifestV2): string =>
  canonicalizeJson(withoutManifestDigest(manifest));

/** Returns the exact promotion-observation digest preimage, excluding observationDigest and additive fields. */
export const canonicalizeBillingAnalysisPromotionObservationV1ForDigest = (observation: BillingAnalysisPromotionObservationV1): string =>
  canonicalizeJson(projectPromotionObservation(observation));

/** Returns the RFC 8785/JCS-compatible canonical JSON string for a validated JSON value. */
export const canonicalizeBillingArtifactJson = (value: unknown): string => canonicalizeJson(value);
