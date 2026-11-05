/** Admission permits a request clock up to five minutes ahead of the collecting host. */
export const ASSESSMENT_REQUEST_CLOCK_SKEW_MS = 5 * 60 * 1000;
export const SUPPORTED_ASSESSMENT_SOURCE_VERSIONS = Object.freeze(['5.45.0']);
export const FRAMEWORK_ASSESSMENT_LIMITS = Object.freeze({
    pageDecodedBytes: 1024 * 1024,
    pageItems: 1000,
    documentDecodedBytes: 8 * 1024 * 1024,
    catalogueItems: 10000,
    frameworks: 1000,
    pages: 10000,
    textLength: 65536,
    jsonDepth: 12,
    jsonNodes: 500000,
});
