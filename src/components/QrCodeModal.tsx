// src/components/QrCodeModal.tsx
import { QrCode, X } from "lucide-react";
import { useState } from "react";

interface QrCodeModalProps {
  vendorId: string;
  buildingId: string;
  vendorName?: string;
  buildingName?: string;
}

export default function QrCodeModal({
  vendorId,
  buildingId,
  vendorName,
  buildingName,
}: QrCodeModalProps) {
  const [open, setOpen] = useState(false);

  const qrUrl = `${
    import.meta.env.VITE_API_URL
  }/access/qr?vendorId=${vendorId}&buildingId=${buildingId}`;

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-ghost btn-sm">
        <QrCode className="h-4 w-4" />
        QR Code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="relative bg-white dark:bg-neutral-900 p-8 rounded-2xl max-w-lg w-full mx-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold mb-2">Access QR Code</h3>

            {vendorName && buildingName && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {vendorName} → {buildingName}
              </p>
            )}

            <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700">
              <img src={qrUrl} alt="Access QR Code" className="w-full h-auto" />
            </div>

            <p className="text-sm text-neutral-500 mt-4 text-center">
              Scan at building entrance to verify vendor access
            </p>

            <div className="flex gap-3 mt-6">
              <a
                href={qrUrl}
                download={`qr-${vendorId}-${buildingId}.png`}
                className="btn btn-primary flex-1"
              >
                Download QR
              </a>
              <button onClick={() => setOpen(false)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
