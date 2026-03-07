/** Common AI interfaces shared between frontend and backend */
export type AIResponseStatus = 'complete' | 'needs_clarification' | 'needs_more_metrics';

export type RecommendationPillar = 'Cost Optimization' | 'Performance Efficiency' | 'Security' | 'Reliability' | 'Operational Excellence';

export type RecommendationType = 'advisor' | 'custom' | 'ai_generated';

export interface RecommendationAction {
  action: 'fix';
  recommendation_id: string;
}

export interface AIRecommendation {
  priority_rank: number;
  pillar: RecommendationPillar;
  description: string;
  type: RecommendationType;
  reference_ids: string[];
  actions: RecommendationAction[];
}

export interface StructuredAIResponse {
  status: AIResponseStatus;
  clarification_request: string | null;
  metrics_request: string[];
  friendly_message: string;
  recommendations: AIRecommendation[];
}

/** Common PageContext interface - unified version */
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
  ui_state?: Record<string, unknown>;
  contextHash?: string;
}

/** Common message interface for AI conversations */
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Date for backend, string for frontend */
  timestamp: Date | string;
  structuredResponse?: StructuredAIResponse;
  /** Response ID for continuity */
  responseId?: string;
}

export type AIChatMode = 'page' | 'workspace';

type AIWorkspaceScopeMode = 'all_authorized' | 'explicit';

type AIWorkspaceScopePolicyOutcome = 'accepted' | 'intersected' | 'rejected';

interface AIWorkspaceScopeAllAuthorizedRequest {
  mode: 'all_authorized';
  companyIds?: never;
  subscriptionIds?: never;
  resourceIds?: never;
  includeChildCompanies?: boolean;
}

type AIWorkspaceScopeExplicitIdentifiers =
  | { companyIds: string[]; subscriptionIds?: string[]; resourceIds?: string[] }
  | { companyIds?: string[]; subscriptionIds: string[]; resourceIds?: string[] }
  | { companyIds?: string[]; subscriptionIds?: string[]; resourceIds: string[] };

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

type AIChatDomain = 'cost' | 'performance' | 'security' | 'reliability' | 'governance' | 'operations' | 'general';

interface AIChatSkillDescriptor {
  skillId: AIChatSkillId;
  title: string;
  description?: string;
  domains: AIChatDomain[];
  toolNames?: string[];
  modeSupport?: AIChatMode[];
  canMutate?: boolean;
}

type AIChatIntentLabel =
  | 'ask_summary'
  | 'investigate_cost'
  | 'investigate_security'
  | 'investigate_reliability'
  | 'investigate_governance'
  | 'execute_action'
  | 'explain_recommendation'
  | 'unknown';

type AIChatComplexity = 'simple' | 'standard' | 'complex';

interface AIChatClassificationIntent {
  label: AIChatIntentLabel;
  confidence: number;
}

interface AIChatClassificationResult {
  version: string;
  intents: AIChatClassificationIntent[];
  complexity: AIChatComplexity;
  requiresTools: boolean;
  suggestedSkillIds: AIChatSkillId[];
}

interface AIChatSkillClassificationResult {
  classifierVersion: string;
  requestedSkillId?: AIChatSkillId;
  selectedSkillId?: AIChatSkillId;
  candidates: AIChatSkillClassificationCandidate[];
  reasonCodes?: AIChatReasonCode[];
}

type AIChatRoutingStrategy = 'single_agent' | 'fanout';

interface AIChatRoutingSubtaskPlan {
  subtaskId: string;
  domain: AIChatDomain;
  title: string;
  skillId?: AIChatSkillId;
}

interface AIChatRoutingDecision {
  strategy: AIChatRoutingStrategy;
  selectedMode: AIChatMode;
  selectedSkillIds: AIChatSkillId[];
  reasonCodes: AIChatReasonCode[];
  subtasks?: AIChatRoutingSubtaskPlan[];
}

