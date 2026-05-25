export interface ApiKeyCreateRequest {
    /** Name of the API key */
    name: string;
    /** Optional description of the API key */
    description?: string;
    /** Role permissions mask (bitmask) */
    roleMask: number;
    /** Allowed IP address ranges (e.g., ["192.168.1.0/24", "10.0.0.0/8"]) */
    allowedIpRanges?: string[];
    /** Allowed country codes (e.g., ["US", "CA", "GB"]) */
    allowedCountryCodes?: string[];
    /** Denied country codes (e.g., ["CN", "RU"]) */
    deniedCountryCodes?: string[];
}
export interface ApiKeyUpdateRequest {
    /** Name of the API key */
    name?: string;
    /** Optional description of the API key */
    description?: string;
    /** Role permissions mask (bitmask) */
    roleMask?: number;
    /** Allowed IP address ranges (e.g., ["192.168.1.0/24", "10.0.0.0/8"]) */
    allowedIpRanges?: string[];
    /** Allowed country codes (e.g., ["US", "CA", "GB"]) */
    allowedCountryCodes?: string[];
    /** Denied country codes (e.g., ["CN", "RU"]) */
    deniedCountryCodes?: string[];
}
export interface ApiKeySummary {
    /** Unique identifier for the API key */
    keyId: string;
    /** Masked/partially hidden key value for display (e.g., "sk_live_****1234") */
    maskedKey: string;
    /** Name of the API key */
    name: string;
    /** Optional description of the API key */
    description?: string;
    /** Role permissions mask (bitmask) */
    roleMask: number;
    /** Allowed IP address ranges (e.g., ["192.168.1.0/24", "10.0.0.0/8"]) */
    allowedIpRanges?: string[];
    /** Allowed country codes (e.g., ["US", "CA", "GB"]) */
    allowedCountryCodes?: string[];
    /** Denied country codes (e.g., ["CN", "RU"]) */
    deniedCountryCodes?: string[];
    /** Creation timestamp (ISO 8601 format) */
    createdAt: string;
    /** Display name of the user who created the API key */
    createdByDisplayName?: string;
    /** Customer segment identifier */
    customerSegment: string;
    /** Key ID this API key was rotated from (if applicable) */
    rotatedFromKey?: string;
    /** Suffix to display for the key (e.g., "1234") */
    displayKeySuffix: string;
    /** Version number of the API key */
    version: number;
}
export interface ApiKeyProvisionResult {
    /** The full API key (only shown once during creation) */
    apiKey: string;
    /** Masked/partially hidden key value for display (e.g., "sk_live_****1234") */
    maskedKey: string;
    /** The API key summary record */
    record: ApiKeySummary;
}
//# sourceMappingURL=apikey.d.ts.map