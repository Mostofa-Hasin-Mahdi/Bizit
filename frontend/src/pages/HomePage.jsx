import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import "../styles/homepage.css";

const HomePage = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <div className={darkMode ? "home dark" : "home"}>
      <Navbar darkMode={darkMode} setDarkMode={toggleDarkMode} />

      {/* Hero */}
      <section className="hero">
        <h2>
          Smarter Business,
          <span> Stronger Decisions</span>
        </h2>
        <p>
          An intelligent business management platform built for modern SMEs.
        </p>
        <button className="primary-btn" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </section>

      {/* Why Bizit */}
      <section className="why-bizit">
        <div className="why-text">
          <h2>Why Bizit?</h2>
          <p>
            Bizit unifies inventory, sales, suppliers, and analytics into one
            intelligent system — helping SMEs make confident, data-driven
            decisions without expensive ERP software.
          </p>
        </div>

        <div className="why-card">
          <h3>All-in-One Business Intelligence</h3>
          <p>
            EOQ optimization, profit analysis, supplier scoring, and financial
            clarity — all in one place.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <FeatureCard
          type="auth"
          title="User Authentication"
          description="Secure role-based access for teams."
        />
        <FeatureCard
          type="inventory"
          title="Inventory Management"
          description="EOQ optimization and stock efficiency tracking."
        />
        <FeatureCard
          type="sales"
          title="Sales & Expenses"
          description="Real-time revenue, cost, and profit visibility."
        />
        <FeatureCard
          type="supplier"
          title="Supplier Management"
          description="Performance-based supplier evaluation."
        />
        <FeatureCard
          type="analytics"
          title="Analytics Engine"
          description="ITR, P&L, and profit margin dashboards."
        />
      </section>

      <footer className="footer">
        <p>© 2025 Bizit</p>
      </footer>
    </div>
  );
};

export default HomePage;
//random comment