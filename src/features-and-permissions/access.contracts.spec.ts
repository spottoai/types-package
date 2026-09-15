import type { PortalAccessBootstrapResponse, PortalDataScopeMode, PortalFeatureActionAccess } from '../index';

type Assert<T extends true> = T;
type IsExact<TActual, TExpected> = [TActual] extends [TExpected] ? ([TExpected] extends [TActual] ? true : false) : false;

type DataScopeModeIsClosed = Assert<IsExact<PortalDataScopeMode, 'unrestricted' | 'restricted' | 'none' | 'unavailable'>>;
type RollingActionModeIsOptional = Assert<IsExact<PortalFeatureActionAccess['dataScopeMode'], PortalDataScopeMode | undefined>>;

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

export type { DataScopeModeIsClosed, RollingActionModeIsOptional };
