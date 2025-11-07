export interface ResourcesByType {
  type: string;
  resources: number;
  /** total spend in the current billing period */
  spendBilling?: number;
  /** total amortized spend in the current billing period */
  spendBillingAmortized?: number;
  /** total spend in the previous billing period */
  spendPreviousBilling?: number;
  spendPreviousBillingAmortized?: number;
  /** total spend over the last 30 days */
  spend30Days?: number;
  spend30DaysAmortized?: number;
  /** total spend over the previous 30 days */
  spendPrevious30Days?: number;
  spendPrevious30DaysAmortized?: number;
  /** total spend over the last 7 days */
  spend7Days?: number;
  spend7DaysAmortized?: number;
  /** total spend over the previous 7 days */
  spendPrevious7Days?: number;
  spendPrevious7DaysAmortized?: number;
}

export interface ResourceByLocation {
  location: string;
  resources: number;
  /** total spend in the current billing period */
  spendBilling?: number;
  /** total amortized spend in the current billing period */
  spendBillingAmortized?: number;
  /** total spend in the previous billing period */
  spendPreviousBilling?: number;
  spendPreviousBillingAmortized?: number;
  /** total spend over the last 30 days */
  spend30Days?: number;
  spend30DaysAmortized?: number;
  /** total spend over the previous 30 days */
  spendPrevious30Days?: number;
  spendPrevious30DaysAmortized?: number;
  /** total spend over the last 7 days */
  spend7Days?: number;
  spend7DaysAmortized?: number;
  /** total spend over the previous 7 days */
  spendPrevious7Days?: number;
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
