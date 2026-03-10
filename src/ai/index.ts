/** Common AI interfaces shared between frontend and backend */

export type AIResponseStatus = 'complete' | 'needsClarification' | 'needsMoreMetrics';

export type RecommendationPillar = 'Cost Optimization' | 'Performance Efficiency' | 'Security' | 'Reliability' | 'Operational Excellence';

export type RecommendationType = 'advisor' | 'custom' | 'aiGenerated';

export interface RecommendationAction {
  action: 'fix';
  recommendationId: string;
}

export interface AIRecommendation {
  priorityRank: number;
  pillar: RecommendationPillar;
  description: string;
  type: RecommendationType;
  referenceIds: string[];
  actions: RecommendationAction[];
}

export interface StructuredAIResponse {
  status: AIResponseStatus;
  clarificationRequest: string | null;
  metricsRequest: string[];
  friendlyMessage: string;
  recommendations: AIRecommendation[];
}

export interface PageContext {
  pageType: 'resource-detail' | 'recommendation-detail' | 'dashboard' | string;
  pageId?: string;
  tabName?: string;
  companyId: string;
  subscriptionIds?: string[];
  cloudAccountId?: string;
  resourceId?: string;
  recommendationId?: string;
  pageUrl?: string;
  uiState?: Record<string, unknown>;
  contextHash?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  structuredResponse?: StructuredAIResponse;
  responseId?: string;
}

export type AIChatMode = 'page' | 'workspace';

type AIWorkspaceScopePolicyOutcome = 'accepted' | 'intersected' | 'rejected';

interface AIWorkspaceScopeAllAuthorizedRequest {
  mode: 'allAuthorized';
  companyIds?: never;
  subscriptionIds?: never;
  resourceIds?: never;
  includeChildCompanies?: boolean;
}

type AIWorkspaceScopeExplicitIdentifiers =
  | {
      companyIds: string[];
      subscriptionIds?: string[];
      resourceIds?: string[];
    }
  | {
      companyIds?: string[];
      subscriptionIds: string[];
      resourceIds?: string[];
    }
  | {
      companyIds?: string[];
      subscriptionIds?: string[];
      resourceIds: string[];
    };

type AIWorkspaceScopeExplicitRequest = {
  mode: 'explicit';
  includeChildCompanies?: boolean;
} & AIWorkspaceScopeExplicitIdentifiers;

export type AIWorkspaceScopeRequest = AIWorkspaceScopeAllAuthorizedRequest | AIWorkspaceScopeExplicitRequest;

export interface AIResolvedWorkspaceScope {
  companyIds: string[];
  subscriptionIds: string[];
  resourceIds: string[];
  policyOutcome: AIWorkspaceScopePolicyOutcome;
  rejectedCompanyIds?: string[];
  rejectedSubscriptionIds?: string[];
  rejectedResourceIds?: string[];
}

export type AIChatSkillId = string;

export type AIChatDomain = 'cost' | 'performance' | 'security' | 'reliability' | 'governance' | 'operations' | 'general';

export type AIChatIntentLabel =
  | 'askSummary'
  | 'investigateCost'
  | 'investigateSecurity'
  | 'investigateReliability'
  | 'investigateGovernance'
  | 'executeAction'
  | 'explainRecommendation'
  | 'unknown';

export type AIChatComplexity = 'simple' | 'standard' | 'complex';

export interface AIChatClassificationIntent {
  label: AIChatIntentLabel;
  confidence: number;
}

export interface AIChatClassificationResult {
  version: string;
  intents: AIChatClassificationIntent[];
  complexity: AIChatComplexity;
  requiresTools: boolean;
  suggestedSkillPackIds: AIChatSkillId[];
}

type AIChatRoutingReasonCode =
  | 'AI_SKILL_CLASSIFIER_SELECTED'
  | 'AI_SKILL_CLASSIFIER_LOW_CONFIDENCE'
  | 'AI_SKILL_FALLBACK_DEFAULT';

type AIChatScopeReasonCode = 'AI_SCOPE_EMPTY_REQUEST' | 'AI_SCOPE_EMPTY_EFFECTIVE' | 'AI_SCOPE_REDUCED_UNAUTHORIZED_MEMBERS' | 'AI_SCOPE_INVALID';

