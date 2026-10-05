export const MICROSOFT_365_LICENSE_SOURCES = [
  'subscribedSkus',
  'users',
  'signInActivity',
  'reportSettings',
  'officeActiveUsers',
  'officeAppUsage',
  'copilotUsage',
] as const;
export type Microsoft365SourceName = (typeof MICROSOFT_365_LICENSE_SOURCES)[number];
export type Microsoft365CoverageState = 'complete' | 'partial' | 'denied' | 'unavailable' | 'failed';
export type Microsoft365RecoveryAction = 'review_access' | 'retry_collection' | 'none';
export interface Microsoft365LicenseSource {
  endpoint: string;
  requiredPermissions: string[];
  state: Microsoft365CoverageState;
  reason?: string;
  httpStatus?: number;
  attemptedAt: string;
  observedAt: string | null;
  data: Record<string, unknown>[] | null;
  period?: 'D30' | 'D28';
  recovery?: { action: Microsoft365RecoveryAction; optional: boolean };
}
export interface Microsoft365LicenseArtifact {
  schemaVersion: 'microsoft-365-licenses/v1';
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId?: string;
  sources: Record<Microsoft365SourceName, Microsoft365LicenseSource>;
  reportIdentity: { concealment: 'concealed' | 'identifiable' | 'unknown'; correlation: 'not_performed' };
}
export interface Microsoft365LicenseCoverage extends Omit<Microsoft365LicenseSource, 'data' | 'endpoint' | 'recovery'> {
  recovery: { action: Microsoft365RecoveryAction; optional: boolean };
  observedRowCount: number | null;
  omittedRowCount: number;
}
export interface Microsoft365LicenseRow {
  skuId: string;
  skuPartNumber: string;
  appliesTo: string | null;
  capabilityStatus: string | null;
  enabledUnits: number | null;
  consumedUnits: number | null;
  unallocatedUnits: number | null;
  warningUnits: number | null;
  suspendedUnits: number | null;
}
export interface Microsoft365LicensedAccountRow {
  id: string;
  displayName: string | null;
  userPrincipalName: string | null;
  accountEnabled: boolean | null;
  skuIds: string[] | null;
  lastSuccessfulSignInAt: string | null;
  signInOlderThan90Days: boolean | null;
}
export interface Microsoft365UsageRow {
  key: string;
  userPrincipalName: string | null;
  displayName: string | null;
  reportRefreshDate: string | null;
  lastActivityDate: string | null;
  fields: Record<string, string>;
}
export type Microsoft365UsageSource = 'officeActiveUsers' | 'officeAppUsage' | 'copilotUsage';
export interface Microsoft365LicenseView {
  schemaVersion: 'microsoft-365-license-view/v1';
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId?: string;
  coverage: Record<Microsoft365SourceName, Microsoft365LicenseCoverage>;
  reportIdentity: Microsoft365LicenseArtifact['reportIdentity'];
  summary: {
    productCount: number | null;
    licensedAccountCount: number | null;
    disabledLicensedAccountCount: number | null;
    accountsWithUnknownAssignments: number | null;
  };
  licenses: Microsoft365LicenseRow[];
  accounts: Microsoft365LicensedAccountRow[];
  reports: Record<Microsoft365UsageSource, Microsoft365UsageRow[]>;
}
export interface Microsoft365LicenseTenant {
  cloudAccountId: string;
  name: string;
  tenantId: string;
  supportsAccessUpdate: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 512;
const nullableText = (value: unknown): boolean => value === null || text(value);
const count = (value: unknown): boolean => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value: unknown): boolean => value === null || count(value);
const nullableBoolean = (value: unknown): boolean => value === null || typeof value === 'boolean';
const date = (value: unknown): boolean => text(value) && Number.isFinite(Date.parse(value));
const rows = (value: unknown, predicate: (row: unknown) => boolean): boolean =>
  Array.isArray(value) && value.length <= 2000 && value.every(predicate);

