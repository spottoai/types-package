export interface BillingAccount {
  companyId: string; // Partition Key - the company that owns the billing account
  stripeCustomerId: string; // Row Key - the  in Stripe that the billing account is linked to
  paymentMethodId: string; // the default payment method for the billing account
  plan: string;
  status: string;
  stripeSubscriptionId: string; // the subscription in Stripe that the billing account is linked to
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
