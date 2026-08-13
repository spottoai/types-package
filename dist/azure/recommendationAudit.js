"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECOMMENDATION_WORKFLOW_AUDIT_DETAILS_SCHEMA_VERSION = exports.RecommendationWorkflowAuditEventTypes = exports.RecommendationAuditRowKinds = void 0;
exports.RecommendationAuditRowKinds = {
    resourceTarget: 'resource-view:target',
    subscriptionTarget: 'scope-view:target',
    resourceProviderScopeFeed: 'resource-view:providerScope-feed',
    subscriptionProviderScopeFeed: 'scope-view:providerScope-feed',
};
exports.RecommendationWorkflowAuditEventTypes = {
    assigned: 'WorkflowAssigned',
    laneChanged: 'WorkflowLaneChanged',
    blocked: 'WorkflowBlocked',
    unblocked: 'WorkflowUnblocked',
    returnedToSuggestions: 'ReturnedToSuggestions',
    repaired: 'WorkflowRepaired',
    sourceChanged: 'WorkflowSourceChanged',
};
exports.RECOMMENDATION_WORKFLOW_AUDIT_DETAILS_SCHEMA_VERSION = 1;
//# sourceMappingURL=recommendationAudit.js.map