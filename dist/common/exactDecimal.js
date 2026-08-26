"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatExactDecimalValue = exports.sumCanonicalDecimals = exports.multiplyExactDecimalValues = exports.subtractExactDecimalValues = exports.addExactDecimalValues = exports.parseCanonicalDecimal = void 0;
const MAX_DECIMAL_SCALE = 128;
const powerOfTen = (exponent) => {
    if (!Number.isSafeInteger(exponent) || exponent < 0 || exponent > MAX_DECIMAL_SCALE) {
        throw new RangeError(`Decimal scale must be between 0 and ${MAX_DECIMAL_SCALE}.`);
    }
    return 10n ** BigInt(exponent);
};
const normalize = (coefficient, scale) => {
    if (coefficient === 0n)
        return { coefficient: 0n, scale: 0 };
    let normalizedCoefficient = coefficient;
    let normalizedScale = scale;
    while (normalizedScale > 0 && normalizedCoefficient % 10n === 0n) {
        normalizedCoefficient /= 10n;
        normalizedScale -= 1;
    }
    return { coefficient: normalizedCoefficient, scale: normalizedScale };
};
const parseCanonicalDecimal = (value) => {
    const negative = value.startsWith('-');
    const unsigned = negative ? value.slice(1) : value;
    const [integerDigits, fractionDigits = ''] = unsigned.split('.');
    if (fractionDigits.length > MAX_DECIMAL_SCALE)
        throw new RangeError('Decimal scale exceeds the supported bound.');
    const coefficient = BigInt(`${integerDigits}${fractionDigits}`);
    return normalize(negative ? -coefficient : coefficient, fractionDigits.length);
};
exports.parseCanonicalDecimal = parseCanonicalDecimal;
const addExactDecimalValues = (left, right) => {
    const scale = Math.max(left.scale, right.scale);
    return normalize(left.coefficient * powerOfTen(scale - left.scale) + right.coefficient * powerOfTen(scale - right.scale), scale);
};
exports.addExactDecimalValues = addExactDecimalValues;
const subtractExactDecimalValues = (left, right) => (0, exports.addExactDecimalValues)(left, { coefficient: -right.coefficient, scale: right.scale });
exports.subtractExactDecimalValues = subtractExactDecimalValues;
const multiplyExactDecimalValues = (left, right) => normalize(left.coefficient * right.coefficient, left.scale + right.scale);
exports.multiplyExactDecimalValues = multiplyExactDecimalValues;
const sumCanonicalDecimals = (values) => values.reduce((total, value) => (0, exports.addExactDecimalValues)(total, (0, exports.parseCanonicalDecimal)(value)), {
    coefficient: 0n,
    scale: 0,
});
exports.sumCanonicalDecimals = sumCanonicalDecimals;
const formatExactDecimalValue = (value) => {
    const normalized = normalize(value.coefficient, value.scale);
    if (normalized.coefficient === 0n)
        return '0';
    const negative = normalized.coefficient < 0n;
    const digits = (negative ? -normalized.coefficient : normalized.coefficient).toString();
    if (normalized.scale === 0)
        return `${negative ? '-' : ''}${digits}`;
    const padded = digits.padStart(normalized.scale + 1, '0');
    const split = padded.length - normalized.scale;
    return `${negative ? '-' : ''}${padded.slice(0, split)}.${padded.slice(split)}`;
};
exports.formatExactDecimalValue = formatExactDecimalValue;
//# sourceMappingURL=exactDecimal.js.map