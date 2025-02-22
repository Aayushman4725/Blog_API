// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import ActivateAccount from "./pages/ActivateAccount";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BlogList from "./pages/BlogList";
import AdminCommentReview from "./pages/AdminCommentReview";
import BlogDetail from "./pages/BlogDetail";
import "./styles/App.css";
import NavBar from "./components/NavBar"; // Import the NavBar component
import { useAuth } from "./context/AuthContext";

function App() {
  const { profile } = useAuth(); // Get user profile

  // ✅ Show loading state if profile is not yet available
  if (profile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <NavBar /> {/* Use the NavBar component */}

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
