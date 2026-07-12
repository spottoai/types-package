import type {
  AIChatCanonicalStreamEvent,
  AIChatCanonicalStreamEventName,
  AIChatDoneEvent,
  AIChatRunCompletedEvent,
  AIChatRunStartRequest,
  AIChatTerminalSnapshot,
} from '../index';

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
