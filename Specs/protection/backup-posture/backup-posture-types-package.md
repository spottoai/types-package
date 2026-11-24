# Backup posture contracts

Type: repo
Status: living
Owner: Platform
Last updated: 2026-11-25
Core feature: [Backup posture](../../../../core/specs/protection/backup-posture/backup-posture.md)

`src/azure/dataProtection.ts` adds optional `DataProtectionJobHistory` on each
protected item. It describes a collected window of distinct provider jobs,
per-kind backup failure groups and latest backup/successful-backup evidence.
Unknown or conflicting counts are null; bounded detail truncation does not imply
lifetime completeness. A successful Log backup does not clear Full failures.
Restore and configuration jobs do not establish successful backup health.

The extension is additive. Existing item coverage, parent identity and cost
contracts retain their meanings. Shared types do not collect, infer or mutate
backup state; provider normalization and authorized projections keep those roles.
