import "../styles/login.css";

export default function Login({ darkMode }) {
  return (
    <div className={`home ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Bizit</div>
      </header>

      {/* Login Section */}
      <section className="auth-container">
        <div className="auth-card">
          <h2>Welcome!</h2>
          <p className="auth-subtitle">
            Login to manage your business smarter
          </p>

          <form className="auth-form">
            <label>
              Username
              <input type="text" placeholder="Enter your username" />
            </label>

            <label>
              Password
              <input type="password" placeholder="Enter your password" />
            </label>

            <button type="submit" className="auth-btn">
              Login
            </button>
          </form>

          <div className="auth-footer">
            <span>Don’t have an account?</span>
            <button className="register-btn">Register</button>
          </div>
        </div>
      </section>
    </div>
  );
}
