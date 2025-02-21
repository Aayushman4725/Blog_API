// src/components/NavBar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NavBar.css"; // Import the CSS for the NavBar

const NavBar = () => {
  const { profile, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-title">A Cube Blog</div>
      <ul className="navbar-items">
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && (
          <li><Link to="/dashboard">Profile</Link></li>
        )}
        {!isAuthenticated && (
          <>
            <li><Link to="/signup">Signup</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
        {profile?.is_admin && (
          <li><Link to="/admin/review-comments">Comment Review</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
