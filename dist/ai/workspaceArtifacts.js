"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CHAT_REPORT_STRATEGY_IDS = exports.AI_CHAT_WORKSPACE_GENERIC_VIEW_IDS = exports.AI_CHAT_WORKSPACE_CAPABILITIES = void 0;
exports.AI_CHAT_WORKSPACE_CAPABILITIES = [
    {
        viewId: 'azure.security.secureScoreTrend',
        version: 1,
        artifactKind: 'chart',
        presentations: ['line'],
        dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
    },
    {
        viewId: 'azure.cost.subscriptionSpendTrend',
        version: 1,
        artifactKind: 'chart',
        presentations: ['area', 'line'],
        dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
    },
    {
        viewId: 'azure.serviceRetirement.upcoming',
        version: 1,
        artifactKind: 'table',
        presentations: ['table'],
        dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
    },
    {
        viewId: 'azure.governance.complianceSummary',
        version: 1,
        artifactKind: 'metricGroup',
        presentations: ['metricGroup'],
        dataModes: ['snapshot', 'snapshotWithLiveRefresh'],
    },
    {
        viewId: 'azure.resource.metrics',
        version: 1,
        artifactKind: 'chart',
        presentations: ['line', 'area', 'bar'],
        dataModes: ['liveView', 'snapshotWithLiveRefresh'],
    },
    /**
     * Report strategies are fixed, reviewed Portal renderers over existing report-domain loaders and
     * pure models. The model selects only the strategy, an authorized subject reference and a title;
     * it never supplies report data, markup, endpoint names or URLs.
     */
    {
        viewId: 'security.landscape',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'cost.changeWaterfall',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'changes.recent',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'cost.analysis',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'cost.tree',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'commitments.planning',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'licensing.hybridBenefit',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'governance.posture',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'backups.posture',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    {
        viewId: 'retirement.tracker',
        version: 1,
        artifactKind: 'document',
        presentations: ['report'],
        dataModes: ['liveView'],
    },
    /**
     * Generic views are server-produced snapshots over an authorized tool result already held by the
     * turn. They have no live recipe and no endpoint binding: the API builds the payload from the same
     * shaped tool output that grounded the answer, so the model never selects data, endpoint or shape.
     */
    {
        viewId: 'genericTable',
        version: 1,
        artifactKind: 'table',
        presentations: ['table'],
        dataModes: ['snapshot'],
    },
    {
        viewId: 'genericBarChart',
        version: 1,
        artifactKind: 'chart',
        presentations: ['bar'],
        dataModes: ['snapshot'],
    },
    {
        viewId: 'genericLineChart',
        version: 1,
        artifactKind: 'chart',
        presentations: ['line'],
        dataModes: ['snapshot'],
    },
    {
        viewId: 'genericKpi',
        version: 1,
        artifactKind: 'kpi',
        presentations: ['kpi'],
        dataModes: ['snapshot'],
    },
];
exports.AI_CHAT_WORKSPACE_GENERIC_VIEW_IDS = ['genericTable', 'genericBarChart', 'genericLineChart', 'genericKpi'];
exports.AI_CHAT_REPORT_STRATEGY_IDS = [
    'security.landscape@1',
    'cost.changeWaterfall@1',
    'changes.recent@1',
    'cost.analysis@1',
    'cost.tree@1',
    'commitments.planning@1',
    'licensing.hybridBenefit@1',
    'governance.posture@1',
    'backups.posture@1',
    'retirement.tracker@1',
];
//# sourceMappingURL=workspaceArtifacts.js.map