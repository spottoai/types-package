import type { Microsoft365AccountDisableEvidence, Microsoft365AccountLifecycle, Microsoft365ContentAvailability, Microsoft365LicensingContent, Microsoft365OneDriveStorage, Microsoft365RelatedSpendAmount, Microsoft365RelatedSpendCoverage, Microsoft365RelatedSpendMeter, Microsoft365RelatedSpendProduct, Microsoft365RelatedSpendView, Microsoft365SharePointStorage } from './microsoft365LicensingContent';
/** Source availability is not a claim that every account or every date has evidence. */
export declare function isMicrosoft365ContentAvailability(value: unknown): value is Microsoft365ContentAvailability;
export declare function isMicrosoft365SharePointStorage(value: unknown): value is Microsoft365SharePointStorage;
export declare function isMicrosoft365OneDriveStorage(value: unknown): value is Microsoft365OneDriveStorage;
/** Known dates prove an observed Entra disable transition, not departure or license-removal safety. */
export declare function isMicrosoft365AccountDisableEvidence(value: unknown): value is Microsoft365AccountDisableEvidence;
export declare function isMicrosoft365AccountLifecycle(value: unknown): value is Microsoft365AccountLifecycle;
/** Billing corrections may be negative. Unknown amounts stay null, independently for each basis. */
export declare function isMicrosoft365RelatedSpendAmount(value: unknown): value is Microsoft365RelatedSpendAmount;
export declare function isMicrosoft365RelatedSpendMeter(value: unknown): value is Microsoft365RelatedSpendMeter;
export declare function isMicrosoft365RelatedSpendProduct(value: unknown): value is Microsoft365RelatedSpendProduct;
export declare function isMicrosoft365RelatedSpendCoverage(value: unknown): value is Microsoft365RelatedSpendCoverage;
export declare function isMicrosoft365RelatedSpendView(value: unknown): value is Microsoft365RelatedSpendView;
/** This artifact includes person-level rows and subscription spend: consumers must authorize both scopes. */
export declare function isMicrosoft365LicensingContent(value: unknown): value is Microsoft365LicensingContent;
//# sourceMappingURL=microsoft365LicensingContentValidation.d.ts.map