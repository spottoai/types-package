import { FRAMEWORK_ASSESSMENT_LIMITS } from './contracts';
import type { AssessmentJsonValue, AssessmentNativeScope, ParsedScopeScanRawFinding } from './contracts';
import { choice, decodedBytes, identifier, input, list, record, text, unique } from './internal';
import { TerminalAssessmentError } from './failures';

/** Only this check emits one row per credential for a single app identity. */
/**
 * Repeated results for one resource and check are summarised (FAIL over MANUAL over PASS) instead of failing the scan:
 * per-credential app results in a tenant, and AWS account scans, where some checks report a resource once per region.
 */
export const isAggregatedScopeScanCheck = (scopeType: string, checkId: string): boolean =>
  scopeType === 'account' || (scopeType === 'tenant' && checkId === 'entra_app_registration_credential_not_expired');
export const SCOPE_SCAN_FINDING_STATUS_PRIORITY = Object.freeze({ PASS: 0, MANUAL: 1, FAIL: 2 });

/** Use the page envelope so single-item acceptance and eventual page parsing have identical depth limits. */
export const parseScopeScanRawItem = (value: unknown): AssessmentJsonValue => {
  const page = input({ schemaVersion: 2, items: [value] }) as { items: AssessmentJsonValue[] };
  if (decodedBytes(page) > FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes) throw new TerminalAssessmentError('raw-row-too-large');
  return page.items[0];
};
const object = (value: unknown): Record<string, unknown> | undefined => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(Object.getOwnPropertyDescriptors(value))
      .filter(([, descriptor]) => 'value' in descriptor)
      .map(([key, descriptor]) => [key, descriptor.value])
  );
};

const AWS_PARTITIONS = new Set(['aws', 'aws-us-gov', 'aws-cn']);

/**
 * An AWS resource belongs to the scanned account when it is the account itself, or an ARN whose account segment is
 * empty (global resources such as S3 buckets) or equal to the account. ARNs are case-sensitive and are not folded.
 */
export const isAwsResourceInAccount = (uid: string, accountId: string): boolean => {
  if (uid === accountId) return true;
  const parts = uid.split(':');
  if (parts.length < 6 || parts[0] !== 'arn' || !AWS_PARTITIONS.has(parts[1] ?? '') || !parts[2]) return false;
  return parts[4] === '' || parts[4] === accountId;
};

const isAzureResourceInScope = (uid: string, scope: AssessmentNativeScope, checkId: string | undefined): boolean => {
  const folded = uid.toLowerCase().replace(/\/$/u, '');
  const ancestor =
    checkId === 'iam_role_user_access_admin_restricted' &&
    /^\/providers\/(?:microsoft\.management\/managementgroups\/[^/]+\/providers\/)?microsoft\.authorization\/roleassignments\/[a-f0-9-]{36}$/u.test(
      folded
    );
  return scope.scopeType === 'tenant'
    ? !folded.startsWith('/')
    : folded.startsWith(`/subscriptions/${scope.scopeId}/`) || folded === `/subscriptions/${scope.scopeId}` || ancestor;
};

/** AWS ids keep their case; Azure ids are folded to lower case without a trailing slash. */
const normalizeResourceId = (uid: string, scope: AssessmentNativeScope): string =>
  scope.providerName === 'aws' ? uid : uid.toLowerCase().replace(/\/$/u, '');

/** Positive native-scope contradictions are terminal even when another field would quarantine the row. */
export const parseScopeScanRawFinding = (
  value: unknown,
  expected: { scope: AssessmentNativeScope; sourceVersion: string; selectedCheckIds: readonly string[] }
): ParsedScopeScanRawFinding | null => {
  const row = object(value),
    cloud = object(row?.cloud),
    account = object(cloud?.account),
    metadata = object(row?.metadata);
  const knownCheck = typeof metadata?.event_code === 'string' ? metadata.event_code : undefined;
  const scope = expected.scope;
  if (
    (typeof cloud?.provider === 'string' && cloud.provider !== scope.providerName) ||
    (typeof account?.uid === 'string' && account.uid.toLowerCase() !== scope.scopeId)
  )
    throw new TerminalAssessmentError('raw-finding-outside-native-scope');
  const version = object(metadata?.product)?.version;
  if (typeof version === 'string' && version !== expected.sourceVersion) throw new TerminalAssessmentError('raw-source-version-mismatch');
  if (
    knownCheck &&
    (!expected.selectedCheckIds.includes(knownCheck) ||
      (scope.scopeType === 'tenant' ? !knownCheck.startsWith('entra_') : knownCheck.startsWith('entra_')))
  )
    throw new TerminalAssessmentError('raw-check-outside-native-scope');
  if (Array.isArray(row?.resources))
    for (const value of row.resources) {
      const entry = object(value);
      if (typeof entry?.uid !== 'string') continue;
      const inScope =
        scope.providerName === 'aws' ? isAwsResourceInAccount(entry.uid, scope.scopeId) : isAzureResourceInScope(entry.uid, scope, knownCheck);
      if (!inScope) throw new TerminalAssessmentError('raw-resource-outside-native-scope');
    }
  try {
    const safe = record(parseScopeScanRawItem(value), 'raw finding');
    const safeCloud = record(safe.cloud, 'cloud');
    if (identifier(safeCloud.provider) !== scope.providerName || identifier(record(safeCloud.account, 'account').uid).toLowerCase() !== scope.scopeId)
      return null;
    const safeMetadata = record(safe.metadata, 'metadata');
    if (identifier(record(safeMetadata.product, 'product').version, 32) !== expected.sourceVersion) return null;
    const resources = list(safe.resources, 1);
    if (resources.length !== 1) return null;
    const resource = record(resources[0], 'resource');
    if (scope.scopeType === 'tenant' && record(resource.group, 'group').name !== 'entra') return null;
    const mappings = safe.unmapped ? record(record(safe.unmapped, 'unmapped').compliance ?? {}, 'compliance') : {};
    const frameworkMappings: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(mappings)) frameworkMappings[identifier(key)] = unique(list(value).map(value => identifier(value)));
    return {
      checkId: identifier(safeMetadata.event_code),
      resourceId: normalizeResourceId(identifier(resource.uid, 4096), scope),
      status: choice(safe.status_code, ['PASS', 'FAIL', 'MANUAL']),
      severity: identifier(safe.severity, 128),
      message: text(safe.message, 65536, false),
      upstreamId: identifier(record(safe.finding_info, 'finding_info').uid, 4096),
      frameworkMappings,
    };
  } catch {
    return null;
  }
};
