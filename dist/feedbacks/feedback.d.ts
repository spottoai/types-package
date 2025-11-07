/**
 * Partition Key: url hash
 * Row Key = userId_postedDate
 */
export interface FeedbackData {
    /** url of the page the feedback was posted on */
    url: string;
    /** company id of the company the feedback was posted on */
    companyId: string;
    /** comment text */
    comment: string;
    /** true if the user wants to be contacted about the feedback */
    contact: boolean;
    /** true if the feedback is negative */
    isNegative: boolean;
}
export interface FeedbackResponse {
    success: boolean;
    message?: string;
    id?: string;
}
//# sourceMappingURL=feedback.d.ts.map