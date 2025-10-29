export interface ResourcesByType {
  type: string;
  resources: number;
  spendBilling?: number; // total spend in the current billing period
  spendBillingAmortized?: number; // total amortized spend in the current billing period
  spendPreviousBilling?: number; // total spend in the previous billing period
  spendPreviousBillingAmortized?: number;
  spend30Days?: number; // total spend over the last 30 days
  spend30DaysAmortized?: number;
  spendPrevious30Days?: number; // total spend over the previous 30 days
  spendPrevious30DaysAmortized?: number;
  spend7Days?: number; // total spend over the last 7 days
  spend7DaysAmortized?: number;
  spendPrevious7Days?: number; // total spend over the previous 7 days
  spendPrevious7DaysAmortized?: number;
}

export interface ResourceByLocation {
  location: string;
  resources: number;
  spendBilling?: number; // total spend in the current billing period
  spendBillingAmortized?: number; // total amortized spend in the current billing period
  spendPreviousBilling?: number; // total spend in the previous billing period
  spendPreviousBillingAmortized?: number;
  spend30Days?: number; // total spend over the last 30 days
  spend30DaysAmortized?: number;
  spendPrevious30Days?: number; // total spend over the previous 30 days
  spendPrevious30DaysAmortized?: number;
  spend7Days?: number; // total spend over the last 7 days
  spend7DaysAmortized?: number;
  spendPrevious7Days?: number; // total spend over the previous 7 days
  spendPrevious7DaysAmortized?: number;
}

export interface ResourceTypeReference {
  type: string;
}

export interface ResourceLink {
  name: string;
  url: string;
  doc: string;
  disabled?: boolean;
}