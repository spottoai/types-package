import {
  formatExactDecimalValue,
  parseCanonicalDecimal,
  subtractExactDecimalValues,
  sumCanonicalDecimals,
  type ExactDecimalValue,
} from '../common/exactDecimal';
import {
  FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  type CurrentSpendCompositionIdentityPreimageV1,
  type CurrentSpendCompositionMemberV1,
  type CurrentSpendCompositionV1,
  type FinancialDataflowCoordinateV1,
} from './financialDataflow';
import type { FinancialChargeCompositionV1, FinancialChargeSelectionV1 } from './financialChargeComposition';
import { selectFinancialChargesV1 } from './financialChargeCompositionValidation';
import {
  createCurrentSpendCompositionIdV1,
  createCurrentSpendMembershipDigestV1,
  isCurrentSpendCompositionCompatibleV1,
} from './financialDataflowValidation';
import { isCompleteFinancialBaselinePeriodV2, type FinancialScopeBaselineEnvelopeV2 } from './financialScopeBaseline';

export const CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1 = 'current-spend-composition/shared-v1' as const;

export interface CurrentSpendCompositionKernelRequestV1 {
  coordinate: FinancialDataflowCoordinateV1;
  baselines: FinancialScopeBaselineEnvelopeV2[];
  chargeCompositions: FinancialChargeCompositionV1[];
  algorithmVersion?: string;
}

export type FinancialExactTrendComparisonV1 =
  | { status: 'unavailable' }
  | {
      status: 'available';
      direction: 'increasing' | 'decreasing' | 'flat';
      changeAmount: string;
      /** Present only when the exact ratio has a canonical representation at six or fewer decimal places. */
      percentChange?: string;
    };

const exactPercentAtSixDecimalPlaces = (change: ExactDecimalValue, comparison: ExactDecimalValue): string | undefined => {
  if (comparison.coefficient === 0n) return undefined;
  const numerator = change.coefficient * 100n * 10n ** BigInt(comparison.scale);
  const denominator = comparison.coefficient * 10n ** BigInt(change.scale);
  for (let scale = 0; scale <= 6; scale += 1) {
    const scaledNumerator = numerator * 10n ** BigInt(scale);
    if (scaledNumerator % denominator === 0n) {
      return formatExactDecimalValue({ coefficient: scaledNumerator / denominator, scale });
    }
  }
  return undefined;
};

/**
 * Shared exact current-versus-comparison semantics for display composition.
 * Canonical analytics projections use the same direction/change/percentage
 * rules; this helper does not create or impersonate an analytics authority.
 */
export const compareFinancialExactAmountsV1 = (request: {
  currentAmount?: string;
  comparisonAmount?: string;
}): FinancialExactTrendComparisonV1 => {
  if (request.currentAmount === undefined || request.comparisonAmount === undefined) return { status: 'unavailable' };
  try {
    const current = parseCanonicalDecimal(request.currentAmount);
    const comparison = parseCanonicalDecimal(request.comparisonAmount);
    if (
      formatExactDecimalValue(current) !== request.currentAmount ||
      formatExactDecimalValue(comparison) !== request.comparisonAmount
    ) {
      return { status: 'unavailable' };
    }
    const change = subtractExactDecimalValues(current, comparison);
    const direction = change.coefficient === 0n ? 'flat' : change.coefficient > 0n ? 'increasing' : 'decreasing';
    const percentChange = exactPercentAtSixDecimalPlaces(change, comparison);
    return {
      status: 'available',
      direction,
      changeAmount: formatExactDecimalValue(change),
      ...(percentChange === undefined ? {} : { percentChange }),
    };
  } catch {
    return { status: 'unavailable' };
  }
};

const uniqueSorted = (values: Iterable<string>): [string, ...string[]] => {
  const result = Array.from(new Set(values)).sort();
  if (result.length === 0) throw new TypeError('Current-spend unavailable state requires at least one reason code.');
  return result as [string, ...string[]];
};

