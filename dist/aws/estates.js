"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAwsSyncFeatureId = exports.AWS_SYNC_FEATURE_IDS = exports.AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS = exports.AWS_ESTATE_ACCOUNT_PURPOSES = exports.AWS_ESTATE_ROLE_DEPLOYMENT_MODES = exports.AWS_ESTATE_ACCOUNT_SOURCES = exports.AWS_ESTATE_KINDS = exports.AWS_ESTATES_MANIFEST_PROVIDER = exports.AWS_ESTATES_MANIFEST_SCHEMA_VERSION = void 0;
const requests_1 = require("./requests");
/** Schema version for the API-owned AWS company estate manifest. */
exports.AWS_ESTATES_MANIFEST_SCHEMA_VERSION = 1;
/** Public provider discriminator used by the AWS estate manifest API. */
exports.AWS_ESTATES_MANIFEST_PROVIDER = 'AWS';
exports.AWS_ESTATE_KINDS = ['standalone', 'organization'];
exports.AWS_ESTATE_ACCOUNT_SOURCES = ['manual'];
exports.AWS_ESTATE_ROLE_DEPLOYMENT_MODES = ['customer-managed'];
exports.AWS_ESTATE_ACCOUNT_PURPOSES = [
    'resource-discovery',
    'organization-discovery',
    'commitments-planning',
    'billing-definition',
    'billing-storage',
];
/**
 * Credential-shaped fields that manifest API boundaries must reject
 * recursively before persisting untyped JSON.
 */
exports.AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS = [
    ...requests_1.AWS_FORBIDDEN_CREDENTIAL_FIELDS,
    'externalId',
    'accessToken',
    'connectionString',
    'sasToken',
    'storageCredential',
];
/**
 * Optional sync features an AWS account can opt out of, in the shared sync
 * feature order. An ID is listed only once the AWS engine both skips its
 * collection and suppresses its Portal output; `billing` is mandatory on AWS.
 */
exports.AWS_SYNC_FEATURE_IDS = ['activityMonitoring', 'governance', 'perimeterInsights'];
const AWS_SYNC_FEATURE_ID_SET = new Set(exports.AWS_SYNC_FEATURE_IDS);
const isAwsSyncFeatureId = (value) => AWS_SYNC_FEATURE_ID_SET.has(value);
exports.isAwsSyncFeatureId = isAwsSyncFeatureId;
//# sourceMappingURL=estates.js.map