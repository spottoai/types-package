"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_GLOBAL_REGION = exports.AWS_RESOURCE_TYPE_PATTERN = void 0;
exports.validateAwsResourceGraphArtifact = validateAwsResourceGraphArtifact;
const resourceGraphValidation_js_1 = require("../common/resourceGraphValidation.js");
const validationHelpers_js_1 = require("./validationHelpers.js");
/** CloudFormation-style resource type, for example `AWS::EC2::Instance`. */
exports.AWS_RESOURCE_TYPE_PATTERN = /^AWS::[A-Za-z0-9]+::[A-Za-z0-9]+$/;
/** Region value for account-global resources such as IAM. */
exports.AWS_GLOBAL_REGION = 'global';
const ARN_PATTERN = /^arn:(aws(?:-[a-z0-9-]+)?):[^:]+:([^:]*):([^:]*):.+$/;
const AVAILABILITY_ZONE_KEY_PATTERN = /(?:^a|A)vailabilityZone(?:Name)?s?$/;
const AWS_RESOURCE_GRAPH_RULES = {
    provider: 'aws',
    isAccountId: value => validationHelpers_js_1.AWS_ACCOUNT_ID_PATTERN.test(value),
    isRegion: value => value === exports.AWS_GLOBAL_REGION || validationHelpers_js_1.AWS_REGION_PATTERN.test(value),
    isResourceType: value => exports.AWS_RESOURCE_TYPE_PATTERN.test(value),
    validateNativeId: (nativeId, scope, field) => {
        if (nativeId.startsWith('arn:'))
            validateScopedArn(nativeId, scope, field, false);
    },
    validateZone: validateAvailabilityZone,
    validateAttribute: validateAttributeFormat,
    isForbiddenKey: (key, inAttributes) => (inAttributes ? (0, validationHelpers_js_1.isAwsCredentialKey)(key) : (0, validationHelpers_js_1.isForbiddenAwsPublicKey)(key)),
};
/**
 * Validates one untrusted AWS resource graph. Adds AWS identifier formats to
 * the generic structural checks; any discovery family is accepted.
 */
function validateAwsResourceGraphArtifact(value) {
    return (0, resourceGraphValidation_js_1.validateResourceGraphArtifact)(value, AWS_RESOURCE_GRAPH_RULES);
}
/**
 * An ARN must stay inside its node's account and Region. Empty ARN segments
 * (S3, IAM) are allowed; attribute references may also name AWS-owned (`aws`) resources.
 */
function validateScopedArn(value, scope, field, allowAwsOwned) {
    const match = ARN_PATTERN.exec(value);
    if (!match)
        throw new Error(`${field} must be a canonical AWS ARN.`);
    const [, , arnRegion, arnAccountId] = match;
    const expectedRegion = scope.region === exports.AWS_GLOBAL_REGION ? '' : scope.region;
    if (arnRegion !== '' && arnRegion !== expectedRegion)
        throw new Error(`${field} ARN Region must match its node Region.`);
    if (arnAccountId !== '' && arnAccountId !== scope.accountId && !(allowAwsOwned && arnAccountId === 'aws'))
        throw new Error(`${field} ARN account must match the artifact account.`);
}
function validateAvailabilityZone(value, region, field) {
    if (region === exports.AWS_GLOBAL_REGION || value === region || !value.startsWith(region))
        throw new Error(`${field} must belong to its node Region.`);
}
function validateAttributeFormat(key, value, scope, field) {
    if (key.endsWith('Arn')) {
        if (typeof value !== 'string')
            throw new Error(`${field} must be an ARN string.`);
        validateScopedArn(value, scope, field, true);
    }
    if (AVAILABILITY_ZONE_KEY_PATTERN.test(key)) {
        const zones = Array.isArray(value) ? value : [value];
        zones.forEach((zone, index) => {
            const zoneField = Array.isArray(value) ? `${field}[${index}]` : field;
            if (typeof zone !== 'string')
                throw new Error(`${zoneField} must be an Availability Zone name.`);
            validateAvailabilityZone(zone, scope.region ?? exports.AWS_GLOBAL_REGION, zoneField);
        });
    }
}
//# sourceMappingURL=resourceGraph.js.map