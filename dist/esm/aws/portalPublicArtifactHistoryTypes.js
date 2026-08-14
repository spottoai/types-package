import { AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME, AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME, } from './portalPublicArtifacts.js';
import { AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME } from './portalCommitmentsPlanningPublicArtifacts.js';
import { AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME } from './portalRelationshipPublicArtifacts.js';
export const AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS = {
    'resource-collection': {
        logicalName: AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
        required: [],
        optional: ['resource-collection-history'],
    },
    'account-summary': {
        logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
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
        logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
        required: ['account-summary'],
        optional: [],
    },
    'commitments-planning': {
        logicalName: AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME,
        required: [],
        optional: [],
    },
    relationships: {
        logicalName: AWS_PORTAL_RELATIONSHIP_LOGICAL_NAME,
        required: [],
        optional: [],
    },
};
