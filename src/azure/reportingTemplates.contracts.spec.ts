import type {
  GeneratedReportMetadata,
  ReportingTemplateContentResponse,
  ReportingTemplateMetadata,
  ReportingTemplateReportType,
  SaveGeneratedReportRequest,
  SaveReportingTemplateRequest,
} from './reportingTemplates';
import { REPORTING_TEMPLATE_REPORT_TYPES } from './reportingTemplates';

const reportTypes: ReportingTemplateReportType[] = [...REPORTING_TEMPLATE_REPORT_TYPES];

const checklistReportType: ReportingTemplateReportType = 'review-checklist';
const architectureAssessmentReportType: ReportingTemplateReportType = 'architecture-assessment';

const templateMetadata: ReportingTemplateMetadata = {
  id: 'rpttpl-1',
  companyId: 'company-1',
  reportType: checklistReportType,
  name: 'Review checklist template',
  fileName: 'review-checklist-template.docx',
  schemaVersion: 1,
  templateRevision: 1,
  isCompanyDefault: true,
  createdAt: '2026-07-05T00:00:00.000Z',
  updatedAt: '2026-07-05T00:00:00.000Z',
  validation: {
    schemaVersion: 1,
    placeholders: ['company_name', 'detailed_findings'],
    missingRequiredPlaceholders: [],
    unknownPlaceholders: [],
    duplicatePlaceholders: [],
    canSave: true,
  },
};

const templateContent: ReportingTemplateContentResponse = {
  metadata: templateMetadata,
  docxBase64: 'UEsDBAoAAAAAA',
};

const saveTemplateRequest: SaveReportingTemplateRequest = {
  reportType: checklistReportType,
  name: templateMetadata.name,
  fileName: templateMetadata.fileName,
  schemaVersion: templateMetadata.schemaVersion,
  docxBase64: templateContent.docxBase64,
  makeDefault: true,
};

const saveGeneratedReportRequest: SaveGeneratedReportRequest = {
  reportType: checklistReportType,
  templateId: templateMetadata.id,
  templateRevision: templateMetadata.templateRevision,
  schemaVersion: templateMetadata.schemaVersion,
  fileName: 'review-checklist-report.docx',
  docxBase64: templateContent.docxBase64,
  sourceDataTimestamp: '2026-07-05T00:00:00.000Z',
  reportPeriod: 'Latest scan',
};

const generatedReport: GeneratedReportMetadata = {
  id: 'rpt-1',
  companyId: templateMetadata.companyId,
  reportType: saveGeneratedReportRequest.reportType,
  fileName: saveGeneratedReportRequest.fileName ?? 'review-checklist-report.docx',
  createdAt: '2026-07-05T00:00:00.000Z',
  templateId: saveGeneratedReportRequest.templateId,
  templateRevision: saveGeneratedReportRequest.templateRevision,
  schemaVersion: saveGeneratedReportRequest.schemaVersion ?? 1,
  sourceDataTimestamp: saveGeneratedReportRequest.sourceDataTimestamp,
  reportPeriod: saveGeneratedReportRequest.reportPeriod,
};

void reportTypes;
void architectureAssessmentReportType;
void saveTemplateRequest;
void generatedReport;
