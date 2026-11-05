/** Internal dependency-free wire checks shared by the optimization contracts. Not exported from the package root. */
export type Row = Record<string, unknown>;
export const row = (value: unknown): value is Row =>
  !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
export const keys = (value: Row, allowed: readonly string[]): boolean => Object.keys(value).every(key => allowed.includes(key));
export const text = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 512 &&
  value.trim() === value &&
  [...value].every(character => {
    const point = character.codePointAt(0)!;
    return (
      point >= 32 &&
      !(point >= 127 && point <= 159) &&
      !(point >= 0xd800 && point <= 0xdfff) &&
      ![0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069].includes(point)
    );
  });
export const token = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
export const code = (value: unknown): value is string => typeof value === 'string' && /^[a-z][a-z0-9_-]{0,95}$/.test(value);
export const guid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
export const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export const nullableCount = (value: unknown): boolean => value === null || count(value);
export const minorUnits = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const scaled = value * 100,
    rounded = Math.round(scaled);
  return Number.isSafeInteger(rounded) && Math.abs(scaled - rounded) <= 0.0001 ? rounded : null;
};
export const amount = (value: unknown): value is number => minorUnits(value) !== null;
export const money = (value: unknown): boolean => value === null || (amount(value) && value >= 0);
export const unitPrice = (value: unknown): boolean =>
  value === null ||
  (typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isSafeInteger(Math.round(value * 10000)) &&
    Math.abs(value * 10000 - Math.round(value * 10000)) <= 0.0001);
export const choice = (value: unknown, values: readonly string[]): boolean => typeof value === 'string' && values.includes(value);
export const list = (value: unknown, limit: number, check: (item: unknown) => boolean): value is unknown[] =>
  Array.isArray(value) &&
  Object.getPrototypeOf(value) === Array.prototype &&
  value.length <= limit &&
  Object.keys(value).length === value.length &&
  Array.from(value).every(check);
export const unique = (value: unknown[], identity: (item: unknown) => unknown = item => item): boolean =>
  new Set(value.map(identity)).size === value.length;
export const identifiers = (value: unknown, limit = 128, check: (item: unknown) => boolean = guid): value is string[] =>
  list(value, limit, check) && unique(value, item => String(item).toLowerCase());
export const codes = (value: unknown): value is string[] => identifiers(value, 128, code);
export const date = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export const timestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
  date(value.slice(0, 10)) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
export const month = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}$/.test(value) && date(`${value}-01`);
export const monthNumber = (value: string): number => Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1;
export const consecutiveMonths = (value: unknown): value is string[] =>
  identifiers(value, 6, month) &&
  value.length === 6 &&
  value.every((item, index) => index === 0 || monthNumber(item) === monthNumber(value[index - 1]) + 1);
export const currentHistory = (value: unknown, generatedAt: string): boolean =>
  consecutiveMonths(value) && monthNumber(value[5]) === monthNumber(generatedAt) - 1;
export const coverage = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['state', 'reasonCodes']) &&
  codes(value.reasonCodes) &&
  (value.state === 'complete' ? value.reasonCodes.length === 0 : choice(value.state, ['partial', 'unavailable']) && value.reasonCodes.length > 0);
export const byKind = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['combineLicenses', 'addProtection', 'changeTerm']) &&
  coverage(value.combineLicenses) &&
  coverage(value.addProtection) &&
  coverage(value.changeTerm);
export const consistentCoverage = (overall: Row, channels: Row, omitted: boolean): boolean => {
  const states = Object.values(channels).map(item => (item as Row).state);
  if (overall.state === 'complete') return !omitted && states.every(state => state === 'complete');
  if (overall.state === 'unavailable') return states.every(state => state === 'unavailable');
  return !states.every(state => state === 'unavailable') && (omitted || states.some(state => state !== 'complete'));
};
