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
/** Dev-only Vite entrypoint that avoids stale sibling .js files under src/. */
__exportStar(require("./azure/common.ts"), exports);
__exportStar(require("./azure/budgets.ts"), exports);
__exportStar(require("./azure/billingPlots.ts"), exports);
__exportStar(require("./azure/benefits.ts"), exports);
__exportStar(require("./azure/commitmentsPlanning.ts"), exports);
__exportStar(require("./azure/configs.ts"), exports);
__exportStar(require("./azure/metrics.ts"), exports);
__exportStar(require("./azure/payloads.ts"), exports);
__exportStar(require("./azure/prices.ts"), exports);
__exportStar(require("./azure/relationships.ts"), exports);
__exportStar(require("./azure/recommendations.ts"), exports);
__exportStar(require("./azure/recommendationAudit.ts"), exports);
__exportStar(require("./azure/recommendationWorkflow.ts"), exports);
__exportStar(require("./azure/recommendationState.ts"), exports);
__exportStar(require("./azure/resources.ts"), exports);
__exportStar(require("./azure/reports.ts"), exports);
__exportStar(require("./azure/reviewChecklist.ts"), exports);
__exportStar(require("./azure/subscriptions.ts"), exports);
__exportStar(require("./azure/views.ts"), exports);
__exportStar(require("./azure/security.ts"), exports);
__exportStar(require("./azure/serviceRetirement.ts"), exports);
__exportStar(require("./azure/serviceRetirementState.ts"), exports);
__exportStar(require("./azure/costEstimation.ts"), exports);
__exportStar(require("./azure/storage-inventory.ts"), exports);
__exportStar(require("./accounts/index.ts"), exports);
__exportStar(require("./users/index.ts"), exports);
__exportStar(require("./common/index.ts"), exports);
__exportStar(require("./company/index.ts"), exports);
__exportStar(require("./ai/index.ts"), exports);
__exportStar(require("./events/index.ts"), exports);
__exportStar(require("./integrations/index.ts"), exports);
__exportStar(require("./identity/index.ts"), exports);
__exportStar(require("./tags/index.ts"), exports);
//# sourceMappingURL=index.vite.js.map