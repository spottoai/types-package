/** Portable wire contracts only. Applications supply trusted routing, membership and fresh direct reads. */
import { sha256Hex } from '../common/sha256.js';
import { isRecord } from '../common/validationHelpers.js';
/** Product bounds for a complete subject population; overflow withholds the affected assessment, never truncates it. */
export const AZURE_BENEFIT_ASSESSMENT_DEPENDENCY_LIMITS_V1 = Object.freeze({ subjects: 4096, decodedBytes: 1024 * 1024 });
/** Generic safe diagnostics; cannot carry foreign owners, claim paths or provider/storage errors. */
export const isAzureBenefitAssessmentCoverageV1 = (value) => isRecord(value) &&
    (value.status === 'verified'
        ? exact(value, ['status'])
        : value.status === 'pending' &&
            exact(value, ['status', 'reason']) &&
            (value.reason === 'authority-unavailable' || value.reason === 'admission-unverified' || value.reason === 'dependency-limit-exceeded'));
const token = (value) => typeof value === 'string' && value.length <= 256 && /^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(value);
const canonicalToken = (value) => token(value) && value === value.toLowerCase();
const exact = (value, required, optional = []) => isRecord(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => required.includes(key) || optional.includes(key));
export const isAzureBenefitAssessmentRevisionV1 = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
/** App-owned CAS transitions use this only after validating the exact predecessor; overflow never wraps or resets. */
export function nextAzureBenefitAssessmentRevisionV1(revision) {
    if (!isAzureBenefitAssessmentRevisionV1(revision) || revision === Number.MAX_SAFE_INTEGER)
        throw new Error('Assessment revision cannot advance.');
    return revision + 1;
}
export const isAzureBenefitAssessmentOwnerV1 = (value) => exact(value, ['companyId', 'tenantId', 'subscriptionId']) &&
    token(value.companyId) &&
    canonicalToken(value.tenantId) &&
    canonicalToken(value.subscriptionId);
export function canonicalAzureBenefitAssessmentOwnerV1(value) {
    if (!isRecord(value) || typeof value.companyId !== 'string' || typeof value.tenantId !== 'string' || typeof value.subscriptionId !== 'string')
        return undefined;
    const owner = {
        companyId: value.companyId.trim(),
        tenantId: value.tenantId.trim().toLowerCase(),
        subscriptionId: value.subscriptionId.trim().toLowerCase(),
    };
    return isAzureBenefitAssessmentOwnerV1(owner) ? owner : undefined;
}
export const equalAzureBenefitAssessmentOwnerV1 = (left, right) => isAzureBenefitAssessmentOwnerV1(left) &&
    isAzureBenefitAssessmentOwnerV1(right) &&
    left.companyId === right.companyId &&
    left.tenantId === right.tenantId &&
    left.subscriptionId === right.subscriptionId;
export function canonicalAzureBenefitAssessmentBenefitIdV1(value) {
    if (typeof value !== 'string' || value.length > 1024)
        return undefined;
    const id = value.trim().toLowerCase().replace(/\/+$/, '');
    return /^\/providers\/(?:microsoft\.capacity\/reservationorders\/[a-z0-9][a-z0-9-]*\/reservations|microsoft\.billingbenefits\/savingsplanorders\/[a-z0-9][a-z0-9-]*\/savingsplans)\/[a-z0-9][a-z0-9-]*$/.test(id)
        ? id
        : undefined;
}
export const isCanonicalAzureBenefitAssessmentBenefitIdV1 = (value) => typeof value === 'string' && canonicalAzureBenefitAssessmentBenefitIdV1(value) === value;
/** The namespace and UTF-8 hash preimage deliberately match existing schema-1 claims. */
export function buildAzureBenefitAssessmentOwnerKeyV1(benefitId) {
    const canonical = canonicalAzureBenefitAssessmentBenefitIdV1(benefitId);
    if (!canonical)
        throw new Error('Invalid native benefit identity.');
    return `_engine/benefit-assessment-owners/v1/${sha256Hex(canonical)}.json`;
}
/** Accept only a service origin, never credentials, a SAS URL, a private path or a deployment label. */
function canonicalStorageOrigin(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid storage service origin.');
    const match = /^https:\/\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*)(?::443)?\/?$/i.exec(value.trim());
    if (!match || value.length > 300)
        throw new Error('Invalid storage service origin.');
    return `https://${match[1].toLowerCase()}`;
}
/** Call with the origin/container of the actual trusted configured Blob client; no regional fallback or caller labels. */
export function deriveAzureBenefitAssessmentAuthorityIdV1(storageServiceOrigin, container) {
    const origin = canonicalStorageOrigin(storageServiceOrigin);
    if (typeof container !== 'string' || !/^[a-z0-9](?:[a-z0-9]|-(?!-)){1,61}[a-z0-9]$/.test(container))
        throw new Error('Invalid storage container.');
    return `aba1_${sha256Hex(JSON.stringify(['azure-benefit-assessment-authority', 1, origin, container]))}`;
}
/** Registration tables are fixed by the owner-join contract; this identity binds their actual trusted Table service origin. */
export function deriveAzureBenefitAssessmentRegistrationAuthorityIdV1(storageServiceOrigin) {
    return `abra1_${sha256Hex(JSON.stringify(['azure-benefit-assessment-registration-authority', 1, canonicalStorageOrigin(storageServiceOrigin)]))}`;
}
export const isAzureBenefitAssessmentAuthorityIdV1 = (value) => typeof value === 'string' && /^aba1_[a-f0-9]{64}$/.test(value);
export const isAzureBenefitAssessmentRegistrationAuthorityIdV1 = (value) => typeof value === 'string' && /^abra1_[a-f0-9]{64}$/.test(value);
const binding = (value) => isCanonicalAzureBenefitAssessmentBenefitIdV1(value.benefitId) && isAzureBenefitAssessmentAuthorityIdV1(value.authorityId);
export const isAzureBenefitAssessmentAdmissionV1 = (value) => exact(value, ['benefitId', 'authorityId', 'revision']) && binding(value) && isAzureBenefitAssessmentRevisionV1(value.revision);
export const isScopedAzureBenefitAssessmentAdmissionV1 = (value) => exact(value, ['benefitId', 'authorityId', 'revision', 'owner']) &&
    binding(value) &&
    isAzureBenefitAssessmentRevisionV1(value.revision) &&
    isAzureBenefitAssessmentOwnerV1(value.owner);
