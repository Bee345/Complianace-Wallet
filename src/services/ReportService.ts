import { TaxRecord, LevyRecord, HealthPermit, Money } from "../types";

/**
 * Service for generating compliance reports.
 * In a real app, this might use a library like jspdf or a server-side PDF generator.
 */
export class ReportService {
  generateComplianceSummary(
    vendorName: string,
    taxRecords: TaxRecord[],
    levyRecords: LevyRecord[],
    healthPermit: HealthPermit | null
  ): string {
    const totalTax = taxRecords.reduce((sum, r) => sum + (r.calculatedTax?.amount || 0), 0);
    const totalLevies = levyRecords.reduce((sum, r) => sum + (r.amount?.amount || 0), 0);
    
    return `
      STREET VENDOR COMPLIANCE REPORT
      -------------------------------
      Vendor: ${vendorName}
      Date: ${new Date().toLocaleDateString()}
      
      COMPLIANCE STATUS:
      - Tax: ${taxRecords.length > 0 ? 'ACTIVE' : 'PENDING'}
      - Health: ${healthPermit ? healthPermit.status : 'NOT REGISTERED'}
      
      FINANCIAL SUMMARY (MONTHLY):
      - Total Tax Paid: ₦${totalTax.toLocaleString()}
      - Total Levies Paid: ₦${totalLevies.toLocaleString()}
      
      This document serves as proof of compliance for local government officials.
      Verification QR: [QR_CODE_STUB]
    `;
  }
}
