"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFinancialEligibilityAssessmentV1 = exports.validateFinancialEligibilityBaselineV1 = exports.createFinancialEligibilityAssessmentIdV1 = exports.canonicalizeFinancialEligibilityAssessmentIdentityV1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const sha256_1 = require("../common/sha256");
const financialSavingsAuthority_1 = require("./financialSavingsAuthority");
const financialSavingsCoordinateValidation_1 = require("./financialSavingsCoordinateValidation");
const financialScopeBaselineValidation_1 = require("./financialScopeBaselineValidation");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
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
const canonicalizeFinancialEligibilityAssessmentIdentityV1 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)(value.status === 'unavailable'
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
    }));
exports.canonicalizeFinancialEligibilityAssessmentIdentityV1 = canonicalizeFinancialEligibilityAssessmentIdentityV1;
const createFinancialEligibilityAssessmentIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialEligibilityAssessmentIdentityV1)(value))}`;
exports.createFinancialEligibilityAssessmentIdV1 = createFinancialEligibilityAssessmentIdV1;
const validateFinancialEligibilityBaselineV1 = (value, context) => {
    if (!(0, financialScopeBaselineValidation_1.isFinancialScopeBaselineEnvelopeV2)(value) || value.status !== 'available' || value.baselineKind !== 'owner')
        return false;
    if (value.scopeKind === 'subscription-residual')
        return false;
    const assessment = context.assessmentById.get(value.assessmentId);
    return ((0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(value.providerAccountRefs, context.authority.providerAccountRefs) &&
        context.bundleById.has(value.evidenceBundleId) &&
        assessment?.result === 'available' &&
        assessment.request.scopeId === value.scopeId &&
        assessment.evidenceBundleId === value.evidenceBundleId &&
        assessment.roleAssessments.some(role => role.role === 'eligibility-rule' && role.matchState === 'matched' && role.evidenceRefId !== undefined));
};
exports.validateFinancialEligibilityBaselineV1 = validateFinancialEligibilityBaselineV1;
const validateFinancialEligibilityAssessmentV1 = (value, context, baselineById) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
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
        ], value.status === 'available'
            ? ['ruleEvidenceRefId', 'eligibilityBaselineId', 'denominator', 'eligibleComponentIds', 'excludedComponentIds', 'currentBaselineMapping']
            : ['ruleEvidenceRefId', 'unavailableReason', 'eligibilityBaselineId']) ||
        value.schemaVersion !== financialSavingsAuthority_1.FINANCIAL_ELIGIBILITY_ASSESSMENT_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialSavingsAuthority_1.FINANCIAL_ELIGIBILITY_ASSESSMENT_CONTRACT_VERSION_V1 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.eligibilityId) ||
        value.provider !== 'azure' ||
        !Array.isArray(value.providerAccountRefs) ||
        value.providerAccountRefs.length === 0 ||
        value.providerAccountRefs.length > 64 ||
        !value.providerAccountRefs.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) ||
        new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(value.providerAccountRefs, context.authority.providerAccountRefs) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.scopeId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.scenarioId) ||
        typeof value.benefitKind !== 'string' ||
        !BENEFIT_KINDS.has(value.benefitKind) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.ruleVersion) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.evaluatedAt) ||
        Date.parse(value.evaluatedAt) > Date.parse(context.authority.artifactGeneration.generatedAt))
        return false;
    if (value.status === 'unavailable') {
        const ruleEvidence = typeof value.ruleEvidenceRefId === 'string' ? context.evidenceById.get(value.ruleEvidenceRefId) : undefined;
        if (typeof value.unavailableReason !== 'string' ||
            !UNAVAILABLE_REASONS.has(value.unavailableReason) ||
            (value.ruleEvidenceRefId !== undefined && (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.ruleEvidenceRefId) || ruleEvidence?.role !== 'eligibility-rule')) ||
            (value.ruleEvidenceRefId === undefined && value.unavailableReason !== 'rule-evidence-unavailable') ||
            (value.eligibilityBaselineId !== undefined && !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.eligibilityBaselineId)))
            return false;
        const { eligibilityId: _eligibilityId, ...identity } = value;
        return value.eligibilityId === (0, exports.createFinancialEligibilityAssessmentIdV1)(identity);
    }
    if (value.status !== 'available' || !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.ruleEvidenceRefId) || !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.eligibilityBaselineId)) {
        return false;
    }
    const baseline = baselineById.get(value.eligibilityBaselineId);
    if (!baseline || baseline.scopeId !== value.scopeId || !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.denominator))
        return false;
    const baselineBundle = context.bundleById.get(baseline.evidenceBundleId);
    const ruleEvidence = baselineBundle?.references.find(reference => reference.evidenceRefId === value.ruleEvidenceRefId);
    const baselineAssessment = context.assessmentById.get(baseline.assessmentId);
    if (ruleEvidence?.role !== 'eligibility-rule' ||
        ruleEvidence.revisionId !== value.ruleVersion ||
        !baselineAssessment?.roleAssessments.some(role => role.role === 'eligibility-rule' && role.matchState === 'matched' && role.evidenceRefId === value.ruleEvidenceRefId))
        return false;
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.denominator, ['denominatorId', 'kind', 'componentIds', 'amount', 'currencyCode']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.denominator.denominatorId) ||
        value.denominator.kind !== 'eligible-spend' ||
        !Array.isArray(value.denominator.componentIds) ||
        value.denominator.componentIds.length === 0 ||
        value.denominator.componentIds.length > 20000 ||
        !value.denominator.componentIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
        new Set(value.denominator.componentIds).size !== value.denominator.componentIds.length ||
        typeof value.denominator.amount !== 'string' ||
        typeof value.denominator.currencyCode !== 'string' ||
        value.denominator.currencyCode !== baseline.total.currencyCode ||
        !Array.isArray(value.eligibleComponentIds) ||
        value.eligibleComponentIds.length === 0 ||
        value.eligibleComponentIds.length > 20000 ||
        !value.eligibleComponentIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
        new Set(value.eligibleComponentIds).size !== value.eligibleComponentIds.length ||
        !Array.isArray(value.excludedComponentIds) ||
        value.excludedComponentIds.length > 20000 ||
        !value.excludedComponentIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
        new Set(value.excludedComponentIds).size !== value.excludedComponentIds.length ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(value.denominator.componentIds, value.eligibleComponentIds) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)([...value.eligibleComponentIds, ...value.excludedComponentIds], baseline.components.map(component => component.componentId)) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.currentBaselineMapping) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.currentBaselineMapping, ['currentBaselineId', 'compatibility', 'mappings']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentBaselineMapping.currentBaselineId) ||
        value.currentBaselineMapping.compatibility !== 'compatible' ||
        !Array.isArray(value.currentBaselineMapping.mappings) ||
        value.currentBaselineMapping.mappings.length === 0 ||
        value.currentBaselineMapping.mappings.length > 20000)
        return false;
    const excludedComponentIds = new Set(value.excludedComponentIds);
    if (value.eligibleComponentIds.some(componentId => excludedComponentIds.has(componentId)))
        return false;
    const baselineComponentById = new Map(baseline.components.map(component => [component.componentId, component]));
    try {
        const eligibleAmount = (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(value.eligibleComponentIds.map(componentId => baselineComponentById.get(componentId).amount)));
        if (eligibleAmount !== value.denominator.amount ||
            value.denominator.denominatorId !==
                (0, financialSavingsCoordinateValidation_1.createFinancialSavingsDenominatorIdV1)({
                    kind: 'eligible-spend',
                    baselineId: baseline.baselineId,
                    componentIds: [value.denominator.componentIds[0], ...value.denominator.componentIds.slice(1)],
                    amount: value.denominator.amount,
                    currencyCode: value.denominator.currencyCode,
                }))
            return false;
    }
    catch {
        return false;
    }
    const currentComponentIds = [];
    const mappedEligibilityComponentIds = [];
    for (const mapping of value.currentBaselineMapping.mappings) {
        if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(mapping) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(mapping, ['currentComponentId', 'eligibilityComponentIds']) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(mapping.currentComponentId) ||
            !Array.isArray(mapping.eligibilityComponentIds) ||
            mapping.eligibilityComponentIds.length === 0 ||
            mapping.eligibilityComponentIds.length > 20000 ||
            !mapping.eligibilityComponentIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
            new Set(mapping.eligibilityComponentIds).size !== mapping.eligibilityComponentIds.length)
            return false;
        currentComponentIds.push(mapping.currentComponentId);
        mappedEligibilityComponentIds.push(...mapping.eligibilityComponentIds);
    }
    if (new Set(currentComponentIds).size !== currentComponentIds.length ||
        new Set(mappedEligibilityComponentIds).size !== mappedEligibilityComponentIds.length ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(mappedEligibilityComponentIds, value.eligibleComponentIds))
        return false;
    const { eligibilityId: _eligibilityId, ...identity } = value;
    return value.eligibilityId === (0, exports.createFinancialEligibilityAssessmentIdV1)(identity);
};
exports.validateFinancialEligibilityAssessmentV1 = validateFinancialEligibilityAssessmentV1;
//# sourceMappingURL=financialEligibilityAssessmentValidation.js.map