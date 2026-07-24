"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS = void 0;
const portalPublicArtifacts_1 = require("./portalPublicArtifacts");
exports.AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS = {
    'resource-collection': {
        logicalName: portalPublicArtifacts_1.AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
        required: [],
        optional: ['resource-collection-history'],
    },
    'account-summary': {
        logicalName: portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
        required: [],
        optional: ['account-summary-history', 'account-summary-ai-cost-summary'],
    },
    'resource-collection-history': {
        logicalNamePattern: 'resources-history--{scope-generation-sha256}.json.gz',
        required: [],
        optional: [],
    },
    'account-summary-history': {
        logicalNamePattern: 'account-summary-history--{scope-sha256}.json.gz',
        required: [],
        optional: [],
    },
    'account-summary-ai-cost-summary': {
        logicalName: portalPublicArtifacts_1.AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
        required: ['account-summary'],
        optional: [],
    },
};
//# sourceMappingURL=portalPublicArtifactHistoryTypes.js.map