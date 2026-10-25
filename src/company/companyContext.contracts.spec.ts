import type {
  AIChatCitation,
  AIChatEvidenceCoverage,
  AIChatMemoryMatch,
  CompanyContextCoverage,
  CompanyContextNoteSource,
  CompanyContextSource,
  CompanyContextUnavailableSource,
  CompanyContextUsage,
  CompanyMeetingExtractionResponse,
  CompanyMeetingSummaryBullet,
  CompanyMeetingSummarySaveRequest,
  CompanyMeetingTranscriptReference,
  CompanyMemoryEntry,
  CompanyMemoryIdentity,
  CompanyMemoryMutationRequest,
  CompanyMemoryMutationResult,
  CompanyMemoryProposal,
  CompanyMemoryPromotionPreviewRequest,
  CompanyMemoryPromotionCommitRequest,
  CompanyMemoryResponsibility,
  CompanyMeetingNoteDocument,
  CompanyNoteRevisionSnapshot,
  CompanyNoteRevisionUpdateRequest,
  UpdateCompanyNoteRequest,
} from '../index';

const source: CompanyContextNoteSource = {
  companyId: 'company-1',
  kind: 'company-note',
  sourceId: 'meeting-1',
  version: { kind: 'revision', revisionId: 'note-revision-1' },
  locator: { kind: 'passage', passageId: 'transcript:paragraph-4' },
};
const coverage: CompanyContextCoverage = {
  status: 'partial',
  reasonCodes: ['context.byte_limit'],
  sources: [{ sourceKind: 'company-note', status: 'partial', reasonCode: 'context.byte_limit' }],
};
const responsibility: CompanyMemoryResponsibility = {
  relationship: 'technical-owner',
  areaId: 'erp',
  assignee: { kind: 'person', personId: 'alex' },
};
const proposal: CompanyMemoryProposal = {
  schemaVersion: 1,
  companyId: 'company-1',
  memoryId: 'memory-1',
  revisionId: 'memory-revision-1',
  contentHash: 'opaque-content-hash',
  content: {
    kind: 'responsibility',
    statement: 'Alex owns ERP recovery planning.',
    responsibility,
    facets: { topics: ['reliability', 'operations'], areaIds: ['erp'], personIds: ['alex'], teamIds: [] },
  },
  sources: [source],
  provenance: { kind: 'model-interpretation', confidence: 'medium', uncertainty: 'Confirm the speaker identity.' },
  createdAt: '2026-10-25T00:00:00.000Z',
  updatedAt: '2026-10-25T00:00:00.000Z',
  createdBy: { kind: 'service', serviceId: 'meeting-extraction' },
  review: { state: 'proposed' },
};
const activeEntry: CompanyMemoryEntry = {
  ...proposal,
  review: {
    state: 'active',
    reviewedAt: '2026-10-25T01:00:00.000Z',
    reviewedBy: { kind: 'user', userId: 'reviewer-1' },
  },
  eligibility: { status: 'eligible' },
};
const identity: CompanyMemoryIdentity = {
  companyId: 'company-1',
  identityId: 'alex',
  kind: 'person',
  displayName: 'Alex',
  aliases: [],
  revisionId: 'identity-revision-1',
};
const approve: CompanyMemoryMutationRequest = {
  operation: 'approve',
  companyId: 'company-1',
  memoryId: proposal.memoryId,
  baseRevisionId: proposal.revisionId,
  idempotencyKey: 'approval-1',
  reviewedContentHash: proposal.contentHash,
  reviewedSources: [source],
};
const partialMutation: CompanyMemoryMutationResult = {
  status: 'conflict',
  companyId: 'company-1',
  memoryId: 'memory-1',
  currentRevisionId: 'newer-revision',
  reasonCode: 'memory.stale_revision',
};
const transcript: CompanyMeetingTranscriptReference = {
  companyId: 'company-1',
  noteId: 'meeting-1',
  transcriptId: 'transcript-1',
  transcriptRevisionId: 'note-revision-1',
};
const bullet: CompanyMeetingSummaryBullet = {
  bulletId: 'bullet-1',
  kind: 'responsibility',
  text: 'Alex owns ERP recovery planning.',
  certainty: 'reported',
  sourcePassages: [{ ...source, transcriptId: transcript.transcriptId, locator: { kind: 'passage', passageId: 'transcript:paragraph-4' } }],
};
const extraction: CompanyMeetingExtractionResponse = {
  schemaVersion: 1,
  companyId: 'company-1',
  extractionId: 'extraction-1',
  transcript,
  summary: { transcript, bullets: [bullet], coverage },
  memoryProposals: [proposal],
  coverage,
};
const saveSummary: CompanyMeetingSummarySaveRequest = {
  companyId: 'company-1',
  noteId: 'meeting-1',
  baseRevisionId: 'note-revision-1',
  idempotencyKey: 'summary-save-1',
  reviewedTranscriptRevisionId: transcript.transcriptRevisionId,
  bullets: [bullet],
};
const usage: CompanyContextUsage = {
  companyId: 'company-1',
  contextVersion: 'context-1',
  matches: [{ source, title: 'Recovery planning', text: bullet.text, observedAt: '2026-10-25T00:00:00.000Z' }],
  coverage,
};
const evidence: AIChatEvidenceCoverage = {
  sourceTypes: [],
  evidenceGroups: [],
  citationCoverage: { required: true, satisfied: true, citationCount: 1 },
  companyContext: usage,
};
const citation: AIChatCitation = {
  citationId: 'citation-1',
  sourceType: 'document',
  title: 'Recovery planning',
  locator: 'meeting-1',
  retrievedAt: '2026-10-25T00:00:00.000Z',
  companyContextSource: source,
};
const legacyMemory: AIChatMemoryMatch = {
  memoryId: 'legacy-1',
  source: { conversationId: 'private-conversation-1' },
  score: 1,
  summary: 'Owned chat context',
};
const legacyUpdate: UpdateCompanyNoteRequest = {
  title: 'Meeting',
  noteDate: '2026-10-25',
  category: 'meeting',
  content: { format: 'tiptap-json', document: { type: 'doc', content: [] } },
};
const revisionUpdate: CompanyNoteRevisionUpdateRequest = {
  ...legacyUpdate,
  expectedRevision: undefined,
  baseRevisionId: 'note-revision-1',
  idempotencyKey: 'note-save-1',
};
const promotionPreview: CompanyMemoryPromotionPreviewRequest = {
  companyId: 'company-1',
  conversationId: 'owned-private-chat',
  messageIds: ['message-1'],
  content: proposal.content,
};
const promotionCommit: CompanyMemoryPromotionCommitRequest = {
  companyId: 'company-1',
  previewId: 'preview-1',
  baseRevisionId: 'preview-revision-1',
  reviewedContentHash: 'approved-wording-hash',
  idempotencyKey: 'promote-1',
};
const meetingDocument: CompanyMeetingNoteDocument = {
  schemaVersion: 1,
  companyId: 'company-1',
  noteId: 'meeting-1',
  category: 'meeting',
  title: 'Recovery planning',
  noteDate: '2026-10-25',
  createdAt: '2026-10-25T00:00:00.000Z',
  updatedAt: '2026-10-25T00:00:00.000Z',
  content: { format: 'tiptap-json', document: { type: 'doc', content: [] } },
  meeting: {
    transcript: {
      schemaVersion: 1,
      reference: transcript,
      title: 'Recovery planning',
      meetingDate: '2026-10-25',
      text: 'Alex owns ERP recovery planning.',
      savedAt: '2026-10-25T00:00:00.000Z',
    },
    summary: { ...extraction.summary, summaryRevisionId: 'summary-revision-1', review: { state: 'needs-review' } },
  },
};
const meetingSnapshot: CompanyNoteRevisionSnapshot = {
  revision: {
    companyId: 'company-1',
    noteId: 'meeting-1',
    revisionId: 'rev-2',
    sequence: 2,
    contentHash: 'note-hash',
    createdAt: '2026-10-25T00:00:00.000Z',
    actor: { kind: 'user', userId: 'user-1' },
    operation: 'update',
  },
  document: meetingDocument,
  deleted: false,
};

