"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentAwsAccountCompiledGenerationPointerV1 = exports.isEnvironmentAwsAccountProjectionV1 = exports.isEnvironmentAwsAccountSourceBindingV1 = exports.isEnvironmentAwsMoneyValueV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const awsContracts_js_1 = require("./awsContracts.js");
const awsIdentity_js_1 = require("./awsIdentity.js");
const awsReferences_js_1 = require("./awsReferences.js");
const internal_js_1 = require("./internal.js");
const projectionValidation_js_1 = require("./projectionValidation.js");
const validation_js_1 = require("./validation.js");
const moneyValidation_js_1 = require("./moneyValidation.js");
const optionalDocuments_js_1 = require("./optionalDocuments.js");
const MONEY_PROVENANCE = new Set([
    'account-summary',
    'account-resources',
    'cost-savings-summary',
    'savings-aggregate',
    'recommendation',
]);
const COVERAGE_ARTIFACTS = {
    completedPortalPublication: ['summary.json', 'resources.json', 'recommendations.json'],
    accountSummary: ['summary.json'],
    resources: ['resources.json'],
    recommendations: ['recommendations.json'],
    commitments: ['commitments-planning.json'],
    reliability: ['recommendations.json'],
    securityPosture: ['security-posture.json'],
    health: ['health-events.json', 'health-availability-statuses.json'],
    governance: ['governance.json.gz', 'governance-access.json.gz'],
    serviceRetirement: ['serviceretirement.json', 'serviceretirement-coverage.json'],
    dataProtection: ['data-protection.json.gz'],
    savingsLedger: ['savings-ledgers.json'],
    publicIpExposure: ['public-ip-addresses.json'],
};
const ARTIFACT_SOURCES = {
    'aws-account-summary': COVERAGE_ARTIFACTS.accountSummary,
    'aws-account-resources': COVERAGE_ARTIFACTS.resources,
    'aws-account-recommendations': COVERAGE_ARTIFACTS.recommendations,
    'aws-account-commitments': COVERAGE_ARTIFACTS.commitments,
    'aws-account-reliability': COVERAGE_ARTIFACTS.reliability,
    'aws-account-security-posture': COVERAGE_ARTIFACTS.securityPosture,
    'aws-account-health': COVERAGE_ARTIFACTS.health,
    'aws-account-governance': COVERAGE_ARTIFACTS.governance,
    'aws-account-service-retirements': COVERAGE_ARTIFACTS.serviceRetirement,
    'aws-account-data-protection': COVERAGE_ARTIFACTS.dataProtection,
    'aws-account-savings-ledger': COVERAGE_ARTIFACTS.savingsLedger,
    'aws-account-public-ip-exposure': COVERAGE_ARTIFACTS.publicIpExposure,
    'aws-account-projection': [],
};
const SOURCE_NAMES = new Set(awsContracts_js_1.ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1);
const SOURCE_COVERAGE_KEYS = Object.keys(COVERAGE_ARTIFACTS);
const OPTIONAL_CONTENT_KEYS = projectionValidation_js_1.ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1.filter(key => key !== 'secretStoreCoverage');
const PORTAL_PAGES = new Set([
    'dashboard',
    'resources',
    'recommendations',
    'cost-analysis',
    'commitments-planning',
    'security',
    'tags',
    'backups',
    'health',
    'perimeter-insights',
    'change-monitoring',
    'governance',
]);
/** AWS money retains the shared financial checks and a separate provenance namespace. */
const isEnvironmentAwsMoneyValueV1 = (value) => (0, moneyValidation_js_1.isEnvironmentMoneyValueWithProvenanceV1)(value, MONEY_PROVENANCE);
exports.isEnvironmentAwsMoneyValueV1 = isEnvironmentAwsMoneyValueV1;
const isPublicationArtifacts = (value) => Array.isArray(value) &&
    value.length >= 3 &&
    value.length <= 20 &&
    value.every((artifact, index) => (0, internal_js_1.isRecord)(artifact) &&
        (0, internal_js_1.hasExactKeys)(artifact, ['name', 'etag']) &&
        typeof artifact.name === 'string' &&
        SOURCE_NAMES.has(artifact.name) &&
        (0, internal_js_1.isBoundedString)(artifact.etag, 512, { trimmed: true, controls: true }) &&
        artifact.etag !== '*' &&
        !artifact.etag.startsWith('W/') &&
        (index === 0 || value[index - 1].name < artifact.name)) &&
    COVERAGE_ARTIFACTS.completedPortalPublication.every(name => value.some(artifact => artifact.name === name));
