import "../styles/homepage.css";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const { darkMode: contextDarkMode, toggleDarkMode } = useDarkMode();
  // Use context dark mode if available, otherwise fall back to prop (for backward compatibility)
  const isDarkMode = darkMode !== undefined ? darkMode : contextDarkMode;
  const handleToggle = setDarkMode || toggleDarkMode;
  
  return (
    <nav className="navbar">
      <h1 className="logo">Bizit</h1>

      <div className="nav-actions">
        <button className="nav-btn" onClick={() => navigate("/login")} >Login</button>
        <button
          className="theme-toggle"
          onClick={handleToggle}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
