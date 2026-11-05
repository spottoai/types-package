import {
  canonicalAzureBenefitAssessmentBenefitIdV1,
  canonicalAzureBenefitAssessmentOwnerV1,
  isAzureBenefitAssessmentDependenciesV1,
} from './benefitAssessmentAdmission';
import { isBoundedRows, isRecord } from '../common/validationHelpers';
import { REPORT_EVIDENCE_LIMITS } from './reportEvidence';

/** Complete source relationships only; these never establish current authority or permission. */
export interface AzureReportLegacySingleSourceV1 {
  id: string;
  benefitType: 'reservation' | 'savings-plan';
  scope: 'Single';
  subscriptionId?: string;
}

export interface AzureReportAssessmentRowBindingV1 {
  id: string;
  subjectIndices: number[];
  legacySingleSourceIndices: number[];
}

export interface AzureReportCommitmentAssessmentBindingsV1 {
  schemaVersion: 1;
  planningSubjectIndices: number[];
  legacySingleSources: AzureReportLegacySingleSourceV1[];
  obsoleteCandidates: AzureReportAssessmentRowBindingV1[];
  reallocationOpportunities: AzureReportAssessmentRowBindingV1[];
  renewals: AzureReportAssessmentRowBindingV1[];
  inventory: AzureReportAssessmentRowBindingV1[];
}

