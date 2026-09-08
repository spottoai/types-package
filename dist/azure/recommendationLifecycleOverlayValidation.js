"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecommendationLifecycleOverlayV2 = exports.createRecommendationLifecycleOverlayIdV2 = exports.canonicalizeRecommendationLifecycleOverlayIdentityV2 = void 0;
const sha256_1 = require("../common/sha256");
const recommendations_1 = require("./recommendations");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
const STATUSES = new Set(['Active', 'Prioritized', 'Dismissed', 'Archived', 'Implementing', 'Implemented', 'Failed']);
const MAX_STATES = 50000;
const MAX_REASONS = 64;
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_REASONS &&
    value.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) &&
    new Set(value).size === value.length;
const isLifecycleState = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['recommendationId', 'scope', 'status', 'updatedAt', 'revision'], ['resourceId', 'statusStartAt', 'statusEndAt']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.recommendationId) ||
        (value.scope !== 'resource' && value.scope !== 'providerScope') ||
        (value.scope === 'resource') !== (value.resourceId !== undefined) ||
        (value.resourceId !== undefined && !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.resourceId)) ||
        typeof value.status !== 'string' ||
        !STATUSES.has(value.status) ||
        (value.statusStartAt !== undefined && !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.statusStartAt)) ||
        (value.statusEndAt !== undefined && !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.statusEndAt)) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.updatedAt) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.revision))
        return false;
    if (value.statusStartAt !== undefined && value.statusEndAt !== undefined && value.statusStartAt >= value.statusEndAt)
        return false;
    return value.statusStartAt === undefined || value.updatedAt >= value.statusStartAt;
};
const canonicalizeState = (state) => ({ ...state });
const canonicalizeRecommendationLifecycleOverlayIdentityV2 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)({
    ...value,
    ...(value.status === 'complete' ? {} : { reasonCodes: [...value.reasonCodes].sort() }),
    states: [...value.states]
        .sort((left, right) => left.recommendationId.localeCompare(right.recommendationId) ||
        (left.resourceId ?? '').localeCompare(right.resourceId ?? ''))
        .map(canonicalizeState),
}));
exports.canonicalizeRecommendationLifecycleOverlayIdentityV2 = canonicalizeRecommendationLifecycleOverlayIdentityV2;
const createRecommendationLifecycleOverlayIdV2 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeRecommendationLifecycleOverlayIdentityV2)(value))}`;
exports.createRecommendationLifecycleOverlayIdV2 = createRecommendationLifecycleOverlayIdV2;
const isRecommendationLifecycleOverlayV2 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
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
        value.schemaVersion !== recommendations_1.RECOMMENDATION_LIFECYCLE_OVERLAY_SCHEMA_VERSION_V2 ||
        value.contractVersion !== recommendations_1.RECOMMENDATION_LIFECYCLE_OVERLAY_CONTRACT_VERSION_V2 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.overlayId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.companyId) ||
        value.provider !== 'azure' ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.providerScopeId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.revision) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.generatedAt) ||
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
    return overlay.overlayId === (0, exports.createRecommendationLifecycleOverlayIdV2)(identity);
};
exports.isRecommendationLifecycleOverlayV2 = isRecommendationLifecycleOverlayV2;
//# sourceMappingURL=recommendationLifecycleOverlayValidation.js.map