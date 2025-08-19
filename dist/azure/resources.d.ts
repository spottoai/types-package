export interface ResourcesByType {
    type: string;
    resources: number;
    spendBilling?: number;
    spendPreviousBilling?: number;
    spend30Days?: number;
    spendPrevious30Days?: number;
    spend7Days?: number;
    spendPrevious7Days?: number;
}
export interface ResourceByLocation {
    location: string;
    resources: number;
    spendBilling?: number;
    spendPreviousBilling?: number;
    spend30Days?: number;
    spendPrevious30Days?: number;
    spend7Days?: number;
    spendPrevious7Days?: number;
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