/** Portable exact-decimal composition kernel shared by Cloud and browser runtimes. */
export const composeCurrentSpendV1 = (request: CurrentSpendCompositionKernelRequestV1): CurrentSpendCompositionV1 => {
  if (request.coordinate.periodRole !== 'current-spend' && request.coordinate.periodRole !== 'comparison') {
    throw new TypeError('Current-spend composition requires a current-spend or comparison coordinate.');
  }
  if (request.baselines.length === 0) throw new TypeError('Current-spend composition requires an authoritative baseline member.');
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
  const selections = new Map<string, FinancialChargeSelectionV1>();
  const members: CurrentSpendCompositionMemberV1[] = sortedBaselines.map(baseline => {
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
    const selection = selectFinancialChargesV1(chargeComposition, request.coordinate.chargeInclusionPolicyRef);
    selections.set(baseline.baselineId, selection);
    return {
      memberScopeId: baseline.scopeId,
      baselineId: baseline.baselineId,
      chargeCompositionId: chargeComposition.chargeCompositionId,
      status: 'included',
    };
  });
  const available = sortedBaselines.filter(
    (baseline): baseline is Extract<FinancialScopeBaselineEnvelopeV2, { status: 'available' }> => baseline.status === 'available'
  );
  const includedBaselineIds = new Set(
    members.flatMap(member => (member.status === 'included' ? [member.baselineId] : []))
  );
  const includedBaselines = available.filter(baseline => includedBaselineIds.has(baseline.baselineId));
  const unavailableReasons = new Set<string>(
    sortedBaselines
      .filter((baseline): baseline is Extract<FinancialScopeBaselineEnvelopeV2, { status: 'unavailable' }> => baseline.status === 'unavailable')
      .map(baseline => baseline.unavailableReason)
  );
  members.filter(member => member.status === 'unavailable').forEach(member => unavailableReasons.add(member.reasonCode));
  const selectionReasonCodes = new Set<string>();
  selections.forEach(selection =>
    selection.reasonCodes?.forEach(reason => {
      selectionReasonCodes.add(reason);
      unavailableReasons.add(reason);
    })
  );
  if (available.some(baseline => !isCompleteFinancialBaselinePeriodV2(baseline.period))) unavailableReasons.add('coverage-incomplete');
  if (request.coordinate.accountingCurrency.status === 'unresolved') {
    unavailableReasons.add(request.coordinate.accountingCurrency.reasonCode);
  }
  const common = {
    schemaVersion: FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
    contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
    coordinate: request.coordinate,
    members,
    membershipDigest: createCurrentSpendMembershipDigestV1(members),
    algorithmVersion: request.algorithmVersion ?? CURRENT_SPEND_COMPOSITION_ALGORITHM_VERSION_V1,
  };
  const currency = request.coordinate.accountingCurrency.status === 'resolved' ? request.coordinate.accountingCurrency.currencyCode : undefined;
  let identity: CurrentSpendCompositionIdentityPreimageV1;
  if (!currency || includedBaselines.length === 0) {
    identity = {
      ...common,
      amount: {
        status: 'unavailable',
        reasonCodes: uniqueSorted(unavailableReasons.size > 0 ? unavailableReasons : ['evidence-unavailable']),
      },
    };
  } else {
    const includedSelections = members.flatMap(member =>
      member.status === 'included' ? [selections.get(member.baselineId)!] : []
    );
    const aggregateSelection: FinancialChargeSelectionV1 = {
      status: includedSelections.some(selection => selection.status === 'partial') ? 'partial' : 'available',
      includedAmount: formatExactDecimalValue(sumCanonicalDecimals(includedSelections.map(selection => selection.includedAmount))),
      excludedAmount: formatExactDecimalValue(sumCanonicalDecimals(includedSelections.map(selection => selection.excludedAmount))),
      withheldAmount: formatExactDecimalValue(sumCanonicalDecimals(includedSelections.map(selection => selection.withheldAmount))),
      forecastEligibleAmount: formatExactDecimalValue(
        sumCanonicalDecimals(includedSelections.map(selection => selection.forecastEligibleAmount))
      ),
      oneTimeAmount: formatExactDecimalValue(sumCanonicalDecimals(includedSelections.map(selection => selection.oneTimeAmount))),
      unknownRecurrenceAmount: formatExactDecimalValue(
        sumCanonicalDecimals(includedSelections.map(selection => selection.unknownRecurrenceAmount))
      ),
      forecastStatus: includedSelections.some(selection => selection.forecastStatus === 'partial') ? 'partial' : 'available',
      currencyCode: currency,
      ...(selectionReasonCodes.size === 0 ? {} : { reasonCodes: uniqueSorted(selectionReasonCodes) }),
      ...(includedSelections.every(selection => selection.forecastReasonCodes === undefined)
        ? {}
        : {
            forecastReasonCodes: uniqueSorted(
              includedSelections.flatMap(selection => selection.forecastReasonCodes ?? [])
            ),
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
  const composition = { ...identity, compositionId: createCurrentSpendCompositionIdV1(identity) } as CurrentSpendCompositionV1;
  if (!isCurrentSpendCompositionCompatibleV1(composition, sortedBaselines, request.chargeCompositions)) {
    throw new TypeError('Current-spend composition does not reconcile to its authoritative baseline members.');
  }
  return composition;
};
