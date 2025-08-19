
export interface AzureLocation {
    name: string // e.g. "eastus"
    displayName: string // e.g. "East US"
}

export interface MonthSummaryEntry {
    month: string // YYYY-MM format
    cost?: number // sum of actual cost for the month
    costAmortized?: number // sum of costAmortized for the month
    startDate?: string // YYYY-MM format - start date of billing period
    endDate?: string // YYYY-MM format - end date of billing period
}

export interface MonthSummary {
    entries: MonthSummaryEntry[]
    lastUpdated: string // ISO date string
}

export interface ActiveDates {
    startDate: number
    endDate: number
}

export interface SpecItem {
    name: string // e.g. RAM
    value: string // e.g. 3.5
    unit: string // e.g. GB
}

export interface Link {
    name: string
    url: string
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

export interface ActivityLog {
    caller: string // e.g. "user@contoso.com"
    change: string // e.g. Update hosting plan
    timestamp: string // e.g. Use the submissionTimestamp
}