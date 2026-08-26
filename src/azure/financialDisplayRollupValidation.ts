import { sha256Utf8 } from '../common/sha256';
import type {
  FinancialAuthorityComponentDescriptorV1,
  FinancialDisplayRollupIdentityPreimageV1,
  FinancialDisplayRollupV1,
} from './financialDisplayRollup';

type JsonRecord = Record<string, unknown>;
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const DISPLAY_LABEL_SOURCES = new Set(['meter-name', 'product-name', 'meter-subcategory', 'meter-category', 'service-name', 'charge-classification']);
const ROLLUP_LABEL_SOURCES = new Set(['service-name', 'meter-category', 'charge-classification']);
const isRecord = (value: unknown): value is JsonRecord => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value: JsonRecord, required: readonly string[], optional: readonly string[] = []): boolean => {
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isHash = (value: unknown): value is string => typeof value === 'string' && SHA256_ID.test(value);
const isBoundedText = (value: unknown, maxLength = 512): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= maxLength && value.trim() === value;
const isHashArray = (value: unknown): value is [string, ...string[]] =>
  Array.isArray(value) && value.length > 0 && value.length <= 256 && value.every(isHash) && new Set(value).size === value.length;

const labelSourceValue = (value: FinancialAuthorityComponentDescriptorV1): string | undefined => {
  switch (value.displayLabelSource) {
    case 'meter-name':
      return value.meterName;
    case 'product-name':
      return value.productName;
    case 'meter-subcategory':
      return value.meterSubCategory;
    case 'meter-category':
      return value.meterCategory;
    case 'service-name':
      return value.serviceName;
    case 'charge-classification':
      return undefined;
  }
};

export const isFinancialAuthorityComponentDescriptorV1 = (value: unknown): value is FinancialAuthorityComponentDescriptorV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(
      value,
      ['baselineId', 'componentId', 'displayLabel', 'displayLabelSource', 'evidenceRefIds'],
      ['serviceName', 'meterCategory', 'meterSubCategory', 'meterName', 'productName', 'unitOfMeasure']
    ) ||
    !isHash(value.baselineId) ||
    !isHash(value.componentId) ||
    !isBoundedText(value.displayLabel) ||
    typeof value.displayLabelSource !== 'string' ||
    !DISPLAY_LABEL_SOURCES.has(value.displayLabelSource) ||
    !isHashArray(value.evidenceRefIds) ||
    ['serviceName', 'meterCategory', 'meterSubCategory', 'meterName', 'productName', 'unitOfMeasure'].some(
      field => value[field] !== undefined && !isBoundedText(value[field])
    )
  )
    return false;

  const descriptor = value as unknown as FinancialAuthorityComponentDescriptorV1;
  const sourceValue = labelSourceValue(descriptor);
  return descriptor.displayLabelSource === 'charge-classification' || sourceValue === descriptor.displayLabel;
};

const canonicalRollupPreimage = (value: FinancialDisplayRollupIdentityPreimageV1): unknown => ({
  displayScopeId: value.displayScopeId,
  purpose: value.purpose,
  additivity: value.additivity,
  displayLabel: value.displayLabel,
  displayLabelSource: value.displayLabelSource,
  members: [...value.members].sort((left, right) =>
    `${left.baselineId}\u0000${left.componentId}`.localeCompare(`${right.baselineId}\u0000${right.componentId}`)
  ),
});

export const createFinancialDisplayRollupIdV1 = (value: FinancialDisplayRollupIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(JSON.stringify(canonicalRollupPreimage(value)))}`;

export const isFinancialDisplayRollupV1 = (value: unknown): value is FinancialDisplayRollupV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['displayRollupId', 'displayScopeId', 'purpose', 'additivity', 'displayLabel', 'displayLabelSource', 'members']) ||
    !isHash(value.displayRollupId) ||
    !isBoundedText(value.displayScopeId, 2048) ||
    value.purpose !== 'cost-composition' ||
    value.additivity !== 'non-additive' ||
    !isBoundedText(value.displayLabel) ||
    typeof value.displayLabelSource !== 'string' ||
    !ROLLUP_LABEL_SOURCES.has(value.displayLabelSource) ||
    !Array.isArray(value.members) ||
    value.members.length === 0 ||
    value.members.length > 20_000 ||
    !value.members.every(
      member => isRecord(member) && hasExactFields(member, ['baselineId', 'componentId']) && isHash(member.baselineId) && isHash(member.componentId)
    )
  )
    return false;
  const rollup = value as unknown as FinancialDisplayRollupV1;
  const membershipKeys = rollup.members.map(member => `${member.baselineId}\u0000${member.componentId}`);
  if (new Set(membershipKeys).size !== membershipKeys.length) return false;
  const { displayRollupId: _displayRollupId, ...identity } = rollup;
  return rollup.displayRollupId === createFinancialDisplayRollupIdV1(identity);
};
