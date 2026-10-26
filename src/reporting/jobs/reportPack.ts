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
] as const;
export type ReportPackReportId = (typeof REPORT_PACK_REPORT_IDS)[number];

export const REPORT_PACK_FEATURES: Record<ReportPackReportId, readonly string[]> = {
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

export const isReportPackReportId = (value: unknown): value is ReportPackReportId =>
  typeof value === 'string' && (REPORT_PACK_REPORT_IDS as readonly string[]).includes(value);

export interface ReportPackConfigurationV1 {
  /** A nonempty, unique selection; canonical serialization uses catalogue order. */
  reportIds: ReportPackReportId[];
  scopeCurrencyCode: string;
}

export const reportJobFileExtension = (reportType: string): '.zip' | '.docx' => (reportType === 'report-pack' ? '.zip' : '.docx');
export const reportJobContentType = (reportType: string): string =>
  reportType === 'report-pack' ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const isReportJobFileNameForType = (fileName: string, reportType: string): boolean => fileName.endsWith(reportJobFileExtension(reportType));
