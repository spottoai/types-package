"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX = exports.AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES = exports.AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS = exports.AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS = exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES = exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES = exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES = exports.AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION = void 0;
exports.buildAwsOrganizationCommitmentsSessionId = buildAwsOrganizationCommitmentsSessionId;
const pluginPublicArtifacts_js_1 = require("./pluginPublicArtifacts.js");
exports.AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION = 1;
exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES = [
    'account-inventory',
    'payer-analytics',
    'payer-recommendations',
    'materialization',
    'publication',
];
exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES = ['not-started', 'pending', 'processing', 'fresh', 'partial', 'failed'];
exports.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES = ['pending', 'processing', 'fresh', 'partial', 'failed', 'skipped'];
exports.AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS = [
    'estate-disabled',
    'estate-not-ready',
    'management-account-missing',
    'commitments-permission-missing',
    'not-authorized',
    'unknown',
];
exports.AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS = ['not-collected', 'not-proved', 'source-unavailable'];
exports.AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES = [
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
exports.AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX = 'aws-org-commitments:';
/** Builds the bounded Service Bus session identity shared by API and engine. */
function buildAwsOrganizationCommitmentsSessionId(companyId, estateId) {
    const company = requiredSessionIdentity(companyId, 'companyId');
    const estate = requiredSessionIdentity(estateId, 'estateId');
    return `${exports.AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX}${(0, pluginPublicArtifacts_js_1.sha256AwsPluginIdentity)(JSON.stringify(['aws-organization-commitments', company, estate]))}`;
}
function requiredSessionIdentity(value, field) {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
        throw new Error(`${field} must be a non-empty trimmed string.`);
    }
    return value;
}
//# sourceMappingURL=organizationCommitments.js.map