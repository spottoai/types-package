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
// Main entry point - export all interfaces from this package
__exportStar(require("./azure/common"), exports);
__exportStar(require("./azure/budgets"), exports);
__exportStar(require("./azure/configs"), exports);
__exportStar(require("./azure/metrics"), exports);
__exportStar(require("./azure/payloads"), exports);
__exportStar(require("./azure/prices"), exports);
__exportStar(require("./azure/recommendations"), exports);
__exportStar(require("./azure/resources"), exports);
__exportStar(require("./azure/subscriptions"), exports);
__exportStar(require("./azure/views"), exports);
//# sourceMappingURL=index.js.map