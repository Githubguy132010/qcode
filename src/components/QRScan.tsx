import { X } from 'lucide-react';
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

interface QRScanProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export default function QRScan({ onScan, onClose }: QRScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let isMounted = true;
    let controls: IScannerControls | undefined;

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      (result, err, ctrl) => {
        if (ctrl) controls = ctrl;
        if (result && isMounted) {
          onScan(result.getText());
        }
      }
    );

    return () => {
      isMounted = false;
      if (controls) controls.stop();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="relative rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)] border">
        {/* Sluitknop rechtsboven */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors z-10"
          aria-label="Sluiten"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1 text-center">
            Scan QR-code of barcode
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 text-center">
            Richt je camera op een QR-code of barcode om automatisch de code in te vullen.
          </p>
          <div className="w-full flex justify-center">
            <video
              ref={videoRef}
              className="w-full max-w-xs aspect-square bg-black rounded-lg border border-[var(--input-border)] shadow-md"
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>
      </div>
    </div>
  );
} 