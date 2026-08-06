"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_ESTATES_MANIFEST_FORBIDDEN_CREDENTIAL_FIELDS = exports.AWS_ESTATE_ACCOUNT_PURPOSES = exports.AWS_ESTATE_ROLE_DEPLOYMENT_MODES = exports.AWS_ESTATE_ACCOUNT_SOURCES = exports.AWS_ESTATE_KINDS = exports.AWS_ESTATES_MANIFEST_PROVIDER = exports.AWS_ESTATES_MANIFEST_SCHEMA_VERSION = void 0;
const requests_1 = require("./requests");
/** Schema version for the API-owned AWS company estate manifest. */
exports.AWS_ESTATES_MANIFEST_SCHEMA_VERSION = 1;
/** Public provider discriminator used by the AWS estate manifest API. */
exports.AWS_ESTATES_MANIFEST_PROVIDER = 'AWS';
exports.AWS_ESTATE_KINDS = ['standalone', 'organization'];
exports.AWS_ESTATE_ACCOUNT_SOURCES = ['manual'];
exports.AWS_ESTATE_ROLE_DEPLOYMENT_MODES = ['customer-managed'];
exports.AWS_ESTATE_ACCOUNT_PURPOSES = ['resource-discovery', 'organization-discovery', 'billing-definition', 'billing-storage'];
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
//# sourceMappingURL=estates.js.map