interface AIChatSkillRouteTarget {
  skillId: AIChatSkillId;
  skillVersion: string;
  routeSource: AIChatSkillRouteSource;
  policyOutcome: AIChatSkillRoutePolicyOutcome;
}

interface AIChatSkillRoutingFallback {
  fromSkillId?: AIChatSkillId;
  toRoute: AIChatSkillRouteTarget;
  reasonCode: AIChatReasonCode;
}

interface AIChatSkillRoutingDecision {
  requestedSkillId?: AIChatSkillId;
  selectedSkillId?: AIChatSkillId;
  route: AIChatSkillRouteTarget;
  reasonCodes: AIChatReasonCode[];
  fallback?: AIChatSkillRoutingFallback;
}

type AIChatClassificationMetadata = AIChatClassificationResult | AIChatSkillClassificationResult;

type AIChatRoutingMetadata = AIChatRoutingDecision | AIChatSkillRoutingDecision;

type AIChatRoutingReasonCode =
  | 'AI_SKILL_EXPLICIT_ACCEPTED'
  | 'AI_SKILL_EXPLICIT_REJECTED_MODE'
  | 'AI_SKILL_EXPLICIT_REJECTED_POLICY'
  | 'AI_SKILL_CLASSIFIER_SELECTED'
  | 'AI_SKILL_CLASSIFIER_LOW_CONFIDENCE'
  | 'AI_SKILL_FALLBACK_DEFAULT';

type AIChatScopeReasonCode = 'AI_SCOPE_EMPTY_REQUEST' | 'AI_SCOPE_EMPTY_EFFECTIVE' | 'AI_SCOPE_REDUCED_UNAUTHORIZED_MEMBERS' | 'AI_SCOPE_INVALID';

type AIChatConfirmationReasonCode = 'AI_MUTATION_CONFIRMATION_REQUIRED' | 'AI_MUTATION_CONFIRMATION_EXPIRED' | 'AI_MUTATION_CONFIRMATION_REJECTED';

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
  | AIChatConfirmationReasonCode
  | AIChatDegradedReasonCode
  | AIChatOrchestrationReasonCode;

interface AIChatConfirmationDecision {
  /**
   * Legacy confirmation map shape keyed by actionId.
   * Prefer AIChatConfirmationResponse for new continuation requests.
   */
  approve: boolean;
  token: string;
  actionType?: string;
}

type AIChatConfirmationMap = Record<string, AIChatConfirmationDecision>;

type AIChatConfirmationDecisionValue = 'approve' | 'reject';

export interface AIChatConfirmationResponse {
  challengeId: string;
  decision: AIChatConfirmationDecisionValue;
  idempotencyKey: string;
}

interface AIChatRoutingHints {
  preferredMode?: AIChatMode;
  preferredSkillIds?: AIChatSkillId[];
  forceSkillIds?: AIChatSkillId[];
  allowFanout?: boolean;
}

