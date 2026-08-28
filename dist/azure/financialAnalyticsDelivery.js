"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAnalyticsInputByIdPathV1 = exports.FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 = exports.FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 = exports.FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 = exports.FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1 = exports.FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1 = exports.FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1 = exports.FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 = exports.FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 = void 0;
exports.FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 = 'financial-analytics-job-request/v1';
exports.FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 = 'financial-analytics-current-pointer/v1';
exports.FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1 = 'financial-analytics-input.json.gz';
exports.FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1 = 'financial-analytics/inputs-by-id';
exports.FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1 = 'financial-analytics-projection.json.gz';
exports.FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 = 'financial-analytics-batch-query/v1';
exports.FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 = 'financial-analytics-batch-response/v1';
exports.FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 = 'financial-analytics-output-manifest/v1';
const financialAnalyticsInputByIdPathV1 = (analyticsInputId) => `${exports.FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1}/${analyticsInputId}/${exports.FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1}`;
exports.financialAnalyticsInputByIdPathV1 = financialAnalyticsInputByIdPathV1;
//# sourceMappingURL=financialAnalyticsDelivery.js.map