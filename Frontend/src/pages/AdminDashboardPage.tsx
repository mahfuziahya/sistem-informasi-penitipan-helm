import { useEffect, useState } from "react";
import { FileText, ShieldCheck, PackageCheck, LayoutGrid } from "lucide-react";

import api from "../services/api";

type Rack = {
  id: number;
  code: string;
  status: "AVAILABLE" | "OCCUPIED";
};

type Transaction = {
  id: number;
  ticketCode: string;
  plateNumber: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  checkInAt: string;
  checkOutAt: string | null;
  rack: {
    code: string;
  };
};

function AdminDashboardPage() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const roleName = user?.role === "ADMIN" ? "ADMINISTRATOR" : "OFFICER";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      /*
       * Sesuaikan endpoint dengan endpoint
       * dashboard/rack yang sudah kita buat di backend.
       */

      const [rackResponse, transactionResponse] = await Promise.all([api.get("/racks"), api.get("/transactions")]);

      setRacks(rackResponse.data.data || []);

      setTransactions(transactionResponse.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRack = racks.length;

  const occupiedRack = racks.filter((rack) => rack.status === "OCCUPIED").length;

  const availableRack = racks.filter((rack) => rack.status === "AVAILABLE").length;

  const occupancy = totalRack > 0 ? Math.round((occupiedRack / totalRack) * 100) : 0;

  const today = new Date();

  const todayTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.checkInAt);

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  });

  const activeTransactions = transactions.filter((transaction) => transaction.status === "ACTIVE").length;

  const completedTransactions = transactions.filter((transaction) => transaction.status === "COMPLETED").length;

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
    <div className="min-h-screen bg-[#eef7ff] px-5 py-10 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* ================================
            HEADER
        ================================= */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-[0.35em] text-[#2485e8]">HALO, {roleName}</p>

          <h1 className="font-serif text-4xl font-bold text-[#173477]">Dashboard Operasional</h1>
        </div>

        {/* ================================
            STATISTIC CARDS
        ================================= */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* TRANSAKSI */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Transaksi Hari Ini</p>

              <FileText size={22} className="text-[#2485e8]" />
            </div>

            <p className="mt-5 font-serif text-4xl font-bold text-[#173477]">{loading ? "..." : todayTransactions.length}</p>
          </div>

          {/* AKTIF */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Titipan Aktif</p>

              <PackageCheck size={22} className="text-[#2485e8]" />
            </div>

            <p className="mt-5 font-serif text-4xl font-bold text-[#173477]">{loading ? "..." : activeTransactions}</p>
          </div>

          {/* DIAMBIL */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Sudah Diambil</p>

              <ShieldCheck size={22} className="text-[#2485e8]" />
            </div>

            <p className="mt-5 font-serif text-4xl font-bold text-[#173477]">{loading ? "..." : completedTransactions}</p>
          </div>

          {/* OKUPANSI */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#41648f]">Okupansi Rak</p>

              <LayoutGrid size={22} className="text-[#2485e8]" />
            </div>

            <p className="mt-5 font-serif text-4xl font-bold text-[#173477]">{loading ? "..." : `${occupancy}%`}</p>
          </div>
        </div>

        {/* ================================
            DAILY REPORT
        ================================= */}

        <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-blue-200 bg-white p-7 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-serif font-bold text-[#173477]">Laporan Harian</p>

            <p className="mt-1 text-sm text-[#41648f]">Pilih tanggal untuk melihat, mencetak, atau mengunduh laporan.</p>
          </div>

          <button onClick={() => (window.location.href = "/admin/report")} className="rounded-lg bg-[#2485e8] px-6 py-3 font-semibold text-white transition hover:bg-[#173f95]">
            Buka Laporan Harian
          </button>
        </div>

        {/* ================================
            RACK MAP
        ================================= */}

        <div className="mt-8 rounded-2xl border border-blue-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="font-serif text-2xl font-bold text-[#173477]">Peta Rak Helm</h2>

            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-[#008f4c]" />
                <span className="font-semibold text-[#173477]">Available</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-[#df1627]" />
                <span className="font-semibold text-[#173477]">Occupied</span>
              </div>
            </div>
          </div>

          {/* RACK GRID */}

          {loading ? (
            <div className="py-10 text-center text-[#41648f]">Memuat data rak...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {racks.map((rack) => {
                const occupied = rack.status === "OCCUPIED";

                return (
                  <div key={rack.id} className={`rounded-xl px-3 py-5 text-center text-white ${occupied ? "bg-[#df1627]" : "bg-[#008f4c]"}`}>
                    <p className="font-bold">{rack.code}</p>

                    <p className="mt-1 text-xs">{occupied ? "Terisi" : "Kosong"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================
            RECENT TRANSACTIONS
        ================================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="p-7">
            <h2 className="font-serif text-2xl font-bold text-[#173477]">Transaksi Terbaru</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-blue-200 text-left text-sm uppercase tracking-wide text-[#41648f]">
                  <th className="px-7 py-4">Ticket ID</th>

                  <th className="px-7 py-4">Plat</th>

                  <th className="px-7 py-4">Rak</th>

                  <th className="px-7 py-4">Masuk</th>

                  <th className="px-7 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-blue-100 last:border-0">
                    <td className="px-7 py-4 font-semibold text-[#173477]">{transaction.ticketCode}</td>

                    <td className="px-7 py-4 font-bold text-[#173477]">{transaction.plateNumber}</td>

                    <td className="px-7 py-4 text-[#41648f]">Rak {transaction.rack.code}</td>

                    <td className="px-7 py-4 text-[#41648f]">{formatDate(transaction.checkInAt)}</td>

                    <td className="px-7 py-4">
                      <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${transaction.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {transaction.status === "ACTIVE" ? "Active" : "Released"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
