import type {
  AIChatAnswerDraftEvent,
  AIChatAnswerDraftResetEvent,
  AIChatGuardrailTriggeredEvent,
  AIChatModelCallRecord,
  AIChatRoutingCompletedEvent,
  AIChatRunFailedEvent,
  AIChatToolCallEvent,
  AIChatToolErrorEvent,
  AIChatToolResultEvent,
  AIChatTurnDiagnosticsEvent,
  AIChatTurnLatencySummary,
  AIChatCanonicalStreamEvent,
  AIChatCanonicalStreamEventName,
  AIChatEvidenceCoverage,
  AIChatGroundingSummary,
  AIChatRetrievalSourceType,
  AIChatToolDescriptor,
  AIChatDoneEvent,
  AIEnvironmentEvidenceMatch,
  AIChatRunCompletedEvent,
  AIChatRunStartRequest,
  AIChatTerminalSnapshot,
} from '../index';

const environmentSource: AIChatRetrievalSourceType = 'environment';
const compatibleExistingSources: AIChatRetrievalSourceType[] = ['operational', 'memory', 'knowledge', 'external'];

const environmentMatch: AIEnvironmentEvidenceMatch = {
  safeLabel: 'Production subscription environment',
  portalRoute: '/company/company-1/dashboard',
  artifactKind: 'subscription-recommendations',
  sourceCompletedAt: '2026-08-29T00:00:00.000Z',
  coverageStatus: 'partial',
  truncated: true,
  citationIds: ['environment-call-1'],
};

const grounding: AIChatGroundingSummary = {
  status: 'verified',
  method: 'deterministic-citation-and-value',
  totalClaimCount: 1,
  verifiedClaimCount: 1,
  claims: [{ claimId: 'claim-1', status: 'verified', citationIds: ['environment-call-1'] }],
};

const environmentCoverage: AIChatEvidenceCoverage = {
  sourceTypes: ['environment'],
  evidenceGroups: [],
  citationCoverage: { required: true, satisfied: true, citationCount: 1 },
  environmentMatches: [environmentMatch],
};

const environmentTool: AIChatToolDescriptor = {
  toolName: 'environment_read',
  source: 'internal',
  title: 'Read environment evidence',
  description: 'Reads one authorized environment document.',
  mutationMode: 'read',
  retrievalSourceType: 'environment',
};

void environmentSource;
void compatibleExistingSources;
void environmentCoverage;
void environmentTool;

const run = {
  runId: 'run-1',
  status: 'completed' as const,
  updatedAt: '2026-07-12T00:00:00.000Z',
};

const terminalSnapshot: AIChatTerminalSnapshot = {
  conversationId: 'conversation-1',
  runId: run.runId,
  run,
  turnSnapshot: {
    run,
    turn: {
      turnId: 'turn-1',
      runId: run.runId,
      phase: 'completed',
      status: 'completed',
      updatedAt: run.updatedAt,
    },
  },
  answer: 'Completed answer',
  grounding,
  contractOutput: {
    contract: 'customerDecisionBrief',
    value: {
      headline: 'Reduce the highest production exposure first.',
      businessOutcomes: ['Improve audit readiness.', 'Reduce avoidable access risk.'],
      costOfDelay: ['Known exposure remains open.', 'Remediation evidence remains incomplete.'],
      decisionRequired: 'Approve the first package, owner, and review date.',
    },
  },
};

const completedEvent: AIChatRunCompletedEvent = {
  event: 'runCompleted',
  sequence: 3,
  conversationId: terminalSnapshot.conversationId,
  runId: run.runId,
  turnId: terminalSnapshot.turnSnapshot.turn.turnId,
  timestamp: run.updatedAt,
  run,
  terminalSnapshot,
};

const canonicalEvent: AIChatCanonicalStreamEvent = completedEvent;
const canonicalTerminalName: AIChatCanonicalStreamEventName = 'runCompleted';

const pageStartRequest: AIChatRunStartRequest = {
  action: 'start',
  chatMode: 'page',
  input: 'What should I focus on?',
  stream: true,
  outputContract: 'customerDecisionBrief',
  pageContext: {
    pageType: 'dashboard',
    companyId: 'comp-1',
    pageUrl: '/dashboard',
  },
};

