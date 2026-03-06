export interface Budget {
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
