import { sha256Utf8 } from '../common/sha256.js';
import { RECOMMENDATION_LIFECYCLE_OVERLAY_CONTRACT_VERSION_V2, RECOMMENDATION_LIFECYCLE_OVERLAY_SCHEMA_VERSION_V2, } from './recommendations.js';
import { canonicalizeFinancialSavingsJsonValue, hasExactFinancialSavingsFields, isFinancialSavingsHash, isFinancialSavingsIdentity, isFinancialSavingsIsoInstant, isFinancialSavingsRecord, } from './financialSavingsAuthorityValidationPrimitives.js';
const STATUSES = new Set(['Active', 'Prioritized', 'Dismissed', 'Archived', 'Implementing', 'Implemented', 'Failed']);
const MAX_STATES = 50000;
const MAX_REASONS = 64;
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_REASONS &&
    value.every(isFinancialSavingsIdentity) &&
    new Set(value).size === value.length;
const isLifecycleState = (value) => {
    if (!isFinancialSavingsRecord(value) ||
        !hasExactFinancialSavingsFields(value, ['recommendationId', 'scope', 'status', 'updatedAt', 'revision'], ['resourceId', 'statusStartAt', 'statusEndAt']) ||
        !isFinancialSavingsIdentity(value.recommendationId) ||
        (value.scope !== 'resource' && value.scope !== 'providerScope') ||
        (value.scope === 'resource') !== (value.resourceId !== undefined) ||
        (value.resourceId !== undefined && !isFinancialSavingsIdentity(value.resourceId)) ||
        typeof value.status !== 'string' ||
        !STATUSES.has(value.status) ||
        (value.statusStartAt !== undefined && !isFinancialSavingsIsoInstant(value.statusStartAt)) ||
        (value.statusEndAt !== undefined && !isFinancialSavingsIsoInstant(value.statusEndAt)) ||
        !isFinancialSavingsIsoInstant(value.updatedAt) ||
        !isFinancialSavingsIdentity(value.revision))
        return false;
    if (value.statusStartAt !== undefined && value.statusEndAt !== undefined && value.statusStartAt >= value.statusEndAt)
        return false;
    return value.statusStartAt === undefined || value.updatedAt >= value.statusStartAt;
};
const canonicalizeState = (state) => ({ ...state });
export const canonicalizeRecommendationLifecycleOverlayIdentityV2 = (value) => JSON.stringify(canonicalizeFinancialSavingsJsonValue({
    ...value,
    ...(value.status === 'complete' ? {} : { reasonCodes: [...value.reasonCodes].sort() }),
    states: [...value.states]
        .sort((left, right) => left.recommendationId.localeCompare(right.recommendationId) ||
        (left.resourceId ?? '').localeCompare(right.resourceId ?? ''))
        .map(canonicalizeState),
}));
export const createRecommendationLifecycleOverlayIdV2 = (value) => `sha256:${sha256Utf8(canonicalizeRecommendationLifecycleOverlayIdentityV2(value))}`;
export const isRecommendationLifecycleOverlayV2 = (value) => {
    if (!isFinancialSavingsRecord(value) ||
        !hasExactFinancialSavingsFields(value, [
            'schemaVersion',
            'contractVersion',
            'overlayId',
            'companyId',
            'provider',
            'providerScopeId',
            'revision',
            'generatedAt',
            'status',
            'states',
        ], value.status === 'complete' ? [] : ['reasonCodes']) ||
        value.schemaVersion !== RECOMMENDATION_LIFECYCLE_OVERLAY_SCHEMA_VERSION_V2 ||
        value.contractVersion !== RECOMMENDATION_LIFECYCLE_OVERLAY_CONTRACT_VERSION_V2 ||
        !isFinancialSavingsHash(value.overlayId) ||
        !isFinancialSavingsIdentity(value.companyId) ||
        value.provider !== 'azure' ||
        !isFinancialSavingsIdentity(value.providerScopeId) ||
        !isFinancialSavingsIdentity(value.revision) ||
        !isFinancialSavingsIsoInstant(value.generatedAt) ||
        (value.status !== 'complete' && value.status !== 'partial' && value.status !== 'unavailable') ||
        !Array.isArray(value.states) ||
        value.states.length > MAX_STATES ||
        !value.states.every(isLifecycleState) ||
        (value.status === 'unavailable' && value.states.length !== 0) ||
        (value.status !== 'complete' && !isReasonCodes(value.reasonCodes)))
        return false;
    const stateKeys = value.states.map(state => `${state.scope}\u0000${state.resourceId?.toLowerCase() ?? ''}\u0000${state.recommendationId}`);
    if (new Set(stateKeys).size !== stateKeys.length)
        return false;
    const overlay = value;
    const { overlayId: _overlayId, ...identity } = overlay;
    return overlay.overlayId === createRecommendationLifecycleOverlayIdV2(identity);
};
