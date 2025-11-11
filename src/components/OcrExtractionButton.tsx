// src/components/OcrExtractionButton.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, FileSearch, Loader2 } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "../lib/api";

interface OcrResult {
  insuredName?: string;
  policyNumber?: string;
  expirationDate?: string;
  coverageAmount?: number;
  insurer?: string;
  effectiveDate?: string;
  confidence?: number;
}

interface OcrExtractionButtonProps {
  coiId: string;
  onSuccess?: (data: OcrResult) => void;
}

export default function OcrExtractionButton({
  coiId,
  onSuccess,
}: OcrExtractionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const queryClient = useQueryClient();

  // Extract OCR data - endpoint: POST /cois/:id/extract
  const extractMutation = useMutation({
    mutationFn: () => fetchApi(`/cois/${coiId}/extract`, { method: "POST" }),
    onSuccess: (data: OcrResult) => {
      setResult(data);
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: ["coi", coiId] });
      console.log("✓ OCR extraction successful");
    },
    onError: (error) => {
      console.error("✗ OCR extraction failed:", error);
      setResult({ confidence: 0 });
    },
  });

  // Apply extracted data - endpoint: PATCH /cois/:id/apply-ocr
  const applyMutation = useMutation({
    mutationFn: (data: OcrResult) =>
      fetchApi(`/cois/${coiId}/apply-ocr`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coi", coiId] });
      setIsOpen(false);
      setResult(null);
      console.log("✓ OCR data applied successfully");
    },
    onError: (error) => {
      console.error("✗ Failed to apply OCR data:", error);
    },
  });

  const handleExtract = () => {
    setIsOpen(true);
    setResult(null);
    extractMutation.mutate();
  };

  const handleApply = () => {
    if (result) {
      applyMutation.mutate(result);
    }
  };

  return (
    <>
      {/* Extract Button */}
      <button
        onClick={handleExtract}
        disabled={extractMutation.isPending}
        className="btn btn-ghost"
      >
        {extractMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          <>
            <FileSearch className="h-4 w-4" />
            Extract from PDF
          </>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <FileSearch className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">OCR Extraction</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Extracted data from PDF
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {extractMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-brand animate-spin mb-4" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Processing PDF with OCR...
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    This may take a few seconds
                  </p>
                </div>
              ) : result ? (
                result.confidence === 0 ? (
                  // Error state
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Extraction Failed
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
                      Could not extract data from the PDF. The document may be a
                      scanned image or have poor quality.
                    </p>
                  </div>
                ) : (
                  // Success state
                  <div className="space-y-6">
                    {/* Confidence Score */}
                    {result.confidence !== undefined && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-900 dark:text-green-100">
                            Extraction Successful
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Confidence: {(result.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}

                    {/* Extracted Data */}
                    <div className="grid grid-cols-2 gap-4">
                      {result.insuredName && (
                        <DataField
                          label="Insured Name"
                          value={result.insuredName}
                        />
                      )}
                      {result.policyNumber && (
                        <DataField
                          label="Policy Number"
                          value={result.policyNumber}
                        />
                      )}
                      {result.insurer && (
                        <DataField label="Insurer" value={result.insurer} />
                      )}
                      {result.effectiveDate && (
                        <DataField
                          label="Effective Date"
                          value={new Date(
                            result.effectiveDate
                          ).toLocaleDateString()}
                        />
                      )}
                      {result.expirationDate && (
                        <DataField
                          label="Expiration Date"
                          value={new Date(
                            result.expirationDate
                          ).toLocaleDateString()}
                        />
                      )}
                      {result.coverageAmount && (
                        <DataField
                          label="Coverage Amount"
                          value={`$${result.coverageAmount.toLocaleString()}`}
                        />
                      )}
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Review carefully:</strong> OCR may not be 100%
                        accurate. Please verify the extracted data before
                        applying.
                      </p>
                    </div>
                  </div>
                )
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost flex-1"
                disabled={applyMutation.isPending}
              >
                Cancel
              </button>
              {result && result.confidence !== 0 && (
                <button
                  onClick={handleApply}
                  className="btn btn-primary flex-1"
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? "Applying..." : "Apply to COI"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper component
function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 mb-1">
        {label}
      </label>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
