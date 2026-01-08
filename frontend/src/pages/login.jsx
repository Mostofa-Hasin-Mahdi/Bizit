import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { authenticateUser, setCurrentUser } from "../utils/storage";
import { useDarkMode } from "../contexts/DarkModeContext";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
    setSuccessMessage(""); // Clear success message on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Authenticate user
    const user = authenticateUser(formData.username, formData.password);
    
    if (user) {
      // Store user info in localStorage
      setCurrentUser(user);
      
      // For admins, set their organization automatically
      if (user.role === "admin" && user.organizationId) {
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const userOrg = organizations.find(o => o.id === user.organizationId);
        if (userOrg) {
          localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
        }
      }
      
      // Redirect based on role
      if (user.role === "owner" || user.role === "admin") {
        navigate("/dashboard/owner");
      } else if (user.role === "employee") {
        // Set organization for employees
        if (user.organizationId) {
          const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
          const userOrg = organizations.find(o => o.id === user.organizationId);
          if (userOrg) {
            localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
          }
        }
        // Redirect based on department
        if (user.department === "stock") {
          navigate("/dashboard/stock");
        } else if (user.department === "sales") {
          navigate("/dashboard/sales");
        } else {
          navigate("/dashboard/owner");
        }
      } else {
        navigate("/login");
      }
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className={`home ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="navbar">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>Bizit</Link>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
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

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

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
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
