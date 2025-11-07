/**
 * Partition Key: url hash
 * Row Key = userId_postedDate
 */
export interface FeedbackData {
  /** url of the page the feedback was posted on */
  url: string;
  /*
   * Potential future fields:
   * - userId: string; user id of the user who posted the feedback
   * - postedDate: Date; date the feedback was posted
   */
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