export const AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1 = Object.freeze({ rows: 4096, sources: 4096, decodedBytes: 1024 * 1024 });
const lanes = ['obsoleteCandidates', 'reallocationOpportunities', 'renewals', 'inventory'] as const;
const exact = (value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> =>
  isRecord(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
  required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
  Object.keys(value).every(key => required.includes(key) || optional.includes(key));

function withinWireBudget(value: unknown): boolean {
  try {
    const json = JSON.stringify(value);
    if (json.length > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes) return false;
    // encodeURIComponent rejects ill-formed Unicode and expresses UTF-8 bytes portably.
    return encodeURIComponent(json).replace(/%[A-F0-9]{2}/g, 'x').length <= AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes;
  } catch {
    return false;
  }
}

/** Opaque exact IDs have no token grammar or independent length ceiling below the combined wire budget. */
export function isAzureReportAssessmentIdV1(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value.length ||
    value.trim() !== value ||
    value.length > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes ||
    /[\p{Cc}\p{Cf}]/u.test(value)
  )
    return false;
  try {
    encodeURIComponent(value);
    return true;
  } catch {
    return false;
  }
}

export function isAzureReportLegacySingleSourceV1(value: unknown): value is AzureReportLegacySingleSourceV1 {
  return (
    exact(value, ['id', 'benefitType', 'scope'], ['subscriptionId']) &&
    isAzureReportAssessmentIdV1(value.id) &&
    !canonicalAzureBenefitAssessmentBenefitIdV1(value.id) &&
    !/^(?:[\\/]*(?:providers|subscriptions|tenants)(?:[\\/]|$)|https?:\/\/management\.azure\.)/i.test(value.id) &&
    (value.benefitType === 'reservation' || value.benefitType === 'savings-plan') &&
    value.scope === 'Single' &&
    (!Object.prototype.hasOwnProperty.call(value, 'subscriptionId') ||
      (typeof value.subscriptionId === 'string' &&
        canonicalAzureBenefitAssessmentOwnerV1({ companyId: 'local', tenantId: 'local', subscriptionId: value.subscriptionId })?.subscriptionId ===
          value.subscriptionId))
  );
}

const indices = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length <= AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources &&
  value.every((index, position) => Number.isSafeInteger(index) && index >= 0 && (position === 0 || index > value[position - 1]));
const row = (value: unknown): value is AzureReportAssessmentRowBindingV1 =>
  exact(value, ['id', 'subjectIndices', 'legacySingleSourceIndices']) &&
  isAzureReportAssessmentIdV1(value.id) &&
  indices(value.subjectIndices) &&
  indices(value.legacySingleSourceIndices);
const ordered = <T extends { id: string }>(rows: T[]): boolean => rows.every((item, position) => position === 0 || item.id > rows[position - 1].id);

/** Strict syntax and local relationships. Pack/root relationships require the consistency guard below. */
export function isAzureReportCommitmentAssessmentBindingsV1(value: unknown): value is AzureReportCommitmentAssessmentBindingsV1 {
  if (
    !exact(value, ['schemaVersion', 'planningSubjectIndices', 'legacySingleSources', ...lanes]) ||
    value.schemaVersion !== 1 ||
    !indices(value.planningSubjectIndices) ||
    !Array.isArray(value.legacySingleSources) ||
    value.legacySingleSources.length > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources ||
    !lanes.every(key => Array.isArray(value[key]) && value[key].length <= AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.rows) ||
    lanes.reduce((sum, key) => sum + (value[key] as unknown[]).length, 0) > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.rows ||
    !withinWireBudget(value)
  )
    return false;
  if (!value.legacySingleSources.every(isAzureReportLegacySingleSourceV1) || !ordered(value.legacySingleSources)) return false;
  if (value.planningSubjectIndices.length + value.legacySingleSources.length > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources) return false;
  const legacySources = value.legacySingleSources;
  const planning = new Set(value.planningSubjectIndices);
  const used = new Set<number>();
  for (const key of lanes) {
    const rows = value[key] as unknown[];
    if (!rows.every(row) || !ordered(rows)) return false;
    for (const item of rows) {
      if (
        (key !== 'inventory' && !item.subjectIndices.length && !item.legacySingleSourceIndices.length) ||
        ((key === 'renewals' || key === 'inventory') && item.subjectIndices.length + item.legacySingleSourceIndices.length > 1) ||
        item.subjectIndices.some(index => !planning.has(index)) ||
        item.legacySingleSourceIndices.some(index => index >= legacySources.length)
      )
        return false;
      item.legacySingleSourceIndices.forEach(index => used.add(index));
    }
  }
  return used.size === value.legacySingleSources.length;
}

/** Pure enclosing-pack consistency, never an admission/current-read decision. Missing metadata returns false. */
export function areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies: unknown, scope: unknown, projection: unknown): boolean {
  if (
    !isAzureBenefitAssessmentDependenciesV1(dependencies) ||
    !isRecord(scope) ||
    !isRecord(projection) ||
    !isAzureReportCommitmentAssessmentBindingsV1(projection.assessmentSourceBindings)
  )
    return false;
  const binding = projection.assessmentSourceBindings;
  const owner = canonicalAzureBenefitAssessmentOwnerV1(scope as unknown as import('./benefitAssessmentAdmission').AzureBenefitAssessmentOwnerV1);
  if (
    !owner ||
    dependencies.subjects.length + binding.legacySingleSources.length > AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources ||
    binding.planningSubjectIndices.some(index => index >= dependencies.subjects.length) ||
    binding.legacySingleSources.some(source => source.subscriptionId !== undefined && source.subscriptionId !== owner.subscriptionId) ||
    !withinWireBudget({ benefitAssessmentDependencies: dependencies, assessmentSourceBindings: binding })
  )
    return false;
  for (const key of lanes) {
    const section = projection[key];
    const rows = binding[key];
    if (
      !isBoundedRows(section, REPORT_EVIDENCE_LIMITS.detailRows, isRecord) ||
      section.totalCount !== rows.length ||
      section.rows.length !== Math.min(rows.length, REPORT_EVIDENCE_LIMITS.detailRows) ||
      section.omittedCount !== rows.length - section.rows.length
    )
      return false;
    const byId = new Map(rows.map(item => [item.id, item]));
    const retained = new Set<string>();
    for (const item of section.rows) {
      if (!isAzureReportAssessmentIdV1(item.id) || retained.has(item.id)) return false;
      retained.add(item.id);
      const source = byId.get(item.id);
      if (!source) return false;
      const references = [
        ...source.subjectIndices.map(index => dependencies.subjects[index].benefitId),
        ...source.legacySingleSourceIndices.map(index => binding.legacySingleSources[index].id),
      ];
      if (key === 'renewals' || (key === 'inventory' && (references.length || item.doNotRenewAnnualImpact !== undefined))) {
        const id = key === 'renewals' ? item.commitmentId : item.id;
        if (!isAzureReportAssessmentIdV1(id) || references.length !== 1 || (canonicalAzureBenefitAssessmentBenefitIdV1(id) ?? id) !== references[0])
          return false;
      }
    }
  }
  return true;
}
