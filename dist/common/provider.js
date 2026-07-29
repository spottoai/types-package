"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderScopeType = exports.ProviderName = void 0;
var ProviderName;
(function (ProviderName) {
    ProviderName["Azure"] = "azure";
    ProviderName["Aws"] = "aws";
})(ProviderName || (exports.ProviderName = ProviderName = {}));
/** Provider-owned resource boundary kind used by indexed scope records. */
var ProviderScopeType;
(function (ProviderScopeType) {
    ProviderScopeType["Subscription"] = "subscription";
    ProviderScopeType["Account"] = "account";
})(ProviderScopeType || (exports.ProviderScopeType = ProviderScopeType = {}));
//# sourceMappingURL=provider.js.map