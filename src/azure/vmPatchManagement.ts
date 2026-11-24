export const VM_PATCH_MANAGEMENT_SCHEMA_VERSION = 1 as const;
export const PATCH_MANAGEMENT_PORTAL_FILE_NAME = 'patch-management.json.gz' as const;
export const AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE = 'microsoft.compute/virtualmachines' as const;

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
  /** Count validity is independent of schedule or configured orchestration. */
  countCoverage?: VmPatchManagementEvidenceCoverageStatus;
  /** Classification populations can overlap; never sum them to invent a total. */
  availablePatchCountsByClassification?: Record<string, number | null>;
  status?: string;
  activityId?: string;
  startedAt?: string;
  lastModifiedAt?: string;
  rebootPending?: boolean;
  installedPatchCount: number | null;
  failedPatchCount: number | null;
  pendingPatchCount: number | null;
  excludedPatchCount: number | null;
  notSelectedPatchCount: number | null;
  criticalUpdateCount: number | null;
  securityUpdateCount: number | null;
  otherUpdateCount: number | null;
}

export interface VmPatchInstallationSummary {
  status?: string;
  activityId?: string;
  startedAt?: string;
  lastModifiedAt?: string;
  rebootStatus?: string;
  startedBy?: string;
  maintenanceWindowExceeded?: boolean;
  installedPatchCount: number | null;
  failedPatchCount: number | null;
  pendingPatchCount: number | null;
  excludedPatchCount: number | null;
  notSelectedPatchCount: number | null;
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
  /** null means the selected machine population lacks complete current count evidence. */
  machinesWithPendingUpdates: number | null;
  /** null means the selected machine population lacks complete current count evidence. */
  pendingUpdateCount: number | null;
  /** null means the selected machine population lacks complete current count evidence. */
  criticalUpdateCount: number | null;
  /** null means the selected machine population lacks complete current count evidence. */
  securityUpdateCount: number | null;
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
