import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import CheckInPage from "./pages/CheckInPage";
import CheckOutPage from "./pages/CheckOutPage";
import TicketPage from "./pages/TiketPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DailyReportPage from "./pages/DailyReportPage";

import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* CUSTOMER TICKET */}
        <Route path="/ticket/:token" element={<TicketPage />} />

        {/* MAIN APPLICATION */}
        <Route element={<MainLayout />}>
          <Route path="/check-in" element={<CheckInPage />} />

          <Route path="/checkout" element={<CheckOutPage />} />

          <Route path="/admin" element={<AdminDashboardPage />} />

          <Route path="/admin/report" element={<DailyReportPage />} />
        </Route>

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
