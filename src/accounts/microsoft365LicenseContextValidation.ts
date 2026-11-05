import { isRecord, type JsonRecord } from '../common/validationHelpers';
import { isMicrosoft365PricingDate } from './microsoft365PricingOverrides';
import {
  MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION,
  MICROSOFT365_LICENSE_CONTEXT_LIMITS as limits,
  MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION,
  type Microsoft365AccountContext,
  type Microsoft365AccountContextDocument,
  type Microsoft365AccountContextInput,
  type Microsoft365AccountContextResponse,
  type Microsoft365AccountContextScope,
  type Microsoft365LicenseContextScope,
  type Microsoft365LicenseStrategy,
  type Microsoft365ProductContext,
  type Microsoft365ProductContextCollectionResponse,
  type Microsoft365ProductContextDocument,
  type Microsoft365ProductContextInput,
  type Microsoft365ProductContextResponse,
  type Microsoft365ProductContextSummary,
} from './microsoft365LicenseContext';

const productInputKeys = ['strategy', 'notes', 'reviewOn'] as const;
const attributionKeys = ['updatedAt', 'updatedBy'] as const;
const productKeys = ['skuId', ...productInputKeys, ...attributionKeys] as const;
const accountKeys = ['accountId', 'notes', ...attributionKeys] as const;
const summaryKeys = ['skuId', 'strategy', 'reviewOn', 'updatedAt', 'updatedBy', 'hasNotes'] as const;

const exact = (value: unknown, keys: readonly string[]): value is JsonRecord =>
  isRecord(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
  Reflect.ownKeys(value).length === keys.length &&
  keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
const text = (value: unknown, maximum: number): value is string => typeof value === 'string' && value.length <= maximum;
const normalizedText = (value: unknown, maximum: number): value is string => text(value, maximum) && value.trim() === value;
const identifier = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
const guid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
const dateOrNull = (value: unknown): boolean => value === null || isMicrosoft365PricingDate(value);
const timestamp = (value: unknown): boolean => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === (value.includes('.') ? value : value.replace('Z', '.000Z'));
};

/** Called on validated shapes. API additionally bounds actual request/storage bytes. */
const withinBytes = (value: unknown, maximum: number): boolean => {
  let bytes = 0;
  for (const character of JSON.stringify(value)) {
    const code = character.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes > maximum) return false;
  }
  return true;
};

export const isMicrosoft365LicenseStrategy = (value: unknown): value is Microsoft365LicenseStrategy =>
  value === 'encourage' || value === 'contain' || value === 'exit';
const productPlan = (value: JsonRecord): boolean =>
  (value.strategy === null || isMicrosoft365LicenseStrategy(value.strategy)) && dateOrNull(value.reviewOn);
const attribution = (value: JsonRecord): boolean =>
  timestamp(value.updatedAt) && normalizedText(value.updatedBy, limits.actorCharacters) && value.updatedBy.length > 0;

export function isMicrosoft365ProductContextInput(value: unknown): value is Microsoft365ProductContextInput {
  return exact(value, productInputKeys) && text(value.notes, limits.noteCharacters) && productPlan(value) && withinBytes(value, limits.requestBytes);
}

export function isMicrosoft365AccountContextInput(value: unknown): value is Microsoft365AccountContextInput {
  return exact(value, ['notes']) && text(value.notes, limits.noteCharacters) && withinBytes(value, limits.requestBytes);
}

export function isMicrosoft365ProductContext(value: unknown): value is Microsoft365ProductContext {
  return (
    exact(value, productKeys) && guid(value.skuId) && normalizedText(value.notes, limits.noteCharacters) && productPlan(value) && attribution(value)
  );
}

export function isMicrosoft365AccountContext(value: unknown): value is Microsoft365AccountContext {
  return exact(value, accountKeys) && guid(value.accountId) && normalizedText(value.notes, limits.noteCharacters) && attribution(value);
}

const products = <T extends { skuId: string }>(value: unknown, guard: (item: unknown) => item is T): value is T[] => {
  if (!Array.isArray(value) || value.length > limits.products) return false;
  const ids = new Set<string>();
  for (const row of value) {
    if (!guard(row) || ids.has(row.skuId)) return false;
    ids.add(row.skuId);
  }
  return true;
};

/** Expected binding checks supplement authorization and current subject-membership checks in API policy. */
export function isMicrosoft365ProductContextDocument(
  value: unknown,
  expected?: Microsoft365LicenseContextScope
): value is Microsoft365ProductContextDocument {
  return (
    exact(value, ['schemaVersion', 'companyId', 'tenantId', 'products']) &&
    value.schemaVersion === MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION &&
    identifier(value.companyId) &&
    identifier(value.tenantId) &&
    (!expected || (value.companyId === expected.companyId && value.tenantId === expected.tenantId)) &&
    products(value.products, isMicrosoft365ProductContext) &&
    withinBytes(value, limits.productDocumentBytes)
  );
}

export function isMicrosoft365AccountContextDocument(
  value: unknown,
  expected?: Microsoft365AccountContextScope
): value is Microsoft365AccountContextDocument {
  return (
    exact(value, ['schemaVersion', 'companyId', 'tenantId', 'accountId', 'context']) &&
    value.schemaVersion === MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION &&
    identifier(value.companyId) &&
    identifier(value.tenantId) &&
    guid(value.accountId) &&
    (!expected || (value.companyId === expected.companyId && value.tenantId === expected.tenantId && value.accountId === expected.accountId)) &&
    (value.context === null || (isMicrosoft365AccountContext(value.context) && value.context.accountId === value.accountId)) &&
    withinBytes(value, limits.accountDocumentBytes)
  );
}

const response = <T>(value: unknown, guard: (context: unknown) => context is T): boolean =>
  exact(value, ['tenantId', 'context']) &&
  identifier(value.tenantId) &&
  (value.context === null || guard(value.context)) &&
  withinBytes(value, limits.accountDocumentBytes);

export const isMicrosoft365ProductContextResponse = (value: unknown): value is Microsoft365ProductContextResponse =>
  response(value, isMicrosoft365ProductContext);
export const isMicrosoft365AccountContextResponse = (value: unknown): value is Microsoft365AccountContextResponse =>
  response(value, isMicrosoft365AccountContext);

export function isMicrosoft365ProductContextSummary(value: unknown): value is Microsoft365ProductContextSummary {
  return exact(value, summaryKeys) && guid(value.skuId) && productPlan(value) && attribution(value) && typeof value.hasNotes === 'boolean';
}

export function isMicrosoft365ProductContextCollectionResponse(value: unknown): value is Microsoft365ProductContextCollectionResponse {
  return (
    exact(value, ['tenantId', 'products']) &&
    identifier(value.tenantId) &&
    products(value.products, isMicrosoft365ProductContextSummary) &&
    // Replacing empty notes with hasNotes:false adds at most six JSON bytes per entry.
    withinBytes(value, limits.productDocumentBytes + limits.products * 6)
  );
}
