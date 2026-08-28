export const FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 = 'financial-analytics-job-request/v1';
export const FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 = 'financial-analytics-current-pointer/v1';
export const FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1 = 'financial-analytics-input.json.gz';
export const FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1 = 'financial-analytics/inputs-by-id';
export const FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1 = 'financial-analytics-projection.json.gz';
export const FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 = 'financial-analytics-batch-query/v1';
export const FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 = 'financial-analytics-batch-response/v1';
export const FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 = 'financial-analytics-output-manifest/v1';
export const financialAnalyticsInputByIdPathV1 = (analyticsInputId) => `${FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1}/${analyticsInputId}/${FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1}`;
