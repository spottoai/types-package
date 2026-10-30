/**
 * Resilience facts: the small per-resource property reads the resilience story needs that no other collection
 * carries — storage blob-service data-protection settings and lifecycle management, Azure SQL database backup
 * retention and failover groups. Collected in the reliability component beside the data-protection posture and
 * published as `azure-portal/subscriptions/{id}/resilience-facts.json`. Consumed by the cloud-engine
 * `ProtectionProfileBuilder` (`data-protection:<selector>` capability sources) and available to the resilience story page.
 *
 * Spec: `Specs/reporting/utilization-stories-types-package.md` (parent: core `specs/reporting/utilization-stories.md`).
 * Additive: consumers tolerate unknown fields. Field semantics: `undefined` = not read (the request failed, was not
 * applicable or was skipped) and resolves to an `unknown` capability; `null` = read and absent/disabled. A failed
 * read must never be presented as "disabled".
 */
export const RESILIENCE_FACTS_SCHEMA_VERSION = 1;
export const RESILIENCE_FACTS_SOURCE = 'AzureResilienceFacts';
export const RESILIENCE_FACTS_PORTAL_FILE = 'resilience-facts.json';
export const RESILIENCE_FACTS_RAW_FILE = 'data-protection/resilience-facts.json.gz';
