import {
  RESILIENCE_FACTS_PORTAL_FILE,
  RESILIENCE_FACTS_SCHEMA_VERSION,
  RESILIENCE_FACTS_SOURCE,
  type ResilienceFactsProjection,
} from './resilienceFacts';
import { isResilienceFactsItem, isResilienceFactsProjection } from './resilienceFactsValidation';

const projection: ResilienceFactsProjection = {
  schemaVersion: RESILIENCE_FACTS_SCHEMA_VERSION,
  source: RESILIENCE_FACTS_SOURCE,
  subscriptionId: '11111111-2222-4333-8444-555555555555',
  generatedAt: '2026-09-12T01:00:00.000Z',
  summary: { storageAccounts: 1, sqlDatabases: 1, sqlServers: 1, collected: 2, partial: 0, failed: 0, requestCount: 5 },
  items: [
    {
      resourceId:
        '/subscriptions/11111111-2222-4333-8444-555555555555/resourcegroups/rg-fixture-dev/providers/microsoft.storage/storageaccounts/stdev01',
      resourceType: 'microsoft.storage/storageaccounts',
      status: 'collected',
      observedAt: '2026-09-12T01:00:00.000Z',
      requestCount: 2,
      storage: {
        blobSoftDelete: { enabled: true, days: 14 },
        containerSoftDelete: { enabled: true, days: 7 },
        versioning: false,
        changeFeed: { enabled: false },
        pointInTimeRestore: { enabled: false },
        managementPolicy: { present: true, ruleCount: 2 },
      },
    },
    {
      resourceId:
        '/subscriptions/11111111-2222-4333-8444-555555555555/resourcegroups/rg-fixture-dev/providers/microsoft.sql/servers/sql-dev-01/databases/sqldb-dev-01',
      resourceType: 'microsoft.sql/servers/databases',
      status: 'collected',
      observedAt: '2026-09-12T01:00:00.000Z',
      requestCount: 3,
      sql: {
        shortTermRetentionDays: 7,
        diffBackupIntervalHours: 12,
        longTermRetention: { enabled: true, weekly: 'P4W', monthly: null, yearly: 'P1Y', weekOfYear: 1 },
        failoverGroup: {
          id: '/subscriptions/11111111-2222-4333-8444-555555555555/resourcegroups/rg-fixture-dev/providers/microsoft.sql/servers/sql-dev-01/failovergroups/fog-dev',
          name: 'fog-dev',
          partnerServers: [
            '/subscriptions/11111111-2222-4333-8444-555555555555/resourcegroups/rg-fixture-dr/providers/microsoft.sql/servers/sql-dev-02',
          ],
          readWriteFailoverPolicy: 'Automatic',
          role: 'Primary',
        },
        backupStorageRedundancy: 'Geo',
      },
    },
  ],
  issues: [],
};

const portalFile: string = RESILIENCE_FACTS_PORTAL_FILE;
const valid: boolean = isResilienceFactsProjection(projection) && projection.items.every(isResilienceFactsItem);
void [portalFile, valid];
