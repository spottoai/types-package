"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeReportingPathSegment = exports.isReportFileName = exports.toReportTableSdkEntity = exports.REPORT_TABLE_SYSTEM_FIELDS = exports.normalizeReportTableEntity = exports.REPORT_JOB_COMPANY_ID_MAX_LENGTH = exports.REPORT_ENTITY_ID_PATTERN = exports.isReportJobCompanyId = exports.isReportGuid = exports.isReportEntityId = exports.isIsoUtcTimestamp = exports.isIanaTimeZone = exports.SHA256_HEX_PATTERN = exports.sha256Hex = void 0;
/**
 * `@spottoai/types-package/reporting-jobs`: background report job contracts shared by the API, cloud-engine and
 * reportworker (types-package/specs/reporting/reporting-scheduler-types.md, Part A).
 */
__exportStar(require("./reportJobSpec"), exports);
__exportStar(require("./reportJobIdentity"), exports);
__exportStar(require("./reportJobMessages"), exports);
__exportStar(require("./reportJobStatus"), exports);
__exportStar(require("./reportJobRow"), exports);
var reportingDigest_1 = require("../shared/reportingDigest");
Object.defineProperty(exports, "sha256Hex", { enumerable: true, get: function () { return reportingDigest_1.sha256Hex; } });
Object.defineProperty(exports, "SHA256_HEX_PATTERN", { enumerable: true, get: function () { return reportingDigest_1.SHA256_HEX_PATTERN; } });
var reportingIds_1 = require("../shared/reportingIds");
Object.defineProperty(exports, "isIanaTimeZone", { enumerable: true, get: function () { return reportingIds_1.isIanaTimeZone; } });
Object.defineProperty(exports, "isIsoUtcTimestamp", { enumerable: true, get: function () { return reportingIds_1.isIsoUtcTimestamp; } });
Object.defineProperty(exports, "isReportEntityId", { enumerable: true, get: function () { return reportingIds_1.isReportEntityId; } });
Object.defineProperty(exports, "isReportGuid", { enumerable: true, get: function () { return reportingIds_1.isReportGuid; } });
Object.defineProperty(exports, "isReportJobCompanyId", { enumerable: true, get: function () { return reportingIds_1.isReportJobCompanyId; } });
Object.defineProperty(exports, "REPORT_ENTITY_ID_PATTERN", { enumerable: true, get: function () { return reportingIds_1.REPORT_ENTITY_ID_PATTERN; } });
Object.defineProperty(exports, "REPORT_JOB_COMPANY_ID_MAX_LENGTH", { enumerable: true, get: function () { return reportingIds_1.REPORT_JOB_COMPANY_ID_MAX_LENGTH; } });
var reportTableEntities_1 = require("../shared/reportTableEntities");
Object.defineProperty(exports, "normalizeReportTableEntity", { enumerable: true, get: function () { return reportTableEntities_1.normalizeReportTableEntity; } });
Object.defineProperty(exports, "REPORT_TABLE_SYSTEM_FIELDS", { enumerable: true, get: function () { return reportTableEntities_1.REPORT_TABLE_SYSTEM_FIELDS; } });
Object.defineProperty(exports, "toReportTableSdkEntity", { enumerable: true, get: function () { return reportTableEntities_1.toReportTableSdkEntity; } });
var reportingPaths_1 = require("../shared/reportingPaths");
Object.defineProperty(exports, "isReportFileName", { enumerable: true, get: function () { return reportingPaths_1.isReportFileName; } });
Object.defineProperty(exports, "sanitizeReportingPathSegment", { enumerable: true, get: function () { return reportingPaths_1.sanitizeReportingPathSegment; } });
//# sourceMappingURL=index.js.map