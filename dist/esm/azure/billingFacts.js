/** Decoded UTF-8 JSON limits; readers enforce these before parsing as well. */
export const AZURE_BILLING_FACTS_LIMITS_V1 = Object.freeze({
    overviewMaxDecodedBytes: 64 * 1024,
    driversMaxDecodedBytes: 256 * 1024,
    maxDaysPerWindow: 30,
    maxDriverRowsPerGrouping: 1024,
    maxLabelLength: 200,
});
export { isAzureBillingOverviewV1, isAzureBillingDriversV1 } from './billingFactsValidation.js';
