"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_SYNC_STEP_ORDER = exports.getAzureSyncFeatureIdsForScope = exports.getAzureSyncFeatureOptions = exports.sortAzureSyncFeatureIds = exports.isAzureSyncFeatureSupportedInScope = exports.getAzureSyncFeatureMetadata = exports.isAzureSyncFeatureId = exports.AZURE_SYNC_FEATURE_METADATA = exports.AZURE_SYNC_FEATURE_ORDER = void 0;
exports.AZURE_SYNC_FEATURE_ORDER = [
    'activityMonitoring',
    'metrics',
    'billing',
    'pricing',
    'costEstimation',
    'commitments',
    'relationshipGraphs',
    'governance',
    'availabilityZones',
    'reliability',
    'perimeterInsights',
    'reportEvidencePack',
];
exports.AZURE_SYNC_FEATURE_METADATA = [
    {
        id: 'activityMonitoring',
        displayName: 'Activity monitoring',
        description: 'Collects Azure activity logs and activity-derived operational events.',
        supportedScopes: ['cloudAccount', 'subscription'],
        warning: 'Disabling activity monitoring prevents activity log collection and related detections.',
    },
    {
        id: 'metrics',
        displayName: 'Metrics',
        description: 'Collects subscription resource metrics used for utilization and rightsizing insights.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'billing',
        displayName: 'Billing',
        description: 'Collects billing and cost usage data.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'pricing',
        displayName: 'Pricing',
        description: 'Collects Azure price data used for cost calculations.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'costEstimation',
        displayName: 'Cost estimation',
        description: 'Builds estimated costs when billing-backed usage is unavailable or incomplete.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'commitments',
        displayName: 'Reservations and commitments',
        description: 'Collects reserved instances, savings plans, and commitment utilization data.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'relationshipGraphs',
        displayName: 'Relationship graphs',
        description: 'Builds relationship graph artifacts from scanned Azure resources.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'governance',
        displayName: 'Governance',
        description: 'Builds tenant and subscription governance reports and graph artifacts.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'availabilityZones',
        displayName: 'Availability zones',
        description: 'Collects tenant-level availability zone mappings.',
        supportedScopes: ['cloudAccount'],
    },
    {
        id: 'reliability',
        displayName: 'Reliability',
        description: 'Collects reliability signals and recommendations for subscription resources.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'perimeterInsights',
        displayName: 'Perimeter insights',
        description: 'Builds public IP and perimeter exposure insights.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
    {
        id: 'reportEvidencePack',
        displayName: 'Report evidence pack',
        description: 'Builds evidence artifacts used by reports and review workflows.',
        supportedScopes: ['cloudAccount', 'subscription'],
    },
];
const AZURE_SYNC_FEATURE_ORDER_INDEX = new Map(exports.AZURE_SYNC_FEATURE_ORDER.map((featureId, index) => [featureId, index]));
const AZURE_SYNC_FEATURE_IDS = new Set(exports.AZURE_SYNC_FEATURE_ORDER);
const isAzureSyncFeatureId = (value) => AZURE_SYNC_FEATURE_IDS.has(value);
exports.isAzureSyncFeatureId = isAzureSyncFeatureId;
const getAzureSyncFeatureMetadata = (featureId) => exports.AZURE_SYNC_FEATURE_METADATA.find(feature => feature.id === featureId) ?? {
    id: featureId,
    displayName: featureId,
    description: '',
    supportedScopes: ['cloudAccount', 'subscription'],
};
exports.getAzureSyncFeatureMetadata = getAzureSyncFeatureMetadata;
const isAzureSyncFeatureSupportedInScope = (featureId, scope) => (0, exports.getAzureSyncFeatureMetadata)(featureId).supportedScopes.includes(scope);
exports.isAzureSyncFeatureSupportedInScope = isAzureSyncFeatureSupportedInScope;
const sortAzureSyncFeatureIds = (featureIds) => [...featureIds].sort((left, right) => (AZURE_SYNC_FEATURE_ORDER_INDEX.get(left) ?? Number.MAX_SAFE_INTEGER) - (AZURE_SYNC_FEATURE_ORDER_INDEX.get(right) ?? Number.MAX_SAFE_INTEGER));
exports.sortAzureSyncFeatureIds = sortAzureSyncFeatureIds;
const supportsAzureSyncFeatureScope = (feature, scope) => feature.supportedScopes.includes(scope);
const getAzureSyncFeatureOptions = (scope) => exports.AZURE_SYNC_FEATURE_METADATA.filter(feature => supportsAzureSyncFeatureScope(feature, scope));
exports.getAzureSyncFeatureOptions = getAzureSyncFeatureOptions;
const getAzureSyncFeatureIdsForScope = (scope) => (0, exports.getAzureSyncFeatureOptions)(scope).map(feature => feature.id);
exports.getAzureSyncFeatureIdsForScope = getAzureSyncFeatureIdsForScope;
exports.SUBSCRIPTION_SYNC_STEP_ORDER = [
    'metrics',
    'resourcegroups',
    'activities',
    'queries',
    'reliability',
    'billing',
    'costestimation',
    'pricing',
    'commitments',
    'views',
];
//# sourceMappingURL=accounts.js.map