"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeCurrentSpendV1 = exports.compareFinancialExactAmountsV1 = exports.CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const financialDataflow_1 = require("./financialDataflow");
const financialChargeCompositionValidation_1 = require("./financialChargeCompositionValidation");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialScopeBaseline_1 = require("./financialScopeBaseline");
exports.CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1 = 'current-spend-composition/shared-v1';
const exactPercentAtSixDecimalPlaces = (change, comparison) => {
    if (comparison.coefficient === 0n)
        return undefined;
    const numerator = change.coefficient * 100n * 10n ** BigInt(comparison.scale);
    const denominator = comparison.coefficient * 10n ** BigInt(change.scale);
    for (let scale = 0; scale <= 6; scale += 1) {
        const scaledNumerator = numerator * 10n ** BigInt(scale);
        if (scaledNumerator % denominator === 0n) {
            return (0, exactDecimal_1.formatExactDecimalValue)({ coefficient: scaledNumerator / denominator, scale });
        }
    }
    return undefined;
};
/**
 * Shared exact current-versus-comparison semantics for display composition.
 * Canonical analytics projections use the same direction/change/percentage
 * rules; this helper does not create or impersonate an analytics authority.
 */
const compareFinancialExactAmountsV1 = (request) => {
    if (request.currentAmount === undefined || request.comparisonAmount === undefined)
        return { status: 'unavailable' };
    try {
        const current = (0, exactDecimal_1.parseCanonicalDecimal)(request.currentAmount);
        const comparison = (0, exactDecimal_1.parseCanonicalDecimal)(request.comparisonAmount);
        if ((0, exactDecimal_1.formatExactDecimalValue)(current) !== request.currentAmount ||
            (0, exactDecimal_1.formatExactDecimalValue)(comparison) !== request.comparisonAmount) {
            return { status: 'unavailable' };
        }
        const change = (0, exactDecimal_1.subtractExactDecimalValues)(current, comparison);
        const direction = change.coefficient === 0n ? 'flat' : change.coefficient > 0n ? 'increasing' : 'decreasing';
        const percentChange = exactPercentAtSixDecimalPlaces(change, comparison);
        return {
            status: 'available',
            direction,
            changeAmount: (0, exactDecimal_1.formatExactDecimalValue)(change),
            ...(percentChange === undefined ? {} : { percentChange }),
        };
    }
    catch {
        return { status: 'unavailable' };
    }
};
exports.compareFinancialExactAmountsV1 = compareFinancialExactAmountsV1;
const uniqueSorted = (values) => {
    const result = Array.from(new Set(values)).sort();
    if (result.length === 0)
        throw new TypeError('Current-spend unavailable state requires at least one reason code.');
    return result;
};
/** Portable exact-decimal composition kernel shared by Cloud and browser runtimes. */
const composeCurrentSpendV1 = (request) => {
    if (request.coordinate.periodRole !== 'current-spend' && request.coordinate.periodRole !== 'comparison') {
        throw new TypeError('Current-spend composition requires a current-spend or comparison coordinate.');
    }
    if (request.baselines.length === 0)
        throw new TypeError('Current-spend composition requires an authoritative baseline member.');
    if (request.chargeCompositions.length > request.baselines.length) {
        throw new TypeError('Current-spend composition has more charge compositions than baseline members.');
    }
    const chargeCompositionByBaselineId = new Map(request.chargeCompositions.map(composition => [composition.baselineId, composition]));
    if (chargeCompositionByBaselineId.size !== request.chargeCompositions.length) {
        throw new TypeError('Current-spend composition cannot contain duplicate charge compositions.');
    }
    const sortedBaselines = [...request.baselines].sort((left, right) => left.scopeId.localeCompare(right.scopeId));
    if (new Set(sortedBaselines.map(baseline => baseline.scopeId)).size !== sortedBaselines.length) {
        throw new TypeError('Current-spend composition cannot contain duplicate member scopes.');
    }
    const selections = new Map();
    const members = sortedBaselines.map(baseline => {
        if (baseline.status === 'unavailable') {
            return { memberScopeId: baseline.scopeId, status: 'unavailable', reasonCode: baseline.unavailableReason };
        }
        if (baseline.baselineKind !== 'owner') {
            return { memberScopeId: baseline.scopeId, status: 'unavailable', reasonCode: 'charge-composition-requires-owner-baseline' };
        }
        const chargeComposition = chargeCompositionByBaselineId.get(baseline.baselineId);
        if (!chargeComposition || chargeComposition.ownerScopeId !== baseline.scopeId) {
            return { memberScopeId: baseline.scopeId, status: 'unavailable', reasonCode: 'charge-composition-unavailable' };
        }
        const selection = (0, financialChargeCompositionValidation_1.selectFinancialChargesV1)(chargeComposition, request.coordinate.chargeInclusionPolicyRef);
        selections.set(baseline.baselineId, selection);
        return {
            memberScopeId: baseline.scopeId,
            baselineId: baseline.baselineId,
            chargeCompositionId: chargeComposition.chargeCompositionId,
            status: 'included',
        };
    });
    const available = sortedBaselines.filter((baseline) => baseline.status === 'available');
    const includedBaselineIds = new Set(members.flatMap(member => (member.status === 'included' ? [member.baselineId] : [])));
    const includedBaselines = available.filter(baseline => includedBaselineIds.has(baseline.baselineId));
    const unavailableReasons = new Set(sortedBaselines
        .filter((baseline) => baseline.status === 'unavailable')
        .map(baseline => baseline.unavailableReason));
    members.filter(member => member.status === 'unavailable').forEach(member => unavailableReasons.add(member.reasonCode));
    const selectionReasonCodes = new Set();
    selections.forEach(selection => selection.reasonCodes?.forEach(reason => {
        selectionReasonCodes.add(reason);
        unavailableReasons.add(reason);
    }));
    if (available.some(baseline => !(0, financialScopeBaseline_1.isCompleteFinancialBaselinePeriodV2)(baseline.period)))
        unavailableReasons.add('coverage-incomplete');
    if (request.coordinate.accountingCurrency.status === 'unresolved') {
        unavailableReasons.add(request.coordinate.accountingCurrency.reasonCode);
    }
    const common = {
        schemaVersion: financialDataflow_1.FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
        contractVersion: financialDataflow_1.FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
        coordinate: request.coordinate,
        members,
        membershipDigest: (0, financialDataflowValidation_1.createCurrentSpendMembershipDigestV1)(members),
        algorithmVersion: request.algorithmVersion ?? exports.CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1,
    };
    const currency = request.coordinate.accountingCurrency.status === 'resolved' ? request.coordinate.accountingCurrency.currencyCode : undefined;
    let identity;
    if (!currency || includedBaselines.length === 0) {
        identity = {
            ...common,
            amount: {
                status: 'unavailable',
                reasonCodes: uniqueSorted(unavailableReasons.size > 0 ? unavailableReasons : ['evidence-unavailable']),
            },
        };
    }
    else {
        const includedSelections = members.flatMap(member => member.status === 'included' ? [selections.get(member.baselineId)] : []);
        const aggregateSelection = {
            status: includedSelections.some(selection => selection.status === 'partial') ? 'partial' : 'available',
            includedAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.includedAmount))),
            excludedAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.excludedAmount))),
            withheldAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.withheldAmount))),
            forecastEligibleAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.forecastEligibleAmount))),
            oneTimeAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.oneTimeAmount))),
            unknownRecurrenceAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.unknownRecurrenceAmount))),
            forecastStatus: includedSelections.some(selection => selection.forecastStatus === 'partial') ? 'partial' : 'available',
            currencyCode: currency,
            ...(selectionReasonCodes.size === 0 ? {} : { reasonCodes: uniqueSorted(selectionReasonCodes) }),
            ...(includedSelections.every(selection => selection.forecastReasonCodes === undefined)
                ? {}
                : {
                    forecastReasonCodes: uniqueSorted(includedSelections.flatMap(selection => selection.forecastReasonCodes ?? [])),
                }),
        };
        const knownAmount = aggregateSelection.includedAmount;
        identity =
            unavailableReasons.size === 0
                ? { ...common, amount: { status: 'available', amount: knownAmount, currencyCode: currency }, chargeSelection: aggregateSelection }
                : {
                    ...common,
                    amount: { status: 'partial', knownAmount, currencyCode: currency, reasonCodes: uniqueSorted(unavailableReasons) },
                    chargeSelection: aggregateSelection,
                };
    }
    const composition = { ...identity, compositionId: (0, financialDataflowValidation_1.createCurrentSpendCompositionIdV1)(identity) };
    if (!(0, financialDataflowValidation_1.isCurrentSpendCompositionCompatibleV1)(composition, sortedBaselines, request.chargeCompositions)) {
        throw new TypeError('Current-spend composition does not reconcile to its authoritative baseline members.');
    }
    return composition;
};
exports.composeCurrentSpendV1 = composeCurrentSpendV1;
//# sourceMappingURL=financialDataflowKernel.js.map