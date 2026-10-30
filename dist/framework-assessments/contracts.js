"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRAMEWORK_ASSESSMENT_LIMITS = exports.SUPPORTED_ASSESSMENT_SOURCE_VERSIONS = exports.ASSESSMENT_REQUEST_CLOCK_SKEW_MS = void 0;
/** Admission permits a request clock up to five minutes ahead of the collecting host. */
exports.ASSESSMENT_REQUEST_CLOCK_SKEW_MS = 5 * 60 * 1000;
exports.SUPPORTED_ASSESSMENT_SOURCE_VERSIONS = Object.freeze(['5.45.0']);
exports.FRAMEWORK_ASSESSMENT_LIMITS = Object.freeze({
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
//# sourceMappingURL=contracts.js.map