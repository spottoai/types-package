"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeBillingArtifactJson = exports.canonicalizeBillingAnalysisPromotionObservationV1ForDigest = exports.canonicalizeBillingAnalyzerOutputManifestV2ForDigest = exports.canonicalizeBillingAnalyzerInputManifestV2ForDigest = exports.canonicalizeBillingOutputBindingV1 = exports.projectBillingOutputBindingV1FromMetadata = exports.projectBillingOutputBindingV1FromManifest = void 0;
const artifactControlData_js_1 = require("../common/artifactControlData.js");
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const requirePlainRecord = (value, name) => {
    if (!isRecord(value))
        throw new TypeError(`${name} must be an object.`);
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
        throw new TypeError(`${name} must be a plain JSON object.`);
    if (Object.getOwnPropertySymbols(value).length > 0)
        throw new TypeError(`${name} cannot contain symbol properties.`);
    return value;
};
const hasUnpairedSurrogate = (value) => {
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code >= 0xd800 && code <= 0xdbff) {
            const next = value.charCodeAt(index + 1);
            if (!(next >= 0xdc00 && next <= 0xdfff))
                return true;
            index += 1;
        }
        else if (code >= 0xdc00 && code <= 0xdfff) {
            return true;
        }
    }
    return false;
};
const readDataProperty = (value, key, optional = false) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) {
        if (optional)
            return undefined;
        throw new TypeError(`Missing canonical billing field: ${key}`);
    }
    if (!('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
        throw new TypeError(`Canonical billing field must be an enumerable JSON value: ${key}`);
    }
    return descriptor.value;
};
const selectOptional = (source, target, key) => {
    if (hasOwn(source, key))
        target[key] = readDataProperty(source, key, true);
};
const readArrayEntries = (value, name) => {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
        throw new TypeError(`${name} must be a plain JSON array.`);
    }
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some(key => typeof key === 'symbol') ||
        ownKeys.some(key => typeof key === 'string' && key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))) {
        throw new TypeError(`${name} cannot contain custom properties.`);
    }
    const entries = [];
    for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
            throw new TypeError(`${name} entries must be enumerable JSON values.`);
        }
        entries.push(descriptor.value);
    }
    return entries;
};
const projectOwnership = (value) => {
    const source = requirePlainRecord(value, 'Billing output ownership');
    const projected = {
        provider: readDataProperty(source, 'provider'),
        tenantId: readDataProperty(source, 'tenantId'),
        companyId: readDataProperty(source, 'companyId'),
        cloudAccountId: readDataProperty(source, 'cloudAccountId'),
        accountId: readDataProperty(source, 'accountId'),
    };
    selectOptional(source, projected, 'ownershipEpochRevision');
    return projected;
};
const projectRevision = (value) => {
    const source = requirePlainRecord(value, 'Billing output revision');
    const projected = {
        sourceRevision: readDataProperty(source, 'sourceRevision'),
        policyRevision: readDataProperty(source, 'policyRevision'),
    };
    selectOptional(source, projected, 'ownershipEpochRevision');
    return projected;
};
const projectIssue = (value) => {
    const source = requirePlainRecord(value, 'Billing publication issue');
    const projected = {
        code: readDataProperty(source, 'code'),
        blocking: readDataProperty(source, 'blocking'),
    };
    selectOptional(source, projected, 'dependency');
    return projected;
};
const projectObservedRange = (value) => {
    const source = requirePlainRecord(value, 'Billing observed range');
    const projected = {
        fromInclusive: readDataProperty(source, 'fromInclusive'),
        throughExclusive: readDataProperty(source, 'throughExclusive'),
        dateBasis: readDataProperty(source, 'dateBasis'),
    };
    selectOptional(source, projected, 'timeZone');
    return projected;
};
const projectDependency = (value) => {
    const source = requirePlainRecord(value, 'Billing publication dependency');
    const projected = {
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
    if (hasOwn(source, 'observedRange'))
        projected.observedRange = projectObservedRange(readDataProperty(source, 'observedRange', true));
    return projected;
};
const projectClaim = (value) => {
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
const projectPublicationDecision = (value) => {
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
    };
};
const projectPromotionEvaluation = (value) => {
    const source = requirePlainRecord(value, 'Billing promotion observation evaluation');
    const projected = {
        comparison: readDataProperty(source, 'comparison'),
        projectedOutcome: readDataProperty(source, 'projectedOutcome'),
    };
    selectOptional(source, projected, 'outputDigestRelation');
    return projected;
};
const projectPromotionObservation = (value) => {
    const source = requirePlainRecord(value, 'Billing promotion observation');
    const observationDigest = readDataProperty(source, 'observationDigest');
    if (typeof observationDigest !== 'string')
        throw new TypeError('Billing promotion observation requires an observationDigest string.');
    const projected = {
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
    if ((0, artifactControlData_js_1.containsForbiddenArtifactControlData)(projected, [
        ...(0, artifactControlData_js_1.allowedArtifactReferenceField)(projected, 'inputManifestPath'),
        ...(0, artifactControlData_js_1.allowedArtifactReferenceField)(projected, 'outputManifestPath'),
    ])) {
        throw new TypeError('Billing promotion observation contains forbidden control data.');
    }
    return projected;
};
const projectBinding = (subscriptionId, generationId, ownership, revision, inputManifestDigest, publicationDecision) => ({
    kind: 'billing-analysis-output',
    schemaVersion: 1,
    subscriptionId: subscriptionId,
    generationId: generationId,
    ownership: projectOwnership(ownership),
    revision: projectRevision(revision),
    inputManifestDigest: inputManifestDigest,
    publicationDecision: projectPublicationDecision(publicationDecision),
});
/** Selects the exact binding-v1 identity/evidence fields from an output manifest. */
const projectBillingOutputBindingV1FromManifest = (manifest) => {
    const value = requirePlainRecord(manifest, 'Billing output manifest');
    return projectBinding(readDataProperty(value, 'subscriptionId'), readDataProperty(value, 'generationId'), readDataProperty(value, 'ownership'), readDataProperty(value, 'revision'), readDataProperty(value, 'inputManifestDigest'), readDataProperty(value, 'publicationDecision'));
};
exports.projectBillingOutputBindingV1FromManifest = projectBillingOutputBindingV1FromManifest;
/** Selects the exact binding-v1 identity/evidence fields from billing metadata. */
const projectBillingOutputBindingV1FromMetadata = (metadata) => {
    const value = requirePlainRecord(metadata, 'Billing cost metadata');
    return projectBinding(readDataProperty(value, 'subscriptionId'), readDataProperty(value, 'billingGenerationId'), readDataProperty(value, 'ownership'), readDataProperty(value, 'revision'), readDataProperty(value, 'inputManifestDigest'), readDataProperty(value, 'artifactEvidence'));
};
exports.projectBillingOutputBindingV1FromMetadata = projectBillingOutputBindingV1FromMetadata;
const canonicalizeJson = (value) => {
    const active = new Set();
    const serialize = (candidate) => {
        if (candidate === null || typeof candidate === 'boolean')
            return JSON.stringify(candidate);
        if (typeof candidate === 'string') {
            if (hasUnpairedSurrogate(candidate))
                throw new TypeError('Canonical JSON rejects invalid Unicode surrogate data.');
            return JSON.stringify(candidate);
        }
        if (typeof candidate === 'number') {
            if (!Number.isFinite(candidate) || Object.is(candidate, -0) || (Number.isInteger(candidate) && !Number.isSafeInteger(candidate))) {
                throw new TypeError('Canonical JSON requires finite, safe, non-negative-zero numbers.');
            }
            return JSON.stringify(candidate);
        }
        if (typeof candidate !== 'object' || candidate === undefined)
            throw new TypeError('Canonical JSON rejects non-JSON values.');
        if (active.has(candidate))
            throw new TypeError('Canonical JSON rejects cyclic values.');
        active.add(candidate);
        try {
            if (Array.isArray(candidate)) {
                if (Object.getPrototypeOf(candidate) !== Array.prototype)
                    throw new TypeError('Canonical JSON requires plain arrays.');
                const ownKeys = Reflect.ownKeys(candidate);
                if (ownKeys.some(key => typeof key === 'symbol') ||
                    ownKeys.some(key => typeof key === 'string' && key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))) {
                    throw new TypeError('Canonical JSON arrays cannot contain custom properties.');
                }
                const values = [];
                for (let index = 0; index < candidate.length; index += 1) {
                    if (!hasOwn(candidate, index))
                        throw new TypeError('Canonical JSON rejects sparse arrays.');
                    const descriptor = Object.getOwnPropertyDescriptor(candidate, String(index));
                    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
                        throw new TypeError('Canonical JSON array entries must be enumerable JSON values.');
                    }
                    values.push(serialize(descriptor.value));
                }
                return `[${values.join(',')}]`;
            }
            const prototype = Object.getPrototypeOf(candidate);
            if (prototype !== Object.prototype && prototype !== null)
                throw new TypeError('Canonical JSON requires plain objects.');
            if (Object.getOwnPropertySymbols(candidate).length > 0)
                throw new TypeError('Canonical JSON rejects symbol properties.');
            const entries = [];
            for (const key of Object.getOwnPropertyNames(candidate).sort()) {
                if (hasUnpairedSurrogate(key))
                    throw new TypeError('Canonical JSON rejects invalid Unicode property names.');
                const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
                if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
                    throw new TypeError('Canonical JSON object fields must be enumerable JSON values.');
                }
                entries.push(`${JSON.stringify(key)}:${serialize(descriptor.value)}`);
            }
            return `{${entries.join(',')}}`;
        }
        finally {
            active.delete(candidate);
        }
    };
    return serialize(value);
};
const withoutManifestDigest = (manifest) => {
    const prototype = Object.getPrototypeOf(manifest);
    if (prototype !== Object.prototype && prototype !== null)
        throw new TypeError('Canonical manifests must be plain objects.');
    const digestDescriptor = Object.getOwnPropertyDescriptor(manifest, 'manifestDigest');
    if (digestDescriptor === undefined || !('value' in digestDescriptor) || typeof digestDescriptor.value !== 'string') {
        throw new TypeError('Canonical manifests require a top-level manifestDigest string.');
    }
    const preimage = {};
    for (const key of Reflect.ownKeys(manifest)) {
        if (typeof key !== 'string')
            throw new TypeError('Canonical manifests reject symbol properties.');
        if (key === 'manifestDigest')
            continue;
        const descriptor = Object.getOwnPropertyDescriptor(manifest, key);
        if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable || descriptor.value === undefined) {
            throw new TypeError('Canonical manifest fields must be enumerable JSON values.');
        }
        preimage[key] = descriptor.value;
    }
    return preimage;
};
/** Returns the RFC 8785/JCS-compatible UTF-8 preimage for billing output binding SHA-256 B. */
const canonicalizeBillingOutputBindingV1 = (binding) => {
    const value = requirePlainRecord(binding, 'Billing output binding');
    if (readDataProperty(value, 'kind') !== 'billing-analysis-output' || readDataProperty(value, 'schemaVersion') !== 1) {
        throw new TypeError('Billing output binding requires its version-1 domain separator.');
    }
    return canonicalizeJson(projectBinding(readDataProperty(value, 'subscriptionId'), readDataProperty(value, 'generationId'), readDataProperty(value, 'ownership'), readDataProperty(value, 'revision'), readDataProperty(value, 'inputManifestDigest'), readDataProperty(value, 'publicationDecision')));
};
exports.canonicalizeBillingOutputBindingV1 = canonicalizeBillingOutputBindingV1;
/** Returns the canonical input-manifest digest preimage, excluding only top-level manifestDigest. */
const canonicalizeBillingAnalyzerInputManifestV2ForDigest = (manifest) => canonicalizeJson(withoutManifestDigest(manifest));
exports.canonicalizeBillingAnalyzerInputManifestV2ForDigest = canonicalizeBillingAnalyzerInputManifestV2ForDigest;
/** Returns the canonical output-manifest digest preimage, excluding only top-level manifestDigest. */
const canonicalizeBillingAnalyzerOutputManifestV2ForDigest = (manifest) => canonicalizeJson(withoutManifestDigest(manifest));
exports.canonicalizeBillingAnalyzerOutputManifestV2ForDigest = canonicalizeBillingAnalyzerOutputManifestV2ForDigest;
/** Returns the exact promotion-observation digest preimage, excluding observationDigest and additive fields. */
const canonicalizeBillingAnalysisPromotionObservationV1ForDigest = (observation) => canonicalizeJson(projectPromotionObservation(observation));
exports.canonicalizeBillingAnalysisPromotionObservationV1ForDigest = canonicalizeBillingAnalysisPromotionObservationV1ForDigest;
/** Returns the RFC 8785/JCS-compatible canonical JSON string for a validated JSON value. */
const canonicalizeBillingArtifactJson = (value) => canonicalizeJson(value);
exports.canonicalizeBillingArtifactJson = canonicalizeBillingArtifactJson;
//# sourceMappingURL=billingArtifactCanonicalization.js.map