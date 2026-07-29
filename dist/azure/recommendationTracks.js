"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTrackCardGranularities = exports.RecommendationTrackFacets = exports.RecommendationFocusModes = exports.SystemTrackIds = void 0;
exports.SystemTrackIds = {
    resourceHygiene: 'resource-hygiene',
    capacityRightsizing: 'capacity-rightsizing',
    securityPosture: 'security-posture',
    patchingLifecycle: 'patching-lifecycle',
    commitmentsLicensing: 'commitments-licensing',
    backupRecovery: 'backup-recovery',
    perimeterExposure: 'perimeter-exposure',
    identityPrivilege: 'identity-privilege',
    governanceOwnership: 'governance-ownership',
    spendExceptions: 'spend-exceptions',
};
exports.RecommendationFocusModes = {
    all: 'all',
    finops: 'finops',
    securityGovernance: 'securityGovernance',
    operationalHealth: 'operationalHealth',
    optimizationDelivery: 'optimizationDelivery',
    serviceDelivery: 'serviceDelivery',
};
exports.RecommendationTrackFacets = {
    orphaned: 'orphaned',
    unattached: 'unattached',
    idle: 'idle',
    underutilized: 'underutilized',
    unprotected: 'unprotected',
    staleBackup: 'stale-backup',
    expiring: 'expiring',
    unpatched: 'unpatched',
    unsupported: 'unsupported',
    publicIngress: 'public-ingress',
    overprivileged: 'overprivileged',
    missingOwnership: 'missing-ownership',
    missingTags: 'missing-tags',
    costAnomaly: 'cost-anomaly',
};
exports.SystemTrackCardGranularities = {
    recommendation: 'recommendation',
    resource: 'resource',
};
//# sourceMappingURL=recommendationTracks.js.map