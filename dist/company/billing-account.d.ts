import { Company } from './company';
export interface BillingAccount {
    billingAccountId: string;
    primaryCompanyId: string;
    companyIds?: string[];
    stripeCustomerId: string;
    defaultPaymentMethodId?: string;
    subscriptionId?: string;
    planTier?: string;
    billingEmail?: string;
    status: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
export interface BillingAccountCreateRequest {
    billingAccountId?: string;
    stripeCustomerId?: string;
    defaultPaymentMethodId?: string;
    subscriptionId?: string;
    planTier?: string;
    billingEmail?: string;
    metadata?: Record<string, unknown>;
}
export interface BillingAccountUpdateRequest {
    stripeCustomerId?: string;
    defaultPaymentMethodId?: string;
    subscriptionId?: string;
    planTier?: string;
    billingEmail?: string;
    metadata?: Record<string, unknown>;
    status?: string;
}
export interface CompanyBillingAccountResponse {
    managedByParent: boolean;
    parentCompany?: ManagedBillingParentCompany;
    billingAccount?: BillingAccount;
}
export interface ManagedBillingParentCompany extends Pick<Company, 'id' | 'name' | 'billingAccountId'> {
}
//# sourceMappingURL=billing-account.d.ts.map