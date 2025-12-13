import { ArrowRight, BarChart3, Boxes, TrendingUp } from "lucide-react";
import FeatureCard from "../components/FeatureCard";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="text-2xl font-bold tracking-wide">Bizit</h1>

        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>

        <button className="primary-btn">Get Started</button>
      </header>

      {/* Hero */}
      <section className="hero">
        <div>
          <h2 className="hero-title">
            Smarter Business,
            <br />
            <span className="hero-accent">Stronger Decisions</span>
          </h2>

          <p className="hero-text">
            Bizit helps you manage inventory, track profits, optimize stock
            using EOQ, and make confident business decisions.
          </p>

          <div className="hero-actions">
            <button className="primary-btn flex items-center gap-2 px-6 py-3">
              Get Started <ArrowRight size={18} />
            </button>

            <button className="secondary-btn">View Demo</button>
          </div>
        </div>

        <div className="info-card">
          <h3 className="text-xl font-semibold mb-4">Why Bizit?</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>• EOQ-based inventory optimization</li>
            <li>• Profit & COGS analytics</li>
            <li>• Supplier & cash flow insights</li>
            <li>• Multi-user business management</li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h3 className="text-3xl font-bold text-center mb-12">
            Core Capabilities
          </h3>

          <div className="feature-grid">
            <FeatureCard
              icon={<Boxes />}
              title="Inventory Optimization"
              desc="Reduce holding and ordering costs using EOQ"
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Profit Analytics"
              desc="Track margins, COGS, and profitability"
            />
            <FeatureCard
              icon={<BarChart3 />}
              title="Dashboards"
              desc="Real-time business performance insights"
            />
            <FeatureCard
              icon={<ArrowRight />}
              title="Growth Tracking"
              desc="Scale efficiently with data-driven decisions"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Bizit. All rights reserved.
      </footer>
    </div>
  );
}
