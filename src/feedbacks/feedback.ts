export interface FeedbackData {
  // Partition Key: url hash
  // Row Key = userId_postedDate
  url: string; // url of the page the feedback was posted on
  // userId: string; // user id of the user who posted the feedback
  companyId: string; // company id of the company the feedback was posted on
  // postedDate: Date; // date the feedback was posted
  comment: string; // comment text
  contact: boolean; // true if the user wants to be contacted about the feedback
  isNegative: boolean; // true if the feedback is negative
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  id?: string;
}
