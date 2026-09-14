export declare const VM_PATCH_MANAGEMENT_SCHEMA_VERSION: 1;
export declare const PATCH_MANAGEMENT_PORTAL_FILE_NAME: "patch-management.json.gz";
export declare const AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE: "microsoft.compute/virtualmachines";
export type VmPatchManagementStatus = 'protected' | 'unprotected' | 'unknown';
export type VmPatchManagementEvidenceCoverageStatus = 'current' | 'stale' | 'unavailable';
export type VmPatchManagementAssignmentType = 'direct' | 'dynamic';
export type VmPatchPeriodicAssessmentStatus = 'enabled' | 'disabled' | 'unknown';
export interface VmPatchSchedule {
    assignmentId: string;
    assignmentName?: string;
    assignmentType: VmPatchManagementAssignmentType;
    maintenanceConfigurationId: string;
    maintenanceConfigurationName?: string;
    startDateTime?: string;
    expirationDateTime?: string;
    duration?: string;
    timeZone?: string;
    recurEvery?: string;
    rebootSetting?: string;
}
export interface VmPatchAssessmentSummary {
    status?: string;
    activityId?: string;
    startedAt?: string;
    lastModifiedAt?: string;
    rebootPending?: boolean;
    installedPatchCount: number;
    failedPatchCount: number;
    pendingPatchCount: number;
    excludedPatchCount: number;
    notSelectedPatchCount: number;
    criticalUpdateCount: number;
    securityUpdateCount: number;
    otherUpdateCount: number;
}
export interface VmPatchInstallationSummary {
    status?: string;
    activityId?: string;
    startedAt?: string;
    lastModifiedAt?: string;
    rebootStatus?: string;
    startedBy?: string;
    maintenanceWindowExceeded?: boolean;
    installedPatchCount: number;
    failedPatchCount: number;
    pendingPatchCount: number;
    excludedPatchCount: number;
    notSelectedPatchCount: number;
}
export interface VmPatchManagementMachine {
    id: string;
    name?: string;
    resourceGroup?: string;
    location?: string;
    resourceType: typeof AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE;
    osType?: string;
    patchMode?: string;
    assessmentMode?: string;
    enableAutomaticUpdates?: boolean;
    periodicAssessment: VmPatchPeriodicAssessmentStatus;
    managementStatus: VmPatchManagementStatus;
    managementReason: string;
    schedules: VmPatchSchedule[];
    assessment?: VmPatchAssessmentSummary;
    latestInstallation?: VmPatchInstallationSummary;
}
export interface VmPatchManagementScope {
    resourceTypes: [typeof AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE];
    includesArcMachines: false;
    includesScaleSetInstances: false;
    includesIndividualPatchDetails: false;
}
export interface VmPatchManagementCoverage {
    status: VmPatchManagementEvidenceCoverageStatus;
    staleAfterHours: number;
    warnings: string[];
    sourceRecordCounts: Record<string, number>;
}
export interface VmPatchManagementSummary {
    totalMachines: number;
    protectedMachines: number;
    unprotectedMachines: number;
    unknownMachines: number;
    periodicAssessmentEnabledMachines: number;
    periodicAssessmentDisabledMachines: number;
    periodicAssessmentUnknownMachines: number;
    assessedMachines: number;
    machinesWithPendingUpdates: number;
    pendingUpdateCount: number;
    criticalUpdateCount: number;
    securityUpdateCount: number;
    machinesWithDeploymentEvidence: number;
    latestDeploymentSucceededMachines: number;
    latestDeploymentFailedMachines: number;
    latestDeploymentInProgressMachines: number;
    latestDeploymentOtherMachines: number;
    machinesWithoutDeploymentEvidence: number;
}
export interface VmPatchManagementArtifact {
    schemaVersion: typeof VM_PATCH_MANAGEMENT_SCHEMA_VERSION;
    generatedAt: string;
    sourceObservedAt?: string;
    subscriptionId: string;
    scope: VmPatchManagementScope;
    coverage: VmPatchManagementCoverage;
    summary: VmPatchManagementSummary;
    machines: VmPatchManagementMachine[];
}
//# sourceMappingURL=vmPatchManagement.d.ts.map