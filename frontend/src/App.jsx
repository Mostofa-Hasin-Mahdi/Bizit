import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/login";
import OwnerDashboard from "./pages/OwnerDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/owner" element={<OwnerDashboard />} />
    </Routes>
  );
}

export default App;
