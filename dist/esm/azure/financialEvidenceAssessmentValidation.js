import { sha256Utf8 } from '../common/sha256.js';
import { FINANCIAL_EVIDENCE_ASSESSMENT_CONTRACT_VERSION_V1, } from './financialScopeEvidence.js';
import { canonicalizeValidatedFinancialEvidenceAssessmentIdentityV1 } from './financialScopeBaselineIdentity.js';
const MAX_EVIDENCE_REFERENCES = 64;
const MAX_IDENTITY_LENGTH = 256;
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const EVIDENCE_ROLES = new Set([
    'billing',
    'billing-currency-declaration',
    'estimate',
    'inventory-configuration',
    'retail-rate',
    'commitment-quote',
    'fx-conversion',
    'eligibility-rule',
    'recommendation-scenario-set',
    'recommendation-lifecycle',
]);
const SCOPE_KINDS = new Set([
    'canonical-resource-owner',
    'composite-resource',
    'commitment-instrument',
    'subscription-residual',
    'subscription-aggregate',
    'portfolio-currency-group',
]);
const ASSESSMENT_REASONS = new Set([
    'evidence-accepted',
    'evidence-not-produced',
    'evidence-not-matched',
    'evidence-incomplete',
    'evidence-stale',
    'reconciliation-failed',
    'currency-unresolved',
    'currency-conflicting',
    'ownership-unresolved',
    'unsupported-scope',
]);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isBoundedIdentity = (value) => typeof value === 'string' && value.length > 0 && value.length <= MAX_IDENTITY_LENGTH && value.trim() === value;
const isIsoInstant = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const isCountSummary = (value) => isRecord(value) &&
    hasExactFields(value, ['requestedRoleCount', 'producedRoleCount', 'matchedRoleCount']) &&
    [value.requestedRoleCount, value.producedRoleCount, value.matchedRoleCount].every(count => Number.isSafeInteger(count) && Number(count) >= 0) &&
    Number(value.matchedRoleCount) <= Number(value.producedRoleCount) &&
    Number(value.producedRoleCount) <= Number(value.requestedRoleCount);
