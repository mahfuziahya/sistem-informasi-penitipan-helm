import { useEffect, useRef, useState } from "react";
import { CheckCircle, Ticket } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import QrCodeDisplay from "../components/qr/QrCodeDisplay";
import api from "../services/api";

type TicketData = {
  id: number;
  ticketCode: string;
  qrToken: string;
  plateNumber: string;
  status: string;
  checkInAt: string;
  checkOutAt: string | null;
  rack: {
    code: string;
    status: string;
  };
};

function TicketPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Supaya auto-download hanya dilakukan sekali
  const autoDownloadStarted = useRef(false);

  // Container QR
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token tiket tidak ditemukan");
      setLoading(false);
      return;
    }

    loadTicket();
  }, [token]);

  const loadTicket = async () => {
    try {
      const response = await api.get(`/transactions/ticket/${token}`);

      console.log("TICKET RESPONSE:", response.data);

      setTicket(response.data.data);
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.message || "Tiket tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * DOWNLOAD QR OTOMATIS
   *
   * QR yang tampil di halaman akan dicari:
   * - canvas
   * - img
   * - svg
   *
   * kemudian disimpan sebagai PNG.
   */
  const downloadDisplayedQr = async () => {
    if (!qrContainerRef.current || !ticket) return;

    const container = qrContainerRef.current;

    // =========================
    // 1. CANVAS
    // =========================

    const canvas = container.querySelector("canvas");

    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `QR-${ticket.ticketCode}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      }, "image/png");

      return;
    }

    // =========================
    // 2. IMAGE
    // =========================

    const image = container.querySelector("img");

    if (image) {
      try {
        const response = await fetch(image.src);

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `QR-${ticket.ticketCode}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        return;
      } catch (error) {
        console.error("Gagal mengambil gambar QR:", error);
      }
    }

    // =========================
    // 3. SVG
    // =========================

    const svg = container.querySelector("svg");

    if (svg) {
      try {
        const serializer = new XMLSerializer();

        const svgString = serializer.serializeToString(svg);

        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });

        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `QR-${ticket.ticketCode}.svg`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (error) {
        console.error("Gagal mengunduh QR:", error);
      }
    }
  };

  /*
   * AUTO DOWNLOAD
   *
   * Tunggu QR selesai dirender terlebih dahulu.
   */
  useEffect(() => {
    if (!ticket || loading || autoDownloadStarted.current) {
      return;
    }

    autoDownloadStarted.current = true;

    const timer = setTimeout(() => {
      downloadDisplayedQr();
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [ticket, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef7ff]">
        <p className="font-semibold text-[#173477]">Memuat tiket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef7ff] px-5">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h1 className="font-serif text-2xl font-bold text-red-600">Tiket Tidak Ditemukan</h1>

          <p className="mt-3 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const ticketUrl = `${window.location.origin}/ticket/${ticket.qrToken}`;

  return (
    <div className="min-h-screen bg-[#eef7ff] px-5 py-10">
      <div className="mx-auto max-w-[600px]">
        {/* HEADER */}

        <div className="mb-7 text-center">
          <p className="text-xs font-semibold tracking-[0.35em] text-[#2485e8]">SISTEM INFORMASI PENITIPAN</p>

          <h1 className="mt-2 font-serif text-4xl font-bold text-[#173477]">SIMPAN</h1>

          <p className="mt-1 text-sm text-[#41648f]">Sistem Penitipan Helm berbasis QR Code</p>
        </div>

        {/* TICKET */}

        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl">
          {/* HEADER BIRU */}

          <div className="bg-[#173f95] px-7 py-6 text-center text-white">
            <Ticket size={40} className="mx-auto mb-3" />

            <h2 className="font-serif text-2xl font-bold">Tiket Penitipan Helm</h2>

            <p className="mt-1 text-sm text-blue-200">Simpan tiket ini sampai proses pengambilan helm.</p>
          </div>

          <div className="p-7">
            {/* SUCCESS */}

            <div className="mb-7 text-center">
              <CheckCircle size={45} className="mx-auto text-green-500" />

              <p className="mt-3 text-sm font-semibold text-green-600">Penitipan Berhasil</p>
            </div>

            {/* TICKET CODE */}

            <div className="rounded-xl bg-[#eef7ff] p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#41648f]">Ticket ID</p>

              <p className="mt-2 break-all font-mono text-2xl font-bold text-[#173477]">{ticket.ticketCode}</p>
            </div>

            {/* QR CODE */}

            <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-[#eef7ff] p-6 text-center">
              <p className="text-sm font-bold text-[#173477]">QR Code Tiket</p>

              <p className="mt-1 text-xs text-[#41648f]">Scan QR ini menggunakan HP customer.</p>

              <div ref={qrContainerRef} className="mt-5 flex justify-center overflow-hidden">
                <QrCodeDisplay value={ticketUrl} size={250} />
              </div>

              {/* AUTO DOWNLOAD INFO */}

              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-700">QR tiket sedang disimpan ke perangkat...</p>

                <p className="mt-1 text-xs text-green-600">Jika tidak terunduh otomatis, gunakan tombol di bawah.</p>
              </div>

              {/* SIMPAN TIKET */}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    downloadDisplayedQr();

                    setTimeout(() => {
                      navigate("/check-in");
                    }, 1000);
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-[#2485e8] px-6 py-5 text-lg font-bold text-white transition hover:bg-[#173f95]"
                >
                  Simpan Tiket / Download QR
                </button>
              </div>
            </div>

            {/* DETAIL */}

            <div className="mt-6 space-y-4">
              <div className="flex justify-between border-b border-blue-100 pb-3">
                <span className="text-sm text-[#41648f]">Nomor Plat</span>

                <strong className="text-[#173477]">{ticket.plateNumber}</strong>
              </div>

              <div className="flex justify-between border-b border-blue-100 pb-3">
                <span className="text-sm text-[#41648f]">Rak</span>

                <strong className="text-xl text-[#173477]">{ticket.rack?.code || "-"}</strong>
              </div>

              <div className="flex justify-between border-b border-blue-100 pb-3">
                <span className="text-sm text-[#41648f]">Waktu Masuk</span>

                <strong className="text-right text-sm text-[#173477]">{formatDate(ticket.checkInAt)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[#41648f]">Status</span>

                <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700">{ticket.status}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#41648f]">Tunjukkan QR tiket kepada petugas saat mengambil helm.</p>
      </div>
    </div>
  );
}

export default TicketPage;
