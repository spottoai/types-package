export interface BillingAccount {
    companyId: string;
    stripeCustomerId: string;
    paymentMethodId: string;
    plan: string;
    status: string;
    stripeSubscriptionId: string;
    stripeItemExcessId: string;
    stripeItemLicensedId: string;
}
export interface BillingAccountSummary {
    managedByParent: boolean;
    parentCompany?: {
        id: string;
        name: string;
        billingAccountId?: string;
    };
    message?: string;
    billingAccount?: BillingAccount;
}
export interface BillingAccountPostRequest {
    billingEmail?: string;
    returnUrl?: string;
}
export interface BillingAccountPortalSession {
    billingAccount: BillingAccount;
    portalSessionUrl: string;
}
//# sourceMappingURL=billingAccount.d.ts.map