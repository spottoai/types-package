export interface Budget {
  /** Internal marker for a Spotto-suggested budget; not customer-visible text. */
  generatedBySpotto?: boolean;
  name: string;
  startDate: string;
  endDate: string;
  amount: number;
  currentSpend: number;
  forecastedSpend: number;
  scope?: string;
  timeGrain?: string;
  category?: string;
  filter?: Record<string, unknown>;
}
