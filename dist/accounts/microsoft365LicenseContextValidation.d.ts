import { type Microsoft365AccountContext, type Microsoft365AccountContextDocument, type Microsoft365AccountContextInput, type Microsoft365AccountContextResponse, type Microsoft365AccountContextScope, type Microsoft365LicenseContextScope, type Microsoft365LicenseStrategy, type Microsoft365ProductContext, type Microsoft365ProductContextCollectionResponse, type Microsoft365ProductContextDocument, type Microsoft365ProductContextInput, type Microsoft365ProductContextResponse, type Microsoft365ProductContextSummary } from './microsoft365LicenseContext';
export declare const isMicrosoft365LicenseStrategy: (value: unknown) => value is Microsoft365LicenseStrategy;
export declare function isMicrosoft365ProductContextInput(value: unknown): value is Microsoft365ProductContextInput;
export declare function isMicrosoft365AccountContextInput(value: unknown): value is Microsoft365AccountContextInput;
export declare function isMicrosoft365ProductContext(value: unknown): value is Microsoft365ProductContext;
export declare function isMicrosoft365AccountContext(value: unknown): value is Microsoft365AccountContext;
/** Expected binding checks supplement authorization and current subject-membership checks in API policy. */
export declare function isMicrosoft365ProductContextDocument(value: unknown, expected?: Microsoft365LicenseContextScope): value is Microsoft365ProductContextDocument;
export declare function isMicrosoft365AccountContextDocument(value: unknown, expected?: Microsoft365AccountContextScope): value is Microsoft365AccountContextDocument;
export declare const isMicrosoft365ProductContextResponse: (value: unknown) => value is Microsoft365ProductContextResponse;
export declare const isMicrosoft365AccountContextResponse: (value: unknown) => value is Microsoft365AccountContextResponse;
export declare function isMicrosoft365ProductContextSummary(value: unknown): value is Microsoft365ProductContextSummary;
export declare function isMicrosoft365ProductContextCollectionResponse(value: unknown): value is Microsoft365ProductContextCollectionResponse;
//# sourceMappingURL=microsoft365LicenseContextValidation.d.ts.map