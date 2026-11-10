import {
  CURRENCY_CONVERSION_CONTRACT_VERSION,
  CURRENCY_CONVERSION_RATE_SOURCE,
  type CurrencyConversionContextV1,
  type CurrencyConversionDiscoveryV1,
  type CurrencyConversionV1,
  isCurrencyConversionV1,
  type CurrencyDisplayProjectionFieldsV1,
  type CurrencyConversionUnavailableV1,
  type CompanySubscriptionResponse,
  type SubscriptionScopeResponse,
  type ProviderScopeSelectionItem,
  type CompanySubscription,
} from '../index';

const context: CurrencyConversionContextV1 = {
  contractVersion: CURRENCY_CONVERSION_CONTRACT_VERSION,
  targetCurrency: 'USD',
  rateDate: '2026-11-04',
  rateSnapshotId: 'a'.repeat(64),
  rateSource: CURRENCY_CONVERSION_RATE_SOURCE,
};
const document: CurrencyConversionV1 = {
  ...context,
  status: 'converted',
  rates: [{ sourceCurrency: 'NZD', sourceRate: '1.8', targetRate: '1.08', rate: '0.6' }],
};
const discovery: CurrencyConversionDiscoveryV1 = {
  contractVersion: 1,
  rateDate: context.rateDate,
  rateSnapshotId: context.rateSnapshotId,
  rateSource: context.rateSource,
  currencies: [{ code: 'EUR', minorUnitScale: 2 }],
};
const unknownWire: unknown = document;
if (isCurrencyConversionV1(unknownWire)) {
  const status: 'converted' | 'unchanged' = unknownWire.status;
  void status;
}
// @ts-expect-error Failure/partial results cannot claim successful conversion evidence.
const partial: CurrencyConversionV1 = { ...document, status: 'partial' };
// @ts-expect-error Exact quotes remain decimal strings across transports.
const numericRate: CurrencyConversionV1['rates'][number] = { ...document.rates[0], rate: 0.6 };
// @ts-expect-error Discovery exposes supported currencies, not a chosen user preference.
const userSetting: CurrencyConversionDiscoveryV1 = { ...discovery, targetCurrency: 'USD' };
void [partial, numericRate, userSetting];

const unavailable: CurrencyConversionUnavailableV1 = { targetCurrency: 'USD', code: 'currency-source-unknown' };
const displayFields: CurrencyDisplayProjectionFieldsV1 = { billingCurrency: 'NZD', currencyConversion: document };
const subscriptionProjection: Pick<CompanySubscriptionResponse, keyof CurrencyDisplayProjectionFieldsV1> = displayFields;
const scopeProjection: Pick<SubscriptionScopeResponse, keyof CurrencyDisplayProjectionFieldsV1> = displayFields;
const providerProjection: Pick<ProviderScopeSelectionItem, keyof CurrencyDisplayProjectionFieldsV1> = {
  billingCurrency: 'NZD',
  currencyConversionUnavailable: unavailable,
};
// @ts-expect-error Read projections must not become persisted subscription fields.
const persistedProjection: Pick<CompanySubscription, 'currencyConversion'> = displayFields;
// @ts-expect-error Unavailable results use a closed public error vocabulary.
const privateFailure: CurrencyConversionUnavailableV1 = { targetCurrency: 'USD', code: 'internal-secret' };
void [subscriptionProjection, scopeProjection, providerProjection, persistedProjection, privateFailure];
