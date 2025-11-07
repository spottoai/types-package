export interface AzureLocation {
    /** e.g. "eastus" */
    name: string;
    /** e.g. "East US" */
    displayName: string;
}
export interface MonthSummaryEntry {
    /** YYYY-MM format */
    month: string;
    /** sum of actual cost for the month */
    cost?: number;
    /** sum of costAmortized for the month */
    costAmortized?: number;
    /** YYYY-MM format - start date of billing period */
    startDate?: string;
    /** YYYY-MM format - end date of billing period */
    endDate?: string;
    /** Top resources by cost */
    resourceTypes: ResourceCostType[];
}
export interface ResourceCostType {
    /** e.g. "Virtual Machines" */
    name: string;
    /** e.g. 100 */
    cost: number;
    /** e.g. 100 */
    costAmortized?: number;
}
export interface MonthSummary {
    entries: MonthSummaryEntry[];
    /** ISO date string */
    lastUpdated: string;
}
export interface DailySummaryEntry {
    /** YYYY-MM-DD format */
    date: string;
    /** sum of actual cost for the day */
    cost?: number;
    /** sum of costAmortized for the day */
    costAmortized?: number;
    /** Top resources by cost */
    resourceTypes: ResourceCostType[];
}
export interface DailySummary {
    /** rolling last 30 days */
    entries: DailySummaryEntry[];
    /** ISO date string */
    lastUpdated: string;
}
export interface ActiveDates {
    startDate: number;
    endDate: number;
}
export interface SpecItem {
    /** e.g. RAM */
    name: string;
    /** e.g. 3.5 */
    value: string;
    /** e.g. GB */
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
    rows: unknown[][];
}
export interface ActivityLog {
    /** e.g. "user@contoso.com" */
    caller: string;
    /** e.g. Update hosting plan */
    change: string;
    /** e.g. Use the submissionTimestamp */
    timestamp: string;
}
//# sourceMappingURL=common.d.ts.map