type AIChatApprovalReasonCode = 'AI_MUTATION_CONFIRMATION_REQUIRED' | 'AI_MUTATION_CONFIRMATION_EXPIRED' | 'AI_MUTATION_CONFIRMATION_REJECTED';

type AIChatDegradedReasonCode =
  | 'AI_LEARN_MCP_UNAVAILABLE'
  | 'AI_LEARN_MCP_TIMEOUT'
  | 'AI_TOOL_TIMEOUT'
  | 'AI_TOOL_PARTIAL_FAILURE'
  | 'AI_DEGRADED_NO_PATH';

type AIChatOrchestrationReasonCode =
  | 'AI_ROUTE_GENERIC'
  | 'AI_ROUTE_ANALYSIS'
  | 'AI_ROUTE_GENERIC_FALLBACK_MEDIUM_CONFIDENCE'
  | 'AI_ROUTE_CLARIFY_LOW_CONFIDENCE'
  | 'AI_PLAN_CREATED'
  | 'AI_PLAN_NO_ELIGIBLE_SPECIALISTS'
  | 'AI_SPECIALIST_STARTED'
  | 'AI_SPECIALIST_COMPLETED'
  | 'AI_SPECIALIST_FAILED'
  | 'AI_SYNTHESIS_COMPLETED'
  | 'AI_SYNTHESIS_CONFLICT_DETECTED'
  | 'AI_CRITIC_SKIPPED'
  | 'AI_CRITIC_PASS'
  | 'AI_CRITIC_REVISE'
  | 'AI_REVISION_LOOP_LIMIT_REACHED';

export type AIChatReasonCode =
  | AIChatRoutingReasonCode
  | AIChatScopeReasonCode
  | AIChatApprovalReasonCode
  | AIChatDegradedReasonCode
  | AIChatOrchestrationReasonCode;

export type AIRouteReasonCode =
  | 'route.low_confidence'
  | 'route.page_context_sufficient'
  | 'route.cross_domain_analysis_required'
  | 'route.retrieval_required'
  | 'route.missing_required_inputs'
  | `route.${string}`;

export type AIToolReasonCode =
  | 'tool.not_authorized'
  | 'tool.out_of_scope'
  | 'tool.missing_required_arguments'
  | 'tool.requires_confirmation'
  | 'tool.not_applicable_to_page'
  | `tool.${string}`;

export type AIFreshnessReasonCode =
  | 'freshness.current'
  | 'freshness.stale_source'
  | 'freshness.partial_data'
  | 'freshness.refresh_in_progress'
  | `freshness.${string}`;

export type AISchemaReasonCode =
  | 'schema.parse_failed'
  | 'schema.validation_failed'
  | 'schema.missing_required_field'
  | 'schema.invalid_enum_value'
  | `schema.${string}`;

export type AIReasonCode = AIRouteReasonCode | AIToolReasonCode | AIFreshnessReasonCode | AISchemaReasonCode;

export interface AISchemaIssue {
  reasonCode: AISchemaReasonCode;
  fieldPath?: string;
  detail?: string;
}

export interface AIChatSkillClassificationCandidate {
  skillId: AIChatSkillId;
  score: number;
  reasonCodes: AIChatReasonCode[];
}

export interface AIChatSkillClassificationResult {
  classifierVersion: string;
  selectedSkillPackId?: AIChatSkillId;
  candidates: AIChatSkillClassificationCandidate[];
  reasonCodes?: AIChatReasonCode[];
}

export type AIChatRoutingStrategy = 'singleAgent' | 'fanout';

export interface AIChatRoutingSubtaskPlan {
  subtaskId: string;
  domain: AIChatDomain;
  title: string;
  skillPackId?: AIChatSkillId;
}

export interface AIChatRoutingDecision {
  strategy: AIChatRoutingStrategy;
  selectedMode: AIChatMode;
  selectedSkillPackIds: AIChatSkillId[];
  reasonCodes: AIChatReasonCode[];
  subtasks?: AIChatRoutingSubtaskPlan[];
}

export type AIChatSkillRouteSource = 'auto' | 'default';

export type AIChatSkillRoutePolicyOutcome = 'accepted' | 'fallback' | 'rejected';