/** Validates the bounded engine projection at API/storage boundaries. */
export function isMicrosoft365LicenseView(value: unknown): value is Microsoft365LicenseView {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 'microsoft-365-license-view/v1' ||
    !text(value.tenantId) ||
    !value.tenantId ||
    !date(value.generatedAt) ||
    (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId))
  )
    return false;
  if (
    !isRecord(value.reportIdentity) ||
    !['concealed', 'identifiable', 'unknown'].includes(String(value.reportIdentity.concealment)) ||
    value.reportIdentity.correlation !== 'not_performed'
  )
    return false;
  if (
    !isRecord(value.coverage) ||
    !MICROSOFT_365_LICENSE_SOURCES.every(name => {
      const source = (value.coverage as Record<string, unknown>)[name];
      return (
        isRecord(source) &&
        ['complete', 'partial', 'denied', 'unavailable', 'failed'].includes(String(source.state)) &&
        date(source.attemptedAt) &&
        (source.observedAt === null || date(source.observedAt)) &&
        Array.isArray(source.requiredPermissions) &&
        source.requiredPermissions.length <= 8 &&
        source.requiredPermissions.every(text) &&
        isRecord(source.recovery) &&
        ['none', 'review_access', 'retry_collection'].includes(String(source.recovery.action)) &&
        typeof source.recovery.optional === 'boolean' &&
        nullableCount(source.observedRowCount) &&
        count(source.omittedRowCount) &&
        (source.reason === undefined || text(source.reason)) &&
        (source.httpStatus === undefined ||
          (typeof source.httpStatus === 'number' && Number.isInteger(source.httpStatus) && source.httpStatus >= 100 && source.httpStatus <= 599)) &&
        (source.period === undefined || source.period === 'D30' || source.period === 'D28')
      );
    })
  )
    return false;
  if (
    !isRecord(value.summary) ||
    !['productCount', 'licensedAccountCount', 'disabledLicensedAccountCount', 'accountsWithUnknownAssignments'].every(key =>
      nullableCount((value.summary as Record<string, unknown>)[key])
    )
  )
    return false;
  if (
    !rows(
      value.licenses,
      row =>
        isRecord(row) &&
        text(row.skuId) &&
        !!row.skuId &&
        text(row.skuPartNumber) &&
        nullableText(row.appliesTo) &&
        nullableText(row.capabilityStatus) &&
        ['enabledUnits', 'consumedUnits', 'unallocatedUnits', 'warningUnits', 'suspendedUnits'].every(key => nullableCount(row[key]))
    )
  )
    return false;
  if (
    !rows(
      value.accounts,
      row =>
        isRecord(row) &&
        text(row.id) &&
        !!row.id &&
        nullableText(row.displayName) &&
        nullableText(row.userPrincipalName) &&
        nullableBoolean(row.accountEnabled) &&
        (row.lastSuccessfulSignInAt === null || date(row.lastSuccessfulSignInAt)) &&
        nullableBoolean(row.signInOlderThan90Days) &&
        (row.skuIds === null || (Array.isArray(row.skuIds) && row.skuIds.length <= 128 && row.skuIds.every(text)))
    )
  )
    return false;
  if (
    !isRecord(value.reports) ||
    !['officeActiveUsers', 'officeAppUsage', 'copilotUsage'].every(name =>
      rows(
        (value.reports as Record<string, unknown>)[name],
        row =>
          isRecord(row) &&
          text(row.key) &&
          nullableText(row.userPrincipalName) &&
          nullableText(row.displayName) &&
          nullableText(row.reportRefreshDate) &&
          nullableText(row.lastActivityDate) &&
          isRecord(row.fields) &&
          Object.keys(row.fields).length <= 100 &&
          Object.entries(row.fields).every(([key, field]) => text(key) && text(field))
      )
    )
  )
    return false;
  return true;
}
