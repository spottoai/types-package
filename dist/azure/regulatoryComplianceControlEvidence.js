"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGULATORY_CONTROL_RESOURCE_PAGE_SIZE = void 0;
exports.regulatoryPolicyEvidenceOutcome = regulatoryPolicyEvidenceOutcome;
exports.REGULATORY_CONTROL_RESOURCE_PAGE_SIZE = 25;
function regulatoryPolicyEvidenceOutcome(state) {
    if (state === 'nonCompliant')
        return 'failed';
    if (state === 'compliant' || state === 'protected')
        return 'passed';
    return 'notAssessed';
}
//# sourceMappingURL=regulatoryComplianceControlEvidence.js.map