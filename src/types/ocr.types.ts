export interface OcrResult {
  insuredName?: string;
  policyNumber?: string;
  expirationDate?: string;
  coverageAmount?: number;
  insurer?: string;
  effectiveDate?: string;
  confidence?: number;
}