// @ts-expect-error a company note must name an immutable note revision, never an environment generation.
const wrongSourceVersion: CompanyContextSource = { ...source, version: { kind: 'generation', generationId: 'env-1' } };

// @ts-expect-error source references require an exact revision or generation.
const unversionedSource: CompanyContextSource = { ...source, version: { kind: 'revision' } };
// @ts-expect-error private conversations are not company-visible source references.
const privateSource: CompanyContextSource = { ...source, kind: 'conversation' };
// @ts-expect-error denied coverage cannot disclose a source title.
const deniedLeak: CompanyContextUnavailableSource = { sourceKind: 'company-note', status: 'denied', reasonCode: 'denied', title: 'Private' };
// @ts-expect-error a proposal is not an approved entry and carries no eligibility decision.
const proposalAsEntry: CompanyMemoryEntry = proposal;
// @ts-expect-error active review requires a server-attributed reviewer and review time.
const missingReviewer: CompanyMemoryEntry = { ...activeEntry, review: { state: 'active' } };
// @ts-expect-error responsibility cannot be inferred without an explicit subject and assignee.
const missingAssignee: CompanyMemoryResponsibility = { relationship: 'technical-owner', areaId: 'erp' };
// @ts-expect-error an approval must bind the source snapshot as well as the content.
const unboundApproval: CompanyMemoryMutationRequest = { ...approve, reviewedSources: [] };
// @ts-expect-error source-backed proposals need at least one source.
const sourcelessProposal: CompanyMemoryProposal = { ...proposal, sources: [] };
// @ts-expect-error a meeting summary bullet needs a source passage.
const sourcelessBullet: CompanyMeetingSummaryBullet = { ...bullet, sourcePassages: [] };
// @ts-expect-error stale edits cannot omit their expected base revision.
const unguardedSummarySave: CompanyMeetingSummarySaveRequest = {
  companyId: 'company-1',
  noteId: 'meeting-1',
  idempotencyKey: 'save',
  reviewedTranscriptRevisionId: 'rev-1',
  bullets: [],
};
// @ts-expect-error new revision-aware note writes require an explicit concurrency token.
const unguardedNoteWrite: CompanyNoteRevisionUpdateRequest = legacyUpdate;
// @ts-expect-error numeric legacy concurrency and immutable revisions cannot be mixed.
const mixedConcurrency: CompanyNoteRevisionUpdateRequest = { ...revisionUpdate, expectedRevision: 1 };
const documentOnlyBullet: CompanyMeetingSummaryBullet = {
  ...bullet,
  // @ts-expect-error a summary bullet must identify a transcript passage, not a whole document.
  sourcePassages: [{ ...source, transcriptId: 'transcript-1', locator: { kind: 'document' } }],
};
const questionOnlyBullet: CompanyMeetingSummaryBullet = {
  ...bullet,
  // @ts-expect-error structured-question provenance is not supporting transcript speech.
  sourcePassages: [{ ...source, transcriptId: 'transcript-1', locator: { kind: 'question', questionId: 'recovery-target' } }],
};
const unidentifiedTranscriptBullet: CompanyMeetingSummaryBullet = {
  ...bullet,
  // @ts-expect-error a transcript passage must identify which transcript supplies the words.
  sourcePassages: [{ ...source, locator: { kind: 'passage', passageId: 'p-1' } }],
};
// @ts-expect-error shared-source metadata must never contain the private chat identifier.
const leakedPrivateChat: CompanyContextSource = { ...source, conversationId: promotionPreview.conversationId };
// @ts-expect-error promotion approval binds the exact preview content hash.
const unboundPromotion: CompanyMemoryPromotionCommitRequest = {
  companyId: 'company-1',
  previewId: 'preview-1',
  baseRevisionId: 'rev-1',
  idempotencyKey: 'save',
};

void [identity, partialMutation, extraction, saveSummary, evidence, citation, legacyMemory, revisionUpdate];
void [unversionedSource, privateSource, deniedLeak, proposalAsEntry, missingReviewer, missingAssignee];
void [unboundApproval, sourcelessProposal, sourcelessBullet, unguardedSummarySave, unguardedNoteWrite, mixedConcurrency];
void wrongSourceVersion;
void [documentOnlyBullet, questionOnlyBullet];
void unidentifiedTranscriptBullet;
void [promotionCommit, meetingSnapshot, leakedPrivateChat, unboundPromotion];
