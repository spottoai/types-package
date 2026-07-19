export const REPORTING_TEMPLATE_REPORT_TYPES = ['sdm', 'sow', 'review-checklist', 'architecture-assessment'] as const;

export type ReportingTemplateReportType = (typeof REPORTING_TEMPLATE_REPORT_TYPES)[number];

export interface ReportingTemplatePlaceholderDefinition {
  key: string;
  label: string;
  required: boolean;
}

export interface ReportingTemplateValidationResult {
  schemaVersion: number;
  placeholders: string[];
  missingRequiredPlaceholders: string[];
  unknownPlaceholders: string[];
  duplicatePlaceholders: string[];
  canSave: boolean;
}

export interface ReportingTemplateMetadata {
  id: string;
  companyId: string;
  reportType: ReportingTemplateReportType;
  name: string;
  fileName: string;
  schemaVersion: number;
  templateRevision: number;
  isCompanyDefault: boolean;
  createdAt: string;
  updatedAt: string;
  validation: ReportingTemplateValidationResult;
}

export interface ReportingTemplateContentResponse {
  metadata: ReportingTemplateMetadata;
  docxBase64: string;
}

export interface SaveReportingTemplateRequest {
  reportType: ReportingTemplateReportType;
  name: string;
  fileName?: string;
  schemaVersion?: number;
  docxBase64: string;
  makeDefault?: boolean;
}

export interface UpdateReportingTemplateRequest {
  name: string;
}

export interface DeleteReportingTemplateResponse {
  deleted: true;
  activeTemplate: ReportingTemplateMetadata | null;
}

export interface SaveGeneratedReportRequest {
  reportType: ReportingTemplateReportType;
  templateId?: string;
  templateRevision?: number;
  schemaVersion?: number;
  fileName?: string;
  docxBase64: string;
  sourceDataTimestamp?: string;
  reportPeriod?: string;
}

export interface GeneratedReportMetadata {
  id: string;
  companyId: string;
  reportType: ReportingTemplateReportType;
  fileName: string;
  createdAt: string;
  templateId?: string;
  templateRevision?: number;
  schemaVersion: number;
  sourceDataTimestamp?: string;
  reportPeriod?: string;
}
