"use strict";
/** Common AI interfaces shared between frontend and backend */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAIEnvironmentEvidenceMatch = void 0;
const internal_1 = require("../environment/internal");
const validation_1 = require("../environment/validation");
/** Strictly validates the client-safe environment evidence shape. */
const isAIEnvironmentEvidenceMatch = (value) => (0, internal_1.isRecord)(value) &&
    (0, internal_1.hasExactKeys)(value, ['safeLabel', 'portalRoute', 'scope', 'artifactKind', 'sourceGeneration']) &&
    (0, validation_1.isEnvironmentSafeLabelV1)(value.safeLabel) &&
    (0, validation_1.isEnvironmentPortalRouteV1)(value.portalRoute) &&
    (0, validation_1.isEnvironmentScopeV1)(value.scope) &&
    (0, validation_1.isEnvironmentArtifactKindV1)(value.artifactKind) &&
    (0, validation_1.isEnvironmentSourceGenerationV1)(value.sourceGeneration);
exports.isAIEnvironmentEvidenceMatch = isAIEnvironmentEvidenceMatch;
//# sourceMappingURL=index.js.map