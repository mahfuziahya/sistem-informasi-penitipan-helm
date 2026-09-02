import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import api from "../services/api";

type ReportTransaction = {
  id: number;
  ticketCode: string;
  plateNumber: string;
  rack: {
    code: string;
  };
  checkInAt: string;
  checkOutAt: string | null;
  status: string;
};

type DailyReport = {
  id: number;
  reportDate: string;
  totalTransactions: number;
  completedTransactions: number;
  activeTransactions: number;
  transactions?: ReportTransaction[];
};

function DailyReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [report, setReport] = useState<DailyReport | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (selectedDate = date) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/reports/daily", {
        params: {
          date: selectedDate,
        },
      });
      console.log("DAILY REPORT RESPONSE:", response.data);
      setReport(response.data.data);
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.message || "Gagal mengambil laporan harian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const downloadPdf = () => {
    if (!report) return;

    const token = localStorage.getItem("token");

    const url = `${api.defaults.baseURL}/reports/daily/${report.id}/pdf`;

    const link = document.createElement("a");

    link.href = url;

    /*
     * Endpoint PDF menggunakan authentication.
     * Browser tidak dapat menambahkan Bearer token
     * lewat window.open biasa.
     *
     * Untuk sementara kita gunakan fetch agar
     * Authorization header tetap dikirim.
     */

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengunduh PDF");
        }

        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);

        link.href = blobUrl;

        link.download = `laporan-harian-${date}.pdf`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error(error);

        setError("Gagal mengunduh PDF laporan");
      });
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatReportDate = (value: string) => {
    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#eef7ff] px-5 py-10 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-[0.35em] text-[#2485e8]">ADMINISTRATOR</p>

          <h1 className="font-serif text-4xl font-bold text-[#173477]">Laporan Harian</h1>

          <p className="mt-2 text-[#41648f]">Pilih tanggal untuk melihat laporan transaksi penitipan helm.</p>
        </div>

        {/* FILTER */}

        <div className="rounded-2xl border border-blue-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#41648f]">Tanggal</label>

              <input type="date" value={date} onChange={handleDateChange} className="w-full rounded-lg border-2 border-blue-200 bg-[#eef7ff] px-4 py-3 font-semibold text-[#173477] outline-none focus:border-[#2485e8]" />
            </div>

            <button onClick={() => loadReport()} disabled={loading} className="rounded-lg bg-[#2485e8] px-7 py-3 font-semibold text-white hover:bg-[#173f95] disabled:opacity-60">
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </button>

            <button onClick={downloadPdf} disabled={!report} className="flex items-center justify-center gap-2 rounded-lg bg-[#173f95] px-7 py-3 font-semibold text-white hover:bg-[#2485e8] disabled:cursor-not-allowed disabled:opacity-50">
              <Download size={18} />
              Download PDF
            </button>
          </div>

          {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        </div>

        {/* REPORT */}

        {report && (
          <div className="mt-8">
            {/* TITLE */}

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <FileText size={25} className="text-[#2485e8]" />

                <h2 className="font-serif text-3xl font-bold text-[#173477]">Laporan Harian Penitipan Helm</h2>
              </div>

              <p className="mt-2 text-[#41648f]">{formatReportDate(report.reportDate)}</p>
            </div>

            {/* SUMMARY */}

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Total Transaksi</p>

                <p className="mt-3 font-serif text-4xl font-bold text-[#173477]">{report.totalTransactions}</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Sudah Diambil</p>

                <p className="mt-3 font-serif text-4xl font-bold text-[#173477]">{report.completedTransactions}</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Masih Dititipkan</p>

                <p className="mt-3 font-serif text-4xl font-bold text-[#173477]">{report.activeTransactions}</p>
              </div>
            </div>

            {/* TABLE */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-blue-200 bg-[#f7fbff] text-left text-sm font-semibold uppercase tracking-wide text-[#41648f]">
                      <th className="px-6 py-5">Ticket ID</th>

                      <th className="px-6 py-5">Plat</th>

                      <th className="px-6 py-5">Rak</th>

                      <th className="px-6 py-5">Masuk</th>

                      <th className="px-6 py-5">Keluar</th>

                      <th className="px-6 py-5">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.transactions && report.transactions.length > 0 ? (
                      report.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-blue-100 last:border-0">
                          <td className="px-6 py-5 font-semibold text-[#173477]">{transaction.ticketCode}</td>

                          <td className="px-6 py-5 font-bold text-[#173477]">{transaction.plateNumber}</td>

                          <td className="px-6 py-5 text-[#41648f]">{transaction.rack.code}</td>

                          <td className="px-6 py-5 text-[#41648f]">{formatDate(transaction.checkInAt)}</td>

                          <td className="px-6 py-5 text-[#41648f]">{transaction.checkOutAt ? formatDate(transaction.checkOutAt) : "-"}</td>

                          <td className="px-6 py-5">
                            <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${transaction.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{transaction.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#41648f]">
                          Tidak ada transaksi pada tanggal ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyReportPage;
