import { TerminalAssessmentError } from './failures';
import { FRAMEWORK_ASSESSMENT_LIMITS as limits, type AssessmentJsonValue } from './contracts';

export const invalid = (field: string): never => {
  throw new TerminalAssessmentError(`invalid-assessment-field:${field}`);
};
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const hasControls = (value: string, allowFormatting = false): boolean => {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (allowFormatting && (code === 9 || code === 10 || code === 13)) continue;
    if (code <= 31 || (code >= 127 && code <= 159)) return true;
  }
  return false;
};
export const record = (value: unknown, field: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid(field);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return invalid(field);
  return value as Record<string, unknown>;
};
export const shape = (value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> => {
  const row = record(value, required.join('/'));
  const allowed = new Set([...required, ...optional]);
  if (required.some(key => !Object.prototype.hasOwnProperty.call(row, key)) || Object.keys(row).some(key => !allowed.has(key)))
    return invalid('object keys');
  return row;
};
export const text = (value: unknown, maximum: number = limits.textLength, allowEmpty = true): string => {
  if (typeof value !== 'string' || value.length > maximum || (!allowEmpty && (!value.trim() || value.trim() !== value))) return invalid('text');
  // Human descriptions and code may contain line breaks and tabs; other controls are forbidden.
  if (hasControls(value, true)) return invalid('text controls');
  for (let index = 0; index < value.length; index++) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const trailing = value.charCodeAt(++index);
      if (!(trailing >= 0xdc00 && trailing <= 0xdfff)) return invalid('unicode');
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return invalid('unicode');
  }
  return value;
};
export const identifier = (value: unknown, maximum = 256): string => {
  const result = text(value, maximum, false);
  return hasControls(result) ? invalid('identifier') : result;
};
export const list = (value: unknown, maximum: number = limits.catalogueItems): unknown[] =>
  Array.isArray(value) && value.length <= maximum ? value : invalid('list');
export const unique = <T>(values: T[]): T[] => (new Set(values).size === values.length ? values : invalid('duplicates'));
export const number = (value: unknown, maximum = Number.MAX_SAFE_INTEGER): number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= maximum ? value : invalid('count');
export const choice = <T extends string>(value: unknown, choices: readonly T[]): T =>
  typeof value === 'string' && choices.includes(value as T) ? (value as T) : invalid('enum');
export const timestamp = (value: unknown): string => {
  const result = text(value, 24, false);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(result)) return invalid('timestamp');
  const milliseconds = Date.parse(result);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === result ? result : invalid('timestamp');
};
export const httpUrl = (value: unknown, allowEmpty = false): string => {
  const result = text(value, 8192);
  if (allowEmpty && result === '') return result;
  if (/[\s\\]/u.test(result) || hasControls(result) || /%(?![\da-f]{2})/iu.test(result)) return invalid('URL');
  const match = /^https?:\/\/([^/?#]+)(?:[/?#].*)?$/iu.exec(result);
  if (!match || match[1].includes('@')) return invalid('URL');
  // All supported Node/browser/Worker runtimes provide the pure WHATWG URL parser.
  // A structural type keeps this subpath independent of DOM and Node declarations.
  const Url = (globalThis as unknown as { URL: new (value: string) => { username: string; password: string; protocol: string } }).URL;
  try {
    const parsed = new Url(result);
    if (parsed.username || parsed.password || !['http:', 'https:'].includes(parsed.protocol)) return invalid('URL');
  } catch {
    return invalid('URL');
  }
  const authority = match[1];
  const hostPort = /^(\[[0-9a-f:]+\]|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::([0-9]{1,5}))?$/iu.exec(authority);
  if (!hostPort || (hostPort[2] !== undefined && Number(hostPort[2]) > 65535)) return invalid('URL host');
  if (!hostPort[1].startsWith('[') && hostPort[1].split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/iu.test(label)))
    return invalid('URL host');
  return result;
};

/** Inspects descriptors before reading values, rejects cycles, accessors, prototypes and non-JSON values. */
export const safeJson = (value: unknown): AssessmentJsonValue => {
  let nodes = 0;
  const active = new Set<object>();
  const visit = (child: unknown, depth: number): AssessmentJsonValue => {
    if (++nodes > limits.jsonNodes || depth > limits.jsonDepth) return invalid('JSON budget');
    if (child === null || typeof child === 'boolean') return child;
    if (typeof child === 'string') return text(child);
    if (typeof child === 'number') return Number.isFinite(child) ? child : invalid('JSON number');
    if (!child || typeof child !== 'object' || active.has(child) || Object.getOwnPropertySymbols(child).length) return invalid('JSON value');
    active.add(child);
    const descriptors = Object.getOwnPropertyDescriptors(child);
    let result: AssessmentJsonValue;
    if (Array.isArray(child)) {
      if (child.length > limits.jsonNodes || Object.keys(descriptors).some(key => key !== 'length' && !/^(0|[1-9]\d*)$/u.test(key)))
        return invalid('JSON array');
      result = [];
      for (let index = 0; index < child.length; index++) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) return invalid('JSON array item');
        result.push(visit(descriptor.value, depth + 1));
      }
    } else {
      record(child, 'JSON object');
      const object: { [key: string]: AssessmentJsonValue } = {};
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (forbidden.has(key) || key.length > 256 || !('value' in descriptor) || !descriptor.enumerable || hasControls(key))
          return invalid('JSON key');
        object[key] = visit(descriptor.value, depth + 1);
      }
      result = object;
    }
    active.delete(child);
    return result;
  };
  return visit(value, 0);
};
export const decodedBytes = (value: unknown): number => {
  let bytes = 0;
  for (const character of JSON.stringify(value)) {
    const point = character.codePointAt(0) as number;
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return bytes;
};
export const input = (value: unknown): AssessmentJsonValue => {
  const safe = safeJson(value);
  if (decodedBytes(safe) > limits.documentDecodedBytes) return invalid('document size');
  return safe;
};
