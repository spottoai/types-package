/** Stable report identifiers shared by the Reports catalogue and unattended pack generation. */
export declare const REPORT_PACK_REPORT_IDS: readonly ["resources", "recommendations", "security", "perimeter", "backup-assessment", "dr-handbook", "service-retirement", "hybrid-benefit", "microsoft365", "cost-tree", "commitments", "at-a-glance"];
export type ReportPackReportId = (typeof REPORT_PACK_REPORT_IDS)[number];
export declare const REPORT_PACK_FEATURES: Record<ReportPackReportId, readonly string[]>;
export declare const isReportPackReportId: (value: unknown) => value is ReportPackReportId;
export interface ReportPackConfigurationV1 {
    /** A nonempty, unique selection; canonical serialization uses catalogue order. */
    reportIds: ReportPackReportId[];
    scopeCurrencyCode: string;
}
export declare const reportJobFileExtension: (reportType: string) => ".zip" | ".docx";
export declare const reportJobContentType: (reportType: string) => string;
export declare const isReportJobFileNameForType: (fileName: string, reportType: string) => boolean;
//# sourceMappingURL=reportPack.d.ts.map