export interface AzureLocation {
    name: string;
    displayName: string;
}
export interface MonthSummaryEntry {
    month: string;
    cost?: number;
    costAmortized?: number;
    startDate?: string;
    endDate?: string;
}
export interface MonthSummary {
    entries: MonthSummaryEntry[];
    lastUpdated: string;
}
export interface ActiveDates {
    startDate: number;
    endDate: number;
}
export interface SpecItem {
    name: string;
    value: string;
    unit: string;
}
export interface Link {
    name: string;
    url: string;
}
export interface LogAnalyticsResponse {
    tables: Array<LogAnalyticsTable>;
}
export interface LogAnalyticsTable {
    name: string;
    columns: Array<{
        name: string;
        type: string;
    }>;
    rows: any[][];
}
//# sourceMappingURL=common.d.ts.map