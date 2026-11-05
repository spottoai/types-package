"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOURCE_SCHEDULE_PROVIDERS = exports.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS = void 0;
/**
 * Cross-engine resource-schedule execution. The scheduling kernel keeps all
 * schedule state and sends one request per readiness check or transition to the
 * provider engine; the provider engine replies with exactly one result.
 * AWS: request on `aws-request` (SessionId = AWS account ID), result on
 * `azure-request` (no session).
 */
exports.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS = {
    messageBytes: 16384,
    reasonCodes: 32,
    missingActions: 64,
};
exports.RESOURCE_SCHEDULE_PROVIDERS = ['aws'];
//# sourceMappingURL=resourceScheduleProviderContracts.js.map