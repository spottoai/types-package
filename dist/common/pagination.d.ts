export interface PaginationResult<T> {
    data: T[];
    nextPartitionKey?: string;
    nextRowKey?: string;
}
export interface PaginationParams {
    page?: number;
    records?: number;
    nextPartitionKey?: string;
    nextRowKey?: string;
}
//# sourceMappingURL=pagination.d.ts.map