export interface AIChatSkillRouteTarget {
  skillPackId: AIChatSkillId;
  skillPackVersion: string;
  routeSource: AIChatSkillRouteSource;
  policyOutcome: AIChatSkillRoutePolicyOutcome;
}

export interface AIChatSkillRoutingFallback {
  fromSkillPackId?: AIChatSkillId;
  toRoute: AIChatSkillRouteTarget;
  reasonCode: AIChatReasonCode;
}

export interface AIChatSkillRoutingDecision {
  selectedSkillPackId?: AIChatSkillId;
  route: AIChatSkillRouteTarget;
  reasonCodes: AIChatReasonCode[];
  fallback?: AIChatSkillRoutingFallback;
}

export type AIChatClassificationMetadata = AIChatClassificationResult | AIChatSkillClassificationResult;

export type AIChatRoutingMetadata = AIChatRoutingDecision | AIChatSkillRoutingDecision;

export type AIEntityType = 'company' | 'subscription' | 'resource' | 'recommendation' | string;

export interface AIEntityRef {
  id: string;
  label?: string;
  type: AIEntityType;
}

export type AIPageIntentHint = 'thisPage' | 'theseRows' | 'thisResource' | 'crossPage';

export interface AIPageFreshness {
  capturedAt: string;
  dataAsOf?: string;
  isStale?: boolean;
  stalenessReason?: string;
  reasonCode?: AIFreshnessReasonCode;
}

export interface AIChatPageSnapshot {
  pageType: string;
  pageId?: string;
  pageUrl?: string;
  companyId?: string;
  title?: string;
  summary?: string;
  routePath?: string;
  tab?: string;
  view?: string;
  selectedEntities: AIEntityRef[];
  scopeLabels: {
    company?: string;
    subscriptions?: string[];
    resources?: string[];
  };
  uiState?: Record<string, unknown>;
  loadedDataHints?: string[];
  intentHints?: AIPageIntentHint[];
  freshness?: AIPageFreshness;
}

export type AIChatMutationMode = 'read' | 'writeRequiresApproval' | 'writeBlocked';

export interface AIChatToolAffordanceEntry {
  toolName: string;
  title?: string;
  reasonCode?: AIReasonCode;
  reason?: string;
  missingArgs?: string[];
  requiresApproval?: boolean;
}

export interface AIChatBlockedToolAffordanceEntry extends AIChatToolAffordanceEntry {
  blockReasonCode?: AIReasonCode;
  blockReason?: string;
}

export interface AIChatToolAffordanceSnapshot {
  availableTools: AIChatToolAffordanceEntry[];
  applicableTools: AIChatToolAffordanceEntry[];
  deferredTools: AIChatToolAffordanceEntry[];
  writeTools: AIChatToolAffordanceEntry[];
  blockedTools: AIChatBlockedToolAffordanceEntry[];
}

export type AIOrchestrationPath = 'clarify' | 'pageAnswer' | 'genericToolLoop' | 'analysisWithRetrieval';

export interface AIRouterDomainScore {
  name: 'cost' | 'performance' | 'reliability' | 'security' | 'operations' | string;
  confidence: number;
}

export interface AIRouterOutput {
  path: AIOrchestrationPath;
  confidence: number;
  entitiesInFocus: string[];
  domains: AIRouterDomainScore[];
  needsRetrieval: boolean;
  missingInputs: string[];
  reasonCode?: AIRouteReasonCode;
  whyThisPath?: string;
  complexity?: AIChatComplexity;
}

export type AIPlannerPriority = 'P1' | 'P2' | 'P3';

export interface AIPlannerWorkItem {
  workItemId: string;
  domain: string;
  task: string;
  priority: AIPlannerPriority;
}

export interface AIPlannerRetrievalStep {
  retrievalId: string;
  toolName: string;
  purpose: string;
  arguments: Record<string, unknown>;
  required: boolean;
}

export interface AIPlannerOutput {
  investigationGoal: string;
  decisionToSupport: string;
  workItems: AIPlannerWorkItem[];
  retrievalPlan: AIPlannerRetrievalStep[];
  successCriteria: string[];
}

export type AICitationSourceType = 'toolResult' | 'pageData' | 'document' | 'metric' | 'log' | string;

