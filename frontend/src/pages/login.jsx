import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../styles/login.css";

// Hard-coded owner credentials
const OWNER_CREDENTIALS = {
  username: "owner",
  password: "owner123",
  role: "owner"
};

export default function Login({ darkMode: propDarkMode, setDarkMode: propSetDarkMode }) {
  const navigate = useNavigate();
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;
  const setDarkMode = propSetDarkMode || setInternalDarkMode;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Check if credentials match owner
    if (
      formData.username === OWNER_CREDENTIALS.username &&
      formData.password === OWNER_CREDENTIALS.password
    ) {
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify({
        username: formData.username,
        role: OWNER_CREDENTIALS.role
      }));
      // Redirect to owner dashboard
      navigate("/dashboard/owner");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className={`home ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Bizit</div>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Login Section */}
      <section className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <ShieldCheck size={40} className="auth-icon" />
            </div>
            <h2>Welcome Back!</h2>
            <p className="auth-subtitle">
              Login to manage your business smarter
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="auth-btn">
              Login
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <button className="register-btn">Register</button>
          </div>
        </div>
      </section>
    </div>
  );
}
