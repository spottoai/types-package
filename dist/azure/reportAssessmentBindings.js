"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1 = void 0;
exports.isAzureReportAssessmentIdV1 = isAzureReportAssessmentIdV1;
exports.isAzureReportLegacySingleSourceV1 = isAzureReportLegacySingleSourceV1;
exports.isAzureReportCommitmentAssessmentBindingsV1 = isAzureReportCommitmentAssessmentBindingsV1;
exports.areAzureReportCommitmentAssessmentBindingsConsistentV1 = areAzureReportCommitmentAssessmentBindingsConsistentV1;
const benefitAssessmentAdmission_1 = require("./benefitAssessmentAdmission");
const validationHelpers_1 = require("../common/validationHelpers");
const reportEvidence_1 = require("./reportEvidence");
exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1 = Object.freeze({ rows: 4096, sources: 4096, decodedBytes: 1024 * 1024 });
const lanes = ['obsoleteCandidates', 'reallocationOpportunities', 'renewals', 'inventory'];
const exact = (value, required, optional = []) => (0, validationHelpers_1.isRecord)(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => required.includes(key) || optional.includes(key));
function withinWireBudget(value) {
    try {
        const json = JSON.stringify(value);
        if (json.length > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes)
            return false;
        // encodeURIComponent rejects ill-formed Unicode and expresses UTF-8 bytes portably.
        return encodeURIComponent(json).replace(/%[A-F0-9]{2}/g, 'x').length <= exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes;
    }
    catch {
        return false;
    }
}
/** Opaque exact IDs have no token grammar or independent length ceiling below the combined wire budget. */
function isAzureReportAssessmentIdV1(value) {
    if (typeof value !== 'string' ||
        !value.length ||
        value.trim() !== value ||
        value.length > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.decodedBytes ||
        /[\p{Cc}\p{Cf}]/u.test(value))
        return false;
    try {
        encodeURIComponent(value);
        return true;
    }
    catch {
        return false;
    }
}
function isAzureReportLegacySingleSourceV1(value) {
    return (exact(value, ['id', 'benefitType', 'scope'], ['subscriptionId']) &&
        isAzureReportAssessmentIdV1(value.id) &&
        !(0, benefitAssessmentAdmission_1.canonicalAzureBenefitAssessmentBenefitIdV1)(value.id) &&
        !/^(?:[\\/]*(?:providers|subscriptions|tenants)(?:[\\/]|$)|https?:\/\/management\.azure\.)/i.test(value.id) &&
        (value.benefitType === 'reservation' || value.benefitType === 'savings-plan') &&
        value.scope === 'Single' &&
        (!Object.prototype.hasOwnProperty.call(value, 'subscriptionId') ||
            (typeof value.subscriptionId === 'string' &&
                (0, benefitAssessmentAdmission_1.canonicalAzureBenefitAssessmentOwnerV1)({ companyId: 'local', tenantId: 'local', subscriptionId: value.subscriptionId })?.subscriptionId ===
                    value.subscriptionId)));
}
const indices = (value) => Array.isArray(value) &&
    value.length <= exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources &&
    value.every((index, position) => Number.isSafeInteger(index) && index >= 0 && (position === 0 || index > value[position - 1]));
const row = (value) => exact(value, ['id', 'subjectIndices', 'legacySingleSourceIndices']) &&
    isAzureReportAssessmentIdV1(value.id) &&
    indices(value.subjectIndices) &&
    indices(value.legacySingleSourceIndices);