const isAssessmentIdentity = (value) => {
    if (!isRecord(value) ||
        !hasExactFields(value, [
            'schemaVersion',
            'contractVersion',
            'policyVersion',
            'evaluatedAt',
            'request',
            'roleAssessments',
            'completeness',
            'reconciliation',
            'freshness',
            'result',
            'primaryReason',
            'supportingReasons',
            'summary',
        ], ['evidenceBundleId']) ||
        value.schemaVersion !== 1 ||
        value.contractVersion !== FINANCIAL_EVIDENCE_ASSESSMENT_CONTRACT_VERSION_V1 ||
        !isBoundedIdentity(value.policyVersion) ||
        !isIsoInstant(value.evaluatedAt) ||
        !isRecord(value.request) ||
        !hasExactFields(value.request, ['provider', 'providerAccountRefs', 'scopeKind', 'scopeId', 'requestedEvidenceRoles']) ||
        value.request.provider !== 'azure' ||
        !Array.isArray(value.request.providerAccountRefs) ||
        value.request.providerAccountRefs.length === 0 ||
        value.request.providerAccountRefs.length > MAX_EVIDENCE_REFERENCES ||
        !value.request.providerAccountRefs.every(isBoundedIdentity) ||
        new Set(value.request.providerAccountRefs).size !== value.request.providerAccountRefs.length ||
        typeof value.request.scopeKind !== 'string' ||
        !SCOPE_KINDS.has(value.request.scopeKind) ||
        !isBoundedIdentity(value.request.scopeId) ||
        !Array.isArray(value.request.requestedEvidenceRoles) ||
        value.request.requestedEvidenceRoles.length > EVIDENCE_ROLES.size ||
        !value.request.requestedEvidenceRoles.every(role => typeof role === 'string' && EVIDENCE_ROLES.has(role)) ||
        new Set(value.request.requestedEvidenceRoles).size !== value.request.requestedEvidenceRoles.length ||
        !Array.isArray(value.roleAssessments) ||
        value.roleAssessments.length > EVIDENCE_ROLES.size) {
        return false;
    }
    const requestedRoles = new Set(value.request.requestedEvidenceRoles);
    if (requestedRoles.size === 0 && !new Set(['subscription-aggregate', 'portfolio-currency-group']).has(value.request.scopeKind))
        return false;
    for (const item of value.roleAssessments) {
        if (!isRecord(item) ||
            !hasExactFields(item, ['role', 'support', 'requestState', 'productionState', 'matchState'], ['evidenceRefId']) ||
            typeof item.role !== 'string' ||
            !EVIDENCE_ROLES.has(item.role) ||
            !new Set(['supported', 'unsupported', 'unknown']).has(String(item.support)) ||
            !new Set(['requested', 'not-requested']).has(String(item.requestState)) ||
            !new Set(['produced', 'not-produced']).has(String(item.productionState)) ||
            !new Set(['matched', 'not-matched', 'not-applicable']).has(String(item.matchState)) ||
            (item.evidenceRefId !== undefined && (typeof item.evidenceRefId !== 'string' || !SHA256_ID.test(item.evidenceRefId))) ||
            (item.productionState === 'produced') !== (item.evidenceRefId !== undefined) ||
            (item.matchState === 'matched' && item.productionState !== 'produced') ||
            (item.requestState === 'requested') !== requestedRoles.has(item.role)) {
            return false;
        }
    }
    if (new Set(value.roleAssessments.map(item => item.role)).size !== value.roleAssessments.length)
        return false;
    if (!new Set(['complete', 'partial', 'unavailable', 'not-applicable']).has(String(value.completeness)) ||
        !new Set(['reconciled', 'failed', 'not-applicable']).has(String(value.reconciliation)) ||
        !new Set(['current', 'stale', 'unknown', 'not-applicable']).has(String(value.freshness)) ||
        !new Set(['available', 'unavailable']).has(String(value.result)) ||
        typeof value.primaryReason !== 'string' ||
        !ASSESSMENT_REASONS.has(value.primaryReason) ||
        !Array.isArray(value.supportingReasons) ||
        value.supportingReasons.length > 16 ||
        !value.supportingReasons.every(reason => typeof reason === 'string' && ASSESSMENT_REASONS.has(reason)) ||
        new Set(value.supportingReasons).size !== value.supportingReasons.length ||
        (value.evidenceBundleId !== undefined && (typeof value.evidenceBundleId !== 'string' || !SHA256_ID.test(value.evidenceBundleId))) ||
        !isCountSummary(value.summary)) {
        return false;
    }
    const producedCount = value.roleAssessments.filter(item => item.productionState === 'produced').length;
    const matchedCount = value.roleAssessments.filter(item => item.matchState === 'matched').length;
    const available = value.result === 'available';
    return (value.summary.requestedRoleCount === requestedRoles.size &&
        value.summary.producedRoleCount === producedCount &&
        value.summary.matchedRoleCount === matchedCount &&
        (!available ||
            (value.completeness === 'complete' &&
                value.reconciliation === 'reconciled' &&
                value.freshness === 'current' &&
                value.primaryReason === 'evidence-accepted' &&
                value.evidenceBundleId !== undefined)));
};
export const canonicalizeFinancialEvidenceAssessmentIdentityV1 = (value) => {
    if (!isAssessmentIdentity(value))
        throw new TypeError('Invalid FinancialEvidenceAssessmentIdentityPreimageV1.');
    return canonicalizeValidatedFinancialEvidenceAssessmentIdentityV1(value);
};
export const isFinancialEvidenceAssessmentV1 = (value) => {
    if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, 'assessmentId'))
        return false;
    const { assessmentId, ...identity } = value;
    return (typeof assessmentId === 'string' &&
        SHA256_ID.test(assessmentId) &&
        isAssessmentIdentity(identity) &&
        assessmentId === `sha256:${sha256Utf8(canonicalizeValidatedFinancialEvidenceAssessmentIdentityV1(identity))}`);
};
