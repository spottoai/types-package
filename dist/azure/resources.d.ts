export interface ResourcesByType {
    type: string;
    resources: number;
    spendBilling?: number;
    spendBillingAmortized?: number;
    spendPreviousBilling?: number;
    spendPreviousBillingAmortized?: number;
    spend30Days?: number;
    spend30DaysAmortized?: number;
    spendPrevious30Days?: number;
    spendPrevious30DaysAmortized?: number;
    spend7Days?: number;
    spend7DaysAmortized?: number;
    spendPrevious7Days?: number;
    spendPrevious7DaysAmortized?: number;
}
export interface ResourceByLocation {
    location: string;
    resources: number;
    spendBilling?: number;
    spendBillingAmortized?: number;
    spendPreviousBilling?: number;
    spendPreviousBillingAmortized?: number;
    spend30Days?: number;
    spend30DaysAmortized?: number;
    spendPrevious30Days?: number;
    spendPrevious30DaysAmortized?: number;
    spend7Days?: number;
    spend7DaysAmortized?: number;
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
//# sourceMappingURL=resources.d.ts.map