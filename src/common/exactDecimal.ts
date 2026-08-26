export interface ExactDecimalValue {
  coefficient: bigint;
  scale: number;
}

const MAX_DECIMAL_SCALE = 128;

const powerOfTen = (exponent: number): bigint => {
  if (!Number.isSafeInteger(exponent) || exponent < 0 || exponent > MAX_DECIMAL_SCALE) {
    throw new RangeError(`Decimal scale must be between 0 and ${MAX_DECIMAL_SCALE}.`);
  }
  return 10n ** BigInt(exponent);
};

const normalize = (coefficient: bigint, scale: number): ExactDecimalValue => {
  if (coefficient === 0n) return { coefficient: 0n, scale: 0 };
  let normalizedCoefficient = coefficient;
  let normalizedScale = scale;
  while (normalizedScale > 0 && normalizedCoefficient % 10n === 0n) {
    normalizedCoefficient /= 10n;
    normalizedScale -= 1;
  }
  return { coefficient: normalizedCoefficient, scale: normalizedScale };
};

export const parseCanonicalDecimal = (value: string): ExactDecimalValue => {
  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [integerDigits, fractionDigits = ''] = unsigned.split('.');
  if (fractionDigits.length > MAX_DECIMAL_SCALE) throw new RangeError('Decimal scale exceeds the supported bound.');
  const coefficient = BigInt(`${integerDigits}${fractionDigits}`);
  return normalize(negative ? -coefficient : coefficient, fractionDigits.length);
};

export const addExactDecimalValues = (left: ExactDecimalValue, right: ExactDecimalValue): ExactDecimalValue => {
  const scale = Math.max(left.scale, right.scale);
  return normalize(left.coefficient * powerOfTen(scale - left.scale) + right.coefficient * powerOfTen(scale - right.scale), scale);
};

export const subtractExactDecimalValues = (left: ExactDecimalValue, right: ExactDecimalValue): ExactDecimalValue =>
  addExactDecimalValues(left, { coefficient: -right.coefficient, scale: right.scale });

export const multiplyExactDecimalValues = (left: ExactDecimalValue, right: ExactDecimalValue): ExactDecimalValue =>
  normalize(left.coefficient * right.coefficient, left.scale + right.scale);

export const sumCanonicalDecimals = (values: readonly string[]): ExactDecimalValue =>
  values.reduce<ExactDecimalValue>((total, value) => addExactDecimalValues(total, parseCanonicalDecimal(value)), {
    coefficient: 0n,
    scale: 0,
  });

export const formatExactDecimalValue = (value: ExactDecimalValue): string => {
  const normalized = normalize(value.coefficient, value.scale);
  if (normalized.coefficient === 0n) return '0';
  const negative = normalized.coefficient < 0n;
  const digits = (negative ? -normalized.coefficient : normalized.coefficient).toString();
  if (normalized.scale === 0) return `${negative ? '-' : ''}${digits}`;
  const padded = digits.padStart(normalized.scale + 1, '0');
  const split = padded.length - normalized.scale;
  return `${negative ? '-' : ''}${padded.slice(0, split)}.${padded.slice(split)}`;
};
