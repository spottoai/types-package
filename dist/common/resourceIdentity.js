"use strict";
/**
 * Provider-neutral resource identity vocabulary.
 *
 * Families, relationship types, and synthetic types are open kebab-case
 * identifiers so a provider can add a service without a package change.
 * Validators check identifier format only, never membership in a list.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceAttributes = exports.isAttributeValue = exports.isAttributeScalar = exports.isAttributeKey = exports.isCapabilitySourceId = exports.isResourceFamilyId = exports.isKebabIdentifier = exports.ATTRIBUTE_KEY_PATTERN = exports.KEBAB_IDENTIFIER_PATTERN = void 0;
exports.KEBAB_IDENTIFIER_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
exports.ATTRIBUTE_KEY_PATTERN = /^[a-z][A-Za-z0-9]*$/;
const isKebabIdentifier = (value) => typeof value === 'string' && exports.KEBAB_IDENTIFIER_PATTERN.test(value);
exports.isKebabIdentifier = isKebabIdentifier;
const isResourceFamilyId = (value) => (0, exports.isKebabIdentifier)(value);
exports.isResourceFamilyId = isResourceFamilyId;
const isCapabilitySourceId = (value) => (0, exports.isKebabIdentifier)(value);
exports.isCapabilitySourceId = isCapabilitySourceId;
const isAttributeKey = (value) => typeof value === 'string' && exports.ATTRIBUTE_KEY_PATTERN.test(value);
exports.isAttributeKey = isAttributeKey;
const isAttributeScalar = (value) => typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
exports.isAttributeScalar = isAttributeScalar;
const isPlainRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const isAttributeRecord = (value) => isPlainRecord(value) && Object.entries(value).every(([key, item]) => (0, exports.isAttributeKey)(key) && (0, exports.isAttributeScalar)(item));
const isAttributeValue = (value) => {
    if ((0, exports.isAttributeScalar)(value))
        return true;
    if (!Array.isArray(value))
        return false;
    return value.every(exports.isAttributeScalar) || value.every(isAttributeRecord);
};
exports.isAttributeValue = isAttributeValue;
const isResourceAttributes = (value) => isPlainRecord(value) && Object.entries(value).every(([key, item]) => (0, exports.isAttributeKey)(key) && (0, exports.isAttributeValue)(item));
exports.isResourceAttributes = isResourceAttributes;
//# sourceMappingURL=resourceIdentity.js.map