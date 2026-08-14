export const RecommendationAuditRowKinds = {
    resourceTarget: 'resource-view:target',
    subscriptionTarget: 'scope-view:target',
    resourceProviderScopeFeed: 'resource-view:providerScope-feed',
    subscriptionProviderScopeFeed: 'scope-view:providerScope-feed',
};
export const RecommendationWorkflowAuditEventTypes = {
    assigned: 'WorkflowAssigned',
    laneChanged: 'WorkflowLaneChanged',
    blocked: 'WorkflowBlocked',
    unblocked: 'WorkflowUnblocked',
    returnedToSuggestions: 'ReturnedToSuggestions',
    repaired: 'WorkflowRepaired',
    sourceChanged: 'WorkflowSourceChanged',
};
export const RECOMMENDATION_WORKFLOW_AUDIT_DETAILS_SCHEMA_VERSION = 1;
