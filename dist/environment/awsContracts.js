"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1 = exports.ENVIRONMENT_AWS_ARTIFACT_KINDS_V1 = void 0;
exports.ENVIRONMENT_AWS_ARTIFACT_KINDS_V1 = [
    'aws-account-summary',
    'aws-account-resources',
    'aws-account-recommendations',
    'aws-account-commitments',
    'aws-account-reliability',
    // Issued by the API for admitted projection sections, never a compiler source.
    'aws-account-projection',
    'aws-account-security-posture',
    'aws-account-health',
    'aws-account-governance',
    'aws-account-service-retirements',
    'aws-account-data-protection',
    'aws-account-savings-ledger',
    'aws-account-public-ip-exposure',
];
/** Logical direct-publication names, never caller-selected storage paths. */
exports.ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1 = [
    'summary.json',
    'resources.json',
    'recommendations.json',
    'recommendation-filter-resources.json',
    'savings-ledgers.json',
    'serviceretirement.json',
    'serviceretirement-coverage.json',
    'commitments-planning.json',
    'relationships.json.gz',
    'data-protection.json.gz',
    'public-ip-addresses.json',
    'security-posture.json',
    'health-events.json',
    'health-availability-statuses.json',
    'governance.json.gz',
    'governance-access.json.gz',
];
//# sourceMappingURL=awsContracts.js.map