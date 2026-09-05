import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, CameraOff } from "lucide-react";
import { getProductByBarcode } from "../services/productService";

export default function BarcodeScannerModal({ isOpen, onClose, shopId, onProductFound }) {
  const [error, setError] = useState("");
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const lastScanTime = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setScanError("");
    setError("");

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          startScanner();
        } else {
          setError("Aucune caméra détectée sur cet appareil.");
        }
      })
      .catch((err) => {
        setError("Accès à la caméra refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.");
      });

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startScanner = () => {
    if (!scannerRef.current || isScanning.current) return;

    isScanning.current = true;
    scannerRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        async (decodedText) => {
          // Debounce 2 seconds
          const now = Date.now();
          if (now - lastScanTime.current < 2000) return;
          lastScanTime.current = now;

          try {
            const product = await getProductByBarcode(shopId, decodedText);
            onProductFound(product);
            await stopScanner();
            onClose(); // Close on success
          } catch (err) {
            setScanError(`Produit introuvable pour le code: ${decodedText}`);
          }
        },
        (errorMessage) => {
          // Ignore routine scan errors (no barcode in front of camera)
        }
      )
      .catch((err) => {
        isScanning.current = false;
        setError("Erreur lors de l'initialisation de la caméra.");
      });
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Failed to stop scanner", err);
      } finally {
        isScanning.current = false;
      }
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-[#bdc9c1] bg-white text-[#141e1a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-lg font-bold text-[#141e1a]">Scanner un produit</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-[#6e7a72] transition hover:bg-[#ebf6ef] hover:text-[#141e1a]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          {error ? (
            <div className="text-center text-red-400 flex flex-col items-center gap-3">
              <CameraOff size={48} className="text-red-500/50" />
              <p className="text-sm px-4">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 rounded-lg bg-[#006547] px-6 py-2 text-white transition hover:bg-[#12805c]"
              >
                Saisie manuelle
              </button>
            </div>
          ) : (
            <div className="w-full relative flex flex-col items-center justify-center">
              <div id="reader" className="w-full rounded-lg overflow-hidden bg-black" />
              {scanError && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white text-xs text-center p-2 rounded-lg animate-pulse">
                  {scanError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
