"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOURCE_STRATEGY_CONTRACT_LIMITS = void 0;
exports.RESOURCE_STRATEGY_CONTRACT_LIMITS = {
    textLength: 500,
    rules: 64,
    ruleDays: 7,
    resourceTypes: 64,
    metadataItems: 64,
    evidenceReferences: 32,
    draftPeriodKeys: 64,
    grantGroups: 128,
    permissionOperations: 8192,
    listResults: 100,
    dryRunChecks: 7,
    dryRunReasonCodes: 32,
    dryRunDtoBytes: 16384,
    // Stable readiness evidence may remain current for 24 hours. Transient
    // verdicts still publish their shorter dependency expiry (normally 5 min).
    dryRunMaxTtlMs: 24 * 60 * 60000,
    parameterBytes: 32768,
    publicDtoBytes: 262144,
};
//# sourceMappingURL=resourceStrategyContracts.js.map