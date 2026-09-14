import { sha256AwsPluginIdentity } from './pluginPublicArtifacts.js';
export const AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION = 1;
export const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES = [
    'account-inventory',
    'payer-analytics',
    'payer-recommendations',
    'materialization',
    'publication',
];
export const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES = ['not-started', 'pending', 'processing', 'fresh', 'partial', 'failed'];
export const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES = ['pending', 'processing', 'fresh', 'partial', 'failed', 'skipped'];
export const AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS = [
    'estate-disabled',
    'estate-not-ready',
    'management-account-missing',
    'commitments-permission-missing',
    'not-authorized',
    'unknown',
];
export const AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS = ['not-collected', 'not-proved', 'source-unavailable'];
export const AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES = [
    'estate-disabled',
    'manifest-revision-mismatch',
    'organization-identity-invalid',
    'management-account-unavailable',
    'commitments-permission-missing',
    'account-inventory-partial',
    'payer-analytics-unavailable',
    'payer-recommendations-unavailable',
    'source-refresh-failed',
    'materialization-failed',
    'publication-failed',
    'refresh-cooldown',
    'unknown',
];
export const AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX = 'aws-org-commitments:';
/** Builds the bounded Service Bus session identity shared by API and engine. */
export function buildAwsOrganizationCommitmentsSessionId(companyId, estateId) {
    const company = requiredSessionIdentity(companyId, 'companyId');
    const estate = requiredSessionIdentity(estateId, 'estateId');
    return `${AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX}${sha256AwsPluginIdentity(JSON.stringify(['aws-organization-commitments', company, estate]))}`;
}
function requiredSessionIdentity(value, field) {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
        throw new Error(`${field} must be a non-empty trimmed string.`);
    }
    return value;
}
