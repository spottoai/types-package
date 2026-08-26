"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialDisplayRollupV1 = exports.createFinancialDisplayRollupIdV1 = exports.isFinancialAuthorityComponentDescriptorV1 = void 0;
const sha256_1 = require("../common/sha256");
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const DISPLAY_LABEL_SOURCES = new Set(['meter-name', 'product-name', 'meter-subcategory', 'meter-category', 'service-name', 'charge-classification']);
const ROLLUP_LABEL_SOURCES = new Set(['service-name', 'meter-category', 'charge-classification']);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isHash = (value) => typeof value === 'string' && SHA256_ID.test(value);
const isBoundedText = (value, maxLength = 512) => typeof value === 'string' && value.length > 0 && value.length <= maxLength && value.trim() === value;
const isHashArray = (value) => Array.isArray(value) && value.length > 0 && value.length <= 256 && value.every(isHash) && new Set(value).size === value.length;
const labelSourceValue = (value) => {
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
const isFinancialAuthorityComponentDescriptorV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactFields(value, ['baselineId', 'componentId', 'displayLabel', 'displayLabelSource', 'evidenceRefIds'], ['serviceName', 'meterCategory', 'meterSubCategory', 'meterName', 'productName', 'unitOfMeasure']) ||
        !isHash(value.baselineId) ||
        !isHash(value.componentId) ||
        !isBoundedText(value.displayLabel) ||
        typeof value.displayLabelSource !== 'string' ||
        !DISPLAY_LABEL_SOURCES.has(value.displayLabelSource) ||
        !isHashArray(value.evidenceRefIds) ||
        ['serviceName', 'meterCategory', 'meterSubCategory', 'meterName', 'productName', 'unitOfMeasure'].some(field => value[field] !== undefined && !isBoundedText(value[field])))
        return false;
    const descriptor = value;
    const sourceValue = labelSourceValue(descriptor);
    return descriptor.displayLabelSource === 'charge-classification' || sourceValue === descriptor.displayLabel;
};
exports.isFinancialAuthorityComponentDescriptorV1 = isFinancialAuthorityComponentDescriptorV1;
const canonicalRollupPreimage = (value) => ({
    displayScopeId: value.displayScopeId,
    purpose: value.purpose,
    additivity: value.additivity,
    displayLabel: value.displayLabel,
    displayLabelSource: value.displayLabelSource,
    members: [...value.members].sort((left, right) => `${left.baselineId}\u0000${left.componentId}`.localeCompare(`${right.baselineId}\u0000${right.componentId}`)),
});
const createFinancialDisplayRollupIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)(JSON.stringify(canonicalRollupPreimage(value)))}`;
exports.createFinancialDisplayRollupIdV1 = createFinancialDisplayRollupIdV1;
const isFinancialDisplayRollupV1 = (value) => {
    if (!isRecord(value) ||
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
        value.members.length > 20000 ||
        !value.members.every(member => isRecord(member) && hasExactFields(member, ['baselineId', 'componentId']) && isHash(member.baselineId) && isHash(member.componentId)))
        return false;
    const rollup = value;
    const membershipKeys = rollup.members.map(member => `${member.baselineId}\u0000${member.componentId}`);
    if (new Set(membershipKeys).size !== membershipKeys.length)
        return false;
    const { displayRollupId: _displayRollupId, ...identity } = rollup;
    return rollup.displayRollupId === (0, exports.createFinancialDisplayRollupIdV1)(identity);
};
exports.isFinancialDisplayRollupV1 = isFinancialDisplayRollupV1;
//# sourceMappingURL=financialDisplayRollupValidation.js.map