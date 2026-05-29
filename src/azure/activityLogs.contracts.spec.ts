import type { PortalActivityLog } from './activityLogs';
import { PORTAL_ACTIVITY_LOG_SCHEMA_VERSION } from './activityLogs';

const portalActivityLog: PortalActivityLog = {
  schemaVersion: PORTAL_ACTIVITY_LOG_SCHEMA_VERSION,
  generatedAt: '2026-05-02T00:00:00.000Z',
  source: {
    rawEventCount: 5,
    retainedEventCount: 4,
    changeCount: 2,
    securityCount: 1,
    healthCount: 0,
    suppressedCount: 1,
    latestRawTimestamp: '2026-05-02T00:00:00.000Z',
  },
  changes: [
    {
      eventTimestamp: '2026-05-02T00:00:00.000Z',
      firstEventTimestamp: '2026-05-02T00:00:00.000Z',
      lastEventTimestamp: '2026-05-02T01:00:00.000Z',
      eventCount: 2,
      statusCounts: {
        Succeeded: 2,
      },
      collapsed: true,
      category: 'Administrative',
      level: 'Informational',
      status: 'Succeeded',
      statusDetail: 'Succeeded',
      operationName: 'Create or Update Application Gateway',
      operation: 'microsoft.network/applicationgateways/write',
      caller: 'Backoffice deployment pipeline',
      resourceId: '/subscriptions/sub/resourcegroups/rg/providers/microsoft.network/applicationgateways/appgw-a',
      resourceName: 'appgw-a',
      eventId: 'evt-1',
      feedModes: ['all-advanced', 'changes-default'],
      actorType: 'servicePrincipal',
      actorDisplay: 'Backoffice deployment pipeline',
      actorRaw: '11111111-1111-1111-1111-111111111111',
      actorId: '11111111-1111-1111-1111-111111111111',
      actorResolutionSource: 'tenant-principals',
      kind: 'change',
      subtype: 'write',
      isMaterialChange: true,
      isSecuritySensitive: false,
      isPlatformEvent: false,
      importance: 'medium',
    },
  ],
  security: [
    {
      eventTimestamp: '2026-05-02T02:00:00.000Z',
      firstEventTimestamp: '2026-05-02T02:00:00.000Z',
      lastEventTimestamp: '2026-05-02T02:00:00.000Z',
      eventCount: 1,
      statusCounts: {
        Succeeded: 1,
      },
      collapsed: false,
      category: 'Administrative',
      level: 'Informational',
      status: 'Succeeded',
      operationName: 'List Storage Keys',
      operation: 'microsoft.storage/storageaccounts/listkeys/action',
      caller: 'user@contoso.com',
      feedModes: ['all-advanced', 'security'],
      actorType: 'user',
      actorDisplay: 'user@contoso.com',
      actorRaw: 'user@contoso.com',
      actorResolutionSource: 'caller',
      kind: 'security',
      subtype: 'credential.read',
      isMaterialChange: false,
      isSecuritySensitive: true,
      isPlatformEvent: false,
      importance: 'high',
    },
  ],
  health: [],
  suppressed: [
    {
      reason: 'autoscale',
      count: 1,
      sampleOperation: 'microsoft.insights/autoscalesettings/flapping/action',
      sampleResourceName: 'autoscale-setting',
    },
  ],
};

void portalActivityLog;

const invalidPortalActivityLogSchemaVersion: PortalActivityLog = {
  ...portalActivityLog,
  // @ts-expect-error activity log schema version must match the published portal activity log contract.
  schemaVersion: '2026-05-02.graph-v1',
};

const invalidPortalActivityLogActorType: PortalActivityLog = {
  ...portalActivityLog,
  changes: [
    {
      ...portalActivityLog.changes[0],
      // @ts-expect-error actorType uses the portal activity actor vocabulary.
      actorType: 'application',
    },
  ],
};

const invalidPortalActivityLogSuppressionReason: PortalActivityLog = {
  ...portalActivityLog,
  suppressed: [
    {
      ...portalActivityLog.suppressed[0],
      // @ts-expect-error suppressed reasons use the portal activity suppression vocabulary.
      reason: 'read',
    },
  ],
};

void invalidPortalActivityLogSchemaVersion;
void invalidPortalActivityLogActorType;
void invalidPortalActivityLogSuppressionReason;
