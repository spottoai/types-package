const compareCodePoints = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const canonicalInterval = (interval) => ({
    startDate: interval.startDate,
    endDateExclusive: interval.endDateExclusive,
    dateBasis: interval.dateBasis,
    ...(interval.timeZone === undefined ? {} : { timeZone: interval.timeZone }),
});
const canonicalEvidenceReference = (reference) => ({
    evidenceRefId: reference.evidenceRefId,
    role: reference.role,
    sourceKind: reference.sourceKind,
    ...(reference.generationId === undefined ? {} : { generationId: reference.generationId }),
    ...(reference.revisionId === undefined ? {} : { revisionId: reference.revisionId }),
    digestAlgorithm: reference.digestAlgorithm,
    evidenceDigest: reference.evidenceDigest,
    intrinsicTime: {
        kind: reference.intrinsicTime.kind,
        at: reference.intrinsicTime.at,
    },
    ...(reference.effectivePeriod === undefined ? {} : { effectivePeriod: canonicalInterval(reference.effectivePeriod) }),
});
/** Canonical UTF-8 text for a validated immutable evidence-bundle identity. */
export const canonicalizeValidatedFinancialEvidenceBundleIdentityV1 = (value) => JSON.stringify({
    schemaVersion: value.schemaVersion,
    contractVersion: value.contractVersion,
    references: [...value.references]
        .sort((left, right) => compareCodePoints(left.evidenceRefId, right.evidenceRefId))
        .map(canonicalEvidenceReference),
});
/** Canonical UTF-8 text for a validated evidence-assessment identity. */
export const canonicalizeValidatedFinancialEvidenceAssessmentIdentityV1 = (value) => JSON.stringify({
    schemaVersion: value.schemaVersion,
    contractVersion: value.contractVersion,
    policyVersion: value.policyVersion,
    evaluatedAt: value.evaluatedAt,
    request: {
        provider: value.request.provider,
        providerAccountRefs: [...value.request.providerAccountRefs].sort(compareCodePoints),
        scopeKind: value.request.scopeKind,
        scopeId: value.request.scopeId,
        requestedEvidenceRoles: [...value.request.requestedEvidenceRoles].sort(compareCodePoints),
    },
    roleAssessments: [...value.roleAssessments]
        .sort((left, right) => compareCodePoints(left.role, right.role))
        .map(item => ({
        role: item.role,
        support: item.support,
        requestState: item.requestState,
        productionState: item.productionState,
        matchState: item.matchState,
        ...(item.evidenceRefId === undefined ? {} : { evidenceRefId: item.evidenceRefId }),
    })),
    completeness: value.completeness,
    reconciliation: value.reconciliation,
    freshness: value.freshness,
    result: value.result,
    primaryReason: value.primaryReason,
    supportingReasons: [...value.supportingReasons].sort(compareCodePoints),
    ...(value.evidenceBundleId === undefined ? {} : { evidenceBundleId: value.evidenceBundleId }),
    summary: {
        requestedRoleCount: value.summary.requestedRoleCount,
        producedRoleCount: value.summary.producedRoleCount,
        matchedRoleCount: value.summary.matchedRoleCount,
    },
});
const canonicalCoverage = (coverage) => ({
    coverageId: coverage.coverageId,
    interval: canonicalInterval(coverage.interval),
    settlementState: coverage.settlementState,
    evidenceRefIds: [...coverage.evidenceRefIds].sort(compareCodePoints),
});
const canonicalPeriod = (period) => ({
    windowKind: period.windowKind,
    requested: canonicalInterval(period.requested),
    ...(period.observed === undefined ? {} : { observed: canonicalInterval(period.observed) }),
    ...(period.providerBillingPeriodId === undefined ? {} : { providerBillingPeriodId: period.providerBillingPeriodId }),
    coverage: [...period.coverage].sort((left, right) => compareCodePoints(left.coverageId, right.coverageId)).map(canonicalCoverage),
    gaps: [...period.gaps]
        .sort((left, right) => compareCodePoints(`${left.startDate}:${left.endDateExclusive}`, `${right.startDate}:${right.endDateExclusive}`))
        .map(canonicalInterval),
});
const canonicalComponent = (component) => ({
    componentId: component.componentId,
    billableIdentity: component.billableIdentity,
    ownerScopeId: component.ownerScopeId,
    chargeClassification: component.chargeClassification,
    amount: component.amount,
    evidenceRefIds: [...component.evidenceRefIds].sort(compareCodePoints),
    coverageIds: [...component.coverageIds].sort(compareCodePoints),
    ...(component.quantity === undefined ? {} : { quantity: component.quantity }),
    ...(component.effectiveRate === undefined ? {} : { effectiveRate: component.effectiveRate }),
});
/** Canonical UTF-8 text for a validated owner or aggregate baseline identity. */
export const canonicalizeValidatedFinancialScopeBaselineIdentityV2 = (value) => {
    const common = {
        schemaVersion: value.schemaVersion,
        contractVersion: value.contractVersion,
        provider: value.provider,
        providerAccountRefs: [...value.providerAccountRefs].sort(compareCodePoints),
        scopeKind: value.scopeKind,
        scopeId: value.scopeId,
        period: canonicalPeriod(value.period),
        costBasis: value.costBasis,
        estimateLens: value.estimateLens,
        ...(value.requestedCurrencyCode === undefined ? {} : { requestedCurrencyCode: value.requestedCurrencyCode }),
        assessmentId: value.assessmentId,
        baselineKind: value.baselineKind,
    };
    if (value.baselineKind === 'owner') {
        return JSON.stringify({
            ...common,
            evidenceBundleId: value.evidenceBundleId,
            accountingCurrency: {
                currencyCode: value.accountingCurrency.currencyCode,
                sourceCurrencyCode: value.accountingCurrency.sourceCurrencyCode,
                evidenceRefIds: [...value.accountingCurrency.evidenceRefIds].sort(compareCodePoints),
                ...(value.accountingCurrency.fxEvidenceRefId === undefined ? {} : { fxEvidenceRefId: value.accountingCurrency.fxEvidenceRefId }),
            },
            chargeInclusionPolicyRef: value.chargeInclusionPolicyRef,
            components: [...value.components].sort((left, right) => compareCodePoints(left.componentId, right.componentId)).map(canonicalComponent),
        });
    }
    return JSON.stringify({
        ...common,
        accountingCurrencyCode: value.accountingCurrencyCode,
        memberBaselineIds: [...value.memberBaselineIds].sort(compareCodePoints),
        compatibility: value.compatibility,
    });
};
