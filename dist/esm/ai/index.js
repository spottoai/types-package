/** Common AI interfaces shared between frontend and backend */
import { hasExactKeys, isRecord } from '../environment/internal.js';
import { isEnvironmentArtifactKindV1, isEnvironmentPortalRouteV1, isEnvironmentSafeLabelV1, isEnvironmentScopeV1, isEnvironmentSourceGenerationV1, } from '../environment/validation.js';
/** Strictly validates the client-safe environment evidence shape. */
export const isAIEnvironmentEvidenceMatch = (value) => isRecord(value) &&
    hasExactKeys(value, ['safeLabel', 'portalRoute', 'scope', 'artifactKind', 'sourceGeneration']) &&
    isEnvironmentSafeLabelV1(value.safeLabel) &&
    isEnvironmentPortalRouteV1(value.portalRoute) &&
    isEnvironmentScopeV1(value.scope) &&
    isEnvironmentArtifactKindV1(value.artifactKind) &&
    isEnvironmentSourceGenerationV1(value.sourceGeneration);
