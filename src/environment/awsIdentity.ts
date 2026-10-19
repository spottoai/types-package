import type { EnvironmentAwsAccountScopeV1 } from './awsContracts.js';
import { ENVIRONMENT_CONTRACT_LIMITS_V1 } from './contracts.js';
import { hasExactKeys, isBoundedString, isRecord, isScopeIdentifier } from './internal.js';
import { AWS_ACCOUNT_ID_PATTERN, AWS_REGION_PATTERN } from '../aws/validationHelpers.js';
import { AWS_RESOURCE_TYPE_PATTERN } from '../aws/resourceGraph.js';
import { parseAwsArn } from '../aws/arn.js';

/** Validates the exact AWS account/company identity without coercing account IDs. */
export const isEnvironmentAwsAccountScopeV1 = (value: unknown): value is EnvironmentAwsAccountScopeV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['kind', 'companyId', 'accountId']) &&
  value.kind === 'aws-account' &&
  isScopeIdentifier(value.companyId) &&
  typeof value.accountId === 'string' &&
  AWS_ACCOUNT_ID_PATTERN.test(value.accountId);

export const environmentAwsScopesEqual = (left: unknown, right: unknown): boolean =>
  isEnvironmentAwsAccountScopeV1(left) &&
  isEnvironmentAwsAccountScopeV1(right) &&
  left.companyId === right.companyId &&
  left.accountId === right.accountId;

export const isEnvironmentAwsResourceTypeV1 = (value: unknown): value is string =>
  isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) && AWS_RESOURCE_TYPE_PATTERN.test(value);

/** Scoped native IDs and referenced AWS-owned policies do not assert customer ownership. */
export const isEnvironmentAwsResourceIdV1 = (scope: unknown, value: unknown): value is string => {
  if (
    !isEnvironmentAwsAccountScopeV1(scope) ||
    !isScopeIdentifier(value) ||
    /[\s\\%?]/u.test(value) ||
    value.includes('://') ||
    /^[A-Za-z]:\//u.test(value) ||
    value.startsWith('//') ||
    value.split('/').some(segment => segment === '.' || segment === '..')
  )
    return false;
  if (!value.startsWith('arn:')) return /^\/?[A-Za-z0-9][A-Za-z0-9._:/@+=,-]*$/u.test(value);
  const arn = parseAwsArn(value);
  if (!arn) return false;
  const { region, accountId } = arn;
  return (region === '' || AWS_REGION_PATTERN.test(region)) && (accountId === '' || accountId === 'aws' || accountId === scope.accountId);
};