// Compatibility remains explicit for parsers while being excluded from the
// canonical producer union above.
const compatibilityDoneEvent: AIChatDoneEvent = {
  ...completedEvent,
  event: 'done',
  grounding,
};

void canonicalEvent;
void canonicalTerminalName;
void pageStartRequest;
void compatibilityDoneEvent;

const invalidEnvironmentMatch: AIEnvironmentEvidenceMatch = {
  ...environmentMatch,
  // @ts-expect-error client-safe environment evidence cannot carry raw scope identities.
  scope: { kind: 'azure-subscription', tenantId: 'tenant-1', companyId: 'company-1', subscriptionId: 'subscription-1' },
};

const invalidGroundingConfidence: AIChatGroundingSummary = {
  ...grounding,
  // @ts-expect-error deterministic grounding never exposes model confidence.
  confidencePercentage: '100',
};

void invalidEnvironmentMatch;
void invalidGroundingConfidence;

// @ts-expect-error canonical streams must not use the deprecated done terminal.
const invalidCanonicalTerminalName: AIChatCanonicalStreamEventName = 'done';

// @ts-expect-error runCompleted requires an authoritative terminalSnapshot.
const invalidCompletedEvent: AIChatRunCompletedEvent = {
  event: 'runCompleted',
  sequence: 3,
  conversationId: 'conversation-1',
  runId: 'run-1',
  turnId: 'turn-1',
  timestamp: run.updatedAt,
  run,
};

// @ts-expect-error page starts require pageContext.
const invalidPageStartRequest: AIChatRunStartRequest = {
  action: 'start',
  chatMode: 'page',
  input: 'What should I focus on?',
  stream: true,
};

void invalidCanonicalTerminalName;
void invalidCompletedEvent;
void invalidPageStartRequest;

const answerDraftEvent: AIChatAnswerDraftEvent = {
  event: 'answerDraft',
  sequence: 4,
  conversationId: 'conversation-1',
  runId: 'run-1',
  turnId: 'turn-1',
  timestamp: '2026-09-11T00:00:00.000Z',
  delta: 'Six workloads are unprotected',
};

const answerDraftResetEvent: AIChatAnswerDraftResetEvent = {
  ...answerDraftEvent,
  event: 'answerDraftReset',
  reason: 'toolCall',
};

const guardrailDraftResetEvent: AIChatAnswerDraftResetEvent = {
  ...answerDraftResetEvent,
  reason: 'outputGuardrail',
};

const canonicalDraftEvents: AIChatCanonicalStreamEvent[] = [answerDraftEvent, answerDraftResetEvent, guardrailDraftResetEvent];
const canonicalDraftNames: AIChatCanonicalStreamEventName[] = ['answerDraft', 'answerDraftReset'];

void canonicalDraftEvents;
void canonicalDraftNames;

const invalidDraftResetReason: AIChatAnswerDraftResetEvent = {
  ...answerDraftResetEvent,
  // @ts-expect-error draft reset reasons are a closed set.
  reason: 'superseded',
};

// @ts-expect-error an answer draft carries only a plain-text delta.
const invalidDraftWithoutDelta: AIChatAnswerDraftEvent = {
  event: 'answerDraft',
  sequence: 5,
  conversationId: 'conversation-1',
  runId: 'run-1',
  turnId: 'turn-1',
  timestamp: '2026-09-11T00:00:00.000Z',
};

void invalidDraftResetReason;
void invalidDraftWithoutDelta;

const envelope = {
  conversationId: 'conversation-1',
  runId: 'run-1',
  turnId: 'turn-1',
  timestamp: '2026-09-11T00:00:00.000Z',
};

const guardrailTriggeredEvent: AIChatGuardrailTriggeredEvent = {
  ...envelope,
  event: 'guardrailTriggered',
  sequence: 6,
  stage: 'output',
  action: 'fallback',
  category: 'internal_state_disclosure',
  reasonCode: 'guardrail.blocked_output',
  message: "I can help with scoped analysis and approved actions, but I can't expose internal-only data.",
};

const runFailedEvent: AIChatRunFailedEvent = {
  ...envelope,
  event: 'runFailed',
  sequence: 7,
  run: { runId: 'run-1', status: 'failed', updatedAt: envelope.timestamp, completedAt: envelope.timestamp },
};

