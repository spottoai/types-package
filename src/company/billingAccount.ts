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
