import {
  AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  type AwsPortalAccountSummaryScope,
  type AwsPortalResourceCollectionScope,
} from './portalPublicArtifacts';
import { AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, type AwsPublicArtifactType } from './publicArtifacts';
import {
  asRecord,
  assertAccount,
  assertExactKeys,
  assertPublicJson,
  assertValue,
  isoTimestamp,
  requiredEnum,
  requiredString,
  stringArray,
  validateBilling,
  validateMetricWindow,
} from './pluginPublicArtifactValidationHelpers';

export { asRecord, assertExactKeys, assertPublicJson, assertValue, isoTimestamp, requiredEnum, requiredString, stringArray };

export function validatePortalEnvelope(
  artifact: Record<string, unknown>,
  artifactType: AwsPublicArtifactType,
  allowed: readonly string[]
): { accountId: string; runId: string; portalGeneratedAt: string; bodyGeneratedAt: string } {
  assertExactKeys(artifact, allowed, 'artifact');
  assertValue(artifact.schemaVersion, AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
  assertValue(artifact.portalSchemaVersion, AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.portalSchemaVersion');
  assertValue(artifact.provider, 'aws', 'artifact.provider');
  const accountId = requiredString(artifact.accountId, 'artifact.accountId');
  assertAccount(accountId, accountId, 'artifact.accountId');
  assertValue(artifact.artifactType, artifactType, 'artifact.artifactType');
  const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
  const bodyGeneratedAt = isoTimestamp(artifact.generatedAt, 'artifact.generatedAt');
  if (Date.parse(bodyGeneratedAt) > Date.parse(generation.generatedAt))
    throw new Error('artifact.generatedAt must not be newer than the Portal generation.');
  return { accountId, runId: generation.runId, portalGeneratedAt: generation.generatedAt, bodyGeneratedAt };
}

export function validateGeneration(value: unknown, field: string): { runId: string; generatedAt: string } {
  const generation = asRecord(value, field);
  assertExactKeys(generation, ['runId', 'generatedAt'], field);
  return {
    runId: requiredPublicIdentifier(generation.runId, `${field}.runId`),
    generatedAt: isoTimestamp(generation.generatedAt, `${field}.generatedAt`),
  };
}

export function validateResourceScope(value: unknown, accountId: string, field: string): AwsPortalResourceCollectionScope {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['provider', 'accountId', 'billing', 'resourceRegions', 'metricTimeWindow', 'tagRuleScope'], field);
  assertValue(scope.provider, 'aws', `${field}.provider`);
  assertAccount(scope.accountId, accountId, `${field}.accountId`);
  validateBilling(scope.billing, `${field}.billing`);
  regionArray(scope.resourceRegions, `${field}.resourceRegions`);
  validateMetricWindow(scope.metricTimeWindow, `${field}.metricTimeWindow`);
  if (scope.tagRuleScope !== undefined) {
    const tagRuleScope = asRecord(scope.tagRuleScope, `${field}.tagRuleScope`);
    assertExactKeys(tagRuleScope, ['companyId'], `${field}.tagRuleScope`);
    requiredString(tagRuleScope.companyId, `${field}.tagRuleScope.companyId`);
  }
  return value as AwsPortalResourceCollectionScope;
}

export function validateAccountScope(value: unknown, accountId: string, field: string): AwsPortalAccountSummaryScope {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['provider', 'accountId', 'billing', 'comparisonBillingPeriod', 'resourceRegions', 'metricTimeWindow'], field);
  assertValue(scope.provider, 'aws', `${field}.provider`);
  assertAccount(scope.accountId, accountId, `${field}.accountId`);
  validateBilling(scope.billing, `${field}.billing`);
  if (scope.comparisonBillingPeriod !== undefined) validatePeriod(scope.comparisonBillingPeriod, `${field}.comparisonBillingPeriod`);
  regionArray(scope.resourceRegions, `${field}.resourceRegions`);
  validateMetricWindow(scope.metricTimeWindow, `${field}.metricTimeWindow`);
  return value as AwsPortalAccountSummaryScope;
}

export function validateHistoryAccountScope(value: unknown, accountId: string, field: string): void {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['provider', 'accountId', 'billing', 'resourceRegions'], field);
  assertValue(scope.provider, 'aws', `${field}.provider`);
  assertAccount(scope.accountId, accountId, `${field}.accountId`);
  validateBilling(scope.billing, `${field}.billing`);
  regionArray(scope.resourceRegions, `${field}.resourceRegions`);
}

export function validatePeriod(value: unknown, field: string): void {
  const period = asRecord(value, field);
  assertExactKeys(period, ['start', 'end'], field);
  dateValue(period.start, `${field}.start`);
  dateValue(period.end, `${field}.end`);
  if (String(period.start) > String(period.end)) throw new Error(`${field}.start must not exceed end.`);
}

export function validateFreshness(value: unknown, field: string, timestampField: string): void {
  const freshness = asRecord(value, field);
  assertExactKeys(freshness, [timestampField, timestampField === 'lastSuccessfulImportAt' ? 'hasSuccessfulImport' : 'hasSuccessfulRefresh'], field);
  if (freshness[timestampField] !== undefined) isoTimestamp(freshness[timestampField], `${field}.${timestampField}`);
  const booleanField = timestampField === 'lastSuccessfulImportAt' ? 'hasSuccessfulImport' : 'hasSuccessfulRefresh';
  requiredBoolean(freshness[booleanField], `${field}.${booleanField}`);
}

export function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean.`);
  return value;
}

export function nonNegativeInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${field} must be a non-negative safe integer.`);
  return Number(value);
}

export function finiteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${field} must be a finite number.`);
  return value;
}

export function validateJsonObject(value: unknown, field: string): void {
  asRecord(value, field);
  assertPublicJson(value, field);
}

export function validateJsonArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  assertPublicJson(value, field);
  return value;
}

export function assertRegionsBelong(regions: unknown, allowedRegions: string[], field: string): void {
  const nested = stringArray(regions, field);
  nested.forEach(region => {
    if (!allowedRegions.includes(region)) throw new Error(`${field} contains Region outside artifact scope: ${region}.`);
  });
}

export function assertUnique(values: string[], field: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${field} must not contain duplicates.`);
}

export function regionArray(value: unknown, field: string): string[] {
  const regions = stringArray(value, field);
  if (regions.length === 0) throw new Error(`${field} must not be empty.`);
  assertUnique(regions, field);
  regions.forEach(region => {
    if (region !== 'global' && !/^[a-z]{2}(?:-gov)?-[a-z0-9-]+-\d+$/.test(region))
      throw new Error(`${field} contains a non-canonical AWS Region: ${region}.`);
  });
  return regions;
}

export function requiredPublicIdentifier(value: unknown, field: string): string {
  const identifier = requiredString(value, field);
  if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('://') || identifier.includes('..'))
    throw new Error(`${field} must not contain a physical path or URI.`);
  return identifier;
}

export function dateValue(value: unknown, field: string): string {
  const date = requiredString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00.000Z`))) throw new Error(`${field} must be a calendar date.`);
  const normalized = new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10);
  if (normalized !== date) throw new Error(`${field} must be a valid calendar date.`);
  return date;
}
