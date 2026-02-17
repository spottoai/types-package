import { Comment } from './recommendationState';

export type ServiceRetirementStatus = 'Active' | 'Prioritized' | 'Dismissed';

export interface ServiceRetirementHistory {
  userId: string;
  userName?: string;
  createdAt: Date;
  action:
    | 'Dismiss'
    | 'Restore'
    | 'Prioritize'
    | 'Unprioritize'
    | 'Comment'
    | 'Pin'
    | 'Unpin';
  reason?: string;
}

export interface ServiceRetirementState {
  companyId: string;
  retirementId: number;
  status: ServiceRetirementStatus;
  statusStartAt?: string;
  statusEndAt?: string;
  createdAt: Date;
  updatedAt?: Date;
  comments: Comment[];
  pinnedCommentId?: string;
  history: ServiceRetirementHistory[];
}
