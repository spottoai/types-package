/** Public lifecycle states shared by provider sync progress responses. */
export type SyncProgressStatus = 'idle' | 'processing' | 'completed' | 'error';

/** Public lifecycle states shared by provider sync progress stages. */
export type SyncProgressStepStatus = 'idle' | 'pending' | 'queued' | 'inProgress' | 'completed' | 'error';

/** Public lifecycle states shared by nested provider sync progress stages. */
export type SyncProgressSubStepStatus = SyncProgressStepStatus | 'skipped';
