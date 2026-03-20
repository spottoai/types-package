export interface ResourcesByType {
    type: string;
    resources: number;
    /** effective spend baseline used by summaries (rolling 30-day window in current pipeline) */
    spendBilling?: number;
    /** amortized variant of spendBilling */
    spendBillingAmortized?: number;
    /** previous-window baseline aligned with spendBilling semantics */
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
    /** effective spend baseline used by summaries (rolling 30-day window in current pipeline) */
    spendBilling?: number;
    /** amortized variant of spendBilling */
    spendBillingAmortized?: number;
    /** previous-window baseline aligned with spendBilling semantics */
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
//# sourceMappingURL=resources.d.ts.map