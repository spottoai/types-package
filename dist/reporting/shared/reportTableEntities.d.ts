/**
 * Azure Table entities arrive in two key casings: the REST API with `odata=nometadata` (the API's TableStore)
 * returns `PartitionKey`/`RowKey`/`Timestamp`, while `@azure/data-tables` (reportworker, cloud-engine's
 * `schedules` table) returns `partitionKey`/`rowKey`/`timestamp`/`etag`. The contracts use the REST casing;
 * these helpers convert either shape and drop system properties.
 */
/** System and metadata properties a Table read may add; never part of a contract row. */
export declare const REPORT_TABLE_SYSTEM_FIELDS: readonly string[];
/**
 * Returns a copy with `PartitionKey`/`RowKey` (from either casing), without system properties and without
 * `null`/`undefined` values (some SDKs return absent properties as `null`). Conflicting casings are kept as-is so
 * the caller's validation rejects them.
 */
export declare const normalizeReportTableEntity: (entity: Record<string, unknown>) => Record<string, unknown>;
/** The `@azure/data-tables` shape of a contract row: `partitionKey`/`rowKey` instead of `PartitionKey`/`RowKey`. */
export declare const toReportTableSdkEntity: <T extends {
    PartitionKey: string;
    RowKey: string;
}>(row: T) => Omit<T, "PartitionKey" | "RowKey"> & {
    partitionKey: string;
    rowKey: string;
};
//# sourceMappingURL=reportTableEntities.d.ts.map