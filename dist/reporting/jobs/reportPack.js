"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportJobFileNameForType = exports.reportJobContentType = exports.reportJobFileExtension = exports.isReportPackReportId = exports.REPORT_PACK_FEATURES = exports.REPORT_PACK_REPORT_IDS = void 0;
/** Stable report identifiers shared by the Reports catalogue and unattended pack generation. */
exports.REPORT_PACK_REPORT_IDS = [
    'resources',
    'recommendations',
    'security',
    'perimeter',
    'backup-assessment',
    'dr-handbook',
    'service-retirement',
    'hybrid-benefit',
    'microsoft365',
    'cost-tree',
    'commitments',
    'at-a-glance',
];
exports.REPORT_PACK_FEATURES = {
    resources: ['resources'],
    recommendations: ['recommendations'],
    security: ['security', 'recommendations_security'],
    perimeter: ['perimeter_insights'],
    'backup-assessment': ['data_protection'],
    'dr-handbook': ['data_protection'],
    'service-retirement': ['service_retirement'],
    'hybrid-benefit': ['licensing'],
    microsoft365: ['microsoft_365_licenses'],
    'cost-tree': ['cost_tree'],
    commitments: ['commitments_planning'],
    'at-a-glance': ['resources'],
};
const isReportPackReportId = (value) => typeof value === 'string' && exports.REPORT_PACK_REPORT_IDS.includes(value);
exports.isReportPackReportId = isReportPackReportId;
const reportJobFileExtension = (reportType) => (reportType === 'report-pack' ? '.zip' : '.docx');
exports.reportJobFileExtension = reportJobFileExtension;
const reportJobContentType = (reportType) => reportType === 'report-pack' ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
exports.reportJobContentType = reportJobContentType;
const isReportJobFileNameForType = (fileName, reportType) => fileName.endsWith((0, exports.reportJobFileExtension)(reportType));
exports.isReportJobFileNameForType = isReportJobFileNameForType;
//# sourceMappingURL=reportPack.js.map