const isEnvironmentAwsAccountSourceBindingV1 = (value) => (0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) &&
    (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['kind', 'scope', 'portalRunId', 'portalGeneratedAt', 'completedAt', 'artifacts']) &&
    value.kind === 'aws-account-portal-publication' &&
    (0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(value.scope) &&
    (0, internal_js_1.isSourceIdentity)(value.portalRunId) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.portalGeneratedAt) &&
    (0, internal_js_1.isCanonicalUtcTimestamp)(value.completedAt) &&
    Date.parse(value.portalGeneratedAt) <= Date.parse(value.completedAt) &&
    isPublicationArtifacts(value.artifacts) &&
    (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes;
exports.isEnvironmentAwsAccountSourceBindingV1 = isEnvironmentAwsAccountSourceBindingV1;
/** Company-local routes only; the API still authorizes and constructs final navigation. */
const isPortalRoute = (scope, value) => {
    if (typeof value !== 'string' || value.length > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars)
        return false;
    const match = /^\/company\/([^/?#]+)\/([a-z-]+)(?:\/([^/?#]+))?(?:\?subscriptions=(\d{12}))?$/u.exec(value);
    if (!match)
        return false;
    const [, company, page, subject, accountId] = match;
    if (company === '.' ||
        company === '..' ||
        company !== encodeURIComponent(scope.companyId) ||
        !PORTAL_PAGES.has(page) ||
        (accountId !== undefined && accountId !== scope.accountId))
        return false;
    if (subject === undefined)
        return true;
    try {
        const decoded = decodeURIComponent(subject);
        if (encodeURIComponent(decoded) !== subject || /[%\\?]/u.test(decoded) || (0, internal_js_1.hasControlCharacter)(decoded))
            return false;
        if (page === 'resources')
            return (0, awsIdentity_js_1.isEnvironmentAwsResourceIdV1)(scope, decoded);
        return page === 'recommendations' && /^[A-Za-z0-9_~.-]+$/u.test(decoded) && decoded !== '.' && decoded !== '..';
    }
    catch {
        return false;
    }
};
const isResourceTypeArray = (value) => Array.isArray(value) &&
    value.length <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.boundedListItems &&
    value.every(awsIdentity_js_1.isEnvironmentAwsResourceTypeV1) &&
    value.every((item, index) => index === 0 || value[index - 1] < item);
const resourceTypesMatchReferences = (types, references) => {
    const parsed = references.map(awsReferences_js_1.parseEnvironmentAwsLogicalResourceReferenceV1);
    if (parsed.some(reference => reference === null))
        return false;
    const derived = [...new Set(parsed.map(reference => reference.resourceType))].sort();
    return types.length === derived.length && types.every((type, index) => type === derived[index]);
};
/** Validates the complete bounded AWS account projection, including every nested reference. */
const isEnvironmentAwsAccountProjectionV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) || !(0, internal_js_1.isRecord)(value))
        return false;
    if (!(0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'scope', 'sourceBinding', 'generatedAt', 'account', 'sourceCoverage', ...projectionValidation_js_1.ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1], OPTIONAL_CONTENT_KEYS) ||
        value.schemaVersion !== 1 ||
        !(0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(value.scope) ||
        !(0, exports.isEnvironmentAwsAccountSourceBindingV1)(value.sourceBinding) ||
        !(0, awsIdentity_js_1.environmentAwsScopesEqual)(value.scope, value.sourceBinding.scope) ||
        !(0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) ||
        Date.parse(value.generatedAt) < Date.parse(value.sourceBinding.completedAt) ||
        !(0, internal_js_1.isRecord)(value.account) ||
        !(0, internal_js_1.hasExactKeys)(value.account, ['safeLabel', 'portalRoute']) ||
        !(0, internal_js_1.isSafeLabel)(value.account.safeLabel) ||
        !(0, internal_js_1.isRecord)(value.sourceCoverage) ||
        !(0, internal_js_1.hasExactKeys)(value.sourceCoverage, SOURCE_COVERAGE_KEYS) ||
        !Object.values(value.sourceCoverage).every(validation_js_1.isEnvironmentCoverageStateV1))
        return false;
    const scope = value.scope;
    const sourceNames = new Set(value.sourceBinding.artifacts.map(artifact => artifact.name));
    if (value.sourceCoverage.completedPortalPublication.status !== 'complete')
        return false;
    for (const [key, names] of Object.entries(COVERAGE_ARTIFACTS)) {
        const coverage = value.sourceCoverage[key];
        if (['complete', 'partial', 'stale'].includes(coverage.status) && !names.every(name => sourceNames.has(name)))
            return false;
    }
    const validateContent = (0, projectionValidation_js_1.createEnvironmentProjectionContentValidatorV1)({
        isEvidenceReference: reference => {
            const parsed = (0, awsReferences_js_1.parseEnvironmentAwsLogicalArtifactReferenceV1)(reference) ?? (0, awsReferences_js_1.parseEnvironmentAwsLogicalResourceReferenceV1)(reference);
            return (parsed !== null &&
                (0, awsIdentity_js_1.environmentAwsScopesEqual)(scope, parsed.scope) &&
                (parsed.kind === 'resource' ||
                    (parsed.artifactKind !== 'aws-account-projection' && ARTIFACT_SOURCES[parsed.artifactKind].every(name => sourceNames.has(name)))));
        },
        isResourceReference: (reference) => {
            const parsed = (0, awsReferences_js_1.parseEnvironmentAwsLogicalResourceReferenceV1)(reference);
            return parsed !== null && (0, awsIdentity_js_1.environmentAwsScopesEqual)(scope, parsed.scope);
        },
        isResourceTypeArray,
        resourceTypesMatchReferences,
        isPortalRoute: (route) => isPortalRoute(scope, route),
        isMoneyValue: exports.isEnvironmentAwsMoneyValueV1,
    });
    return (isPortalRoute(scope, value.account.portalRoute) &&
        validateContent(value) &&
        (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.projectionBytes);
};
exports.isEnvironmentAwsAccountProjectionV1 = isEnvironmentAwsAccountProjectionV1;
/** Same fixed document tree and independent run identity as the Azure generation protocol. */
const isEnvironmentAwsAccountCompiledGenerationPointerV1 = (value) => {
    if (!(0, internal_js_1.hasSafeContainerShape)(value, 0, new Set(), true) || !(0, internal_js_1.isRecord)(value))
        return false;
    return ((0, internal_js_1.hasExactKeys)(value, ['schemaVersion', 'status', 'environmentRunId', 'scope', 'sourceBinding', 'treeDigestSha256', 'fileCount', 'generatedAt'], ['optionalDocuments']) &&
        value.schemaVersion === 1 &&
        value.status === 'completed' &&
        (0, validation_js_1.isEnvironmentRunIdV1)(value.environmentRunId) &&
        (0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(value.scope) &&
        (0, exports.isEnvironmentAwsAccountSourceBindingV1)(value.sourceBinding) &&
        (0, awsIdentity_js_1.environmentAwsScopesEqual)(value.scope, value.sourceBinding.scope) &&
        value.environmentRunId !== value.sourceBinding.portalRunId &&
        !value.sourceBinding.artifacts.some(artifact => artifact.etag === value.environmentRunId) &&
        typeof value.treeDigestSha256 === 'string' &&
        internal_js_1.SHA256_PATTERN.test(value.treeDigestSha256) &&
        value.fileCount === contracts_js_1.ENVIRONMENT_DOCUMENT_NAMES_V1.length &&
        (value.optionalDocuments === undefined || (0, optionalDocuments_js_1.isEnvironmentCapabilityDocumentSetV1)(value.optionalDocuments, value.scope)) &&
        (0, internal_js_1.isCanonicalUtcTimestamp)(value.generatedAt) &&
        Date.parse(value.generatedAt) >= Date.parse(value.sourceBinding.completedAt) &&
        (0, internal_js_1.utf8ByteLength)(JSON.stringify(value)) <= contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.completedPointerBytes);
};
exports.isEnvironmentAwsAccountCompiledGenerationPointerV1 = isEnvironmentAwsAccountCompiledGenerationPointerV1;
//# sourceMappingURL=awsValidation.js.map