const ordered = (rows) => rows.every((item, position) => position === 0 || item.id > rows[position - 1].id);
/** Strict syntax and local relationships. Pack/root relationships require the consistency guard below. */
function isAzureReportCommitmentAssessmentBindingsV1(value) {
    if (!exact(value, ['schemaVersion', 'planningSubjectIndices', 'legacySingleSources', ...lanes]) ||
        value.schemaVersion !== 1 ||
        !indices(value.planningSubjectIndices) ||
        !Array.isArray(value.legacySingleSources) ||
        value.legacySingleSources.length > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources ||
        !lanes.every(key => Array.isArray(value[key]) && value[key].length <= exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.rows) ||
        lanes.reduce((sum, key) => sum + value[key].length, 0) > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.rows ||
        !withinWireBudget(value))
        return false;
    if (!value.legacySingleSources.every(isAzureReportLegacySingleSourceV1) || !ordered(value.legacySingleSources))
        return false;
    if (value.planningSubjectIndices.length + value.legacySingleSources.length > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources)
        return false;
    const legacySources = value.legacySingleSources;
    const planning = new Set(value.planningSubjectIndices);
    const used = new Set();
    for (const key of lanes) {
        const rows = value[key];
        if (!rows.every(row) || !ordered(rows))
            return false;
        for (const item of rows) {
            if ((key !== 'inventory' && !item.subjectIndices.length && !item.legacySingleSourceIndices.length) ||
                ((key === 'renewals' || key === 'inventory') && item.subjectIndices.length + item.legacySingleSourceIndices.length > 1) ||
                item.subjectIndices.some(index => !planning.has(index)) ||
                item.legacySingleSourceIndices.some(index => index >= legacySources.length))
                return false;
            item.legacySingleSourceIndices.forEach(index => used.add(index));
        }
    }
    return used.size === value.legacySingleSources.length;
}
/** Pure enclosing-pack consistency, never an admission/current-read decision. Missing metadata returns false. */
function areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, projection) {
    if (!(0, benefitAssessmentAdmission_1.isAzureBenefitAssessmentDependenciesV1)(dependencies) ||
        !(0, validationHelpers_1.isRecord)(scope) ||
        !(0, validationHelpers_1.isRecord)(projection) ||
        !isAzureReportCommitmentAssessmentBindingsV1(projection.assessmentSourceBindings))
        return false;
    const binding = projection.assessmentSourceBindings;
    const owner = (0, benefitAssessmentAdmission_1.canonicalAzureBenefitAssessmentOwnerV1)(scope);
    if (!owner ||
        dependencies.subjects.length + binding.legacySingleSources.length > exports.AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1.sources ||
        binding.planningSubjectIndices.some(index => index >= dependencies.subjects.length) ||
        binding.legacySingleSources.some(source => source.subscriptionId !== undefined && source.subscriptionId !== owner.subscriptionId) ||
        !withinWireBudget({ benefitAssessmentDependencies: dependencies, assessmentSourceBindings: binding }))
        return false;
    for (const key of lanes) {
        const section = projection[key];
        const rows = binding[key];
        if (!(0, validationHelpers_1.isBoundedRows)(section, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows, validationHelpers_1.isRecord) ||
            section.totalCount !== rows.length ||
            section.rows.length !== Math.min(rows.length, reportEvidence_1.REPORT_EVIDENCE_LIMITS.detailRows) ||
            section.omittedCount !== rows.length - section.rows.length)
            return false;
        const byId = new Map(rows.map(item => [item.id, item]));
        const retained = new Set();
        for (const item of section.rows) {
            if (!isAzureReportAssessmentIdV1(item.id) || retained.has(item.id))
                return false;
            retained.add(item.id);
            const source = byId.get(item.id);
            if (!source)
                return false;
            const references = [
                ...source.subjectIndices.map(index => dependencies.subjects[index].benefitId),
                ...source.legacySingleSourceIndices.map(index => binding.legacySingleSources[index].id),
            ];
            if (key === 'renewals' || (key === 'inventory' && (references.length || item.doNotRenewAnnualImpact !== undefined))) {
                const id = key === 'renewals' ? item.commitmentId : item.id;
                if (!isAzureReportAssessmentIdV1(id) || references.length !== 1 || ((0, benefitAssessmentAdmission_1.canonicalAzureBenefitAssessmentBenefitIdV1)(id) ?? id) !== references[0])
                    return false;
            }
        }
    }
    return true;
}
//# sourceMappingURL=reportAssessmentBindings.js.map