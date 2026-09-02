import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";

import QrCodeDisplay from "../components/qr/QrCodeDisplay";
import api from "../services/api";

type RackData = {
  id?: number;
  code?: string;
  status?: string;
};

type CheckInResult = {
  id?: number;
  ticketCode?: string;
  qrToken?: string;
  qrImage?: string;
  ticketUrl?: string;
  plateNumber?: string;
  rackId?: number;
  status?: string;
  checkInAt?: string;
  checkOutAt?: string | null;
  rack?: RackData;
};

function CheckInPage() {
  const navigate = useNavigate();

  const [plateNumber, setPlateNumber] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [racks, setRacks] = useState<
    {
      id: number;
      code: string;
      status: "AVAILABLE" | "OCCUPIED";
    }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRacks = async () => {
      try {
        const response = await api.get("/racks");

        console.log("RACK DATA:", response.data);

        setRacks(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data rak:", error);
      }
    };

    loadRacks();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plateNumber.trim()) {
      setError("Nomor plat wajib diisi");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post("/transactions/check-in", {
        plateNumber: plateNumber.trim(),
      });

      console.log("FULL CHECK-IN RESPONSE:", response.data);

      const data = response.data?.data;

      if (!data) {
        throw new Error("Response Check-In tidak memiliki data");
      }

      const transaction = data.transaction;
      const qr = data.qr;

      console.log("TRANSACTION:", transaction);
      console.log("QR:", qr);

      if (!transaction) {
        throw new Error("Data transaksi tidak ditemukan");
      }

      if (!qr) {
        throw new Error("Data QR tidak ditemukan");
      }

      /*
       * BACKEND KITA:
       *
       * qr: {
       *   qrImage: "data:image/png;base64,...",
       *   ticketUrl: "http://localhost:5173/ticket/xxxxx"
       * }
       */

      const ticketUrl = qr.ticketUrl ?? "";

      /*
       * Ambil token dari URL tiket.
       *
       * Contoh:
       *
       * http://localhost:5173/ticket/abcdef123
       *
       * menjadi:
       *
       * abcdef123
       */
      let qrToken = "";

      if (ticketUrl) {
        qrToken = ticketUrl.split("/ticket/")[1] ?? "";
      }

      /*
       * Ambil data rak.
       */
      const rack = transaction.rack ?? transaction.Rack ?? undefined;

      const rackId = transaction.rackId ?? rack?.id;

      /*
       * Normalisasi data.
       */
      const normalizedData: CheckInResult = {
        id: transaction.id,

        ticketCode: transaction.ticketCode ?? transaction.ticket?.ticketCode ?? transaction.code ?? "",

        qrToken,

        qrImage: qr.qrImage ?? "",

        ticketUrl,

        plateNumber: transaction.plateNumber ?? transaction.plate ?? plateNumber.trim(),

        rackId,

        status: transaction.status ?? "ACTIVE",

        checkInAt: transaction.checkInAt ?? transaction.createdAt ?? new Date().toISOString(),

        checkOutAt: transaction.checkOutAt ?? null,

        rack: rack
          ? {
              id: rack.id,
              code: rack.code,
              status: rack.status,
            }
          : undefined,
      };

      console.log("NORMALIZED CHECK-IN DATA:", normalizedData);

      /*
       * Backend sudah memberikan QR image
       * dan ticket URL.
       */
      if (!normalizedData.ticketUrl) {
        throw new Error("Ticket URL tidak ditemukan dari server");
      }

      setResult(normalizedData);
      const rackResponse = await api.get("/racks");
      setRacks(rackResponse.data.data || []);

      setPlateNumber("");
    } catch (error: any) {
      console.error("CHECK-IN ERROR:", error);

      setError(error?.response?.data?.message || error?.message || "Check-in gagal");
    } finally {
      setLoading(false);
    }
  };

  /*
   * URL tiket.
   *
   * Kita pakai langsung ticketUrl dari backend.
   */
  const ticketUrl = result?.ticketUrl ?? "";

  /*
   * Copy link.
   */
  const copyTicketLink = async () => {
    if (!ticketUrl) return;

    try {
      await navigator.clipboard.writeText(ticketUrl);

      alert("Link tiket berhasil disalin");
    } catch (error) {
      console.error("Gagal menyalin link:", error);
    }
  };

  /*
   * Nama rak.
   */
  const rackName = result?.rack?.code ? `Rak ${result.rack.code}` : result?.rackId ? `Rak #${result.rackId}` : "Rak belum tersedia";

  const occupiedRacks = racks.filter((rack) => rack.status === "OCCUPIED").length;

  const availableRacks = racks.filter((rack) => rack.status === "AVAILABLE").length;

  const totalRacks = racks.length;
  return (
    <div className="min-h-screen bg-[#eef7ff] px-5 py-10 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-[0.35em] text-[#2485e8]">LAYAR PETUGAS</p>

          <h1 className="font-serif text-4xl font-bold text-[#173477]">Check-In Penitipan</h1>

          <p className="mt-2 max-w-2xl text-[#41648f]">Masukkan nomor plat kendaraan. Sistem akan memilih rak kosong secara otomatis dan membuat tiket QR Code digital.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* =========================
              FORM CHECK-IN
          ========================== */}

          <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleCheckIn}>
              <label className="mb-3 block text-base font-semibold text-[#173477]">Nomor Plat Kendaraan</label>

              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="B 1234 CD"
                disabled={loading}
                className="w-full rounded-xl border-2 border-blue-200 bg-[#eef7ff] px-5 py-5 text-center font-serif text-2xl font-bold tracking-wider text-[#173477] outline-none placeholder:text-blue-300 focus:border-[#2485e8] disabled:opacity-60"
              />

              {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#2485e8] py-4 text-lg font-bold text-white transition hover:bg-[#173f95] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Memproses Check-In..." : "Proses Check-In & Buat QR"}
              </button>
            </form>

            {/* INFO RAK */}

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-200 bg-[#eef7ff] p-4 text-center">
                <p className="font-serif text-3xl font-bold text-[#173477]"> {occupiedRacks}</p>

                <p className="mt-1 text-xs font-semibold uppercase text-[#41648f]">Rak Terpakai</p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-[#eef7ff] p-4 text-center">
                <p className="font-serif text-3xl font-bold text-[#173477]">{availableRacks}</p>

                <p className="mt-1 text-xs font-semibold uppercase text-[#41648f]">Rak Tersedia</p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-[#eef7ff] p-4 text-center">
                <p className="font-serif text-3xl font-bold text-[#173477]"> {totalRacks}</p>

                <p className="mt-1 text-xs font-semibold uppercase text-[#41648f]">Total Rak</p>
              </div>
            </div>
          </div>

          {/* =========================
              HASIL CHECK-IN
          ========================== */}

          <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm">
            {!result ? (
              <div className="flex min-h-[400px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef7ff] text-[#2485e8]">
                    <CheckCircle size={42} />
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#173477]">Tiket Digital</h2>

                  <p className="mt-2 max-w-sm text-sm text-[#41648f]">Setelah proses check-in, QR Code tiket akan tampil di sini.</p>
                </div>
              </div>
            ) : (
              <div>
                {/* SUCCESS */}

                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle size={30} />
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#173477]">Check-In Berhasil</h2>

                  <p className="mt-1 text-sm text-green-600">Tiket digital berhasil dibuat</p>
                </div>

                {/* =========================
                    TICKET DATA
                ========================== */}

                <div className="rounded-2xl border-2 border-blue-200 bg-[#eef7ff] p-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#41648f]">Nomor Tiket</p>

                    <p className="mt-2 break-all font-mono text-xl font-bold text-[#173477]">{result.ticketCode || "-"}</p>
                  </div>

                  <div className="my-6 border-t border-blue-200" />

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs uppercase text-[#41648f]">Plat</p>

                      <p className="mt-1 font-bold text-[#173477]">{result.plateNumber || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-[#41648f]">Rak</p>

                      <p className="mt-1 text-xl font-bold text-[#173477]">{rackName}</p>
                    </div>
                  </div>
                </div>

                {/* =========================
                    QR CODE
                ========================== */}

                <div className="mt-6 rounded-xl border border-blue-200 bg-white p-6 text-center">
                  <p className="text-sm font-bold text-[#173477]">QR Code Tiket</p>

                  <p className="mt-2 text-xs text-[#41648f]">Tunjukkan QR Code ini kepada customer untuk disimpan di HP.</p>

                  <div className="mt-5 flex justify-center">
                    {result.qrImage ? (
                      /*
                       * PENTING:
                       * Backend sudah mengirim QR
                       * dalam bentuk Base64.
                       *
                       * Jadi kita tampilkan langsung.
                       */

                      <img src={result.qrImage} alt="QR Code Tiket" className="h-[230px] w-[230px] rounded-xl border border-blue-200 bg-white p-2 object-contain" />
                    ) : (
                      /*
                       * Fallback kalau qrImage tidak ada.
                       */
                      <QrCodeDisplay value={ticketUrl} size={230} />
                    )}
                  </div>

                  <p className="mt-4 text-xs text-[#41648f]">Scan QR untuk membuka tiket digital.</p>

                  {/* LINK */}

                  <div className="mt-4 rounded-lg bg-[#eef7ff] p-3">
                    <p className="break-all text-xs text-[#41648f]">{ticketUrl}</p>
                  </div>

                  {/* BUTTON */}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={copyTicketLink} className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 px-4 py-3 text-sm font-semibold text-[#173477] transition hover:bg-[#eef7ff]">
                      <Copy size={17} />
                      Salin Link
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (result.ticketUrl) {
                          window.location.href = result.ticketUrl;
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#2485e8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173f95]"
                    >
                      <ExternalLink size={17} />
                      Buka Tiket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInPage;
