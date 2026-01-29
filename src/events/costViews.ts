import type { CostAlertCriteria, CostAlertDefinition, CostAlertInstance } from './cost';

/**
 * Lightweight definition reference included alongside instances in list views.
 * This is not persisted as part of the alert instance row.
 */
export interface CostAlertDefinitionReference {
  id: string;
  name: string;
  criteria?: CostAlertCriteria;
}

/**
 * API/Portal view model for an alert instance.
 * Extends the persisted `CostAlertInstance` with runtime-only convenience fields.
 */
export interface CostAlertInstanceView extends CostAlertInstance {
  /**
   * Hydrated definition data for UI rendering. This is not stored in Table Storage.
   * - List endpoints often return a lightweight `CostAlertDefinitionReference`.
   * - Detail endpoints may return the full `CostAlertDefinition` (or a superset).
   */
  definition?: CostAlertDefinitionReference | CostAlertDefinition;
}
