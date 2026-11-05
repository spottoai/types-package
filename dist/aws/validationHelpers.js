"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isForbiddenAwsPublicKey = exports.isAwsCredentialKey = exports.AWS_REGION_PATTERN = exports.AWS_ACCOUNT_ID_PATTERN = void 0;
exports.assertAwsPublicJson = assertAwsPublicJson;
exports.assertAccount = assertAccount;
const validationHelpers_js_1 = require("../common/validationHelpers.js");
const requests_js_1 = require("./requests.js");
exports.AWS_ACCOUNT_ID_PATTERN = /^\d{12}$/;
exports.AWS_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z0-9-]+-\d+$/;
/** Credential material and setup secrets; rejected at every depth of a public artifact. */
const CREDENTIAL_KEYS = new Set([...requests_js_1.AWS_FORBIDDEN_CREDENTIAL_FIELDS, 'externalId', 'secretReference', 'credentialReference'].map(key => key.toLowerCase()));
/** Setup locators and engine-operational markers that never belong on a public envelope. */
const OPERATIONAL_KEYS = new Set([
    'roleArn',
    'secretArn',
    'storagePath',
    'sourcePath',
    'path',
    'blobPath',
    'containerPath',
    'chunk',
    'chunks',
    'lease',
    'retries',
    'retry',
    'refreshState',
    'lastRefreshExecutionRequestId',
    'lastRefreshExecutionRequestedAt',
    'prompt',
    'promptInput',
    'sourceBytes',
    'maxSourceBytes',
    'bedrockRegion',
    'guardrailId',
    'guardrailVersion',
    'etag',
    'eTag',
    'retiredAt',
].map(key => key.toLowerCase()));
const OPERATIONAL_KEY_PATTERN = /^(?:source|storage|blob|container)(?:path|uri|url|key)$|^s3(?:bucket|key|uri|url)$/i;
const isAwsCredentialKey = (key) => CREDENTIAL_KEYS.has(key.toLowerCase());
exports.isAwsCredentialKey = isAwsCredentialKey;
const isForbiddenAwsPublicKey = (key) => (0, exports.isAwsCredentialKey)(key) || OPERATIONAL_KEYS.has(key.toLowerCase()) || OPERATIONAL_KEY_PATTERN.test(key);
exports.isForbiddenAwsPublicKey = isForbiddenAwsPublicKey;
/** Rejects non-JSON values plus credential, physical-path, and operational-marker keys recursively. */
function assertAwsPublicJson(value, field) {
    (0, validationHelpers_js_1.assertPlainJson)(value, field, exports.isForbiddenAwsPublicKey);
}
function assertAccount(value, accountId, field) {
    (0, validationHelpers_js_1.assertValue)(value, accountId, field);
    if (!exports.AWS_ACCOUNT_ID_PATTERN.test(accountId))
        throw new Error(`${field} must be a 12-digit AWS account id.`);
}
//# sourceMappingURL=validationHelpers.js.map