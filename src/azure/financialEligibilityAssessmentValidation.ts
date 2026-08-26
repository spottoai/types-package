import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal';
import { sha256Utf8 } from '../common/sha256';
import type { FinancialAuthorityViewV1 } from './financialAuthorityView';
import {
  FINANCIAL_ELIGIBILITY_ASSESSMENT_CONTRACT_VERSION_V1,
  FINANCIAL_ELIGIBILITY_ASSESSMENT_SCHEMA_VERSION_V1,
  type FinancialEligibilityAssessmentIdentityPreimageV1,
  type FinancialEligibilityAssessmentV1,
} from './financialSavingsAuthority';
import { createFinancialSavingsDenominatorIdV1 } from './financialSavingsCoordinateValidation';
import type { AvailableOwnerFinancialScopeBaselineV2 } from './financialScopeBaseline';
import { isFinancialScopeBaselineEnvelopeV2 } from './financialScopeBaselineValidation';
import type { FinancialEvidenceAssessmentV1, FinancialEvidenceBundleV1, FinancialEvidenceReferenceV1 } from './financialScopeEvidence';
import {
  canonicalizeFinancialSavingsJsonValue,
  hasExactFinancialSavingsFields,
  haveSameFinancialSavingsSet,
  isFinancialSavingsHash,
  isFinancialSavingsIdentity,
  isFinancialSavingsIsoInstant,
  isFinancialSavingsRecord,
} from './financialSavingsAuthorityValidationPrimitives';

const BENEFIT_KINDS = new Set(['savings-plan', 'reservation', 'licence', 'other']);
const UNAVAILABLE_REASONS = new Set([
  'rule-evidence-unavailable',
  'eligibility-baseline-unavailable',
  'eligible-components-unavailable',
  'denominator-unavailable',
  'current-baseline-mapping-unavailable',
  'currency-conflict',
  'reconciliation-failure',
]);

export interface FinancialEligibilityValidationContextV1 {
  authority: FinancialAuthorityViewV1;
  bundleById: Map<string, FinancialEvidenceBundleV1>;
  assessmentById: Map<string, FinancialEvidenceAssessmentV1>;
  evidenceById: Map<string, FinancialEvidenceReferenceV1>;
}

export const canonicalizeFinancialEligibilityAssessmentIdentityV1 = (value: FinancialEligibilityAssessmentIdentityPreimageV1): string =>
  JSON.stringify(
    canonicalizeFinancialSavingsJsonValue(
      value.status === 'unavailable'
        ? { ...value, providerAccountRefs: [...value.providerAccountRefs].sort() }
        : {
            ...value,
            providerAccountRefs: [...value.providerAccountRefs].sort(),
            denominator: { ...value.denominator, componentIds: [...value.denominator.componentIds].sort() },
            eligibleComponentIds: [...value.eligibleComponentIds].sort(),
            excludedComponentIds: [...value.excludedComponentIds].sort(),
            currentBaselineMapping: {
              ...value.currentBaselineMapping,
              mappings: [...value.currentBaselineMapping.mappings]
                .sort((left, right) => left.currentComponentId.localeCompare(right.currentComponentId))
                .map(mapping => ({ ...mapping, eligibilityComponentIds: [...mapping.eligibilityComponentIds].sort() })),
            },
          }
    )
  );

