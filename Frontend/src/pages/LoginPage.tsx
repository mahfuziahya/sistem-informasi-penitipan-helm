import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/check-in");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f3ff] px-4 py-10">
      <div className="mx-auto w-full max-w-[580px] overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl">
        {/* HEADER LOGIN */}
        <div className="bg-[#173f95] px-8 py-7">
          <p className="mb-2 text-xs tracking-[0.35em] text-blue-200">MASUK PETUGAS</p>

          <h1 className="font-serif text-3xl font-bold text-white">SIMPAN</h1>

          <p className="mt-1 text-sm text-blue-200">Sistem Penitipan Helm berbasis QR Code</p>
        </div>

        {/* FORM */}
        <div className="px-8 py-8">
          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* USERNAME */}
            <div>
              <label className="mb-2 block text-base font-semibold text-[#173477]">Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="petugas"
                className="w-full rounded-lg border-2 border-blue-200 bg-[#eef7ff] px-5 py-4 text-base text-[#173477] outline-none transition placeholder:text-blue-300 focus:border-[#2485e8]"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-base font-semibold text-[#173477]">PIN / Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full rounded-lg border-2 border-blue-200 bg-[#eef7ff] px-5 py-4 text-base text-[#173477] outline-none transition placeholder:text-blue-300 focus:border-[#2485e8]"
                required
              />
            </div>

            {/* BUTTON */}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2485e8] py-4 text-lg font-bold text-white transition hover:bg-[#173f95] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* DEMO */}
          <div className="mt-5 rounded-lg border border-blue-200 bg-[#eef7ff] px-4 py-3 text-center text-sm text-[#41648f]">
            Akun demo: <strong>petugas / 1234</strong>
            {" · "}
            <strong>admin / admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
