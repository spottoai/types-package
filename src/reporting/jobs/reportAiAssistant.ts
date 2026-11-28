/**
 * AI Assistant reporting settings and saved briefings, shared by the API and the Portal
 * (core/specs/reporting/generation/background-report-generation/background-report-generation-ai-assistant.md).
 *
 * Routes (company path scope only, no child aggregation):
 *   GET    /companies/{companyId}/reporting/ai-settings                 -> ReportAiSettingsProjectionV1
 *   PUT    /companies/{companyId}/reporting/ai-settings                 <- ReportAiSettingsWriteV1
 *   GET    /companies/{companyId}/reporting/ai-briefings?reportType=    -> { items: ReportAiSavedBriefingListItemV1[] }
 *   POST   /companies/{companyId}/reporting/ai-briefings                <- ReportAiSavedBriefingWriteV1 -> ReportAiSavedBriefingV1
 *   PUT    /companies/{companyId}/reporting/ai-briefings/{briefingId}   <- ReportAiSavedBriefingWriteV1 -> ReportAiSavedBriefingV1
 *   DELETE /companies/{companyId}/reporting/ai-briefings/{briefingId}
 *
 * Job requests send `ReportJobAiRequestV1`; the API resolves it into the frozen `ReportJobAiAssistantV1`.
 */
import { isPlainRecord, hasExactlyKeys } from '../shared/reportingIds';
import { REPORT_JOB_AI_BRIEFING_MAX_CHARS, REPORT_JOB_AI_REPORT_TYPES } from './reportJobSpec';

export type ReportAiReportType = (typeof REPORT_JOB_AI_REPORT_TYPES)[number];

export const REPORT_AI_BRIEFING_NAME_MAX_CHARS = 80;
/** Saved briefings per company and report type. */
export const REPORT_AI_MAX_SAVED_BRIEFINGS = 50;

/** Effective AI settings for a company, after the reporting settings hierarchy is applied. */
export interface ReportAiSettingsProjectionV1 {
  /** The company has the AI Assistant feature and the caller has `ai_chat.use`. */
  available: boolean;
  /** Web research is allowed for this company's reports. */
  webResearchEnabled: boolean;
  /** MSP default briefing per report type; absent when none applies. */
  defaultBriefings: Partial<Record<ReportAiReportType, string>>;
  /** Where each effective value came from: this company or an ancestor MSP. */
  inheritedFromCompanyId?: string;
}

/** Writes this company's own settings. A null default removes it, so the inherited value applies. */
export interface ReportAiSettingsWriteV1 {
  webResearchEnabled?: boolean | null;
  defaultBriefings?: Partial<Record<ReportAiReportType, string | null>>;
}

export interface ReportAiSavedBriefingV1 {
  briefingId: string;
  reportType: ReportAiReportType;
  name: string;
  text: string;
  createdByUserId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ReportAiSavedBriefingListItemV1 extends ReportAiSavedBriefingV1 {
  /** The current caller can edit or delete this briefing through the requested company route. */
  canManage: boolean;
}

export interface ReportAiSavedBriefingWriteV1 {
  reportType: ReportAiReportType;
  name: string;
  text: string;
}

/**
 * The AI choice a client sends with a job request. The API resolves the briefing text (a saved briefing's current
 * text, else the run text, else the effective MSP default, else none) and the research flag (off when the company
 * does not allow research), then stores the frozen `ReportJobAiAssistantV1` in the job's request.
 */
export interface ReportJobAiRequestV1 {
  /** Run focus typed by the requester. */
  briefing?: string;
  /** A saved briefing to use instead of typed text. */
  savedBriefingId?: string;
  /** Requester's research choice; defaults to the company setting. */
  research?: boolean;
}

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max && value === value.trim();

export const isReportAiReportType = (value: unknown): value is ReportAiReportType =>
  typeof value === 'string' && (REPORT_JOB_AI_REPORT_TYPES as readonly string[]).includes(value);

export const isReportAiSavedBriefingWriteV1 = (value: unknown): value is ReportAiSavedBriefingWriteV1 =>
  isPlainRecord(value) &&
  hasExactlyKeys(value, ['reportType', 'name', 'text']) &&
  isReportAiReportType(value.reportType) &&
  isText(value.name, REPORT_AI_BRIEFING_NAME_MAX_CHARS) &&
  isText(value.text, REPORT_JOB_AI_BRIEFING_MAX_CHARS);

export const isReportJobAiRequestV1 = (value: unknown): value is ReportJobAiRequestV1 =>
  isPlainRecord(value) &&
  hasExactlyKeys(value, [], ['briefing', 'savedBriefingId', 'research']) &&
  (value.briefing === undefined || isText(value.briefing, REPORT_JOB_AI_BRIEFING_MAX_CHARS)) &&
  (value.savedBriefingId === undefined || (typeof value.savedBriefingId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value.savedBriefingId))) &&
  (value.research === undefined || typeof value.research === 'boolean') &&
  !(value.briefing !== undefined && value.savedBriefingId !== undefined);
