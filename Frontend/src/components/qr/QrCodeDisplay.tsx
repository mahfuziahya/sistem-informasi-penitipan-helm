import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrCodeDisplayProps = {
  value: string;
  size?: number;
};

function QrCodeDisplay({ value, size = 240 }: QrCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!value) {
      setQrUrl("");
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrUrl(url);
      })
      .catch((error) => {
        console.error("Gagal membuat QR Code:", error);
      });
  }, [value, size]);

  if (!qrUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-white"
        style={{
          width: size,
          height: size,
        }}
      >
        <span className="text-sm text-gray-400">Membuat QR...</span>
      </div>
    );
  }

  return <img src={qrUrl} alt="QR Code Tiket" width={size} height={size} className="rounded-xl bg-white p-3" />;
}

export default QrCodeDisplay;