interface AIChatRequestBase {
  conversationId?: string;
  previousResponseId?: string;
  contextHash?: string;
  /**
   * Legacy map keyed by actionId for existing clients.
   * Prefer confirmationResponse for spec-aligned continuation payloads.
   */
  confirmations?: AIChatConfirmationMap;
  confirmationResponse?: AIChatConfirmationResponse;
  routingHints?: AIChatRoutingHints;
  requestedSkillId?: AIChatSkillId;
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

type AIChatRequestInput = { input: string; question?: string } | { question: string; input?: string };

type AIChatRequest = (AIChatRequestPage | AIChatRequestWorkspace) & AIChatRequestInput;

interface AIConversationScopeMetadata {
  chatMode?: AIChatMode;
  resolvedWorkspaceScope?: AIResolvedWorkspaceScope;
  selectedSkillIds?: AIChatSkillId[];
}

interface AIConversationRoutingMetadata extends AIConversationScopeMetadata {
  classification?: AIChatClassificationMetadata;
  routing?: AIChatRoutingMetadata;
}

interface AIConversationListItem extends AIConversationRoutingMetadata {
  id: string;
  summary?: string;
  messageCount: number;
  lastResponseTime?: Date | string;
  pageUrl?: string;
  pageType?: string;
}

/**
 * Normalized confidence score in the range [0..1].
 */
type AIAnalysisConfidence = number;

type AIChatOrchestrationRoute = 'generic' | 'analysis';
type AIChatEffectivePath = AIChatOrchestrationRoute | 'clarify';

type AIChatCriticOutcome = 'skipped' | 'pass' | 'revise';

type AIChatSpecialistCompletionStatus = 'completed' | 'failed';

type AIChatAnalysisConfidenceSource = 'routing' | 'planner' | 'specialist' | 'synthesis' | 'critic' | 'final';

interface AIChatRoutingDomainScore {
  name: string;
  confidence: number;
}

interface AIChatRoutingStartedPayload {
  requestedMode?: AIChatMode;
  requestedSkillIds?: AIChatSkillId[];
  /**
   * Runtime alias used by current API emitter.
   */
  chatMode?: AIChatMode;
}

interface AIChatRoutingCompletedPayload {
  route: AIChatOrchestrationRoute;
  effectivePath?: AIChatEffectivePath;
  confidence?: number;
  domains?: AIChatRoutingDomainScore[];
  reasonCodes: AIChatReasonCode[];
  analysisConfidence?: AIAnalysisConfidence;
  selectedSkillIds?: AIChatSkillId[];
  decision?: AIChatRoutingDecision;
}

interface AIChatGenericStartedPayload {
  reasonCode?: AIChatReasonCode;
  reasonCodes?: AIChatReasonCode[];
}

interface AIChatGenericCompletedPayload {
  reasonCode?: AIChatReasonCode;
  reasonCodes?: AIChatReasonCode[];
  responseStatus?: AIResponseStatus;
  responseId?: string;
}

interface AIChatPlannerStartedPayload {
  route?: 'analysis';
  domains?: AIChatRoutingDomainScore[];
}

interface AIChatPlannerCompletedPayload {
  planCreated?: boolean;
  reasonCodes?: AIChatReasonCode[];
  subtasks?: AIChatRoutingSubtaskPlan[];
  note?: string;
  domains?: string[];
  tasks?: string[];
  selectedSpecialists?: string[];
}

interface AIChatSpecialistStartedPayload {
  specialistId: string;
  domain: AIChatDomain;
  skillId?: AIChatSkillId;
  title?: string;
  reasonCode?: AIChatReasonCode;
  revisionLoop?: number;
}

interface AIChatSpecialistProgressPayload {
  specialistId: string;
  domain: AIChatDomain;
  message: string;
  progressPercent?: number;
  revisionLoop?: number;
}

interface AIChatSpecialistCompletedPayload {
  specialistId: string;
  domain: AIChatDomain;
  status: AIChatSpecialistCompletionStatus;
  confidence?: number;
  summary?: string;
  reasonCode?: AIChatReasonCode;
  error?: AIToolError;
  revisionLoop?: number;
}

interface AIChatSynthesisStartedPayload {
  specialistCount?: number;
  specialists?: string[];
  revisionLoop?: number;
}

interface AIChatSynthesisCompletedPayload {
  confidence?: number;
  /**
   * Canonical field name for UI consumers.
   */
  summary?: string;
  /**
   * Canonical field name for UI consumers.
   */
  conflictDetected?: boolean;
  /**
   * Runtime alias used by current API emitter.
   */
  disagreement?: boolean;
  reasonCode?: AIChatReasonCode;
  reasonCodes?: AIChatReasonCode[];
  revisionLoop?: number;
}

interface AIChatCriticStartedPayload {
  revisionAttempt?: number;
  revisionLoop?: number;
  trigger?: {
    disagreement?: boolean;
    synthesisConfidence?: number;
  };
}

interface AIChatCriticCompletedPayload {
  outcome?: AIChatCriticOutcome;
  /**
   * Runtime alias used by current API emitter.
   */
  verdict?: 'PASS' | 'REVISE';
  confidence?: number;
  reason?: string;
  rerunAgents?: string[];
  summary?: string;
  reasonCode?: AIChatReasonCode;
  reasonCodes?: AIChatReasonCode[];
}

interface AIChatRevisionStartedPayload {
  attempt?: number;
  /**
   * Runtime alias used by current API emitter.
   */
  loop?: number;
  targetedSpecialists?: string[];
  reasonCode?: AIChatReasonCode;
}

interface AIChatRevisionCompletedPayload {
  attempt?: number;
  applied?: boolean;
  /**
   * Runtime alias used by current API emitter.
   */
  loop?: number;
  targetedSpecialists?: string[];
  reasonCode?: AIChatReasonCode;
}

interface AIChatAnalysisConfidencePayload {
  analysisConfidence: AIAnalysisConfidence;
  source?: AIChatAnalysisConfidenceSource;
}

interface AIChatOrchestrationSummary {
  routing?: AIChatRoutingCompletedPayload;
  generic?: AIChatGenericCompletedPayload;
  planner?: AIChatPlannerCompletedPayload;
  specialists?: AIChatSpecialistCompletedPayload[];
  synthesis?: AIChatSynthesisCompletedPayload;
  critic?: AIChatCriticCompletedPayload;
  revision?: AIChatRevisionCompletedPayload;
  revisions?: AIChatRevisionCompletedPayload[];
}

interface AIChatFinalSnapshot {
  chatMode?: AIChatMode;
  resolvedScope?: AIResolvedWorkspaceScope;
  classification?: AIChatClassificationMetadata;
  routing?: AIChatRoutingMetadata;
  selectedSkillIds?: AIChatSkillId[];
  analysisConfidence?: AIAnalysisConfidence;
  orchestration?: AIChatOrchestrationSummary;
}

export interface AIChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface AIToolError {
  code: string;
  message: string;
  retryable?: boolean;
  details?: unknown;
}

export interface AIToolResult {
  tool: string;
  ok: boolean;
  data?: unknown;
  error?: AIToolError;
  truncated?: boolean;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

type AIChatStreamEventType =
  | 'message'
  | 'reasoning'
  | 'tool_call'
  | 'tool_result'
  | 'tool_error'
  | 'status'
  | 'citation'
  | 'subtask_start'
  | 'subtask_done'
  | 'scope_resolved'
  | 'skill_classified'
  | 'skill_routed'
  | 'skill_fallback'
  | 'routing_started'
  | 'routing_completed'
  | 'generic_started'
  | 'generic_completed'
  | 'planner_started'
  | 'planner_completed'
  | 'specialist_started'
  | 'specialist_progress'
  | 'specialist_completed'
  | 'synthesis_started'
  | 'synthesis_completed'
  | 'critic_started'
  | 'critic_completed'
  | 'revision_started'
  | 'revision_completed'
  | 'analysis_confidence'
  | 'confirmation_required'
  | 'done'
  | 'error'
  | 'ping';

interface AIChatStreamEventBase {
  event: AIChatStreamEventType;
  sequence: number;
  conversationId: string;
  timestamp: string;
}

export interface AIChatMessageEvent extends AIChatStreamEventBase {
  event: 'message';
  delta: string;
}

interface AIChatReasoningEvent extends AIChatStreamEventBase {
  event: 'reasoning';
  delta: string;
}

interface AIChatCitation {
  citationId?: string;
  sourceType: string;
  title: string;
  locator: string;
}

interface AIChatToolCallEvent extends AIChatStreamEventBase {
  event: 'tool_call';
  callId: string;
  tool: string;
  arguments: Record<string, unknown>;
}

interface AIChatToolResultEvent extends AIChatStreamEventBase {
  event: 'tool_result';
  tool: string;
  callId?: string;
  result: AIToolResult;
}

interface AIChatToolErrorEvent extends AIChatStreamEventBase {
  event: 'tool_error';
  tool: string;
  callId?: string;
  error: AIToolError;
}

export interface AIChatDoneEvent extends AIChatStreamEventBase {
  event: 'done';
  responseId?: string;
  previousResponseId?: string;
  chatMode?: AIChatMode;
  resolvedScope?: AIResolvedWorkspaceScope;
  classification?: AIChatClassificationMetadata;
  routing?: AIChatRoutingMetadata;
  selectedSkillIds?: AIChatSkillId[];
  finalSnapshot?: AIChatFinalSnapshot;
  structuredResponse?: StructuredAIResponse;
  usage?: AIChatUsage;
  answer?: string;
  completionReason?: string;
  reasoningSummary?: string;
  citations?: AIChatCitation[];
  analysisConfidence?: AIAnalysisConfidence;
  orchestration?: AIChatOrchestrationSummary;
  planner?: AIChatPlannerCompletedPayload;
  specialists?: AIChatSpecialistCompletedPayload[];
  synthesis?: AIChatSynthesisCompletedPayload;
  critic?: AIChatCriticCompletedPayload;
}

export interface AIChatErrorEvent extends AIChatStreamEventBase {
  event: 'error';
  code: string;
  message: string;
  retryable: boolean;
}

interface AIChatPingEvent extends AIChatStreamEventBase {
  event: 'ping';
}

interface AIChatStatusEvent extends AIChatStreamEventBase {
  event: 'status';
  message: string;
  reasonCode?: AIChatReasonCode;
}

interface AIChatCitationEvent extends AIChatStreamEventBase {
  event: 'citation';
  citationId: string;
  sourceType: string;
  title: string;
  locator: string;
}

interface AIChatSubtaskStartEvent extends AIChatStreamEventBase {
  event: 'subtask_start';
  subtaskId: string;
  domain: string;
  title: string;
}

interface AIChatSubtaskDoneEvent extends AIChatStreamEventBase {
  event: 'subtask_done';
  subtaskId: string;
  domain: string;
  summary: string;
}

interface AIChatScopeResolvedEvent extends AIChatStreamEventBase {
  event: 'scope_resolved';
  chatMode: AIChatMode;
  requestedScope?: AIWorkspaceScopeRequest;
  resolvedScope: AIResolvedWorkspaceScope;
}

export interface AIChatSkillClassificationCandidate {
  skillId: AIChatSkillId;
  score: number;
  reasonCodes: AIChatReasonCode[];
}

interface AIChatSkillClassifiedEvent extends AIChatStreamEventBase {
  event: 'skill_classified';
  requestedSkillId?: AIChatSkillId;
  selectedSkillId?: AIChatSkillId;
  classifierVersion: string;
  candidates: AIChatSkillClassificationCandidate[];
  reasonCodes?: AIChatReasonCode[];
}

export type AIChatSkillRouteSource = 'auto' | 'explicit' | 'default';

export type AIChatSkillRoutePolicyOutcome = 'accepted' | 'fallback' | 'rejected';

interface AIChatSkillRoutedEvent extends AIChatStreamEventBase {
  event: 'skill_routed';
  skillId: AIChatSkillId;
  skillVersion: string;
  routeSource: AIChatSkillRouteSource;
  policyOutcome: AIChatSkillRoutePolicyOutcome;
  reasonCodes?: AIChatReasonCode[];
}

interface AIChatSkillFallbackEvent extends AIChatStreamEventBase {
  event: 'skill_fallback';
  fromSkillId?: AIChatSkillId;
  toRoute: string;
  reasonCode: AIChatReasonCode;
  reasonCodes?: AIChatReasonCode[];
}

interface AIChatRoutingStartedEvent extends AIChatStreamEventBase, AIChatRoutingStartedPayload {
  event: 'routing_started';
}

interface AIChatRoutingCompletedEvent extends AIChatStreamEventBase, AIChatRoutingCompletedPayload {
  event: 'routing_completed';
}

interface AIChatGenericStartedEvent extends AIChatStreamEventBase, AIChatGenericStartedPayload {
  event: 'generic_started';
}

interface AIChatGenericCompletedEvent extends AIChatStreamEventBase, AIChatGenericCompletedPayload {
  event: 'generic_completed';
}

interface AIChatPlannerStartedEvent extends AIChatStreamEventBase, AIChatPlannerStartedPayload {
  event: 'planner_started';
}

interface AIChatPlannerCompletedEvent extends AIChatStreamEventBase, AIChatPlannerCompletedPayload {
  event: 'planner_completed';
}

interface AIChatSpecialistStartedEvent extends AIChatStreamEventBase, AIChatSpecialistStartedPayload {
  event: 'specialist_started';
}

interface AIChatSpecialistProgressEvent extends AIChatStreamEventBase, AIChatSpecialistProgressPayload {
  event: 'specialist_progress';
}

interface AIChatSpecialistCompletedEvent extends AIChatStreamEventBase, AIChatSpecialistCompletedPayload {
  event: 'specialist_completed';
}

interface AIChatSynthesisStartedEvent extends AIChatStreamEventBase, AIChatSynthesisStartedPayload {
  event: 'synthesis_started';
}

interface AIChatSynthesisCompletedEvent extends AIChatStreamEventBase, AIChatSynthesisCompletedPayload {
  event: 'synthesis_completed';
}

interface AIChatCriticStartedEvent extends AIChatStreamEventBase, AIChatCriticStartedPayload {
  event: 'critic_started';
}

interface AIChatCriticCompletedEvent extends AIChatStreamEventBase, AIChatCriticCompletedPayload {
  event: 'critic_completed';
}

interface AIChatRevisionStartedEvent extends AIChatStreamEventBase, AIChatRevisionStartedPayload {
  event: 'revision_started';
}

interface AIChatRevisionCompletedEvent extends AIChatStreamEventBase, AIChatRevisionCompletedPayload {
  event: 'revision_completed';
}

interface AIChatAnalysisConfidenceEvent extends AIChatStreamEventBase, AIChatAnalysisConfidencePayload {
  event: 'analysis_confidence';
}

interface AIChatConfirmationRequiredEvent extends AIChatStreamEventBase {
  event: 'confirmation_required';
  challengeId: string;
  actionSummary: string;
  requiredRole: string;
  riskLevel: 'low' | 'medium' | 'high';
  expiresAt: string;
  idempotencyKey: string;
  /**
   * Legacy alias fields retained for current API/UI consumers.
   */
  actionId?: string;
  actionType?: string;
  summary?: string;
}

export type AIChatStreamEvent =
  | AIChatMessageEvent
  | AIChatReasoningEvent
  | AIChatToolCallEvent
  | AIChatToolResultEvent
  | AIChatToolErrorEvent
  | AIChatStatusEvent
  | AIChatCitationEvent
  | AIChatSubtaskStartEvent
  | AIChatSubtaskDoneEvent
  | AIChatScopeResolvedEvent
  | AIChatSkillClassifiedEvent
  | AIChatSkillRoutedEvent
  | AIChatSkillFallbackEvent
  | AIChatRoutingStartedEvent
  | AIChatRoutingCompletedEvent
  | AIChatGenericStartedEvent
  | AIChatGenericCompletedEvent
  | AIChatPlannerStartedEvent
  | AIChatPlannerCompletedEvent
  | AIChatSpecialistStartedEvent
  | AIChatSpecialistProgressEvent
  | AIChatSpecialistCompletedEvent
  | AIChatSynthesisStartedEvent
  | AIChatSynthesisCompletedEvent
  | AIChatCriticStartedEvent
  | AIChatCriticCompletedEvent
  | AIChatRevisionStartedEvent
  | AIChatRevisionCompletedEvent
  | AIChatAnalysisConfidenceEvent
  | AIChatConfirmationRequiredEvent
  | AIChatDoneEvent
  | AIChatErrorEvent
  | AIChatPingEvent;
