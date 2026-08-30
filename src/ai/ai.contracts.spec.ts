import type {
  AIChatCanonicalStreamEvent,
  AIChatCanonicalStreamEventName,
  AIChatEvidenceCoverage,
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
  safeLabel: 'Production subscription cost summary',
  portalRoute: '/companies/company-1/subscriptions/subscription-1/cost',
  scope: {
    kind: 'azure-subscription',
    tenantId: 'tenant-1',
    companyId: 'company-1',
    subscriptionId: 'subscription-1',
  },
  artifactKind: 'subscription-summary',
  sourceGeneration: {
    viewSetSchemaVersion: 1,
    publicationId: 'publication-1',
    portalRunId: 'portal:run/1',
    pluginRunId: 'plugin:run/1',
    economicsGenerationId: 'economics-1',
    economicsFingerprint: 'source-fingerprint',
    completedAt: '2026-08-29T00:00:00.000Z',
  },
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
};

void canonicalEvent;
void canonicalTerminalName;
void pageStartRequest;
void compatibilityDoneEvent;

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
