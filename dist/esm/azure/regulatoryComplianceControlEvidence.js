export const REGULATORY_CONTROL_RESOURCE_PAGE_SIZE = 25;
export function regulatoryPolicyEvidenceOutcome(state) {
    if (state === 'nonCompliant')
        return 'failed';
    if (state === 'compliant' || state === 'protected')
        return 'passed';
    return 'notAssessed';
}
