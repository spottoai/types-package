"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_SP_SETUP_DURABLE_STATE_BLOB_ONLY_FIELDS_V1 = void 0;
/**
 * Durable setup fields stored only in the protected blob projection.
 * API and cloud-engine storage adapters must consume this exact list.
 */
exports.AZURE_SP_SETUP_DURABLE_STATE_BLOB_ONLY_FIELDS_V1 = [
    'codeVerifier',
    'nonce',
    'encryptedMicrosoftTokenCache',
    'generatedClientSecretEncrypted',
    'discoveredTenants',
    'selectedSubscriptionIds',
    'subscriptions',
    'managementGroups',
    'permissionPlan',
    'billingExportPlan',
    'billingExportResults',
    'billingExportBackfillMarkers',
    'operationResults',
    'progress',
    'selectedPermissionInstanceKeys',
    'executionRequest',
    'targetCredentialBaselineHash',
    'retryAttemptsByOperation',
    'accountReadiness',
    'subscriptionReadiness',
    'targetedRefreshCheckpoints',
];
//# sourceMappingURL=azureSpSetupDurable.js.map