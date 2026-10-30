/** Default minimum daily increase (subscription currency) above the 7-day average for cost anomaly definitions without `minDelta` or `minCost`. */
export const DEFAULT_COST_ANOMALY_MIN_DELTA = 10;
/** Maps `CostAlertSummary.dataSource` to the data basis shown to users. */
export const toAlertDataBasis = (dataSource) => {
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
