/**
 * Provider-neutral resource identity vocabulary.
 *
 * Families, relationship types, and synthetic types are open kebab-case
 * identifiers so a provider can add a service without a package change.
 * Validators check identifier format only, never membership in a list.
 */

/** Open, kebab-case discovery family identifier, for example `ec2-instance`. */
export type ResourceFamilyId = string;

/** Provider-native resource type, for example `AWS::EC2::Instance`. */
export type ProviderResourceType = string;

/** Open, kebab-case identifier of the capability or source that produced evidence. */
export type CapabilitySourceId = string;

export type AttributeScalar = string | number | boolean;

/** A scalar, a list of scalars, or a list of flat records of scalars. */
export type AttributeValue = AttributeScalar | AttributeScalar[] | Array<Record<string, AttributeScalar>>;

/** Provider-native resource attributes keyed by camelCase names. */
export type ResourceAttributes = Record<string, AttributeValue>;

export const KEBAB_IDENTIFIER_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ATTRIBUTE_KEY_PATTERN = /^[a-z][A-Za-z0-9]*$/;

export const isKebabIdentifier = (value: unknown): value is string => typeof value === 'string' && KEBAB_IDENTIFIER_PATTERN.test(value);
export const isResourceFamilyId = (value: unknown): value is ResourceFamilyId => isKebabIdentifier(value);
export const isCapabilitySourceId = (value: unknown): value is CapabilitySourceId => isKebabIdentifier(value);
export const isAttributeKey = (value: unknown): value is string => typeof value === 'string' && ATTRIBUTE_KEY_PATTERN.test(value);

export const isAttributeScalar = (value: unknown): value is AttributeScalar =>
  typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

const isAttributeRecord = (value: unknown): value is Record<string, AttributeScalar> =>
  isPlainRecord(value) && Object.entries(value).every(([key, item]) => isAttributeKey(key) && isAttributeScalar(item));

export const isAttributeValue = (value: unknown): value is AttributeValue => {
  if (isAttributeScalar(value)) return true;
  if (!Array.isArray(value)) return false;
  return value.every(isAttributeScalar) || value.every(isAttributeRecord);
};

export const isResourceAttributes = (value: unknown): value is ResourceAttributes =>
  isPlainRecord(value) && Object.entries(value).every(([key, item]) => isAttributeKey(key) && isAttributeValue(item));
