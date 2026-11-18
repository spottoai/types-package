import type { Microsoft365CoverageState } from './microsoft365Licenses';
import { type Microsoft365AccountUsage } from './microsoft365Usage';
export type Microsoft365ActivityHistoryStream = 'sign-ins' | 'workloads' | 'people' | 'licenses';
export interface Microsoft365ActivityHistoryCoverage {
    state: Microsoft365CoverageState;
    /** Inclusive start and exclusive end of the requested source window. */
    requestedFrom: string;
    requestedThrough: string;
    observedFrom: string | null;
    observedThrough: string | null;
    sourceTime: string | null;
    reason: string | null;
    /** A current UTC date cannot establish a complete fixed day. */
    provisional?: boolean;
    rejectedEventCount?: number;
}
export interface Microsoft365SignInHistoryRow {
    accountId: string;
    appId: string;
    count: number;
    firstAt: string;
    lastAt: string;
}
export interface Microsoft365WorkloadHistoryRow {
    source: 'officeActiveUsers' | 'officeActiveUserCounts' | 'officeAppUsage' | 'copilotUsage';
    /** Rolling snapshots are not additive daily activity. */
    kind: 'rolling_snapshot' | 'native_daily';
    date: string;
    reportRefreshDate: string | null;
    periodDays: 1 | 28 | 30 | 180;
    state: Microsoft365CoverageState;
    counts: {
        office365: number | null;
        exchange: number | null;
        oneDrive: number | null;
        sharePoint: number | null;
        teams: number | null;
        copilot: number | null;
    };
}
/** Observed dates only; these records never fill intervening activity days. */
export interface Microsoft365PersonActivityHistoryRow {
    accountId: string;
    usage: Microsoft365AccountUsage;
    officeLastActivityDate?: string | null;
    reportRefreshDates?: {
        officeActiveUsers: string | null;
        officeAppUsage: string | null;
        copilotUsage: string | null;
    };
}
export interface Microsoft365LicenseQuantityHistoryRow {
    skuId: string;
    enabledUnits: number | null;
    consumedUnits: number | null;
    /** Commercial subscription allocation may be unavailable even with complete SKU inventory. */
    subscriptionUnits: number | null;
    /** Retail reference context, independent of quantity changes and company agreed pricing. */
    referencePrices?: {
        currency: string;
        unitPriceMonthly: number | null;
        priceListVersion: string;
        basis: 'list_price_estimate';
        term: 'annual_commitment';
        tax: 'excluded';
    }[];
}
export interface Microsoft365LicenseQuantityChange {
    id: string;
    skuId: string;
    kind: 'assignment' | 'enabled_capacity' | 'purchased_quantity';
    from: number;
    to: number;
    delta: number;
    sourceSnapshotId: string;
    targetSnapshotId: string;
    /** Observed quantity changes do not establish realised savings. */
    confirmedSaving: null;
}
interface Microsoft365ActivityHistoryBase {
    schemaVersion: 'microsoft-365-activity-history/v1';
    tenantId: string;
    date: string;
    generatedAt: string;
    tenantSyncRunId?: string;
    coverage: Microsoft365ActivityHistoryCoverage;
}
export type Microsoft365SignInHistoryDay = Microsoft365ActivityHistoryBase & {
    stream: 'sign-ins';
    rows: Microsoft365SignInHistoryRow[];
};
export type Microsoft365WorkloadHistoryDay = Microsoft365ActivityHistoryBase & {
    stream: 'workloads';
    rows: Microsoft365WorkloadHistoryRow[];
};
export type Microsoft365PersonActivityHistoryDay = Microsoft365ActivityHistoryBase & {
    stream: 'people';
    rows: Microsoft365PersonActivityHistoryRow[];
};
export type Microsoft365LicenseQuantityHistoryDay = Microsoft365ActivityHistoryBase & {
    stream: 'licenses';
    classificationVersion: string;
    snapshotId: string;
    rows: Microsoft365LicenseQuantityHistoryRow[];
    changes: Microsoft365LicenseQuantityChange[];
};
export type Microsoft365ActivityHistoryDay = Microsoft365SignInHistoryDay | Microsoft365WorkloadHistoryDay | Microsoft365PersonActivityHistoryDay | Microsoft365LicenseQuantityHistoryDay;
/** Strict UTC date validation rejects normalized impossible dates. */
export declare function isMicrosoft365ActivityHistoryDate(value: unknown): value is string;
export declare function isMicrosoft365ActivityHistoryCoverage(value: unknown): value is Microsoft365ActivityHistoryCoverage;
export declare function isMicrosoft365ActivityHistoryDay(value: unknown): value is Microsoft365ActivityHistoryDay;
export {};
//# sourceMappingURL=microsoft365ActivityHistory.d.ts.map