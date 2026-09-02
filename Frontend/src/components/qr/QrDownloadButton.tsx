import { useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

type Props = {
  value: string;
  fileName?: string;
};

function QrDownloadButton({ value, fileName = "tiket-penitipan-helm" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const dataUrl = await QRCode.toDataURL(value, {
        width: 800,
        margin: 3,
        errorCorrectionLevel: "H",
      });

      const link = document.createElement("a");

      link.href = dataUrl;

      link.download = `${fileName}.png`;

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error) {
      console.error("Gagal download QR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleDownload} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2485e8] px-5 py-4 font-bold text-white transition hover:bg-[#173f95] disabled:opacity-60">
      <Download size={19} />

      {loading ? "Menyiapkan QR..." : "Simpan Tiket / Download QR"}
    </button>
  );
}

export default QrDownloadButton;
