import type {
  PortalAccessBootstrapResponse,
  PortalDataScopeMode,
  PortalFeatureActionAccess,
  PortalFeatureSetAuditAction,
  PortalFeatureSetAuditContinuation,
  PortalFeatureSetAuditEvent,
  PortalFeatureSetAuditPage,
  PortalFeatureSetConfigurationResponse,
} from '../index';

type Assert<T extends true> = T;
type IsExact<TActual, TExpected> = [TActual] extends [TExpected] ? ([TExpected] extends [TActual] ? true : false) : false;

type DataScopeModeIsClosed = Assert<IsExact<PortalDataScopeMode, 'unrestricted' | 'restricted' | 'none' | 'unavailable'>>;
type RollingActionModeIsOptional = Assert<IsExact<PortalFeatureActionAccess['dataScopeMode'], PortalDataScopeMode | undefined>>;
type FeatureSetAuditActionsAreClosed = Assert<
  IsExact<PortalFeatureSetAuditAction, 'override_created' | 'override_updated' | 'override_deleted' | 'locked' | 'unlocked'>
>;

const restrictedBootstrap: PortalAccessBootstrapResponse = {
  customerId: 'company-1',
  principalType: 'user',
  principalId: 'user-1',
  catalogVersion: '5',
  featureSets: [],
  scopeSummary: {
    fingerprint: 'opaque-fingerprint',
    eligibleSubscriptionCount: 1,
    scopes: [{ id: 'production', name: 'Production' }],
  },
  features: [
    {
      featureKey: 'resources',
      entitlementState: 'enabled',
      visibilityState: 'visible',
      actions: {
        view: {
          action: 'view',
          actionabilityState: 'actionable',
          reasonCode: 'allowed',
          dataScopeMode: 'restricted',
        },
      },
    },
  ],
};

void restrictedBootstrap;

const auditActorDisplayName: PortalFeatureSetAuditEvent['actorDisplayName'] = 'admin@example.com';
const auditActorEmail: PortalFeatureSetAuditEvent['actorEmail'] = 'admin@example.com';
const auditContinuation: PortalFeatureSetAuditContinuation = {
  NextPartitionKey: 'company-1',
  NextRowKey: 'reverse-time|event-1',
};
const auditPage: PortalFeatureSetAuditPage = { events: [], continuation: auditContinuation };
const featureSetConfiguration: PortalFeatureSetConfigurationResponse = {
  customerId: 'company-1',
  featureSets: [
    {
      featureSetKey: 'kanban_board',
      entitlementState: 'enabled',
      visibilityState: 'visible',
      reasonCode: 'allowed',
      presentationMode: 'normal',
      sources: [],
      appliesTo: 'all_users',
    },
  ],
};

void auditActorDisplayName;
void auditActorEmail;
void auditPage;
void featureSetConfiguration;

export type { DataScopeModeIsClosed, RollingActionModeIsOptional, FeatureSetAuditActionsAreClosed };
