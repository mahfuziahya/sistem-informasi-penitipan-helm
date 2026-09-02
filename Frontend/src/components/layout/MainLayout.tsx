import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#eef7ff]">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
