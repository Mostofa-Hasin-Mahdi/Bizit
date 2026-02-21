import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { loginUser } from "../utils/api";
import { setCurrentUser, setCurrentOrganization } from "../utils/storage";
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
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const { user } = await loginUser({
        username: formData.username,
        password: formData.password
      });

      // Store user info in localStorage
      setCurrentUser(user);

      // Update organizations list in localStorage to include the backend-provided org
      if (user.org_id) {
        const orgInfo = {
          id: user.org_id,
          name: user.org_name || "My Organization",
          ownerId: user.id // Essential for Owner Selector to find it
        };

        const currentOrgs = JSON.parse(localStorage.getItem('organizations') || '[]');
        const orgExists = currentOrgs.find(o => o.id === user.org_id);

        if (!orgExists) {
          currentOrgs.push(orgInfo);
          localStorage.setItem('organizations', JSON.stringify(currentOrgs));
        }

        // Only auto-select organization for Admins and Employees
        // Owners will see the Selector screen 
        if (user.role !== "owner") {
          setCurrentOrganization(orgInfo);
          console.log("DEBUG: Set organization", orgInfo);
        }
      }

      // Redirect based on role
      if (user.role === "owner" || user.role === "admin") {
        console.log("DEBUG: Redirecting to owner dashboard");
        navigate("/dashboard/owner");
      } else if (user.role === "employee") {
        if (user.department === "sales") {
          console.log("DEBUG: Redirecting to sales dashboard");
          navigate("/dashboard/sales");
        } else {
          console.log("DEBUG: Redirecting to stock dashboard");
          navigate("/dashboard/stock");
        }
      } else {
        console.log("DEBUG: Stay on login");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
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

            <button type="submit" className="auth-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
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
