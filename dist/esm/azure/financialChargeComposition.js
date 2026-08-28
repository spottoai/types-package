import { sha256Utf8 } from '../common/sha256.js';
export const FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1 = 1;
export const FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1 = 'financial-charge-composition/v1';
export const FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1 = 'financial-charge-inclusion-policy/v1';
const createRegisteredPolicy = (definition) => {
    const { policyId, ...policy } = definition;
    const registered = {
        ...policy,
        includeSources: Object.freeze([...policy.includeSources]),
        excludeSources: Object.freeze([...policy.excludeSources]),
        withholdSources: Object.freeze([...policy.withholdSources]),
        policyRef: Object.freeze({ policyId, policyDigest: `sha256:${sha256Utf8(JSON.stringify(definition))}` }),
    };
    return Object.freeze(registered);
};
export const AZURE_BILLED_ALL_CHARGES_POLICY_V1 = createRegisteredPolicy({
    schemaVersion: 1,
    contractVersion: FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1,
    policyId: 'azure-billed-all-charges/v1',
    includeSources: ['azure-native', 'marketplace', 'unknown'],
    excludeSources: [],
    withholdSources: [],
});
export const AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1 = createRegisteredPolicy({
    schemaVersion: 1,
    contractVersion: FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1,
    policyId: 'azure-cloud-services-excluding-marketplace/v1',
    includeSources: ['azure-native'],
    excludeSources: ['marketplace'],
    withholdSources: ['unknown'],
});
export const FINANCIAL_CHARGE_INCLUSION_POLICIES_V1 = Object.freeze([
    AZURE_BILLED_ALL_CHARGES_POLICY_V1,
    AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1,
]);
export const resolveFinancialChargeInclusionPolicyV1 = (policyRef) => policyRef !== null && typeof policyRef === 'object' && FINANCIAL_CHARGE_INCLUSION_POLICIES_V1.find(policy => policy.policyRef.policyId === policyRef.policyId && policy.policyRef.policyDigest === policyRef.policyDigest) || undefined;
