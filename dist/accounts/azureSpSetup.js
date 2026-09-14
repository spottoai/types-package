"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_SP_BILLING_STORAGE_CONVENTION_V1 = exports.AZURE_SP_SETUP_MAX_SELECTED_SUBSCRIPTIONS = void 0;
/** Maximum subscriptions accepted by one assisted Azure setup execution. */
exports.AZURE_SP_SETUP_MAX_SELECTED_SUBSCRIPTIONS = 100;
/** Versioned storage identity shared by assisted and manual Azure onboarding. */
exports.AZURE_SP_BILLING_STORAGE_CONVENTION_V1 = {
    version: 1,
    namePrefix: 'billingexports',
    candidateCount: 20,
    defaultLocation: 'australiaeast',
    purposeTagName: 'SpottoPurpose',
    purposeTagValue: 'BillingExports',
    tenantTagName: 'SpottoTenantId',
    aliasTagName: 'spotto',
    aliasTagValue: 'billing-exports',
};
//# sourceMappingURL=azureSpSetup.js.map