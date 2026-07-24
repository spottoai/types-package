import { AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS } from './requests';

const FORBIDDEN_PUBLIC_KEYS = new Set<string>([
  ...AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS,
  'externalId',
  'roleArn',
  'secretArn',
  'secretReference',
  'storagePath',
  'path',
  'blobPath',
  'containerPath',
  'chunk',
  'chunks',
  'lease',
  'retries',
  'retry',
  'refreshState',
  'retiredAt',
]);

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${field} must be a JSON object.`);
  return value as Record<string, unknown>;
}

export function requiredArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${field} must be a non-empty array.`);
  return value;
}

export function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const strings = value.map((item, index) => requiredString(item, `${field}[${index}]`));
  if (new Set(strings).size !== strings.length) throw new Error(`${field} must not contain duplicates.`);
  const sorted = [...strings].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(strings) !== JSON.stringify(sorted)) throw new Error(`${field} must be sorted.`);
  return strings;
}

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) throw new Error(`${field} must be a non-empty trimmed string.`);
  return value;
}

export function isoTimestamp(value: unknown, field: string): string {
  const timestamp = requiredString(value, field);
  if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp))) throw new Error(`${field} must be an ISO UTC timestamp.`);
  return timestamp;
}

export function sha256(value: unknown, field: string): string {
  const digest = requiredString(value, field);
  if (!SHA256_PATTERN.test(digest)) throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
  return digest;
}

export function requiredEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): Value {
  if (typeof value !== 'string' || !values.includes(value as Value)) throw new Error(`${field} is not declared.`);
  return value as Value;
}

export function optionalEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): void {
  if (value !== undefined) requiredEnum(value, values, field);
}

export function optionalRecord(value: unknown, field: string): void {
  if (value !== undefined) asRecord(value, field);
}

export function assertAccount(value: unknown, accountId: string, field: string): void {
  assertValue(value, accountId, field);
  if (!/^\d{12}$/.test(accountId)) throw new Error(`${field} must be a 12-digit AWS account id.`);
}

export function assertExactKeys(value: Record<string, unknown>, allowed: readonly string[], field: string): void {
  const allowedKeys = new Set(allowed);
  const unknown = Object.keys(value).filter(key => !allowedKeys.has(key));
  if (unknown.length > 0) throw new Error(`${field} contains undeclared fields: ${unknown.sort().join(', ')}.`);
}

export function assertNoForbiddenKeys(value: unknown, field: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${field}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PUBLIC_KEYS.has(key)) throw new Error(`${field}.${key} is not allowed in a public artifact.`);
    assertNoForbiddenKeys(child, `${field}.${key}`);
  }
}

/** Rejects non-JSON values, non-plain objects, and forbidden public keys recursively. */
export function assertPublicJson(value: unknown, field: string): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${field} must contain only finite JSON numbers.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPublicJson(item, `${field}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${field} must contain only plain JSON values.`);
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PUBLIC_KEYS.has(key)) throw new Error(`${field}.${key} is not allowed in a public artifact.`);
    assertPublicJson(child, `${field}.${key}`);
  }
}

export function assertRequiredKeys(value: Record<string, unknown>, required: readonly string[], field: string): void {
  const missing = required.filter(key => !(key in value));
  if (missing.length > 0) throw new Error(`${field} is missing required fields: ${missing.join(', ')}.`);
}

export function assertValue(actual: unknown, expected: unknown, field: string): void {
  if (actual !== expected) throw new Error(`${field} must match its exact binding.`);
}

export function assertJsonEqual(actual: unknown, expected: unknown, field: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${field} must match its exact binding.`);
}

export function validateDescriptor(value: unknown, field: string): void {
  const descriptor = asRecord(value, field);
  assertExactKeys(descriptor, ['name', 'mediaType', 'contentEncoding', 'byteLength', 'sha256'], field);
  requiredString(descriptor.name, `${field}.name`);
  assertValue(descriptor.mediaType, 'application/json', `${field}.mediaType`);
  requiredEnum(descriptor.contentEncoding, ['identity', 'gzip'], `${field}.contentEncoding`);
  if (!Number.isSafeInteger(descriptor.byteLength) || Number(descriptor.byteLength) < 0)
    throw new Error(`${field}.byteLength must be a non-negative safe integer.`);
  sha256(descriptor.sha256, `${field}.sha256`);
}

export function validateBilling(value: unknown, field = 'target.billing'): void {
  const billing = asRecord(value, field);
  if (billing.source === 'cur') {
    assertExactKeys(billing, ['source', 'reportName', 'billingPeriod'], field);
    requiredString(billing.reportName, `${field}.reportName`);
  } else if (billing.source === 'cur-2.0-data-exports') {
    assertExactKeys(billing, ['source', 'exportName', 'billingPeriod'], field);
    requiredString(billing.exportName, `${field}.exportName`);
  } else {
    throw new Error(`${field}.source is not declared.`);
  }
  const period = asRecord(billing.billingPeriod, `${field}.billingPeriod`);
  assertExactKeys(period, ['start', 'end'], `${field}.billingPeriod`);
  requiredString(period.start, `${field}.billingPeriod.start`);
  requiredString(period.end, `${field}.billingPeriod.end`);
  if (String(period.start) > String(period.end)) throw new Error(`${field}.billingPeriod start must not exceed end.`);
}

export function validateSelector(value: unknown, field: string): void {
  const selector = asRecord(value, field);
  if (selector.kind === 'stable-key') {
    assertExactKeys(selector, ['kind', 'stableKey'], field);
    requiredString(selector.stableKey, `${field}.stableKey`);
  } else if (selector.kind === 'resource-arn') {
    assertExactKeys(selector, ['kind', 'resourceArn'], field);
    requiredString(selector.resourceArn, `${field}.resourceArn`);
  } else {
    throw new Error(`${field}.kind is not declared.`);
  }
}

export function validateMetricWindow(value: unknown, field: string): void {
  const window = asRecord(value, field);
  assertExactKeys(window, ['start', 'end'], field);
  isoTimestamp(window.start, `${field}.start`);
  isoTimestamp(window.end, `${field}.end`);
  if (String(window.start) > String(window.end)) throw new Error(`${field}.start must not exceed end.`);
}

export function validateTagRuleScope(value: unknown): void {
  if (value === undefined) return;
  const scope = asRecord(value, 'tagRuleScope');
  assertExactKeys(scope, ['companyId'], 'tagRuleScope');
  requiredString(scope.companyId, 'tagRuleScope.companyId');
}
