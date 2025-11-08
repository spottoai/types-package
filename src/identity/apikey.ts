export interface ApiKeyCreateRequest {
  name: string;
  description?: string;
  roleMask: number;
  allowedIpRanges?: string[];
  allowedCountryCodes?: string[];
  deniedCountryCodes?: string[];
}

export interface ApiKeyUpdateRequest {
  name?: string;
  description?: string;
  roleMask?: number;
  allowedIpRanges?: string[];
  allowedCountryCodes?: string[];
  deniedCountryCodes?: string[];
}

export interface ApiKeySummary {
  keyId: string;
  maskedKey: string;
  name: string;
  description?: string;
  roleMask: number;
  allowedIpRanges?: string[];
  allowedCountryCodes?: string[];
  deniedCountryCodes?: string[];
  createdAt: string;
  createdByDisplayName?: string;
  customerSegment: string;
  rotatedFromKey?: string;
  displayKeySuffix: string;
  version: number;
}

export interface ApiKeyProvisionResult {
  apiKey: string;
  maskedKey: string;
  record: ApiKeySummary;
}
