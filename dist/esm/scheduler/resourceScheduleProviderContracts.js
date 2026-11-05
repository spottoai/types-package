/**
 * Cross-engine resource-schedule execution. The scheduling kernel keeps all
 * schedule state and sends one request per readiness check or transition to the
 * provider engine; the provider engine replies with exactly one result.
 * AWS: request on `aws-request` (SessionId = AWS account ID), result on
 * `azure-request` (no session).
 */
export const RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS = {
    messageBytes: 16384,
    reasonCodes: 32,
    missingActions: 64,
};
export const RESOURCE_SCHEDULE_PROVIDERS = ['aws'];
