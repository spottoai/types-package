export type AdvisorScorePillar =
  | 'overall'
  | 'cost'
  | 'security'
  | 'performance'
  | 'reliability'
  | 'operationalExcellence';

export interface AdvisorScorePoint {
  date: string;
  /** Normalized 0-100 score. */
  score: number;
  /** Raw API value retained while validating live tenant behavior. */
  rawScore?: number;
  consumptionUnits?: number;
  impactedResourceCount?: number;
  potentialScoreIncrease?: number;
  categoryCount?: number;
}

export interface AdvisorScoreCategory {
  pillar: AdvisorScorePillar;
  rawName: string;
  lastRefreshedScore?: AdvisorScorePoint;
  timeSeries?: {
    day?: AdvisorScorePoint[];
    week?: AdvisorScorePoint[];
    month?: AdvisorScorePoint[];
  };
}

export interface AdvisorScoreSummary {
  overall?: AdvisorScoreCategory;
  cost?: AdvisorScoreCategory;
  security?: AdvisorScoreCategory;
  performance?: AdvisorScoreCategory;
  reliability?: AdvisorScoreCategory;
  operationalExcellence?: AdvisorScoreCategory;
  lastRefreshedDate?: string;
}

export interface AdvisorScorePillarScores {
  cost?: number;
  security?: number;
  performance?: number;
  reliability?: number;
  operationalExcellence?: number;
}
