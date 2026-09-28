/**
 * Provider-neutral resource identity vocabulary.
 *
 * Families, relationship types, and synthetic types are open kebab-case
 * identifiers so a provider can add a service without a package change.
 * Validators check identifier format only, never membership in a list.
 */
export const KEBAB_IDENTIFIER_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ATTRIBUTE_KEY_PATTERN = /^[a-z][A-Za-z0-9]*$/;
export const isKebabIdentifier = (value) => typeof value === 'string' && KEBAB_IDENTIFIER_PATTERN.test(value);
export const isResourceFamilyId = (value) => isKebabIdentifier(value);
export const isCapabilitySourceId = (value) => isKebabIdentifier(value);
export const isAttributeKey = (value) => typeof value === 'string' && ATTRIBUTE_KEY_PATTERN.test(value);
export const isAttributeScalar = (value) => typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
const isPlainRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const isAttributeRecord = (value) => isPlainRecord(value) && Object.entries(value).every(([key, item]) => isAttributeKey(key) && isAttributeScalar(item));
export const isAttributeValue = (value) => {
    if (isAttributeScalar(value))
        return true;
    if (!Array.isArray(value))
        return false;
    return value.every(isAttributeScalar) || value.every(isAttributeRecord);
};
export const isResourceAttributes = (value) => isPlainRecord(value) && Object.entries(value).every(([key, item]) => isAttributeKey(key) && isAttributeValue(item));
