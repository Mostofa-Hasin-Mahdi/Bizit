import "../styles/homepage.css";
import { useNavigate } from "react-router-dom";


const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <h1 className="logo">Bizit</h1>

      <div className="nav-actions">
        <button className="nav-btn" onClick={() => navigate("/login")} >Login</button>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
