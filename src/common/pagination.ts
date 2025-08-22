export interface PaginationResult<T> {
  data: T[]; // Data items for the current page
  nextPartitionKey?: string; // Partition key for fetching the next page
  nextRowKey?: string; // Row key for fetching the next page
}

export interface PaginationParams {
  page?: number;
  records?: number;
  nextPartitionKey?: string;
  nextRowKey?: string;
}
