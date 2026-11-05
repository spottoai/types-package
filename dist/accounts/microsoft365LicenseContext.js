"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MICROSOFT365_LICENSE_CONTEXT_LIMITS = exports.MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION = exports.MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION = void 0;
exports.MICROSOFT365_PRODUCT_CONTEXT_SCHEMA_VERSION = 'microsoft-365-license-context/v1';
exports.MICROSOFT365_ACCOUNT_CONTEXT_SCHEMA_VERSION = 'microsoft-365-account-context/v1';
exports.MICROSOFT365_LICENSE_CONTEXT_LIMITS = {
    /** String limits use UTF-16 code units. Byte limits apply to serialized UTF-8 JSON. */
    noteCharacters: 4000,
    actorCharacters: 256,
    products: 1000,
    productDocumentBytes: 1024 * 1024,
    accountDocumentBytes: 64 * 1024,
    requestBytes: 64 * 1024,
};
//# sourceMappingURL=microsoft365LicenseContext.js.map