const toolCallEvent: AIChatToolCallEvent = {
  ...envelope,
  event: 'toolCall',
  sequence: 8,
  callId: 'call-1',
  toolName: 'Read environment evidence',
  canonicalToolName: 'environment_read',
  arguments: { document: 'reliability' },
};

const legacyToolCallEvent: AIChatToolCallEvent = { ...toolCallEvent, canonicalToolName: undefined };

const toolResultEvent: AIChatToolResultEvent = {
  ...envelope,
  event: 'toolResult',
  sequence: 9,
  callId: 'call-1',
  toolName: 'Read environment evidence',
  canonicalToolName: 'environment_read',
  result: { ok: true, data: { document: 'pillars/reliability.md' } },
};

const toolErrorEvent: AIChatToolErrorEvent = {
  ...envelope,
  event: 'toolError',
  sequence: 10,
  callId: 'call-2',
  toolName: 'Read environment evidence',
  canonicalToolName: 'environment_read',
  error: { message: 'Environment evidence is unavailable.', retryable: false },
};

const genericModelCall: AIChatModelCallRecord = {
  stage: 'generic',
  model: 'gpt-5.6-terra',
  requestedEffort: 'low',
  effectiveEffort: 'low',
  startedAtMs: 3903,
  elapsedMs: 3558,
  beforeCreatedMs: 2551,
  streamed: true,
  status: 'ok',
  inputTokens: 17860,
  cachedInputTokens: 0,
  outputTokens: 70,
  reasoningTokens: 0,
};

const latency: AIChatTurnLatencySummary = {
  originEpochMs: 1789088400000,
  capturedAtMs: 13124,
  marks: { runStarted: 1344, routingCompleted: 1379, message: 12265 },
  stages: {
    generic: { calls: 2, elapsedMs: 5905, inputTokens: 36269, cachedInputTokens: 17857, outputTokens: 114, reasoningTokens: 0 },
  },
  totals: { calls: 2, elapsedMs: 5905, inputTokens: 36269, cachedInputTokens: 17857, outputTokens: 114, reasoningTokens: 0 },
  modelCalls: [genericModelCall],
  annotations: { route: 'genericToolLoop', continuity: 'none', routeDomains: [] },
};

const turnDiagnosticsEvent: AIChatTurnDiagnosticsEvent = {
  ...envelope,
  event: 'turnDiagnostics',
  sequence: 11,
  diagnostics: {
    ...latency,
    providerHost: 'example.cognitiveservices.azure.com',
    routePath: 'genericToolLoop',
    responseMode: 'adaptive',
    chatMode: 'workspace',
  },
};

const routingCompletedWithDiagnostics: AIChatRoutingCompletedEvent = {
  ...envelope,
  event: 'routingCompleted',
  sequence: 2,
  path: 'genericToolLoop',
  missingInputs: [],
  diagnostics: { marks: latency.marks, modelCalls: [], annotations: latency.annotations },
};

const additiveCanonicalEvents: AIChatCanonicalStreamEvent[] = [
  guardrailTriggeredEvent,
  runFailedEvent,
  toolCallEvent,
  legacyToolCallEvent,
  toolResultEvent,
  toolErrorEvent,
  turnDiagnosticsEvent,
  routingCompletedWithDiagnostics,
];
const additiveCanonicalNames: AIChatCanonicalStreamEventName[] = ['guardrailTriggered', 'runFailed', 'turnDiagnostics'];

void additiveCanonicalEvents;
void additiveCanonicalNames;

const invalidGuardrailStage: AIChatGuardrailTriggeredEvent = {
  ...guardrailTriggeredEvent,
  // @ts-expect-error guardrail stages are a closed set.
  stage: 'formatter',
};

const invalidModelCallStatus: AIChatTurnLatencySummary = {
  ...latency,
  // @ts-expect-error model call status is a closed set.
  modelCalls: [{ ...genericModelCall, status: 'timeout' }],
};

const invalidDiagnosticsWithoutTotals: AIChatTurnDiagnosticsEvent = {
  ...turnDiagnosticsEvent,
  // @ts-expect-error turn diagnostics require whole-turn totals.
  diagnostics: { originEpochMs: 1, capturedAtMs: 1, marks: {}, stages: {}, modelCalls: [] },
};

void invalidGuardrailStage;
void invalidModelCallStatus;
void invalidDiagnosticsWithoutTotals;
