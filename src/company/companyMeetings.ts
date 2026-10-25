import type { CompanyContextActor, CompanyContextCoverage, CompanyContextNoteSource, CompanyContextSourceLocator } from './companyContext';
import type { CompanyMemoryAssignee, CompanyMemoryProposal } from './companyMemory';
import type { CompanyNoteOrdinaryDocument } from './companyNotes';

export const COMPANY_MEETING_SCHEMA_VERSION = 1 as const;

export interface CompanyMeetingTranscriptReference {
  companyId: string;
  noteId: string;
  transcriptId: string;
  /** Immutable note revision containing the exact transcript text. */
  transcriptRevisionId: string;
}

export interface CompanyMeetingSpeaker {
  speakerId: string;
  label: string;
  /** Present only after an explicit validated association; a label alone is not identity. */
  personId?: string;
}

export interface CompanyMeetingTranscriptInput {
  title: string;
  /** Date-only yyyy-mm-dd; timestamps and speaker identities are never invented. */
  meetingDate: string;
  text: string;
  speakers?: CompanyMeetingSpeaker[];
}

export interface CompanyMeetingTranscript extends CompanyMeetingTranscriptInput {
  schemaVersion: typeof COMPANY_MEETING_SCHEMA_VERSION;
  reference: CompanyMeetingTranscriptReference;
  savedAt: string;
}

export type CompanyMeetingTranscriptSaveRequest = {
  companyId: string;
  idempotencyKey: string;
  transcript: CompanyMeetingTranscriptInput;
} & (
  | { operation: 'create-meeting'; noteId?: never; baseRevisionId?: never }
  | { operation: 'update-transcript'; noteId: string; baseRevisionId: string }
);

/** API checks note/company/revision/transcript equality against the summary's bound source. */
export type CompanyMeetingTranscriptPassage = CompanyContextNoteSource & {
  transcriptId: string;
  locator: Extract<CompanyContextSourceLocator, { kind: 'passage' }>;
  sourceTimestamp?: string;
  speakerId?: string;
};

export interface CompanyMeetingSummaryBullet {
  bulletId: string;
  kind: 'decision' | 'requirement' | 'constraint' | 'responsibility' | 'commitment' | 'action' | 'open-question';
  text: string;
  certainty: 'reported' | 'tentative' | 'agreed' | 'uncertain';
  sourcePassages: [CompanyMeetingTranscriptPassage, ...CompanyMeetingTranscriptPassage[]];
  speakerIds?: string[];
  owner?: CompanyMemoryAssignee;
  dueDate?: string;
}

export interface CompanyMeetingSummaryDraft {
  transcript: CompanyMeetingTranscriptReference;
  bullets: CompanyMeetingSummaryBullet[];
  coverage: CompanyContextCoverage;
}

export type CompanyMeetingSummary = CompanyMeetingSummaryDraft & {
  summaryRevisionId: string;
  review: { state: 'draft' | 'needs-review' } | { state: 'reviewed'; reviewedAt: string; reviewedBy: CompanyContextActor };
};

export interface CompanyMeetingExtractionRequest {
  companyId: string;
  transcript: CompanyMeetingTranscriptReference;
  /** An explicit bounded section selection; omission requests the whole source within API limits. */
  passageIds?: string[];
}

/** Extraction is a proposal response, not a note-save or memory-approval receipt. */
export interface CompanyMeetingExtractionResponse {
  schemaVersion: typeof COMPANY_MEETING_SCHEMA_VERSION;
  companyId: string;
  extractionId: string;
  transcript: CompanyMeetingTranscriptReference;
  summary: CompanyMeetingSummaryDraft;
  memoryProposals: CompanyMemoryProposal[];
  coverage: CompanyContextCoverage;
}

export interface CompanyMeetingSummarySaveRequest {
  companyId: string;
  noteId: string;
  baseRevisionId: string;
  idempotencyKey: string;
  reviewedTranscriptRevisionId: string;
  bullets: CompanyMeetingSummaryBullet[];
}

export interface CompanyMeetingSummarySaveResponse {
  companyId: string;
  noteId: string;
  revisionId: string;
  summary: CompanyMeetingSummary;
}

/** New meeting-aware readers preserve both source and reviewed interpretation in complete note snapshots. */
export type CompanyMeetingNoteDocument = Omit<CompanyNoteOrdinaryDocument, 'category'> & {
  category: 'meeting';
  meeting: {
    transcript: CompanyMeetingTranscript;
    summary?: CompanyMeetingSummary;
  };
};
