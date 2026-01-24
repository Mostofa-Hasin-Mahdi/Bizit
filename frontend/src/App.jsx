import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homepage";
import Login from "./pages/login";
import Register from "./pages/register";
import OwnerDashboard from "./pages/OwnerDashboard";
import StockDashboard from "./pages/StockDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import ProfitLossDashboard from "./pages/ProfitLossDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard/owner" element={<OwnerDashboard />} />
      <Route path="/dashboard/stock" element={<StockDashboard />} />
      <Route path="/dashboard/sales" element={<SalesDashboard />} />
      <Route path="/dashboard/profit-loss" element={<ProfitLossDashboard />} />
    </Routes>
  );
}

export default App;
