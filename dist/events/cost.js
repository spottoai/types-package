"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAlertDataBasis = exports.DEFAULT_COST_ANOMALY_MIN_DELTA = void 0;
/** Default minimum daily increase (subscription currency) above the 7-day average for cost anomaly definitions without `minDelta` or `minCost`. */
exports.DEFAULT_COST_ANOMALY_MIN_DELTA = 10;
/** Maps `CostAlertSummary.dataSource` to the data basis shown to users. */
const toAlertDataBasis = (dataSource) => {
    switch (dataSource) {
        case 'actual':
            return 'billed';
        case 'blended':
            return 'blended';
        case 'estimated':
        case 'metrics_pricing':
            return 'estimated';
        default:
            return undefined;
    }
};
exports.toAlertDataBasis = toAlertDataBasis;
//# sourceMappingURL=cost.js.map