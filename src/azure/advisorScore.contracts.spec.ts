import type {
  AdvisorScoreCategory,
  AdvisorScorePillar,
  AdvisorScorePoint,
  AdvisorScoreSummary,
} from './advisorScore';

const pillar: AdvisorScorePillar = 'reliability';

const point: AdvisorScorePoint = {
  date: '2026-06-15T00:00:00Z',
  score: 84,
  rawScore: 0.84,
  consumptionUnits: 12.5,
  impactedResourceCount: 3,
  potentialScoreIncrease: 5,
  categoryCount: 2,
};

const category: AdvisorScoreCategory = {
  pillar,
  rawName: 'HighAvailability',
  lastRefreshedScore: point,
  timeSeries: {
    day: [point],
    week: [point],
    month: [point],
  },
};

const summary: AdvisorScoreSummary = {
  overall: {
    ...category,
    pillar: 'overall',
    rawName: 'Advisor',
  },
  reliability: category,
  cost: {
    ...category,
    pillar: 'cost',
    rawName: 'Cost',
  },
  security: {
    ...category,
    pillar: 'security',
    rawName: 'Security',
  },
  performance: {
    ...category,
    pillar: 'performance',
    rawName: 'Performance',
  },
  operationalExcellence: {
    ...category,
    pillar: 'operationalExcellence',
    rawName: 'OperationalExcellence',
  },
  lastRefreshedDate: point.date,
};

void summary;
