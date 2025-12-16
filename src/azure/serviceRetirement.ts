import { Tags } from '../tags';
import { ServiceRetirementRecommendation } from './recommendations';

export interface ServiceRetirement {
  id: string;
  subscriptionId: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: string;
  location: string;
  retiringFeature: string;
  retirementDate: string;
  effort?: 'high' | 'medium' | 'low';
  effortHours?: number;
  tags?: Record<string, string>;
  spottoTags?: Tags;
}

export interface ServiceRetirementPortalResource {
  id: string;
  name?: string;
  resourceType?: string;
}

export interface ServiceRetirementPortalEntry extends ServiceRetirementRecommendation {
  resources: ServiceRetirementPortalResource[];
}
