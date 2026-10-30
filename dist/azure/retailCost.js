"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetailCostAvailability = isRetailCostAvailability;
function isRetailCostAvailability(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const evidence = value;
    if (evidence.status === 'unavailable') {
        return ['not-produced', 'currency-unresolved', 'coverage-unproven'].includes(String(evidence.reasonCode));
    }
    if (evidence.status !== 'available')
        return false;
    const period = evidence.period;
    return typeof evidence.currency === 'string' && /^[A-Z]{3}$/u.test(evidence.currency) &&
        evidence.provenance === 'provider-list-price' &&
        !!period && typeof period === 'object' && !Array.isArray(period) &&
        period.kind === 'monthly-run-rate' &&
        period.hours === 730 &&
        Array.isArray(evidence.sourceRefs) && evidence.sourceRefs.length > 0 &&
        evidence.sourceRefs.every(ref => typeof ref === 'string' && ref.trim().length > 0);
}
//# sourceMappingURL=retailCost.js.map