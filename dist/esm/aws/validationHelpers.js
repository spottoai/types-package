import { assertPlainJson, assertValue } from '../common/validationHelpers.js';
import { AWS_FORBIDDEN_CREDENTIAL_FIELDS } from './requests.js';
export const AWS_ACCOUNT_ID_PATTERN = /^\d{12}$/;
export const AWS_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z0-9-]+-\d+$/;
/** Credential material and setup secrets; rejected at every depth of a public artifact. */
const CREDENTIAL_KEYS = new Set([...AWS_FORBIDDEN_CREDENTIAL_FIELDS, 'externalId', 'secretReference', 'credentialReference'].map(key => key.toLowerCase()));
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
export const isAwsCredentialKey = (key) => CREDENTIAL_KEYS.has(key.toLowerCase());
export const isForbiddenAwsPublicKey = (key) => isAwsCredentialKey(key) || OPERATIONAL_KEYS.has(key.toLowerCase()) || OPERATIONAL_KEY_PATTERN.test(key);
/** Rejects non-JSON values plus credential, physical-path, and operational-marker keys recursively. */
export function assertAwsPublicJson(value, field) {
    assertPlainJson(value, field, isForbiddenAwsPublicKey);
}
export function assertAccount(value, accountId, field) {
    assertValue(value, accountId, field);
    if (!AWS_ACCOUNT_ID_PATTERN.test(accountId))
        throw new Error(`${field} must be a 12-digit AWS account id.`);
}
