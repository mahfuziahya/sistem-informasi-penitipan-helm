import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");

  let user: {
    role?: "ADMIN" | "OFFICER";
  } | null = null;

  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#173f95] shadow-md">
      <div className="mx-auto flex min-h-[88px] max-w-[1450px] items-center justify-between px-6 lg:px-10">
        {/* LOGO */}
        <Link to={user?.role === "ADMIN" ? "/admin" : "/check-in"} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2485e8] text-2xl font-bold text-white">S</div>

          <div>
            <h1 className="font-serif text-2xl font-bold tracking-wide text-white">SIMPAN</h1>

            <p className="text-[11px] tracking-[0.28em] text-blue-200">HELM · QR</p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2">
          <Link to="/check-in" className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${isActive("/check-in") ? "bg-[#2485e8] text-white" : "text-blue-100 hover:bg-blue-800"}`}>
            Check-In
          </Link>

          <Link to="/checkout" className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${isActive("/checkout") ? "bg-[#2485e8] text-white" : "text-blue-100 hover:bg-blue-800"}`}>
            Check-Out
          </Link>

          {user?.role === "ADMIN" && (
            <Link to="/admin" className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${isActive("/admin") ? "bg-[#2485e8] text-white" : "text-blue-100 hover:bg-blue-800"}`}>
              Dashboard
            </Link>
          )}

          <button type="button" onClick={handleLogout} className="ml-2 rounded-lg border border-blue-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#173f95]">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