export const createFinancialEligibilityAssessmentIdV1 = (value: FinancialEligibilityAssessmentIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialEligibilityAssessmentIdentityV1(value))}`;

export const validateFinancialEligibilityBaselineV1 = (
  value: unknown,
  context: FinancialEligibilityValidationContextV1
): value is AvailableOwnerFinancialScopeBaselineV2 => {
  if (!isFinancialScopeBaselineEnvelopeV2(value) || value.status !== 'available' || value.baselineKind !== 'owner') return false;
  if (value.scopeKind === 'subscription-residual') return false;
  const assessment = context.assessmentById.get(value.assessmentId);
  return (
    haveSameFinancialSavingsSet(value.providerAccountRefs, context.authority.providerAccountRefs) &&
    context.bundleById.has(value.evidenceBundleId) &&
    assessment?.result === 'available' &&
    assessment.request.scopeId === value.scopeId &&
    assessment.evidenceBundleId === value.evidenceBundleId &&
    assessment.roleAssessments.some(role => role.role === 'eligibility-rule' && role.matchState === 'matched' && role.evidenceRefId !== undefined)
  );
};

export const validateFinancialEligibilityAssessmentV1 = (
  value: unknown,
  context: FinancialEligibilityValidationContextV1,
  baselineById: Map<string, AvailableOwnerFinancialScopeBaselineV2>
): value is FinancialEligibilityAssessmentV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(
      value,
      [
        'schemaVersion',
        'contractVersion',
        'eligibilityId',
        'provider',
        'providerAccountRefs',
        'scopeId',
        'scenarioId',
        'benefitKind',
        'ruleVersion',
        'evaluatedAt',
        'status',
      ],
      value.status === 'available'
        ? ['ruleEvidenceRefId', 'eligibilityBaselineId', 'denominator', 'eligibleComponentIds', 'excludedComponentIds', 'currentBaselineMapping']
        : ['ruleEvidenceRefId', 'unavailableReason', 'eligibilityBaselineId']
    ) ||
    value.schemaVersion !== FINANCIAL_ELIGIBILITY_ASSESSMENT_SCHEMA_VERSION_V1 ||
    value.contractVersion !== FINANCIAL_ELIGIBILITY_ASSESSMENT_CONTRACT_VERSION_V1 ||
    !isFinancialSavingsHash(value.eligibilityId) ||
    value.provider !== 'azure' ||
    !Array.isArray(value.providerAccountRefs) ||
    value.providerAccountRefs.length === 0 ||
    value.providerAccountRefs.length > 64 ||
    !value.providerAccountRefs.every(isFinancialSavingsIdentity) ||
    new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
    !haveSameFinancialSavingsSet(value.providerAccountRefs, context.authority.providerAccountRefs) ||
    !isFinancialSavingsIdentity(value.scopeId) ||
    !isFinancialSavingsIdentity(value.scenarioId) ||
    typeof value.benefitKind !== 'string' ||
    !BENEFIT_KINDS.has(value.benefitKind) ||
    !isFinancialSavingsIdentity(value.ruleVersion) ||
    !isFinancialSavingsIsoInstant(value.evaluatedAt) ||
    Date.parse(value.evaluatedAt) > Date.parse(context.authority.artifactGeneration.generatedAt)
  )
    return false;

  if (value.status === 'unavailable') {
    const ruleEvidence = typeof value.ruleEvidenceRefId === 'string' ? context.evidenceById.get(value.ruleEvidenceRefId) : undefined;
    if (
      typeof value.unavailableReason !== 'string' ||
      !UNAVAILABLE_REASONS.has(value.unavailableReason) ||
      (value.ruleEvidenceRefId !== undefined && (!isFinancialSavingsHash(value.ruleEvidenceRefId) || ruleEvidence?.role !== 'eligibility-rule')) ||
      (value.ruleEvidenceRefId === undefined && value.unavailableReason !== 'rule-evidence-unavailable') ||
      (value.eligibilityBaselineId !== undefined && !isFinancialSavingsHash(value.eligibilityBaselineId))
    )
      return false;
    const { eligibilityId: _eligibilityId, ...identity } = value;
    return value.eligibilityId === createFinancialEligibilityAssessmentIdV1(identity as FinancialEligibilityAssessmentIdentityPreimageV1);
  }
  if (value.status !== 'available' || !isFinancialSavingsHash(value.ruleEvidenceRefId) || !isFinancialSavingsHash(value.eligibilityBaselineId)) {
    return false;
  }
  const baseline = baselineById.get(value.eligibilityBaselineId);
  if (!baseline || baseline.scopeId !== value.scopeId || !isFinancialSavingsRecord(value.denominator)) return false;
  const baselineBundle = context.bundleById.get(baseline.evidenceBundleId);
  const ruleEvidence = baselineBundle?.references.find(reference => reference.evidenceRefId === value.ruleEvidenceRefId);
  const baselineAssessment = context.assessmentById.get(baseline.assessmentId);
  if (
    ruleEvidence?.role !== 'eligibility-rule' ||
    ruleEvidence.revisionId !== value.ruleVersion ||
    !baselineAssessment?.roleAssessments.some(
      role => role.role === 'eligibility-rule' && role.matchState === 'matched' && role.evidenceRefId === value.ruleEvidenceRefId
    )
  )
    return false;
  if (
    !hasExactFinancialSavingsFields(value.denominator, ['denominatorId', 'kind', 'componentIds', 'amount', 'currencyCode']) ||
    !isFinancialSavingsHash(value.denominator.denominatorId) ||
    value.denominator.kind !== 'eligible-spend' ||
    !Array.isArray(value.denominator.componentIds) ||
    value.denominator.componentIds.length === 0 ||
    value.denominator.componentIds.length > 20_000 ||
    !value.denominator.componentIds.every(isFinancialSavingsHash) ||
    new Set(value.denominator.componentIds).size !== value.denominator.componentIds.length ||
    typeof value.denominator.amount !== 'string' ||
    typeof value.denominator.currencyCode !== 'string' ||
    value.denominator.currencyCode !== baseline.total.currencyCode ||
    !Array.isArray(value.eligibleComponentIds) ||
    value.eligibleComponentIds.length === 0 ||
    value.eligibleComponentIds.length > 20_000 ||
    !value.eligibleComponentIds.every(isFinancialSavingsHash) ||
    new Set(value.eligibleComponentIds).size !== value.eligibleComponentIds.length ||
    !Array.isArray(value.excludedComponentIds) ||
    value.excludedComponentIds.length > 20_000 ||
    !value.excludedComponentIds.every(isFinancialSavingsHash) ||
    new Set(value.excludedComponentIds).size !== value.excludedComponentIds.length ||
    !haveSameFinancialSavingsSet(value.denominator.componentIds, value.eligibleComponentIds) ||
    !haveSameFinancialSavingsSet(
      [...value.eligibleComponentIds, ...value.excludedComponentIds],
      baseline.components.map(component => component.componentId)
    ) ||
    !isFinancialSavingsRecord(value.currentBaselineMapping) ||
    !hasExactFinancialSavingsFields(value.currentBaselineMapping, ['currentBaselineId', 'compatibility', 'mappings']) ||
    !isFinancialSavingsHash(value.currentBaselineMapping.currentBaselineId) ||
    value.currentBaselineMapping.compatibility !== 'compatible' ||
    !Array.isArray(value.currentBaselineMapping.mappings) ||
    value.currentBaselineMapping.mappings.length === 0 ||
    value.currentBaselineMapping.mappings.length > 20_000
  )
    return false;
  const excludedComponentIds = new Set(value.excludedComponentIds);
  if (value.eligibleComponentIds.some(componentId => excludedComponentIds.has(componentId))) return false;
  const baselineComponentById = new Map(baseline.components.map(component => [component.componentId, component]));
  try {
    const eligibleAmount = formatExactDecimalValue(
      sumCanonicalDecimals(value.eligibleComponentIds.map(componentId => baselineComponentById.get(componentId)!.amount))
    );
    if (
      eligibleAmount !== value.denominator.amount ||
      value.denominator.denominatorId !==
        createFinancialSavingsDenominatorIdV1({
          kind: 'eligible-spend',
          baselineId: baseline.baselineId,
          componentIds: [value.denominator.componentIds[0]!, ...value.denominator.componentIds.slice(1)],
          amount: value.denominator.amount,
          currencyCode: value.denominator.currencyCode,
        })
    )
      return false;
  } catch {
    return false;
  }
  const currentComponentIds: string[] = [];
  const mappedEligibilityComponentIds: string[] = [];
  for (const mapping of value.currentBaselineMapping.mappings) {
    if (
      !isFinancialSavingsRecord(mapping) ||
      !hasExactFinancialSavingsFields(mapping, ['currentComponentId', 'eligibilityComponentIds']) ||
      !isFinancialSavingsHash(mapping.currentComponentId) ||
      !Array.isArray(mapping.eligibilityComponentIds) ||
      mapping.eligibilityComponentIds.length === 0 ||
      mapping.eligibilityComponentIds.length > 20_000 ||
      !mapping.eligibilityComponentIds.every(isFinancialSavingsHash) ||
      new Set(mapping.eligibilityComponentIds).size !== mapping.eligibilityComponentIds.length
    )
      return false;
    currentComponentIds.push(mapping.currentComponentId);
    mappedEligibilityComponentIds.push(...mapping.eligibilityComponentIds);
  }
  if (
    new Set(currentComponentIds).size !== currentComponentIds.length ||
    new Set(mappedEligibilityComponentIds).size !== mappedEligibilityComponentIds.length ||
    !haveSameFinancialSavingsSet(mappedEligibilityComponentIds, value.eligibleComponentIds)
  )
    return false;
  const { eligibilityId: _eligibilityId, ...identity } = value;
  return value.eligibilityId === createFinancialEligibilityAssessmentIdV1(identity as FinancialEligibilityAssessmentIdentityPreimageV1);
};
