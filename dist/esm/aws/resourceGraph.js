import { validateResourceGraphArtifact, } from '../common/resourceGraphValidation.js';
import { AWS_ACCOUNT_ID_PATTERN, AWS_REGION_PATTERN, isAwsCredentialKey, isForbiddenAwsPublicKey } from './validationHelpers.js';
/** CloudFormation-style resource type, for example `AWS::EC2::Instance`. */
export const AWS_RESOURCE_TYPE_PATTERN = /^AWS::[A-Za-z0-9]+::[A-Za-z0-9]+$/;
/** Region value for account-global resources such as IAM. */
export const AWS_GLOBAL_REGION = 'global';
const ARN_PATTERN = /^arn:(aws(?:-[a-z0-9-]+)?):[^:]+:([^:]*):([^:]*):.+$/;
const AVAILABILITY_ZONE_KEY_PATTERN = /(?:^a|A)vailabilityZone(?:Name)?s?$/;
const AWS_RESOURCE_GRAPH_RULES = {
    provider: 'aws',
    isAccountId: value => AWS_ACCOUNT_ID_PATTERN.test(value),
    isRegion: value => value === AWS_GLOBAL_REGION || AWS_REGION_PATTERN.test(value),
    isResourceType: value => AWS_RESOURCE_TYPE_PATTERN.test(value),
    validateNativeId: (nativeId, scope, field) => {
        if (nativeId.startsWith('arn:'))
            validateScopedArn(nativeId, scope, field, false);
    },
    validateZone: validateAvailabilityZone,
    validateAttribute: validateAttributeFormat,
    isForbiddenKey: (key, inAttributes) => (inAttributes ? isAwsCredentialKey(key) : isForbiddenAwsPublicKey(key)),
};
/**
 * Validates one untrusted AWS resource graph. Adds AWS identifier formats to
 * the generic structural checks; any discovery family is accepted.
 */
export function validateAwsResourceGraphArtifact(value) {
    return validateResourceGraphArtifact(value, AWS_RESOURCE_GRAPH_RULES);
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
    const expectedRegion = scope.region === AWS_GLOBAL_REGION ? '' : scope.region;
    if (arnRegion !== '' && arnRegion !== expectedRegion)
        throw new Error(`${field} ARN Region must match its node Region.`);
    if (arnAccountId !== '' && arnAccountId !== scope.accountId && !(allowAwsOwned && arnAccountId === 'aws'))
        throw new Error(`${field} ARN account must match the artifact account.`);
}
function validateAvailabilityZone(value, region, field) {
    if (region === AWS_GLOBAL_REGION || value === region || !value.startsWith(region))
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
            validateAvailabilityZone(zone, scope.region ?? AWS_GLOBAL_REGION, zoneField);
        });
    }
}
