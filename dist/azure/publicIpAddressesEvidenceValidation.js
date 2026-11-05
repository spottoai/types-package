"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIssue = exports.isSource = exports.hasOmissions = exports.isOmissions = exports.isResource = exports.knownPorts = exports.isPortRanges = exports.isPortRange = exports.timestamp = exports.protocols = exports.isUnique = exports.isTexts = exports.isArray = exports.isOneOf = exports.isCount = exports.isText = exports.isRecord = void 0;
const publicIpAddressesNetworkAccess_1 = require("./publicIpAddressesNetworkAccess");
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
exports.isRecord = isRecord;
const isText = (value, max = publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.idLength) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
exports.isText = isText;
const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
exports.isCount = isCount;
const isOneOf = (value, options) => typeof value === 'string' && options.includes(value);
exports.isOneOf = isOneOf;
const isArray = (value, max) => {
    if (!Array.isArray(value) || value.length > max)
        return false;
    // Array.every skips holes; a sparse array must never establish complete evidence.
    for (let index = 0; index < value.length; index++) {
        if (!Object.prototype.hasOwnProperty.call(value, index))
            return false;
    }
    return true;
};
exports.isArray = isArray;
const isTexts = (value, max, length = publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength) => (0, exports.isArray)(value, max) && value.every(entry => (0, exports.isText)(entry, length));
exports.isTexts = isTexts;
const isUnique = (values) => new Set(values).size === values.length;
exports.isUnique = isUnique;
exports.protocols = ['tcp', 'udp', 'icmp', 'ah', 'esp', 'any', 'unknown'];
/** Strict UTC timestamps with optional milliseconds; no wall-clock or freshness policy. */
const timestamp = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
        return null;
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed))
        return null;
    return new Date(parsed).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value) ? parsed : null;
};
exports.timestamp = timestamp;
const isPortRange = (value) => {
    if (!(0, exports.isRecord)(value) || !(0, exports.isText)(value.value, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.selectorLength))
        return false;
    if (value.from === null || value.to === null)
        return value.from === null && value.to === null;
    if (!(0, exports.isCount)(value.from) || !(0, exports.isCount)(value.to) || value.from > value.to || value.to > 65535)
        return false;
    if (value.value === '*')
        return value.from === 0 && value.to === 65535;
    if (!/^\d+(?:-\d+)?$/.test(value.value))
        return false;
    const [from, to = from] = value.value.split('-').map(Number);
    return from === value.from && to === value.to;
};
exports.isPortRange = isPortRange;
const isPortRanges = (value) => (0, exports.isArray)(value, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.selectors) && value.length > 0 && value.every(exports.isPortRange);
exports.isPortRanges = isPortRanges;
const knownPorts = (value) => value.every(range => range.from !== null && range.to !== null);
exports.knownPorts = knownPorts;
const isResource = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isText)(value.id) &&
    (value.name === null || (0, exports.isText)(value.name, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.labelLength)) &&
    (value.type === null || (0, exports.isText)(value.type, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.labelLength));
exports.isResource = isResource;
const isOmissions = (value, keys) => (0, exports.isRecord)(value) && keys.every(key => (0, exports.isCount)(value[key])) && Object.keys(value).every(key => keys.includes(key));
exports.isOmissions = isOmissions;
const hasOmissions = (value) => Object.values(value).some(count => count > 0);
exports.hasOmissions = hasOmissions;
const isSource = (value, assessedAt) => {
    if (!(0, exports.isRecord)(value) ||
        !(0, exports.isText)(value.id) ||
        !(0, exports.isText)(value.family, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.labelLength) ||
        !(0, exports.isText)(value.location, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.labelLength) ||
        !(0, exports.isOneOf)(value.status, ['complete', 'partial', 'missing']) ||
        (value.reason !== undefined && !(0, exports.isText)(value.reason, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength)))
        return false;
    const observedAt = (0, exports.timestamp)(value.observedAt);
    if (value.observedAt !== null && (observedAt === null || observedAt > assessedAt))
        return false;
    return value.status === 'complete' ? observedAt !== null : (0, exports.isText)(value.reason, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength);
};
exports.isSource = isSource;
const isIssue = (value) => (0, exports.isRecord)(value) &&
    (0, exports.isText)(value.code, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength) &&
    (0, exports.isText)(value.message, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength) &&
    ['resourceId', 'family', 'location'].every(key => value[key] === undefined || (0, exports.isText)(value[key]));
exports.isIssue = isIssue;
//# sourceMappingURL=publicIpAddressesEvidenceValidation.js.map