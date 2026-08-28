import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal.js';
import { FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1, FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1, } from './financialChargeComposition.js';
import { createFinancialChargeCompositionIdV1 } from './financialChargeCompositionValidation.js';
const bucketKey = (component) => `${component.chargeSource}\u0000${component.chargeRecurrence}\u0000${component.chargeClassification}`;
export const createFinancialChargeCompositionV1 = (request) => {
    if (!Array.isArray(request.components) || request.components.length === 0 || request.components.length > 20000) {
        throw new TypeError('Financial charge composition requires a bounded non-empty component collection.');
    }
    if (new Set(request.components.map(component => component.componentId)).size !== request.components.length) {
        throw new TypeError('Financial charge composition cannot classify one component more than once.');
    }
    const groups = new Map();
    for (const component of request.components) {
        const key = bucketKey(component);
        const group = groups.get(key);
        if (group)
            group.push(component);
        else
            groups.set(key, [component]);
    }
    const buckets = [...groups.values()]
        .map(group => ({
        chargeSource: group[0].chargeSource,
        chargeRecurrence: group[0].chargeRecurrence,
        chargeClassification: group[0].chargeClassification,
        amount: formatExactDecimalValue(sumCanonicalDecimals(group.map(component => component.amount))),
        componentIds: [...new Set(group.map(component => component.componentId))].sort(),
        evidenceRefIds: [...new Set(group.flatMap(component => component.evidenceRefIds))].sort(),
    }))
        .sort((left, right) => `${left.chargeSource}\u0000${left.chargeRecurrence}\u0000${left.chargeClassification}`.localeCompare(`${right.chargeSource}\u0000${right.chargeRecurrence}\u0000${right.chargeClassification}`));
    const bucketTotal = formatExactDecimalValue(sumCanonicalDecimals(buckets.map(bucket => bucket.amount)));
    if (bucketTotal !== request.sourceTotal)
        throw new TypeError('Financial charge composition does not reconcile to its source total.');
    const identity = {
        schemaVersion: FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1,
        contractVersion: FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1,
        baselineId: request.baselineId,
        ownerScopeId: request.ownerScopeId,
        period: request.period,
        costBasis: request.costBasis,
        estimateLens: request.estimateLens,
        accountingCurrencyCode: request.accountingCurrencyCode,
        buckets,
        reconciliation: { status: 'reconciled', bucketTotal, sourceTotal: request.sourceTotal, difference: '0' },
        algorithmVersion: request.algorithmVersion,
    };
    return { ...identity, chargeCompositionId: createFinancialChargeCompositionIdV1(identity) };
};
