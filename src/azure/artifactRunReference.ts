const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const RUN_REFERENCE_PREFIX = 'r1-';

export const ARTIFACT_RUN_REFERENCE_V1_LIMITS = Object.freeze({
  maxRawUtf8Bytes: 256,
  maxEncodedSegmentLength: 345,
});

const hasControlCharacter = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

const hasUnpairedSurrogate = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return true;
    }
  }
  return false;
};

const encodeUtf8 = (value: string): Uint8Array => {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) as number;
    if (codePoint > 0xffff) index += 1;
    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >>> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >>> 12), 0x80 | ((codePoint >>> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >>> 18),
        0x80 | ((codePoint >>> 12) & 0x3f),
        0x80 | ((codePoint >>> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  return Uint8Array.from(bytes);
};

/** Validates a semantic workflow run ID before it is encoded for a storage namespace. */
export const isRawArtifactRunIdV1 = (value: unknown): value is string => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.trim() !== value ||
    hasControlCharacter(value) ||
    hasUnpairedSurrogate(value)
  ) {
    return false;
  }
  return encodeUtf8(value).byteLength <= ARTIFACT_RUN_REFERENCE_V1_LIMITS.maxRawUtf8Bytes;
};

const encodeBase64Url = (bytes: Uint8Array): string => {
  let encoded = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const remaining = bytes.length - index;
    const first = bytes[index];
    const second = remaining > 1 ? bytes[index + 1] : 0;
    const third = remaining > 2 ? bytes[index + 2] : 0;
    const chunk = (first << 16) | (second << 8) | third;
    encoded += BASE64URL_ALPHABET[(chunk >>> 18) & 63];
    encoded += BASE64URL_ALPHABET[(chunk >>> 12) & 63];
    if (remaining > 1) encoded += BASE64URL_ALPHABET[(chunk >>> 6) & 63];
    if (remaining > 2) encoded += BASE64URL_ALPHABET[chunk & 63];
  }
  return encoded;
};

/** Encodes the complete semantic run ID into an injective, path-safe V1 namespace segment. */
export const encodeArtifactRunReferenceV1 = (rawRunId: string): string => {
  if (!isRawArtifactRunIdV1(rawRunId)) {
    throw new TypeError(`rawRunId must be non-empty valid UTF-8 and at most ${ARTIFACT_RUN_REFERENCE_V1_LIMITS.maxRawUtf8Bytes} bytes`);
  }
  return `${RUN_REFERENCE_PREFIX}${encodeBase64Url(encodeUtf8(rawRunId))}`;
};

/** Validates the bounded path-safe shape emitted by `encodeArtifactRunReferenceV1`. */
export const isArtifactRunReferenceV1 = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > RUN_REFERENCE_PREFIX.length &&
  value.length <= ARTIFACT_RUN_REFERENCE_V1_LIMITS.maxEncodedSegmentLength &&
  /^r1-[A-Za-z0-9_-]+$/.test(value);
