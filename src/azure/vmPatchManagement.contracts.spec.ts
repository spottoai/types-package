import type { VmPatchManagementArtifact } from '../index';
import { AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE, PATCH_MANAGEMENT_PORTAL_FILE_NAME, VM_PATCH_MANAGEMENT_SCHEMA_VERSION } from '../index';

const artifact: VmPatchManagementArtifact = {
  schemaVersion: VM_PATCH_MANAGEMENT_SCHEMA_VERSION,
  generatedAt: '2026-08-25T01:00:00.000Z',
  sourceObservedAt: '2026-08-25T00:00:00.000Z',
  subscriptionId: '00000000-0000-0000-0000-000000000001',
  scope: {
    resourceTypes: [AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE],
    includesArcMachines: false,
    includesScaleSetInstances: false,
    includesIndividualPatchDetails: false,
  },
  coverage: {
    status: 'current',
    staleAfterHours: 36,
    warnings: [],
    sourceRecordCounts: {
      metadata: 1,
      machine: 1,
      configuration: 1,
      assignment: 1,
      assessment: 1,
      installation: 1,
    },
  },
  summary: {
    totalMachines: 1,
    protectedMachines: 1,
    unprotectedMachines: 0,
    unknownMachines: 0,
    periodicAssessmentEnabledMachines: 1,
    periodicAssessmentDisabledMachines: 0,
    periodicAssessmentUnknownMachines: 0,
    assessedMachines: 1,
    machinesWithPendingUpdates: 1,
    pendingUpdateCount: 7,
    criticalUpdateCount: 2,
    securityUpdateCount: 3,
    machinesWithDeploymentEvidence: 1,
    latestDeploymentSucceededMachines: 1,
    latestDeploymentFailedMachines: 0,
    latestDeploymentInProgressMachines: 0,
    latestDeploymentOtherMachines: 0,
    machinesWithoutDeploymentEvidence: 0,
  },
  machines: [
    {
      id: '/subscriptions/00000000-0000-0000-0000-000000000001/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1',
      name: 'vm-1',
      resourceGroup: 'rg-app',
      location: 'australiaeast',
      resourceType: AZURE_VM_PATCH_MANAGEMENT_RESOURCE_TYPE,
      osType: 'Windows',
      patchMode: 'AutomaticByPlatform',
      assessmentMode: 'AutomaticByPlatform',
      enableAutomaticUpdates: true,
      periodicAssessment: 'enabled',
      managementStatus: 'protected',
      managementReason: 'Assigned to a recurring InGuestPatch Maintenance Configuration',
      schedules: [
        {
          assignmentId:
            '/subscriptions/00000000-0000-0000-0000-000000000001/resourcegroups/rg-app/providers/microsoft.compute/virtualmachines/vm-1/providers/microsoft.maintenance/configurationassignments/weekly',
          assignmentName: 'weekly',
          assignmentType: 'direct',
          maintenanceConfigurationId:
            '/subscriptions/00000000-0000-0000-0000-000000000001/resourcegroups/rg-ops/providers/microsoft.maintenance/maintenanceconfigurations/weekly',
          maintenanceConfigurationName: 'weekly',
          startDateTime: '2026-08-26 23:00',
          duration: '01:30',
          timeZone: 'New Zealand Standard Time',
          recurEvery: '1Week Wednesday',
          rebootSetting: 'IfRequired',
        },
      ],
      assessment: {
        status: 'Succeeded',
        activityId: 'assessment-1',
        startedAt: '2026-08-24T23:00:00.000Z',
        lastModifiedAt: '2026-08-24T23:30:00.000Z',
        rebootPending: false,
        installedPatchCount: 5,
        failedPatchCount: 1,
        pendingPatchCount: 7,
        excludedPatchCount: 0,
        notSelectedPatchCount: 0,
        criticalUpdateCount: 2,
        securityUpdateCount: 3,
        otherUpdateCount: 2,
      },
      latestInstallation: {
        status: 'Succeeded',
        activityId: 'installation-1',
        startedAt: '2026-08-24T21:00:00.000Z',
        lastModifiedAt: '2026-08-24T22:00:00.000Z',
        rebootStatus: 'Completed',
        startedBy: 'Platform',
        maintenanceWindowExceeded: false,
        installedPatchCount: 5,
        failedPatchCount: 0,
        pendingPatchCount: 0,
        excludedPatchCount: 0,
        notSelectedPatchCount: 0,
      },
    },
  ],
};

void artifact;
void PATCH_MANAGEMENT_PORTAL_FILE_NAME;

const invalidSchemaVersion: VmPatchManagementArtifact = {
  ...artifact,
  // @ts-expect-error schema version must remain aligned with the published artifact contract.
  schemaVersion: 2,
};

const invalidCoverageStatus: VmPatchManagementArtifact = {
  ...artifact,
  coverage: {
    ...artifact.coverage,
    // @ts-expect-error coverage uses the current, stale, or unavailable vocabulary.
    status: 'partial',
  },
};

const invalidManagementStatus: VmPatchManagementArtifact = {
  ...artifact,
  machines: [
    {
      ...artifact.machines[0],
      // @ts-expect-error management posture is protected, unprotected, or unknown.
      managementStatus: 'managed',
    },
  ],
};

const invalidAssignmentType: VmPatchManagementArtifact = {
  ...artifact,
  machines: [
    {
      ...artifact.machines[0],
      schedules: [
        {
          ...artifact.machines[0].schedules[0],
          // @ts-expect-error maintenance assignments are direct or dynamic.
          assignmentType: 'policy',
        },
      ],
    },
  ],
};

const invalidPeriodicAssessment: VmPatchManagementArtifact = {
  ...artifact,
  machines: [
    {
      ...artifact.machines[0],
      // @ts-expect-error periodic assessment has a closed three-state vocabulary.
      periodicAssessment: 'automatic',
    },
  ],
};

void invalidSchemaVersion;
void invalidCoverageStatus;
void invalidManagementStatus;
void invalidAssignmentType;
void invalidPeriodicAssessment;
