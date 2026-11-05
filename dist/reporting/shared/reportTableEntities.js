"use strict";
/**
 * Azure Table entities arrive in two key casings: the REST API with `odata=nometadata` (the API's TableStore)
 * returns `PartitionKey`/`RowKey`/`Timestamp`, while `@azure/data-tables` (reportworker, cloud-engine's
 * `schedules` table) returns `partitionKey`/`rowKey`/`timestamp`/`etag`. The contracts use the REST casing;
 * these helpers convert either shape and drop system properties.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReportTableSdkEntity = exports.normalizeReportTableEntity = exports.REPORT_TABLE_SYSTEM_FIELDS = void 0;
/** System and metadata properties a Table read may add; never part of a contract row. */
exports.REPORT_TABLE_SYSTEM_FIELDS = [
    'Timestamp',
    'timestamp',
    'etag',
    'odata.etag',
    'odata.metadata',
    'odata.type',
    'odata.id',
    'odata.editLink',
];
/**
 * Returns a copy with `PartitionKey`/`RowKey` (from either casing), without system properties and without
 * `null`/`undefined` values (some SDKs return absent properties as `null`). Conflicting casings are kept as-is so
 * the caller's validation rejects them.
 */
const normalizeReportTableEntity = (entity) => {
    const result = {};
    for (const [key, value] of Object.entries(entity)) {
        if (value === null || value === undefined || exports.REPORT_TABLE_SYSTEM_FIELDS.includes(key))
            continue;
        if (key === 'partitionKey' && !('PartitionKey' in entity))
            result.PartitionKey = value;
        else if (key === 'rowKey' && !('RowKey' in entity))
            result.RowKey = value;
        else
            result[key] = value;
    }
    return result;
};
exports.normalizeReportTableEntity = normalizeReportTableEntity;
/** The `@azure/data-tables` shape of a contract row: `partitionKey`/`rowKey` instead of `PartitionKey`/`RowKey`. */
const toReportTableSdkEntity = (row) => {
    const { PartitionKey, RowKey, ...rest } = row;
    return { partitionKey: PartitionKey, rowKey: RowKey, ...rest };
};
exports.toReportTableSdkEntity = toReportTableSdkEntity;
//# sourceMappingURL=reportTableEntities.js.map