/**
 * Early spend alerts flag spend before it appears on the Azure bill.
 * Every early-spend figure is an estimate and is reconciled against billing once billing covers the signal date.
 */
export const EARLY_SPEND_SIGNAL_KINDS = ['costImpact', 'createBurst', 'telemetryRunRate'];
/** Default criteria for early spend alerts. Returns a fresh object so callers can't mutate shared defaults. */
export const createEarlySpendDefaultCriteria = () => ({
    kind: 'earlySpend',
    source: 'costSignals',
    templateId: 'early-spend-default',
    signals: [...EARLY_SPEND_SIGNAL_KINDS],
    minEstimatedDailyCost: 25,
    minPercentOfBaseline: 5,
    telemetryMinIncreasePercent: 50,
    burst: { minCount: 20, windowMinutes: 60, minCount24h: 100 },
    minConfidence: 0.5,
    includeCallerInExternalNotifications: false,
});
