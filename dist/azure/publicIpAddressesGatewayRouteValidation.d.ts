import { type PublicIpAddressesGatewayRouteEvaluation, type PublicIpAddressesWafAssessment } from './publicIpAddressesGatewayRoute';
/** Bounded WAF configuration shape. Source binding and route attachments are checked by the parent guard. */
export declare const isPublicIpAddressesWafAssessment: (value: unknown) => value is PublicIpAddressesWafAssessment;
/** Shape and declared consistency only; no policy evaluation, clock freshness, authorization or live access assertion. */
export declare const isPublicIpAddressesGatewayRouteEvaluation: (value: unknown) => value is PublicIpAddressesGatewayRouteEvaluation;
//# sourceMappingURL=publicIpAddressesGatewayRouteValidation.d.ts.map