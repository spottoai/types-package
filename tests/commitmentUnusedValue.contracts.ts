import type { CommitmentUnusedValueEvidence, Recommendation, CommitmentsObsoleteCandidate } from '../src/index';

declare const evidence: CommitmentUnusedValueEvidence;
declare const recommendation: Recommendation;
declare const candidate: CommitmentsObsoleteCandidate;
recommendation.unusedCommitmentValue = evidence;
candidate.unusedCommitmentValue = evidence;
if (evidence.status === 'available') {
  const amount: number = evidence.amount;
  const currency: string = evidence.currency;
  void [amount, currency];
} else {
  // @ts-expect-error Unavailable evidence cannot be used as money.
  const amount: number = evidence.amount;
  void amount;
}
// @ts-expect-error Unavailable is a state, never a zero amount.
const invalid: CommitmentUnusedValueEvidence = { status: 'unavailable', amount: 0 };
void invalid;
type ProxyEvidence = Extract<CommitmentUnusedValueEvidence, { method: 'recurring-charge-utilization-approximation' }>;
declare const periodless: Omit<ProxyEvidence, 'utilizationWindow'>;
// @ts-expect-error A recurring proxy must retain the utilization window used for its calculation.
const periodlessProxy: CommitmentUnusedValueEvidence = periodless;
void periodlessProxy;
