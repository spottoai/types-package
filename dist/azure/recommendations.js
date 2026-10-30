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
exports.RecommendationCategory = exports.isCommitmentUnusedValueEvidence = void 0;
__exportStar(require("./benefitAssessmentAdmission"), exports);
__exportStar(require("./reportAssessmentBindings"), exports);
var commitmentUnusedValue_1 = require("./commitmentUnusedValue");
Object.defineProperty(exports, "isCommitmentUnusedValueEvidence", { enumerable: true, get: function () { return commitmentUnusedValue_1.isCommitmentUnusedValueEvidence; } });
var RecommendationCategory;
(function (RecommendationCategory) {
    RecommendationCategory["Cost"] = "Cost";
    RecommendationCategory["Performance"] = "Performance";
    RecommendationCategory["Reliability"] = "Reliability";
    RecommendationCategory["Security"] = "Security";
    RecommendationCategory["Compliance"] = "Compliance";
    RecommendationCategory["OperationalExcellence"] = "OperationalExcellence";
    RecommendationCategory["OperationalExcellenceAlternative"] = "Operational Excellence";
})(RecommendationCategory || (exports.RecommendationCategory = RecommendationCategory = {}));
//# sourceMappingURL=recommendations.js.map