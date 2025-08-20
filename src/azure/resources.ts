export interface ResourcesByType {
  type: string;
  resources: number;
  spendBilling?: number; // total spend in the current billing period
  spendPreviousBilling?: number; // total spend in the previous billing period
  spend30Days?: number; // total spend over the last 30 days
  spendPrevious30Days?: number; // total spend over the previous 30 days
  spend7Days?: number; // total spend over the last 7 days
  spendPrevious7Days?: number; // total spend over the previous 7 days
}

export interface ResourceByLocation {
  location: string;
  resources: number;
  spendBilling?: number; // total spend in the current billing period
  spendPreviousBilling?: number; // total spend in the previous billing period
  spend30Days?: number; // total spend over the last 30 days
  spendPrevious30Days?: number; // total spend over the previous 30 days
  spend7Days?: number; // total spend over the last 7 days
  spendPrevious7Days?: number; // total spend over the previous 7 days
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
