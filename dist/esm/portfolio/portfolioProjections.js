export const PORTFOLIO_PROJECTION_PREVIOUS_SCHEMA_VERSION = '2026-07-26';
export const PORTFOLIO_PROJECTION_SCHEMA_VERSION = '2026-08-02';
export const PORTFOLIO_PROJECTION_COMPATIBLE_SCHEMA_VERSIONS = [
    PORTFOLIO_PROJECTION_PREVIOUS_SCHEMA_VERSION,
    PORTFOLIO_PROJECTION_SCHEMA_VERSION,
];
export const PORTFOLIO_PROJECTION_DETAIL_LIMIT = 60;
/** Legacy fixed-shard count used to read compatible manifests published before byte-bounded packing. */
export const PORTFOLIO_PROJECTION_DETAIL_SHARD_COUNT = 16;
/** Publishers target small detail artifacts and start a new shard before either target is crossed. */
export const PORTFOLIO_PROJECTION_DETAIL_TARGET_COMPRESSED_BYTES = 1 * 1024 * 1024;
export const PORTFOLIO_PROJECTION_DETAIL_TARGET_DECODED_BYTES = 2 * 1024 * 1024;
/** Aggregate decoded payload budget for a single Worker projection read. */
export const PORTFOLIO_PROJECTION_MAX_REQUEST_DECODED_BYTES = 24 * 1024 * 1024;
export const PORTFOLIO_PROJECTION_MAX_COMPRESSED_BYTES = 8 * 1024 * 1024;
export const PORTFOLIO_PROJECTION_MAX_DECODED_BYTES = 32 * 1024 * 1024;
export const PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION = '2026-08-13';
