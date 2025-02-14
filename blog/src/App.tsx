import { Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup";
import ActivateAccount from "./pages/ActivateAccount";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BlogList from "./pages/BlogList";
import AdminCommentReview from "./pages/AdminCommentReview";
import BlogDetail from "./pages/BlogDetail";
import "./App.css";
import { useAuth } from "./context/AuthContext";

function App() {
  const { profile, isAuthenticated } = useAuth(); // Get user profile

  // ✅ Show loading state if profile is not yet available
  if (profile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <h1>Welcome to My App</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {isAuthenticated && (
            <>
          <li><Link to="/dashboard">Profile</Link></li>
          </>
          )}
          {!isAuthenticated && (
            <>
              <li><Link to="/signup">Signup</Link></li>
              <li><Link to="/login">Login</Link></li>
            </>
          )}
          {/* <li><Link to="/blogs">Blogs</Link></li> */}
          {profile?.is_admin && (
            <li><Link to="/admin/review-comments">Comment Review</Link></li>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
        <Route path="/blogs/:blogId" element={<BlogDetail />} />
        {profile?.is_admin && (
          <Route path="/admin/review-comments" element={<AdminCommentReview />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
