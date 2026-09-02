import { useState } from "react";
import { Camera, CheckCircle, Search, XCircle } from "lucide-react";
import QrScanner from "../components/qr/QrScanner";

import api from "../services/api";

type Transaction = {
  id: number;
  ticketCode: string;
  qrToken: string;
  plateNumber: string;
  status: string;
  checkInAt: string;
  checkOutAt: string | null;
  rack: {
    id: number;
    code: string;
    status: string;
  };
};

function CheckOutPage() {
  const [plateNumber, setPlateNumber] = useState("");

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const [cameraActive, setCameraActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CARI TRANSAKSI BERDASARKAN PLAT
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const plate = plateNumber.trim();

    if (!plate) {
      setError("Nomor plat wajib diisi");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setTransaction(null);

    try {
      const response = await api.get(`/transactions/search?plate=${encodeURIComponent(plate)}`);

      console.log("SEARCH RESPONSE:", response.data);

      const raw = response.data?.data;

      const data = raw?.transaction ?? raw;

      console.log("SEARCH TRANSACTION:", data);

      if (!data) {
        throw new Error("Data transaksi tidak ditemukan");
      }

      const normalizedTransaction: Transaction = {
        id: data.id,
        ticketCode: data.ticketCode,
        qrToken: data.qrToken,
        plateNumber: data.plateNumber,
        status: data.status,
        checkInAt: data.checkInAt,
        checkOutAt: data.checkOutAt ?? null,
        rack: {
          id: data.rack?.id ?? data.rackId,
          code: data.rack?.code ?? data.rackCode,
          status: data.rack?.status ?? "OCCUPIED",
        },
      };

      console.log("NORMALIZED SEARCH TRANSACTION:", normalizedTransaction);

      setTransaction(normalizedTransaction);
    } catch (error: any) {
      console.error("SEARCH ERROR:", error);

      setError(error.response?.data?.message || error.message || "Data penitipan tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // CARI TRANSAKSI BERDASARKAN QR

  const handleQrScan = async (value: string) => {
    console.log("QR TERBACA:", value);

    // Kamera sudah otomatis mati
    setCameraActive(false);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let qrToken = value.trim();

      // QR berisi URL tiket
      try {
        const url = new URL(qrToken);

        const parts = url.pathname.split("/").filter(Boolean);

        qrToken = parts[parts.length - 1];
      } catch {
        // QR langsung berupa token
      }

      console.log("QR TOKEN:", qrToken);

      if (!qrToken) {
        throw new Error("QR Token tidak ditemukan");
      }

      const response = await api.get(`/transactions/ticket/${qrToken}`);

      console.log("QR TICKET RESPONSE:", response.data);

      const raw = response.data?.data;

      const data = raw?.transaction ?? raw;

      console.log("QR TRANSACTION:", data);

      if (!data) {
        throw new Error("Data transaksi tidak ditemukan");
      }

      if (data.status !== "ACTIVE") {
        throw new Error("Transaksi sudah selesai atau helm sudah diambil");
      }

      const normalizedTransaction: Transaction = {
        id: data.id,
        ticketCode: data.ticketCode,
        qrToken: data.qrToken ?? qrToken,
        plateNumber: data.plateNumber,
        status: data.status,
        checkInAt: data.checkInAt,
        checkOutAt: data.checkOutAt ?? null,
        rack: {
          id: data.rack?.id ?? data.rackId,
          code: data.rack?.code ?? data.rackCode,
          status: data.rack?.status ?? "OCCUPIED",
        },
      };

      console.log("NORMALIZED QR TRANSACTION:", normalizedTransaction);

      setTransaction(normalizedTransaction);
    } catch (error: any) {
      console.error("QR SEARCH ERROR:", error);

      setError(error.response?.data?.message || error.message || "QR Code tidak valid");
    } finally {
      setLoading(false);
    }
  };

  // CHECKOUT

  const handleCheckout = async () => {
    if (!transaction) {
      setError("Data transaksi tidak ditemukan");
      return;
    }

    if (!transaction.qrToken) {
      setError("QR Token tidak ditemukan");
      return;
    }

    setCheckoutLoading(true);
    setError("");
    setSuccess("");

    console.log("CHECKOUT TRANSACTION:", transaction);
    console.log("CHECKOUT QR TOKEN:", transaction.qrToken);

    try {
      const response = await api.post(`/transactions/${transaction.id}/checkout`);

      console.log("CHECKOUT RESPONSE:", response.data);
      console.log("CHECKOUT RESPONSE:", response.data);

      setSuccess("Helm berhasil diambil. Transaksi telah selesai.");

      setTransaction((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: "COMPLETED",
          checkOutAt: new Date().toISOString(),
          rack: {
            ...prev.rack,
            status: "AVAILABLE",
          },
        };
      });
    } catch (error: any) {
      console.error("CHECKOUT ERROR:", error);

      setError(error.response?.data?.message || error.message || "Gagal melakukan check-out");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // FORMAT TANGGAL

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#eef7ff] px-5 py-8 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* =====================================
              KIRI - SCANNER
          ====================================== */}

          <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm font-semibold tracking-[0.35em] text-[#2485e8]">LAYAR PETUGAS</p>

            <h1 className="font-serif text-3xl font-bold text-[#173477]">Check-Out Penitipan</h1>

            <p className="mt-2 text-sm text-[#41648f]">Scan QR Code tiket atau cari berdasarkan nomor plat untuk mengambil helm.</p>

            {/* CAMERA */}

            <div className="mt-7 rounded-2xl bg-[#173f95] p-6">
              {!cameraActive ? (
                <div className="flex min-h-[330px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-[245px] w-[245px] flex-col items-center justify-center rounded-xl border-4 border-blue-400/40">
                      <Camera size={48} className="mb-5 text-blue-300" />

                      <p className="text-base text-blue-200">Kamera belum aktif</p>

                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setCameraActive(true);
                        }}
                        className="mt-5 rounded-lg bg-[#2485e8] px-6 py-3 font-bold text-white transition hover:bg-blue-500"
                      >
                        Aktifkan Kamera
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-full overflow-hidden rounded-xl border-4 border-blue-400/40 bg-black">
                    <QrScanner
                      onScan={handleQrScan}
                      onError={(message) => {
                        console.error("QR SCANNER ERROR:", message);

                        setError(message);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCameraActive(false)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    <XCircle size={17} />
                    Matikan Kamera
                  </button>
                </div>
              )}
            </div>

            {/* PEMBATAS */}

            <div className="my-7 border-t border-blue-200" />

            {/* MANUAL */}

            <form onSubmit={handleSearch}>
              <label className="mb-3 block text-base font-semibold text-[#173477]">Cari Manual — Nomor Plat</label>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="B 4556 OPM"
                  className="min-w-0 flex-1 rounded-xl border-2 border-blue-200 bg-[#eef7ff] px-5 py-4 text-lg font-bold tracking-wide text-[#173477] outline-none placeholder:text-blue-300 focus:border-[#2485e8]"
                />

                <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#173f95] px-7 py-4 font-bold text-white transition hover:bg-[#2485e8] disabled:opacity-60">
                  <Search size={19} />

                  {loading ? "Cari..." : "Cari"}
                </button>
              </div>
            </form>

            {/* ERROR */}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <XCircle size={20} className="mt-0.5 shrink-0" />

                <p>{error}</p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle size={20} className="mt-0.5 shrink-0" />

                <p>{success}</p>
              </div>
            )}
          </div>

          {/* =====================================
              KANAN - HASIL
          ====================================== */}

          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            {/* HEADER */}

            <div className="bg-[#173f95] px-8 py-7">
              <p className="text-xs font-semibold tracking-[0.35em] text-blue-200">HASIL PEMINDAIAN</p>

              <h2 className="mt-1 font-serif text-4xl font-bold text-white">Data Titipan</h2>
            </div>

            {/* DETAIL */}

            <div className="p-8">
              {!transaction ? (
                <div className="flex min-h-[470px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef7ff] text-[#2485e8]">
                      <Search size={35} />
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-bold text-[#173477]">Belum Ada Data</h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#41648f]">Scan QR Code atau masukkan nomor plat untuk menampilkan data penitipan.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* LOCATION */}

                  <div className="flex items-center justify-between border-b border-blue-200 py-5">
                    <span className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Location</span>

                    <span className="font-serif text-3xl font-bold text-[#173477]">{transaction.rack?.code ? `Rak ${transaction.rack.code}` : `Rak #${transaction.rack?.id ?? "-"}`}</span>
                  </div>

                  {/* PLATE */}

                  <div className="flex items-center justify-between border-b border-blue-200 py-5">
                    <span className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Plate</span>

                    <span className="font-serif text-3xl font-bold text-[#173477]">{transaction.plateNumber}</span>
                  </div>

                  {/* STATUS */}

                  <div className="flex items-center justify-between border-b border-blue-200 py-5">
                    <span className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Status</span>

                    <span className={transaction.status === "ACTIVE" ? "font-semibold text-green-600" : "font-semibold text-gray-500"}>{transaction.status === "ACTIVE" ? "Active" : "Completed"}</span>
                  </div>

                  {/* ENTRY TIME */}

                  <div className="flex items-center justify-between border-b border-blue-200 py-5">
                    <span className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Entry Time</span>

                    <span className="text-right font-semibold text-[#173477]">{formatDate(transaction.checkInAt)}</span>
                  </div>

                  {/* TICKET */}

                  <div className="flex items-center justify-between border-b border-blue-200 py-5">
                    <span className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Ticket ID</span>

                    <span className="font-semibold text-[#173477]">{transaction.ticketCode}</span>
                  </div>

                  {/* CHECKOUT */}

                  {transaction.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="mt-5 w-full rounded-xl bg-[#009451] py-5 text-lg font-bold text-white transition hover:bg-[#007a43] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutLoading ? "Processing..." : "Confirm & Release"}
                    </button>
                  )}

                  {/* COMPLETED */}

                  {transaction.status === "COMPLETED" && (
                    <div className="mt-5 rounded-xl bg-green-50 p-5 text-center">
                      <CheckCircle size={32} className="mx-auto text-green-600" />

                      <p className="mt-2 font-bold text-green-700">Helm Sudah Diambil</p>

                      {transaction.checkOutAt && <p className="mt-1 text-sm text-green-600">{formatDate(transaction.checkOutAt)}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOutPage;
