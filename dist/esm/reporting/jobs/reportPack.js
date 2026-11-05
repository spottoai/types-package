/** Stable report identifiers shared by the Reports catalogue and unattended pack generation. */
export const REPORT_PACK_REPORT_IDS = [
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
export const REPORT_PACK_FEATURES = {
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
export const isReportPackReportId = (value) => typeof value === 'string' && REPORT_PACK_REPORT_IDS.includes(value);
export const reportJobFileExtension = (reportType) => (reportType === 'report-pack' ? '.zip' : '.docx');
export const reportJobContentType = (reportType) => reportType === 'report-pack' ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const isReportJobFileNameForType = (fileName, reportType) => fileName.endsWith(reportJobFileExtension(reportType));
