import type {
  CompanySubscription,
  CompanySubscriptionResponse,
  SubscriptionAccount,
  SubscriptionInfoBase,
  SubscriptionScopeResponse,
} from '../index';

type Assert<T extends true> = T;
type IsExact<TActual, TExpected> = [TActual] extends [TExpected] ? ([TExpected] extends [TActual] ? true : false) : false;

type CompanySubscriptionReadinessIsBoolean = Assert<IsExact<CompanySubscriptionResponse['ready'], boolean>>;
type SubscriptionScopeReadinessIsBoolean = Assert<IsExact<SubscriptionScopeResponse['ready'], boolean>>;
type SubscriptionDiscountIsOptionalNumber = Assert<IsExact<SubscriptionInfoBase['nativeDiscountPercent'], number | undefined>>;
type StoredSubscriptionDiscountIsOptionalNumber = Assert<IsExact<SubscriptionAccount['nativeDiscountPercent'], number | undefined>>;
type CompanySubscriptionDiscountIsOptionalNumber = Assert<IsExact<CompanySubscriptionResponse['nativeDiscountPercent'], number | undefined>>;
type ScopeSubscriptionDiscountIsOptionalNumber = Assert<IsExact<SubscriptionScopeResponse['nativeDiscountPercent'], number | undefined>>;

const internalSubscriptionWithoutReadiness: CompanySubscription = {
  companyId: 'company-1',
  id: 'subscription-1',
  name: 'Production',
  cloudAccountId: 'cloud-account-1',
  cloudAccountName: 'Primary Azure account',
};

const publicSubscription: CompanySubscriptionResponse = {
  ...internalSubscriptionWithoutReadiness,
  nativeDiscountPercent: 5.25,
  ready: false,
};

const publicSubscriptionScope: SubscriptionScopeResponse = {
  companyId: 'company-1',
  id: 'subscription-1',
  name: 'Production',
  cloudAccountId: 'cloud-account-1',
  cloudAccountName: 'Primary Azure account',
  nativeDiscountPercent: 0,
  ready: true,
  secureScoreEvidence: { status: 'unavailable' },
};

void internalSubscriptionWithoutReadiness;
void publicSubscription;
void publicSubscriptionScope;

const invalidSubscriptionDiscount: CompanySubscriptionResponse = {
  ...publicSubscription,
  // @ts-expect-error The subscription discount is numeric, not a formatted percentage.
  nativeDiscountPercent: '5%',
};

void invalidSubscriptionDiscount;

// @ts-expect-error Public company subscription responses always include readiness.
const publicSubscriptionWithoutReadiness: CompanySubscriptionResponse = internalSubscriptionWithoutReadiness;

// @ts-expect-error Public subscription-scope responses always include readiness.
const publicScopeWithoutReadiness: SubscriptionScopeResponse = {
  companyId: 'company-1',
  id: 'subscription-1',
  name: 'Production',
  cloudAccountId: 'cloud-account-1',
  cloudAccountName: 'Primary Azure account',
};

const publicSubscriptionWithNullReadiness: CompanySubscriptionResponse = {
  ...internalSubscriptionWithoutReadiness,
  // @ts-expect-error Public readiness is a boolean, never a nullable storage value.
  ready: null,
};

void publicSubscriptionWithoutReadiness;
void publicScopeWithoutReadiness;
void publicSubscriptionWithNullReadiness;

export type {
  CompanySubscriptionReadinessIsBoolean,
  SubscriptionScopeReadinessIsBoolean,
  SubscriptionDiscountIsOptionalNumber,
  StoredSubscriptionDiscountIsOptionalNumber,
  CompanySubscriptionDiscountIsOptionalNumber,
  ScopeSubscriptionDiscountIsOptionalNumber,
};
