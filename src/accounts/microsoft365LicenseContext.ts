/** Company-authored strategy, separate from Microsoft status and measured savings. */
export type Microsoft365LicenseStrategy = 'encourage' | 'contain' | 'exit';

export const MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION = 'microsoft-365-license-context/v1';
export const MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION = 'microsoft-365-account-context/v1';
export const MICROSOFT365_LICENSE_CONTEXT_LIMITS = {
  /** String limits use UTF-16 code units. Byte limits apply to serialized UTF-8 JSON. */
  noteCharacters: 4000,
  actorCharacters: 256,
  products: 1000,
  productDocumentBytes: 1024 * 1024,
  accountDocumentBytes: 64 * 1024,
  requestBytes: 64 * 1024,
} as const;

/** Complete subject replacement; API normalizes outer whitespace. Saves are last-write-wins. */
export interface Microsoft365ProductContextInput {
  strategy: Microsoft365LicenseStrategy | null;
  notes: string;
  /** YYYY-MM-DD, compared with the viewer's local calendar date by the portal. */
  reviewOn: string | null;
}

export interface Microsoft365AccountContextInput {
  notes: string;
}

interface Microsoft365ContextAttribution {
  updatedAt: string;
  /** Server-owned display attribution, visible to every authorized context viewer. */
  updatedBy: string;
}

export interface Microsoft365ProductContext extends Microsoft365ProductContextInput, Microsoft365ContextAttribution {
  skuId: string;
}

export interface Microsoft365AccountContext extends Microsoft365AccountContextInput, Microsoft365ContextAttribution {
  accountId: string;
}

export interface Microsoft365LicenseContextScope {
  companyId: string;
  tenantId: string;
}

export interface Microsoft365AccountContextScope extends Microsoft365LicenseContextScope {
  accountId: string;
}

/** Blob ETags are internal to the repository's subject-preserving retries. */
export interface Microsoft365ProductContextDocument extends Microsoft365LicenseContextScope {
  schemaVersion: typeof MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION;
  products: Microsoft365ProductContext[];
}

export interface Microsoft365AccountContextDocument extends Microsoft365AccountContextScope {
  schemaVersion: typeof MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION;
  context: Microsoft365AccountContext | null;
}

export interface Microsoft365ContextResponse<T> {
  tenantId: string;
  /** Null for an absent or cleared subject. */
  context: T | null;
}

export type Microsoft365ProductContextResponse = Microsoft365ContextResponse<Microsoft365ProductContext>;
export type Microsoft365AccountContextResponse = Microsoft365ContextResponse<Microsoft365AccountContext>;

/** Collection metadata is joined to held products by SKU; full notes use detail reads. */
export interface Microsoft365ProductContextSummary extends Omit<Microsoft365ProductContext, 'notes'> {
  hasNotes: boolean;
}

export interface Microsoft365ProductContextCollectionResponse {
  tenantId: string;
  /** Includes saved metadata for products absent from the current scan. */
  products: Microsoft365ProductContextSummary[];
}