export interface AIEvidencePayloadMeta {
  payloadShape?: 'summary' | 'compact' | 'full';
  truncated?: boolean;
  truncationReasonCode?: AIReasonCode;
  estimatedItemCount?: number;
}

export interface AIChatCitation {
  citationId: string;
  sourceType: AICitationSourceType;
  title: string;
  locator: string;
  snippet?: string;
  toolName?: string;
  retrievedAt: string;
}

export interface AIChatToolExecutionError {
  message: string;
  reasonCode?: AIReasonCode;
  retryable?: boolean;
  details?: unknown;
}

export interface AIChatToolExecutionResult {
  ok: boolean;
  data?: unknown;
  error?: AIChatToolExecutionError;
  truncated?: boolean;
}

export interface AIToolError extends AIChatToolExecutionError {
  code: string;
}

export interface AIToolResult extends AIChatToolExecutionResult {
  toolName: string;
  error?: AIToolError;
  payloadMeta?: AIEvidencePayloadMeta;
}

export interface AIToolCall {
  callId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface AIRetrievalExecutionStep {
  retrievalId: string;
  toolName: string;
  argsHash: string;
  startedAt: string;
  endedAt?: string;
  status: 'ok' | 'error' | 'skipped';
  summary?: string;
  callId?: string;
  error?: AIToolError;
  citationIds: string[];
  rawHandle?: string;
}

export interface AIEvidenceEntry {
  evidenceId: string;
  sourceTool: string;
  argsHash: string;
  timestamp: string;
  status: 'ok' | 'error' | 'partial';
  summary: string;
  rawHandle?: string;
  citationIds: string[];
  domains?: string[];
  payloadMeta?: AIEvidencePayloadMeta;
}

export interface AIEvidenceGap {
  gapId: string;
  description: string;
  blocking: boolean;
  suggestedFollowup?: string;
}

export interface AIEvidenceLabelMap {
  companies?: Record<string, string>;
  subscriptions?: Record<string, string>;
  resources?: Record<string, string>;
  recommendations?: Record<string, string>;
}

export interface AIEvidenceBundle {
  bundleId: string;
  entries: AIEvidenceEntry[];
  citations: AIChatCitation[];
  labelMap: AIEvidenceLabelMap;
  gaps: AIEvidenceGap[];
  createdAt: string;
}

export interface AIRetrievalExecution {
  retrievalPlan: AIPlannerRetrievalStep[];
  executionSteps: AIRetrievalExecutionStep[];
  followupPassExecuted: boolean;
  evidenceBundle: AIEvidenceBundle;
}

export interface AISpecialistAction {
  title: string;
  risk: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface AISpecialistTradeoff {
  withDomain: string;
  summary: string;
}

export interface AISpecialistOutput {
  specialistId: string;
  domain: string;
  topFindings: string[];
  evidence: string[];
  actions: AISpecialistAction[];
  tradeoffs: AISpecialistTradeoff[];
  assumptions: string[];
  dataGaps: string[];
  followupRetrieval: AIPlannerRetrievalStep[];
  confidence: number;
}

export interface AISynthesisOutput {
  recommendedPlan: string;
  alternatives: string[];
  keyActions: string[];
  risks: string[];
  evidenceTrace: string[];
  unresolvedGaps: string[];
  confidence: number;
  disagreement: boolean;
}

export interface AICriticOutput {
  verdict: 'PASS' | 'REVISE';
  confidence: number;
  reason: string;
  issues: string[];
  rerunAgents: string[];
}

export type AIHtmlLitePolicy = 'htmlLite';

export interface AIFormatterOutput {
  policy: AIHtmlLitePolicy;
  answerHtml: string;
  answerText: string;
  citations: AIChatCitation[];
  labelFirstApplied: boolean;
  normalizationHash: string;
}

export type AIChatTurnPhase =
  | 'intake'
  | 'contextResolved'
  | 'skillResolved'
  | 'planning'
  | 'executing'
  | 'awaitingApproval'
  | 'formatting'
  | 'finalizing'
  | 'completed'
  | 'errored'
  | 'cancelled';

export type AIChatTurnStatus = 'running' | 'waiting' | 'completed' | 'errored' | 'cancelled';

export interface AIChatTurnState {
  turnId: string;
  phase: AIChatTurnPhase;
  status: AIChatTurnStatus;
  updatedAt: string;
  path?: AIOrchestrationPath;
  analysisConfidence?: number;
  selectedSkillPackId?: AIChatSkillId;
}

export type AIChatCommentaryKind = 'preamble' | 'progress' | 'finding' | 'handoff';

export interface AIChatCommentaryEntry {
  commentaryId: string;
  kind: AIChatCommentaryKind;
  text: string;
  timestamp: string;
  phase?: AIChatTurnPhase;
  progressId?: string;
}

export type AIChatPlanStepStatus = 'pending' | 'running' | 'completed' | 'blocked';

export interface AIChatPlanStep {
  stepId: string;
  label: string;
  status: AIChatPlanStepStatus;
  summary?: string;
  domain?: AIChatDomain;
}

export interface AIChatPlanSnapshot {
  planId: string;
  goal?: string;
  updatedAt: string;
  steps: AIChatPlanStep[];
}

export type AIChatProgressCategory =
  | 'context'
  | 'routing'
  | 'planning'
  | 'retrieval'
  | 'toolExecution'
  | 'subtask'
  | 'approval'
  | 'formatting'
  | 'finalization';

export type AIChatProgressStatus = 'pending' | 'running' | 'completed' | 'blocked' | 'failed' | 'skipped';

export interface AIChatProgressEntry {
  progressId: string;
  category: AIChatProgressCategory;
  status: AIChatProgressStatus;
  title: string;
  detail?: string;
  timestamp: string;
  phase?: AIChatTurnPhase;
  stepId?: string;
  callId?: string;
  subtaskId?: string;
  reasonCode?: AIReasonCode;
}

export type AIChatApprovalState = 'pending' | 'approved' | 'rejected' | 'consumed' | 'expired' | 'completed' | 'failed';

export interface AIChatApprovalRecord {
  challengeId: string;
  state: AIChatApprovalState;
  actionSummary: string;
  actionType?: string;
  requiredRole: string;
  riskLevel: 'low' | 'medium' | 'high';
  idempotencyKey: string;
  createdAt: string;
  decidedAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  detail?: string;
}

export interface AIChatSkillPackDescriptor {
  skillId: AIChatSkillId;
  version: string;
  title: string;
  description?: string;
  domains: AIChatDomain[];
  supportedModes: AIChatMode[];
  intentSignals: string[];
  toolPolicy: {
    allowedToolNames?: string[];
    blockedToolNames?: string[];
    allowLearnMcp?: boolean;
    allowMutations: boolean;
  };
  approvalPolicy: {
    required: boolean;
    requiredRole?: string;
    defaultRiskLevel?: 'low' | 'medium' | 'high';
  };
  uxHints?: {
    commentaryStyle?: 'compact' | 'standard';
    showPlanByDefault?: boolean;
    preferredProgressCategories?: AIChatProgressCategory[];
  };
  fallbackPath?: AIOrchestrationPath;
  enabled: boolean;
}

export interface AIChatToolDescriptor {
  toolName: string;
  source: 'internal' | 'learnMcp' | string;
  title: string;
  description: string;
  domains?: AIChatDomain[];
  mutationMode: AIChatMutationMode;
  approvalRequirement?: {
    required: boolean;
    requiredRole?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  scopeHints?: {
    chatModes?: AIChatMode[];
    requiresWorkspaceScope?: boolean;
    pageTypes?: string[];
  };
  evidenceKinds?: string[];
  resultShape?: string;
  usageHints?: string[];
  avoidWhen?: string[];
}

export interface AIChatTurnSnapshot {
  turn: AIChatTurnState;
  selectedSkillPack?: AIChatSkillPackDescriptor;
  plan?: AIChatPlanSnapshot;
  commentaryEntries?: AIChatCommentaryEntry[];
  progressEntries?: AIChatProgressEntry[];
  approvalRecords?: AIChatApprovalRecord[];
  toolDescriptors?: AIChatToolDescriptor[];
}

export interface AIChatFinalSnapshot {
  turnSnapshot: AIChatTurnSnapshot;
  pageSnapshot?: AIChatPageSnapshot;
  toolAffordanceSnapshot?: AIChatToolAffordanceSnapshot;
  router?: AIRouterOutput;
  planner?: AIPlannerOutput;
  retrieval?: AIRetrievalExecution;
  specialistOutputs?: AISpecialistOutput[];
  synthesis?: AISynthesisOutput;
  critic?: AICriticOutput;
  formatter?: AIFormatterOutput;
}

export interface AIChatAuditArtifact {
  conversationId: string;
  turnId: string;
  createdAt: string;
  turnSnapshot: AIChatTurnSnapshot;
  snapshots?: {
    pageSnapshot?: AIChatPageSnapshot;
    toolAffordanceSnapshot?: AIChatToolAffordanceSnapshot;
  };
  router?: AIRouterOutput;
  planner?: AIPlannerOutput;
  retrieval?: AIRetrievalExecution;
  specialists?: AISpecialistOutput[];
  synthesis?: AISynthesisOutput;
  critic?: AICriticOutput;
  formatter?: AIFormatterOutput;
  analysisConfidence?: number;
}

export interface AIChatConfirmationResponse {
  challengeId: string;
  decision: 'approve' | 'reject';
  idempotencyKey: string;
}

interface AIChatRequestBase {
  conversationId?: string;
  previousResponseId?: string;
  contextHash?: string;
  confirmationResponse?: AIChatConfirmationResponse;
  stream?: true;
}

interface AIChatRequestPage extends AIChatRequestBase {
  chatMode: 'page';
  pageContext: PageContext;
  workspaceScope?: never;
}

interface AIChatRequestWorkspace extends AIChatRequestBase {
  chatMode: 'workspace';
  pageContext?: PageContext;
  workspaceScope: AIWorkspaceScopeRequest;
}

export type AIChatRequest = (AIChatRequestPage & { input: string }) | (AIChatRequestWorkspace & { input: string });

export interface AIConversationScopeMetadata {
  chatMode?: AIChatMode;
  resolvedWorkspaceScope?: AIResolvedWorkspaceScope;
  selectedSkillPackIds?: AIChatSkillId[];
}

export interface AIConversationRoutingMetadata extends AIConversationScopeMetadata {
  classification?: AIChatClassificationMetadata;
  routing?: AIChatRoutingMetadata;
}

export interface AIConversationListItem extends AIConversationRoutingMetadata {
  id: string;
  summary?: string;
  messageCount: number;
  lastResponseTime?: Date | string;
  pageUrl?: string;
  pageType?: string;
}

export interface AIChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type AIChatStreamEventName =
  | 'scopeResolved'
  | 'pageSnapshotBuilt'
  | 'toolAffordanceBuilt'
  | 'routingStarted'
  | 'routingCompleted'
  | 'planCreated'
  | 'planUpdated'
  | 'commentary'
  | 'progressUpdate'
  | 'toolCall'
  | 'toolResult'
  | 'toolError'
  | 'approvalRequired'
  | 'approvalStateChanged'
  | 'formatterStarted'
  | 'formatterCompleted'
  | 'message'
  | 'citation'
  | 'done'
  | 'error'
  | 'ping';

export interface AIChatStreamEventBase {
  event: AIChatStreamEventName;
  sequence: number;
  conversationId: string;
  turnId: string;
  timestamp: string;
}

export interface AIChatScopeResolvedEvent extends AIChatStreamEventBase {
  event: 'scopeResolved';
  chatMode: AIChatMode;
  requestedScope?: AIWorkspaceScopeRequest;
  resolvedScope: AIResolvedWorkspaceScope;
}

export interface AIChatPageSnapshotBuiltEvent extends AIChatStreamEventBase {
  event: 'pageSnapshotBuilt';
  snapshot: AIChatPageSnapshot;
}

export interface AIChatToolAffordanceBuiltEvent extends AIChatStreamEventBase {
  event: 'toolAffordanceBuilt';
  toolAffordanceSnapshot: AIChatToolAffordanceSnapshot;
}

export interface AIChatRoutingStartedEvent extends AIChatStreamEventBase {
  event: 'routingStarted';
  requestedMode?: AIChatMode;
}

export interface AIChatRoutingCompletedEvent extends AIChatStreamEventBase {
  event: 'routingCompleted';
  path: AIOrchestrationPath;
  confidence: number;
  domains?: AIRouterDomainScore[];
  missingInputs: string[];
  reasonCode?: AIReasonCode;
  whyThisPath?: string;
  analysisConfidence?: number;
  needsRetrieval?: boolean;
  selectedSkillPackIds?: AIChatSkillId[];
  complexity?: AIChatComplexity;
}

export interface AIChatPlanCreatedEvent extends AIChatStreamEventBase {
  event: 'planCreated';
  plan: AIChatPlanSnapshot;
}

export interface AIChatPlanUpdatedEvent extends AIChatStreamEventBase {
  event: 'planUpdated';
  plan: AIChatPlanSnapshot;
}

export interface AIChatCommentaryEvent extends AIChatStreamEventBase {
  event: 'commentary';
  entry: AIChatCommentaryEntry;
}

export interface AIChatProgressUpdateEvent extends AIChatStreamEventBase {
  event: 'progressUpdate';
  progress: AIChatProgressEntry;
}

export interface AIChatToolCallEvent extends AIChatStreamEventBase {
  event: 'toolCall';
  callId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface AIChatToolResultEvent extends AIChatStreamEventBase {
  event: 'toolResult';
  callId: string;
  toolName: string;
  result: AIChatToolExecutionResult;
}

export interface AIChatToolErrorEvent extends AIChatStreamEventBase {
  event: 'toolError';
  callId: string;
  toolName: string;
  error: AIChatToolExecutionError;
}

export interface AIChatApprovalRequiredEvent extends AIChatStreamEventBase {
  event: 'approvalRequired';
  approval: AIChatApprovalRecord;
}

export interface AIChatApprovalStateChangedEvent extends AIChatStreamEventBase {
  event: 'approvalStateChanged';
  approval: AIChatApprovalRecord;
}

export interface AIChatFormatterStartedEvent extends AIChatStreamEventBase {
  event: 'formatterStarted';
  policy?: AIHtmlLitePolicy;
}

export interface AIChatFormatterCompletedEvent extends AIChatStreamEventBase {
  event: 'formatterCompleted';
  formatter?: AIFormatterOutput;
}

export interface AIChatMessageEvent extends AIChatStreamEventBase {
  event: 'message';
  delta: string;
}

export interface AIChatCitationEvent extends AIChatStreamEventBase {
  event: 'citation';
  citation: AIChatCitation;
}

export interface AIChatDoneEvent extends AIChatStreamEventBase {
  event: 'done';
  responseId?: string;
  previousResponseId?: string;
  chatMode?: AIChatMode;
  resolvedScope?: AIResolvedWorkspaceScope;
  classification?: AIChatClassificationMetadata;
  routing?: AIChatRoutingMetadata;
  structuredResponse?: StructuredAIResponse;
  usage?: AIChatUsage;
  answer?: string;
  completionReason?: string;
  citations?: AIChatCitation[];
  turnSnapshot: AIChatTurnSnapshot;
  finalSnapshot?: AIChatFinalSnapshot;
  auditArtifact?: AIChatAuditArtifact;
}

export interface AIChatErrorEvent extends AIChatStreamEventBase {
  event: 'error';
  code: string;
  message: string;
  retryable: boolean;
}

export interface AIChatPingEvent extends AIChatStreamEventBase {
  event: 'ping';
}

export type AIChatStreamEvent =
  | AIChatScopeResolvedEvent
  | AIChatPageSnapshotBuiltEvent
  | AIChatToolAffordanceBuiltEvent
  | AIChatRoutingStartedEvent
  | AIChatRoutingCompletedEvent
  | AIChatPlanCreatedEvent
  | AIChatPlanUpdatedEvent
  | AIChatCommentaryEvent
  | AIChatProgressUpdateEvent
  | AIChatToolCallEvent
  | AIChatToolResultEvent
  | AIChatToolErrorEvent
  | AIChatApprovalRequiredEvent
  | AIChatApprovalStateChangedEvent
  | AIChatFormatterStartedEvent
  | AIChatFormatterCompletedEvent
  | AIChatMessageEvent
  | AIChatCitationEvent
  | AIChatDoneEvent
  | AIChatErrorEvent
  | AIChatPingEvent;
