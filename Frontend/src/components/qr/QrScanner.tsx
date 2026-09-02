import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Props = {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
};

function QrScanner({ onScan, onError }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    scannedRef.current = false;

    const scanner = new Html5Qrcode("qr-reader", {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });

    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 300,
              height: 300,
            },
            aspectRatio: 1.5,
          },
          async (decodedText) => {
            if (!mountedRef.current) return;

            // Jangan proses QR berkali-kali
            if (scannedRef.current) return;

            scannedRef.current = true;

            console.log("QR BERHASIL TERBACA:", decodedText);

            // Matikan scanner terlebih dahulu
            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch (error) {
              console.warn("Gagal menghentikan scanner:", error);
            }

            // Pastikan kamera benar-benar dihentikan
            const video = document.querySelector("#qr-reader video") as HTMLVideoElement | null;

            if (video?.srcObject) {
              const stream = video.srcObject as MediaStream;

              stream.getTracks().forEach((track) => track.stop());

              video.srcObject = null;
            }

            if (mountedRef.current) {
              onScan(decodedText);
            }
          },
          () => {
            // Jangan tampilkan error setiap frame
          },
        );
      } catch (error) {
        console.error("Kamera gagal dijalankan:", error);

        if (mountedRef.current) {
          onError?.("Kamera tidak dapat digunakan. Pastikan browser memiliki izin kamera.");
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;

      const cleanup = async () => {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch {
          // Scanner sudah berhenti
        }

        // Paksa hentikan semua track kamera
        const video = document.querySelector("#qr-reader video") as HTMLVideoElement | null;

        if (video?.srcObject) {
          const stream = video.srcObject as MediaStream;

          stream.getTracks().forEach((track) => track.stop());

          video.srcObject = null;
        }

        // Bersihkan elemen scanner
        try {
          scanner.clear();
        } catch {
          // Sudah dibersihkan
        }

        scannerRef.current = null;
      };

      cleanup();
    };
  }, [onScan, onError]);

  return (
    <div
      id="qr-reader"
      className="w-full max-w-full overflow-hidden rounded-xl"
      style={{
        maxHeight: "330px",
      }}
    />
  );
}

export default QrScanner;
