import {
  AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS,
  type AwsOrganizationCommitmentsPlanningView,
} from './organizationCommitments.js';
import {
  validateAwsOrganizationCommitmentsPlanningViewIdentity,
  type AwsOrganizationCommitmentsExpectedIdentity,
} from './organizationCommitmentsValidation.js';
import {
  AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME,
  AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  type AwsPortalOrganizationCommitmentsPlanningArtifact,
} from './portalOrganizationCommitmentsPlanningPublicArtifacts.js';
import { AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION } from './portalPublicArtifacts.js';
import {
  asRecord,
  assertExactKeys,
  assertPublicJson,
  assertValue,
  finiteNumber,
  isoTimestamp,
  requiredEnum,
  requiredString,
  validateGeneration,
} from './portalPublicArtifactValidationCommon.js';

const TOP_LEVEL_KEYS = [
  'schemaVersion',
  'portalSchemaVersion',
  'provider',
  'artifactType',
  'artifactGeneration',
  'logicalName',
  'manifestRevision',
  'version',
  'generatedAt',
  'month',
  'providerScope',
  'accounts',
  'utilizationSummary',
  'expirySummary',
  'inventory',
  'payerAggregates',
  'sharingPosture',
  'pricingContext',
  'freshness',
  'purchaseRecommendations',
  'allocation',
  'resourceAttribution',
] as const;

export type AwsPortalOrganizationCommitmentsExpectedIdentity = AwsOrganizationCommitmentsExpectedIdentity;

/** Validates one untrusted organization Commitments Planning view without its Portal envelope. */
export function validateAwsOrganizationCommitmentsPlanningView(
  value: unknown,
  expected: AwsOrganizationCommitmentsExpectedIdentity
): AwsOrganizationCommitmentsPlanningView {
  validateAwsOrganizationCommitmentsPlanningViewIdentity(value, expected);
  validateBody(value as AwsOrganizationCommitmentsPlanningView);
  assertPublicJson(value, 'organizationCommitmentsPlanning');
  return value as AwsOrganizationCommitmentsPlanningView;
}

