export interface PaginationResult<T> {
  /** Data items for the current page */
  data: T[];
  /** Partition key for fetching the next page */
  nextPartitionKey?: string;
  /** Row key for fetching the next page */
  nextRowKey?: string;
}

export interface PaginationParams {
  page?: number;
  records?: number;
  nextPartitionKey?: string;
  nextRowKey?: string;
}
