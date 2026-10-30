"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnvironmentCapabilityEvidenceReferenceV1 = buildEnvironmentCapabilityEvidenceReferenceV1;
exports.parseEnvironmentCapabilityEvidenceReferenceV1 = parseEnvironmentCapabilityEvidenceReferenceV1;
const optionalDocuments_js_1 = require("./optionalDocuments.js");
const references_js_1 = require("./references.js");
const capabilityIdentifiers_js_1 = require("./capabilityIdentifiers.js");
function buildEnvironmentCapabilityEvidenceReferenceV1(scope, capabilityId, documentId, evidenceId) {
    if (!(0, optionalDocuments_js_1.isEnvironmentCapabilityScopeV1)(scope) || ![capabilityId, documentId, evidenceId].every(optionalDocuments_js_1.isEnvironmentCapabilityIdentifierV1))
        throw new TypeError('Invalid capability evidence identity.');
    const tuple = scope.kind === 'azure-subscription'
        ? ['capability', scope.kind, scope.tenantId, scope.companyId, scope.subscriptionId, capabilityId, documentId, evidenceId]
        : scope.kind === 'aws-account'
            ? ['capability', scope.kind, scope.companyId, scope.accountId, capabilityId, documentId, evidenceId]
            : ['capability', scope.kind, scope.tenantId, capabilityId, documentId, evidenceId];
    return (0, references_js_1.buildEnvironmentLogicalArtifactReferenceV1)('environment-capability-evidence', JSON.stringify(tuple));
}
function parseEnvironmentCapabilityEvidenceReferenceV1(value) {
    const parsed = (0, references_js_1.parseEnvironmentLogicalArtifactReferenceV1)(value);
    return parsed?.artifactKind === 'environment-capability-evidence' ? (0, capabilityIdentifiers_js_1.parseEnvironmentCapabilityEvidenceSubjectV1)(parsed.subject) : null;
}
//# sourceMappingURL=capabilityReferences.js.map