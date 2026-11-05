"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentAwsResourceIdV1 = exports.isEnvironmentAwsResourceTypeV1 = exports.environmentAwsScopesEqual = exports.isEnvironmentAwsAccountScopeV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const validationHelpers_js_1 = require("../aws/validationHelpers.js");
const resourceGraph_js_1 = require("../aws/resourceGraph.js");
const arn_js_1 = require("../aws/arn.js");
/** Validates the exact AWS account/company identity without coercing account IDs. */
const isEnvironmentAwsAccountScopeV1 = (value) => (0, internal_js_1.isRecord)(value) &&
    (0, internal_js_1.hasExactKeys)(value, ['kind', 'companyId', 'accountId']) &&
    value.kind === 'aws-account' &&
    (0, internal_js_1.isScopeIdentifier)(value.companyId) &&
    typeof value.accountId === 'string' &&
    validationHelpers_js_1.AWS_ACCOUNT_ID_PATTERN.test(value.accountId);
exports.isEnvironmentAwsAccountScopeV1 = isEnvironmentAwsAccountScopeV1;
const environmentAwsScopesEqual = (left, right) => (0, exports.isEnvironmentAwsAccountScopeV1)(left) &&
    (0, exports.isEnvironmentAwsAccountScopeV1)(right) &&
    left.companyId === right.companyId &&
    left.accountId === right.accountId;
exports.environmentAwsScopesEqual = environmentAwsScopesEqual;
const isEnvironmentAwsResourceTypeV1 = (value) => (0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) && resourceGraph_js_1.AWS_RESOURCE_TYPE_PATTERN.test(value);
exports.isEnvironmentAwsResourceTypeV1 = isEnvironmentAwsResourceTypeV1;
/** Scoped native IDs and referenced AWS-owned policies do not assert customer ownership. */
const isEnvironmentAwsResourceIdV1 = (scope, value) => {
    if (!(0, exports.isEnvironmentAwsAccountScopeV1)(scope) ||
        !(0, internal_js_1.isScopeIdentifier)(value) ||
        /[\s\\%?]/u.test(value) ||
        value.includes('://') ||
        /^[A-Za-z]:\//u.test(value) ||
        value.startsWith('//') ||
        value.split('/').some(segment => segment === '.' || segment === '..'))
        return false;
    if (!value.startsWith('arn:'))
        return /^\/?[A-Za-z0-9][A-Za-z0-9._:/@+=,-]*$/u.test(value);
    const arn = (0, arn_js_1.parseAwsArn)(value);
    if (!arn)
        return false;
    const { region, accountId } = arn;
    return (region === '' || validationHelpers_js_1.AWS_REGION_PATTERN.test(region)) && (accountId === '' || accountId === 'aws' || accountId === scope.accountId);
};
exports.isEnvironmentAwsResourceIdV1 = isEnvironmentAwsResourceIdV1;
//# sourceMappingURL=awsIdentity.js.map