/** Validates one untrusted immutable AWS organization Commitments Planning artifact. */
export function validateAwsPortalOrganizationCommitmentsPlanningArtifact(
  value: unknown,
  expected: AwsPortalOrganizationCommitmentsExpectedIdentity
): AwsPortalOrganizationCommitmentsPlanningArtifact {
  const artifact = asRecord(value, 'artifact');
  assertExactKeys(artifact, TOP_LEVEL_KEYS, 'artifact');
  assertValue(artifact.schemaVersion, AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
  assertValue(artifact.portalSchemaVersion, AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.portalSchemaVersion');
  assertValue(artifact.provider, 'aws', 'artifact.provider');
  assertValue(artifact.artifactType, 'organization-commitments-planning', 'artifact.artifactType');
  assertValue(artifact.logicalName, AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME, 'artifact.logicalName');
  requiredString(artifact.manifestRevision, 'artifact.manifestRevision');
  assertValue(artifact.version, '1.0', 'artifact.version');
  const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
  const generatedAt = isoTimestamp(artifact.generatedAt, 'artifact.generatedAt');
  if (Date.parse(generatedAt) > Date.parse(generation.generatedAt)) {
    throw new Error('artifact.generatedAt must not be newer than the Portal generation.');
  }
  if (artifact.month !== undefined) requiredString(artifact.month, 'artifact.month');

  validateAwsOrganizationCommitmentsPlanningView(artifact, expected);
  assertPublicJson(artifact, 'artifact');
  return value as AwsPortalOrganizationCommitmentsPlanningArtifact;
}

function validateBody(view: AwsOrganizationCommitmentsPlanningView): void {
  records(view.accounts, 'artifact.accounts', validateAccount);
  validateUtilizationSummary(view.utilizationSummary, 'artifact.utilizationSummary');
  exact(view.expirySummary, ['expired', 'expiring30d', 'expiring60d', 'expiring90d', 'expiring180d'], 'artifact.expirySummary');
  records(view.inventory, 'artifact.inventory', validateInventory);
  records(view.payerAggregates, 'artifact.payerAggregates', validatePayerAggregate);
  validateSharingPosture(view.sharingPosture, 'artifact.sharingPosture');
  validatePricingContext(view.pricingContext, 'artifact.pricingContext');
  optionalRecord(view.freshness, 'artifact.freshness', validateFreshness);
  optionalRecords(view.purchaseRecommendations, 'artifact.purchaseRecommendations', validatePurchaseRecommendation);
  validateAttribution(view.allocation, 'artifact.allocation', validateAllocationRecord);
  validateAttribution(view.resourceAttribution, 'artifact.resourceAttribution', validateResourceAttributionRecord);
}

function validateSharingPosture(value: unknown, field: string): void {
  const posture = exact(value, ['status', 'reason'], field);
  assertValue(posture.status, 'unknown', `${field}.status`);
  assertValue(posture.reason, 'not-collected', `${field}.reason`);
}

function validateAccount(value: unknown, field: string): void {
  const account = exact(value, ['accountId', 'displayName', 'role', 'inventoryStatus', 'lastSuccessfulRefreshAt'], field);
  requiredString(account.accountId, `${field}.accountId`);
  optionalString(account.displayName, `${field}.displayName`);
  requiredEnum(account.role, ['management', 'member'] as const, `${field}.role`);
  requiredEnum(account.inventoryStatus, ['current', 'stale', 'partial', 'unavailable'] as const, `${field}.inventoryStatus`);
  optionalTimestamp(account.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
}

function validateUtilizationSummary(value: unknown, field: string): void {
  const summary = exact(
    value,
    ['total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates', 'byBenefitType'],
    field
  );
  nonNegative(summary.total, `${field}.total`);
  nonNegative(summary.withData, `${field}.withData`);
  optionalNumber(summary.sevenDayAverage, `${field}.sevenDayAverage`);
  optionalNumber(summary.thirtyDayAverage, `${field}.thirtyDayAverage`);
  optionalRecords(summary.sevenDayAggregates, `${field}.sevenDayAggregates`, validateWeightedAggregate);
  optionalRecords(summary.thirtyDayAggregates, `${field}.thirtyDayAggregates`, validateWeightedAggregate);
  records(summary.byBenefitType, `${field}.byBenefitType`, (entry, itemField) => {
    const item = exact(
      entry,
      ['benefitType', 'total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates'],
      itemField
    );
    requiredEnum(item.benefitType, ['reservation', 'savings-plan'] as const, `${itemField}.benefitType`);
    nonNegative(item.total, `${itemField}.total`);
    nonNegative(item.withData, `${itemField}.withData`);
    optionalNumber(item.sevenDayAverage, `${itemField}.sevenDayAverage`);
    optionalNumber(item.thirtyDayAverage, `${itemField}.thirtyDayAverage`);
    optionalRecords(item.sevenDayAggregates, `${itemField}.sevenDayAggregates`, validateWeightedAggregate);
    optionalRecords(item.thirtyDayAggregates, `${itemField}.thirtyDayAggregates`, validateWeightedAggregate);
  });
}

function validateWeightedAggregate(value: unknown, field: string): void {
  const aggregate = exact(value, ['used', 'reserved', 'percentage', 'sampleCount', 'unit', 'currency'], field);
  finiteNumber(aggregate.used, `${field}.used`);
  finiteNumber(aggregate.reserved, `${field}.reserved`);
  optionalNumber(aggregate.percentage, `${field}.percentage`);
  if (aggregate.sampleCount !== undefined) nonNegative(aggregate.sampleCount, `${field}.sampleCount`);
  requiredEnum(aggregate.unit, ['hours', 'quantity', 'currency'] as const, `${field}.unit`);
  optionalString(aggregate.currency, `${field}.currency`);
}

function validateInventory(value: unknown, field: string): void {
  const item = exact(
    value,
    [
      'id',
      'benefitType',
      'commitmentFamily',
      'sourceKind',
      'sourceId',
      'provider',
      'ownerAccountId',
      'shape',
      'scope',
      'type',
      'displayName',
      'status',
      'purchaseDate',
      'expiryDate',
      'daysToExpiry',
      'commitmentAmount',
      'commitmentCurrencyCode',
      'commitmentGrain',
      'commitmentUnit',
      'skuName',
      'location',
      'term',
      'termMonths',
      'billingPlan',
      'utilization',
    ],
    field
  );
  requiredString(item.id, `${field}.id`);
  requiredEnum(item.benefitType, ['reservation', 'savings-plan'] as const, `${field}.benefitType`);
  optionalString(item.commitmentFamily, `${field}.commitmentFamily`);
  assertValue(item.sourceKind, 'aws-native', `${field}.sourceKind`);
  optionalString(item.sourceId, `${field}.sourceId`);
  assertValue(item.provider, 'aws', `${field}.provider`);
  requiredString(item.ownerAccountId, `${field}.ownerAccountId`);
  optionalRecord(item.shape, `${field}.shape`, validateShape);
  requiredEnum(item.scope, ['Shared', 'Single', 'ManagementGroup', 'Unknown'] as const, `${field}.scope`);
  requiredString(item.type, `${field}.type`);
  optionalString(item.displayName, `${field}.displayName`);
  requiredString(item.status, `${field}.status`);
  optionalString(item.purchaseDate, `${field}.purchaseDate`);
  optionalString(item.expiryDate, `${field}.expiryDate`);
  optionalNumber(item.daysToExpiry, `${field}.daysToExpiry`);
  optionalNumber(item.commitmentAmount, `${field}.commitmentAmount`);
  optionalString(item.commitmentCurrencyCode, `${field}.commitmentCurrencyCode`);
  optionalString(item.commitmentGrain, `${field}.commitmentGrain`);
  optionalString(item.commitmentUnit, `${field}.commitmentUnit`);
  optionalString(item.skuName, `${field}.skuName`);
  optionalString(item.location, `${field}.location`);
  optionalString(item.term, `${field}.term`);
  optionalNumber(item.termMonths, `${field}.termMonths`);
  optionalString(item.billingPlan, `${field}.billingPlan`);
  optionalRecord(item.utilization, `${field}.utilization`, validateUtilization);
}

function validatePayerAggregate(value: unknown, field: string): void {
  const aggregate = exact(
    value,
    [
      'benefitType',
      'commitmentFamily',
      'payerAccountId',
      'windowStart',
      'windowEnd',
      'eligibleCost',
      'coveredCost',
      'uncoveredCost',
      'coveragePercent',
      'utilization',
      'source',
    ],
    field
  );
  requiredEnum(aggregate.benefitType, ['reservation', 'savings-plan'] as const, `${field}.benefitType`);
  requiredString(aggregate.commitmentFamily, `${field}.commitmentFamily`);
  requiredString(aggregate.payerAccountId, `${field}.payerAccountId`);
  requiredString(aggregate.windowStart, `${field}.windowStart`);
  requiredString(aggregate.windowEnd, `${field}.windowEnd`);
  optionalRecord(aggregate.eligibleCost, `${field}.eligibleCost`, validateMoney);
  optionalRecord(aggregate.coveredCost, `${field}.coveredCost`, validateMoney);
  optionalRecord(aggregate.uncoveredCost, `${field}.uncoveredCost`, validateMoney);
  optionalNumber(aggregate.coveragePercent, `${field}.coveragePercent`);
  optionalRecord(aggregate.utilization, `${field}.utilization`, validateUtilization);
  validateSource(aggregate.source, `${field}.source`, false);
}

function validatePurchaseRecommendation(value: unknown, field: string): void {
  const recommendation = exact(
    value,
    [
      'id',
      'groupKey',
      'commitmentFamily',
      'action',
      'purchaseScope',
      'payerAccountId',
      'recommendedAccountId',
      'source',
      'targetShape',
      'title',
      'description',
      'confidence',
      'riskLevel',
      'termMonths',
      'quantity',
      'estimatedAnnualSavings',
      'estimatedAnnualCost',
      'estimatedTermSavings',
      'estimatedTermCost',
      'notes',
    ],
    field
  );
  requiredString(recommendation.id, `${field}.id`);
  requiredString(recommendation.groupKey, `${field}.groupKey`);
  requiredString(recommendation.commitmentFamily, `${field}.commitmentFamily`);
  requiredEnum(recommendation.action, ['buy', 'unlock', 'savings-plan', 'none'] as const, `${field}.action`);
  assertValue(recommendation.purchaseScope, 'payer', `${field}.purchaseScope`);
  requiredString(recommendation.payerAccountId, `${field}.payerAccountId`);
  optionalString(recommendation.recommendedAccountId, `${field}.recommendedAccountId`);
  validateSource(recommendation.source, `${field}.source`, false);
  validateShape(recommendation.targetShape, `${field}.targetShape`);
  optionalString(recommendation.title, `${field}.title`);
  optionalString(recommendation.description, `${field}.description`);
  optionalString(recommendation.confidence, `${field}.confidence`);
  optionalString(recommendation.riskLevel, `${field}.riskLevel`);
  optionalNumber(recommendation.termMonths, `${field}.termMonths`);
  optionalNumber(recommendation.quantity, `${field}.quantity`);
  optionalRecord(recommendation.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`, validateMoney);
  optionalRecord(recommendation.estimatedAnnualCost, `${field}.estimatedAnnualCost`, validateMoney);
  optionalRecord(recommendation.estimatedTermSavings, `${field}.estimatedTermSavings`, validateMoney);
  optionalRecord(recommendation.estimatedTermCost, `${field}.estimatedTermCost`, validateMoney);
  optionalStrings(recommendation.notes, `${field}.notes`);
}

function validateAttribution(value: unknown, field: string, validateRecord: RecordValidator): void {
  const evidence = asRecord(value, field);
  if (evidence.status === 'unavailable') {
    assertExactKeys(evidence, ['status', 'reason'], field);
    requiredEnum(evidence.reason, AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS, `${field}.reason`);
    return;
  }
  assertValue(evidence.status, 'available', `${field}.status`);
  assertExactKeys(evidence, ['status', 'source', 'records'], field);
  validateSource(evidence.source, `${field}.source`, true);
  records(evidence.records, `${field}.records`, validateRecord, true);
}

function validateAllocationRecord(value: unknown, field: string): void {
  const record = exact(
    value,
    [
      'beneficiaryAccountId',
      'ownerAccountId',
      'commitmentId',
      'benefitType',
      'commitmentFamily',
      'windowStart',
      'windowEnd',
      'eligibleCost',
      'coveredCost',
      'uncoveredCost',
    ],
    field
  );
  requiredString(record.beneficiaryAccountId, `${field}.beneficiaryAccountId`);
  optionalString(record.ownerAccountId, `${field}.ownerAccountId`);
  optionalString(record.commitmentId, `${field}.commitmentId`);
  requiredEnum(record.benefitType, ['reservation', 'savings-plan'] as const, `${field}.benefitType`);
  requiredString(record.commitmentFamily, `${field}.commitmentFamily`);
  requiredString(record.windowStart, `${field}.windowStart`);
  requiredString(record.windowEnd, `${field}.windowEnd`);
  optionalRecord(record.eligibleCost, `${field}.eligibleCost`, validateMoney);
  optionalRecord(record.coveredCost, `${field}.coveredCost`, validateMoney);
  optionalRecord(record.uncoveredCost, `${field}.uncoveredCost`, validateMoney);
}

function validateResourceAttributionRecord(value: unknown, field: string): void {
  const record = exact(
    value,
    ['accountId', 'resourceId', 'resourceName', 'resourceType', 'benefitIds', 'windowStart', 'windowEnd', 'coveredCost'],
    field
  );
  requiredString(record.accountId, `${field}.accountId`);
  requiredString(record.resourceId, `${field}.resourceId`);
  optionalString(record.resourceName, `${field}.resourceName`);
  optionalString(record.resourceType, `${field}.resourceType`);
  strings(record.benefitIds, `${field}.benefitIds`);
  requiredString(record.windowStart, `${field}.windowStart`);
  requiredString(record.windowEnd, `${field}.windowEnd`);
  optionalRecord(record.coveredCost, `${field}.coveredCost`, validateMoney);
}

function validateShape(value: unknown, field: string): void {
  const shape = exact(
    value,
    [
      'provider',
      'resourceType',
      'commitmentFamily',
      'skuName',
      'normalizedSkuName',
      'location',
      'region',
      'availabilityZone',
      'platform',
      'reservationProductName',
      'reservedResourceType',
      'meterCategory',
      'meterSubCategory',
      'meterName',
      'unit',
      'attributes',
    ],
    field
  );
  assertValue(shape.provider, 'aws', `${field}.provider`);
  if (shape.attributes !== undefined) asRecord(shape.attributes, `${field}.attributes`);
}

function validateSource(value: unknown, field: string, allowDerived: boolean): void {
  const source = exact(value, ['sourceKind', 'sourceId', 'sourceName', 'generatedAt', 'observedAt', 'notes'], field);
  requiredEnum(source.sourceKind, allowDerived ? (['aws-native', 'spotto-derived'] as const) : (['aws-native'] as const), `${field}.sourceKind`);
  optionalString(source.sourceId, `${field}.sourceId`);
  optionalString(source.sourceName, `${field}.sourceName`);
  optionalTimestamp(source.generatedAt, `${field}.generatedAt`);
  optionalTimestamp(source.observedAt, `${field}.observedAt`);
  optionalStrings(source.notes, `${field}.notes`);
}

function validateMoney(value: unknown, field: string): void {
  const money = exact(value, ['amount', 'currency', 'source', 'windowStart', 'windowEnd', 'flags'], field);
  finiteNumber(money.amount, `${field}.amount`);
  requiredString(money.currency, `${field}.currency`);
  optionalString(money.source, `${field}.source`);
  optionalString(money.windowStart, `${field}.windowStart`);
  optionalString(money.windowEnd, `${field}.windowEnd`);
  optionalStrings(money.flags, `${field}.flags`);
}

function validateUtilization(value: unknown, field: string): void {
  const utilization = exact(value, ['trend', 'oneDay', 'sevenDay', 'thirtyDay', 'source'], field);
  optionalString(utilization.trend, `${field}.trend`);
  optionalNumber(utilization.oneDay, `${field}.oneDay`);
  optionalNumber(utilization.sevenDay, `${field}.sevenDay`);
  optionalNumber(utilization.thirtyDay, `${field}.thirtyDay`);
  optionalString(utilization.source, `${field}.source`);
}

function validatePricingContext(value: unknown, field: string): void {
  const pricing = exact(value, ['source', 'currency', 'assumptions', 'confidenceNotes', 'calculatorDeepLink'], field);
  requiredEnum(pricing.source, ['retail', 'negotiated', 'unknown', 'recommendation-apis'] as const, `${field}.source`);
  optionalString(pricing.currency, `${field}.currency`);
  optionalStrings(pricing.assumptions, `${field}.assumptions`);
  optionalString(pricing.confidenceNotes, `${field}.confidenceNotes`);
  optionalString(pricing.calculatorDeepLink, `${field}.calculatorDeepLink`);
}

function validateFreshness(value: unknown, field: string): void {
  const freshness = exact(value, ['status', 'generatedAt', 'entries', 'warnings'], field);
  requiredEnum(freshness.status, ['current', 'stale', 'partial', 'unavailable'] as const, `${field}.status`);
  isoTimestamp(freshness.generatedAt, `${field}.generatedAt`);
  records(freshness.entries, `${field}.entries`, (entry, itemField) => {
    const item = exact(entry, ['section', 'status', 'generatedAt', 'observedAt', 'lastSuccessfulSyncAt', 'reason', 'sourceKind'], itemField);
    requiredString(item.section, `${itemField}.section`);
    requiredEnum(item.status, ['current', 'stale', 'partial', 'unavailable'] as const, `${itemField}.status`);
    optionalTimestamp(item.generatedAt, `${itemField}.generatedAt`);
    optionalTimestamp(item.observedAt, `${itemField}.observedAt`);
    optionalTimestamp(item.lastSuccessfulSyncAt, `${itemField}.lastSuccessfulSyncAt`);
    optionalString(item.reason, `${itemField}.reason`);
    optionalString(item.sourceKind, `${itemField}.sourceKind`);
  });
  optionalStrings(freshness.warnings, `${field}.warnings`);
}

type RecordValidator = (value: unknown, field: string) => void;

function exact(value: unknown, allowed: readonly string[], field: string): Record<string, unknown> {
  const record = asRecord(value, field);
  assertExactKeys(record, allowed, field);
  return record;
}

function records(value: unknown, field: string, validate: RecordValidator, nonEmpty = false): void {
  if (!Array.isArray(value) || (nonEmpty && value.length === 0)) {
    throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
  }
  value.forEach((entry, index) => validate(entry, `${field}[${index}]`));
}

function optionalRecords(value: unknown, field: string, validate: RecordValidator): void {
  if (value !== undefined) records(value, field, validate);
}

function optionalRecord(value: unknown, field: string, validate: RecordValidator): void {
  if (value !== undefined) validate(value, field);
}

function strings(value: unknown, field: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  value.forEach((entry, index) => requiredString(entry, `${field}[${index}]`));
}

function optionalStrings(value: unknown, field: string): void {
  if (value !== undefined) strings(value, field);
}

function optionalString(value: unknown, field: string): void {
  if (value !== undefined) requiredString(value, field);
}

function optionalTimestamp(value: unknown, field: string): void {
  if (value !== undefined) isoTimestamp(value, field);
}

function optionalNumber(value: unknown, field: string): void {
  if (value !== undefined) finiteNumber(value, field);
}

function nonNegative(value: unknown, field: string): void {
  const number = finiteNumber(value, field);
  if (number < 0) throw new Error(`${field} must not be negative.`);
}
