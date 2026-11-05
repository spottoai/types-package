"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentAwsResourceTypeV1 = exports.isEnvironmentAwsResourceIdV1 = exports.environmentAwsScopesEqual = exports.isEnvironmentAwsAccountScopeV1 = void 0;
__exportStar(require("./contracts.js"), exports);
__exportStar(require("./references.js"), exports);
__exportStar(require("./validation.js"), exports);
__exportStar(require("./canonicalization.js"), exports);
__exportStar(require("./tenant.js"), exports);
__exportStar(require("./awsContracts.js"), exports);
var awsIdentity_js_1 = require("./awsIdentity.js");
Object.defineProperty(exports, "isEnvironmentAwsAccountScopeV1", { enumerable: true, get: function () { return awsIdentity_js_1.isEnvironmentAwsAccountScopeV1; } });
Object.defineProperty(exports, "environmentAwsScopesEqual", { enumerable: true, get: function () { return awsIdentity_js_1.environmentAwsScopesEqual; } });
Object.defineProperty(exports, "isEnvironmentAwsResourceIdV1", { enumerable: true, get: function () { return awsIdentity_js_1.isEnvironmentAwsResourceIdV1; } });
Object.defineProperty(exports, "isEnvironmentAwsResourceTypeV1", { enumerable: true, get: function () { return awsIdentity_js_1.isEnvironmentAwsResourceTypeV1; } });
__exportStar(require("./awsReferences.js"), exports);
__exportStar(require("./awsValidation.js"), exports);
__exportStar(require("./any.js"), exports);
__exportStar(require("./optionalDocuments.js"), exports);
__exportStar(require("./capabilityReferences.js"), exports);
//# sourceMappingURL=index.js.map