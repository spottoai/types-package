"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAzureBillingDriversV1 = exports.isAzureBillingOverviewV1 = exports.AZURE_BILLING_FACTS_LIMITS_V1 = void 0;
/** Decoded UTF-8 JSON limits; readers enforce these before parsing as well. */
exports.AZURE_BILLING_FACTS_LIMITS_V1 = Object.freeze({
    overviewMaxDecodedBytes: 64 * 1024,
    driversMaxDecodedBytes: 256 * 1024,
    maxDaysPerWindow: 30,
    maxDriverRowsPerGrouping: 1024,
    maxLabelLength: 200,
});
var billingFactsValidation_js_1 = require("./billingFactsValidation.js");
Object.defineProperty(exports, "isAzureBillingOverviewV1", { enumerable: true, get: function () { return billingFactsValidation_js_1.isAzureBillingOverviewV1; } });
Object.defineProperty(exports, "isAzureBillingDriversV1", { enumerable: true, get: function () { return billingFactsValidation_js_1.isAzureBillingDriversV1; } });
//# sourceMappingURL=billingFacts.js.map