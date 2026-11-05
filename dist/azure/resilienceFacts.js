"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESILIENCE_FACTS_RAW_FILE = exports.RESILIENCE_FACTS_PORTAL_FILE = exports.RESILIENCE_FACTS_SOURCE = exports.RESILIENCE_FACTS_SCHEMA_VERSION = void 0;
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
exports.RESILIENCE_FACTS_SCHEMA_VERSION = 1;
exports.RESILIENCE_FACTS_SOURCE = 'AzureResilienceFacts';
exports.RESILIENCE_FACTS_PORTAL_FILE = 'resilience-facts.json';
exports.RESILIENCE_FACTS_RAW_FILE = 'data-protection/resilience-facts.json.gz';
//# sourceMappingURL=resilienceFacts.js.map