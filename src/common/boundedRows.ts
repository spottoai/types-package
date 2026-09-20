/** Bounded row collection: `totalCount === rows.length + omittedCount`. Shared by report evidence and utilization stories. */
export interface ReportBoundedRows<T> {
  totalCount: number;
  rows: T[];
  omittedCount: number;
}
