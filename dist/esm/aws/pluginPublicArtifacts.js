import { sha256Utf8 } from '../common/sha256.js';
export const AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1;
export const AWS_PLUGIN_SOURCE_ARTIFACT_TYPES = [
    'account-summary',
    'resource-collection',
    'ai-cost-summary',
    'relationships',
    'lifecycle',
    'recommendations',
    'recommendation-actionability',
    'commitment-analysis',
    'reliability',
    'account-governance',
];
export const AWS_PLUGIN_SUBSCRIPTION_SECTIONS = [
    'account-summary',
    'resources',
    'ai-cost-summary',
    'service-retirement',
    'recommendations',
    'commitment-analysis',
    'reliability',
    'account-governance',
];
export const AWS_PLUGIN_RESOURCE_SECTIONS = ['resource', 'relationships', 'service-retirement', 'recommendations'];
/** Builds the path-free subscription logical name from a target-key SHA-256. */
export function buildAwsPluginSubscriptionLogicalName(targetKeySha256) {
    return `plugin-subscription--${normalizeSha256(targetKeySha256, 'targetKeySha256')}.json.gz`;
}
/** Builds the path-free resource logical name from stable and target SHA-256 values. */
export function buildAwsPluginResourceLogicalName(stableKeySha256, targetKeySha256) {
    return `plugin-resource--${normalizeSha256(stableKeySha256, 'stableKeySha256')}--${normalizeSha256(targetKeySha256, 'targetKeySha256')}.json.gz`;
}
/** Browser-safe SHA-256 used to bind stable and target identity to logical names. */
export function sha256AwsPluginIdentity(value) {
    return sha256Utf8(value);
}
function normalizeSha256(value, field) {
    const normalized = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(normalized)) {
        throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
    }
    return normalized;
}
