export type CostAlertSeverity = "info" | "warning" | "critical";

export interface CostAlert {
  id: string;
  severity: CostAlertSeverity;
  title: string;
  description: string;
  eventId: string;
  eventTimestamp: string;
  resourceId: string;
  resourceType: string;
  serviceCategory?: string;
  subscriptionId?: string;
  resourceGroup?: string;
  estimatedCost?: number;
  createdAt: string;
}

export interface CostAlertFile {
  generatedAt: string;
  items: CostAlert[];
}
