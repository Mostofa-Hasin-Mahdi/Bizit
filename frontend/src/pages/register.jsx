import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { createUser } from "../utils/storage";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Create user account
      createUser(formData.username, formData.password, formData.email);
      
      // Redirect to login
      navigate("/login", { 
        state: { message: "Account created successfully! Please login." } 
      });
    } catch (err) {
      setError(err.message || "Failed to create account");
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

      {/* Register Section */}
      <section className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <UserPlus size={40} className="auth-icon" />
            </div>
            <h2>Create Account</h2>
            <p className="auth-subtitle">
              OWNER ACCOUNT
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="auth-btn">
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="register-btn">
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

