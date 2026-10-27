# Shared contract specifications

Core features define product behavior. These specifications describe the shared
contracts consumed by API, UI and provider runtimes; package contracts alone do
not establish workflow implementation or deployment.

| Capability | Contract specification |
| --- | --- |
| Company context | [Sources, retrieval, coverage and chat metadata](ai-chat/company-context/company-context-types-package.md) |
| Company memory | [Shared entries, organization, review, promotion and meeting extraction](ai-chat/company-memory/company-memory-types-package.md) |
| Context harvesting | [Designed background runs, restricted drafts and reviewed change batches](ai-chat/context-harvesting/context-harvesting-types-package.md) |
| Company Notes | [Immutable note revisions and concurrency](companies/company-notes/company-notes-types-package.md) |
| Background report generation | [Jobs, scheduled Report Packs and filename contracts](reporting/background-report-generation/background-report-generation-types-package.md) |
| License inventory | [Microsoft 365 evidence, storage, lifecycle and related Azure spend](licensing/license-inventory/license-inventory-types-package.md) |