function isDependency(value, scoped) {
    if (!isRecord(value))
        return false;
    const keys = ['kind', 'benefitId', 'authorityId', ...(scoped ? ['owner'] : []), ...(value.kind === 'admitted' ? ['revision'] : [])];
    return (exact(value, keys) &&
        binding(value) &&
        (!scoped || isAzureBenefitAssessmentOwnerV1(value.owner)) &&
        (value.kind === 'admitted' ? isAzureBenefitAssessmentRevisionV1(value.revision) : value.kind === 'unclaimed-single'));
}
export const isAzureBenefitAssessmentDependencyV1 = (value) => isDependency(value, false);
export const isScopedAzureBenefitAssessmentDependencyV1 = (value) => isDependency(value, true);
function validRetirement(value) {
    return (exact(value, ['operationId', 'decisionPath', 'precedingRevision']) &&
        token(value.operationId) &&
        value.operationId.length <= 128 &&
        value.decisionPath === `_engine/benefit-assessment-retirements/v1/${value.operationId}.json` &&
        isAzureBenefitAssessmentRevisionV1(value.precedingRevision));
}
/** Exact schema-2 private body. Legacy v1 and unknown/corrupt bodies remain unverified. */
export function isAzureBenefitAssessmentAuthorityV2(value) {
    if (!isRecord(value) ||
        value.schemaVersion !== 2 ||
        !binding(value) ||
        !isAzureBenefitAssessmentRevisionV1(value.revision) ||
        !isAzureBenefitAssessmentRegistrationAuthorityIdV1(value.ownerRegistrationAuthorityId))
        return false;
    const base = ['schemaVersion', 'benefitId', 'authorityId', 'revision', 'state', 'ownerRegistrationAuthorityId'];
    if (value.state === 'active') {
        return (exact(value, [...base, 'owner'], ['retirement']) &&
            isAzureBenefitAssessmentOwnerV1(value.owner) &&
            (value.revision === 1
                ? value.retirement === undefined
                : validRetirement(value.retirement) && value.retirement.precedingRevision < value.revision - 1));
    }
    return (value.state === 'retired' &&
        exact(value, [...base, 'lastOwner', 'retirement']) &&
        isAzureBenefitAssessmentOwnerV1(value.lastOwner) &&
        validRetirement(value.retirement) &&
        value.retirement.precedingRevision === value.revision - 1);
}
export function isAzureBenefitAssessmentAuthorityReadV1(value) {
    if (!isRecord(value) || !binding(value))
        return false;
    if (value.status === 'present')
        return (exact(value, ['status', 'benefitId', 'authorityId', 'claim']) &&
            isAzureBenefitAssessmentAuthorityV2(value.claim) &&
            value.claim.benefitId === value.benefitId &&
            value.claim.authorityId === value.authorityId);
    return (value.status === 'absent' || value.status === 'unavailable') && exact(value, ['status', 'benefitId', 'authorityId']);
}
/** Pure comparison only; does not authorize membership, create a claim or turn missing I/O into absence. No private data is returned. */
export function evaluateAzureBenefitAssessmentDependencyV1(dependency, expected, read) {
    if (!isAzureBenefitAssessmentDependencyV1(dependency) ||
        !isRecord(expected) ||
        !isAzureBenefitAssessmentOwnerV1(expected.owner) ||
        !isAzureBenefitAssessmentAuthorityIdV1(expected.authorityId) ||
        !isAzureBenefitAssessmentRegistrationAuthorityIdV1(expected.ownerRegistrationAuthorityId) ||
        dependency.authorityId !== expected.authorityId ||
        !isAzureBenefitAssessmentAuthorityReadV1(read) ||
        read.authorityId !== expected.authorityId ||
        read.benefitId !== dependency.benefitId)
        return 'pending';
    if (dependency.kind === 'unclaimed-single')
        return read.status === 'absent' ? 'unclaimed-single' : 'pending';
    return read.status === 'present' &&
        read.claim.state === 'active' &&
        read.claim.revision === dependency.revision &&
        read.claim.ownerRegistrationAuthorityId === expected.ownerRegistrationAuthorityId &&
        equalAzureBenefitAssessmentOwnerV1(read.claim.owner, expected.owner)
        ? 'admitted'
        : 'pending';
}
/** UTF-8 size of the decoded JSON representation (all wire fields are bounded ASCII). */
function withinDecodedBudget(value) {
    return JSON.stringify(value).length <= AZURE_BENEFIT_ASSESSMENT_DEPENDENCY_LIMITS_V1.decodedBytes;
}
/** Scope is part of a multi-company source identity; initially unclaimed Single subjects may legitimately share a native ID. */
function dependencyKey(subject, scoped) {
    if (!scoped)
        return subject.benefitId;
    const owner = subject.owner;
    return JSON.stringify([subject.benefitId, owner.companyId, owner.tenantId, owner.subscriptionId]);
}
function isDependencies(value, scoped) {
    if (!exact(value, ['schemaVersion', 'subjects']) ||
        value.schemaVersion !== 1 ||
        !Array.isArray(value.subjects) ||
        value.subjects.length > AZURE_BENEFIT_ASSESSMENT_DEPENDENCY_LIMITS_V1.subjects)
        return false;
    let previous = '';
    for (const subject of value.subjects) {
        if (!isDependency(subject, scoped))
            return false;
        const key = dependencyKey(subject, scoped);
        if (key <= previous)
            return false;
        previous = key;
    }
    return withinDecodedBudget(value);
}
export const isAzureBenefitAssessmentDependenciesV1 = (value) => isDependencies(value, false);
export const isScopedAzureBenefitAssessmentDependenciesV1 = (value) => isDependencies(value, true);
function createDependencies(subjects, scoped) {
    if (!Array.isArray(subjects) || subjects.length > AZURE_BENEFIT_ASSESSMENT_DEPENDENCY_LIMITS_V1.subjects)
        throw new Error('Assessment subject count exceeds the complete-list bound.');
    const byId = new Map();
    for (const subject of subjects) {
        if (!isDependency(subject, scoped))
            throw new Error('Invalid assessment subject.');
        const key = dependencyKey(subject, scoped);
        const previous = byId.get(key);
        if (previous && (previous.kind !== subject.kind || previous.authorityId !== subject.authorityId || previous.revision !== subject.revision)) {
            throw new Error('Conflicting assessment subject.');
        }
        // Reconstruct wire fields, independent of caller property order, and avoid retaining mutable caller objects.
        const copy = {
            kind: subject.kind,
            benefitId: subject.benefitId,
            authorityId: subject.authorityId,
            ...(subject.kind === 'admitted' ? { revision: subject.revision } : {}),
            ...(scoped
                ? {
                    owner: {
                        companyId: subject.owner.companyId,
                        tenantId: subject.owner.tenantId,
                        subscriptionId: subject.owner.subscriptionId,
                    },
                }
                : {}),
        };
        byId.set(key, copy);
    }
    const envelope = {
        schemaVersion: 1,
        subjects: [...byId.values()].sort((left, right) => dependencyKey(left, scoped) < dependencyKey(right, scoped) ? -1 : dependencyKey(left, scoped) > dependencyKey(right, scoped) ? 1 : 0),
    };
    if (!withinDecodedBudget(envelope))
        throw new Error('Assessment subjects exceed the decoded complete-list bound.');
    return envelope;
}
export const createAzureBenefitAssessmentDependenciesV1 = (subjects) => createDependencies(subjects, false);
export const createScopedAzureBenefitAssessmentDependenciesV1 = (subjects) => createDependencies(subjects, true);
/** Scoped derivatives bind both the recorded source owner and the app's independently validated expected context. */
export function evaluateScopedAzureBenefitAssessmentDependencyV1(dependency, expected, read) {
    if (!isScopedAzureBenefitAssessmentDependencyV1(dependency) ||
        !isRecord(expected) ||
        !equalAzureBenefitAssessmentOwnerV1(dependency.owner, expected.owner))
        return 'pending';
    const { owner: _owner, ...subject } = dependency;
    return evaluateAzureBenefitAssessmentDependencyV1(subject, expected, read);
}
