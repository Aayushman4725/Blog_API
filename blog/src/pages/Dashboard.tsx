import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaUserCircle } from "react-icons/fa";
import "../styles/Dashboard.css"; // Import CSS file for styling
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { profile, logoutUser, loading, user } = useAuth();
  const [activeSection, setActiveSection] = useState<"profile" | "blog">("profile");
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<any>(null);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");

  // Fetch user's blogs
  useEffect(() => {
    fetchUserBlogs();
  }, [activeSection, user]);

  const fetchUserBlogs = async () => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/blog/blog_list_user/user/", {
        headers: {
          Authorization: `Bearer ${token}`, // Corrected syntax
        },
      });
      setUserBlogs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
    }
  };

  // Handle blog creation
  const handleCreateBlog = async () => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/blog/create/",
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Corrected syntax
          },
        }
      );
      setShowCreateModal(false);
      setNewBlogTitle("");
      setNewBlogContent("");
      fetchUserBlogs(); // Refresh the blog list
    } catch (error) {
      console.error("Error creating blog:", error);
    }
  };

  // Handle blog update
  const handleUpdateBlog = async () => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/blog/edit/${currentBlog.id}/`, // Corrected syntax
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Corrected syntax
          },
        }
      );
      setShowEditModal(false);
      setNewBlogTitle("");
      setNewBlogContent("");
      fetchUserBlogs(); // Refresh the blog list
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  // Handle blog deletion
  const handleDeleteBlog = async (blogId: number) => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/blog/delete/${blogId}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Corrected syntax
        },
      });
      fetchUserBlogs(); // Refresh the blog list
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  // Ensure full URL for the profile picture
  const profilePictureUrl = profile?.profile_picture
    ? `http://127.0.0.1:8000${profile.profile_picture}` // Corrected syntax
    : "media/images/profile_picture/default-avatar.jpg";

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button
          className={`sidebar-button ${activeSection === "profile" ? "active" : ""}`} // Corrected syntax
          onClick={() => setActiveSection("profile")}
        >
          Profile
        </button>
        <button
          className={`sidebar-button ${activeSection === "blog" ? "active" : ""}`} // Corrected syntax
          onClick={() => setActiveSection("blog")}
        >
          Blog
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "profile" ? (
          <div className="profile-section">
            <h1>Welcome to your Dashboard</h1>
            {profile ? (
              <div className="profile-info">
                <h2>Your Profile</h2>
                <img src={profilePictureUrl} alt="Profile" width="100" height="100" />
                <p>Name: {profile.user || "N/A"}</p>
                <p>Email: {profile.email || "N/A"}</p>
                <p>Phone Number: {profile.phone_number || "Not provided"}</p>
                <p>About: {profile.about || "No information available"}</p>
              </div>
            ) : (
              <p>Profile not available</p>
            )}
            <button className="logout-button" onClick={logoutUser}>
              Logout
            </button>
          </div>
        ) : (
          <div className="blog-section">
            <h1>Your Blogs</h1>
            <button className="create-blog-button" onClick={() => setShowCreateModal(true)}>
              <FaPlus /> Create Blog
            </button>
            {userBlogs.length > 0 ? (
              userBlogs.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <div className="blog-header">
                    <FaUserCircle size={24} />
                    <h2>
                      <Link to={`/blogs/${blog.id}`}>{blog.title}</Link> {/* Corrected syntax */}
                    </h2>
                  </div>
                  <div className="blog-content">
                    <p>{blog.blog}</p>
                  </div>
                  <div className="blog-actions">
                    <button
                      onClick={() => {
                        setCurrentBlog(blog);
                        setNewBlogTitle(blog.title);
                        setNewBlogContent(blog.blog);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDeleteBlog(blog.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No blogs available</p>
            )}
          </div>
        )}
      </div>

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Blog</h2>
            <input
              type="text"
              placeholder="Title"
              value={newBlogTitle}
              onChange={(e) => setNewBlogTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              value={newBlogContent}
              onChange={(e) => setNewBlogContent(e.target.value)}
            ></textarea>
            <div className="modal-buttons">
              <button onClick={handleCreateBlog}>Create</button>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && currentBlog && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Blog</h2>
            <input
              type="text"
              placeholder="Title"
              value={newBlogTitle}
              onChange={(e) => setNewBlogTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              value={newBlogContent}
              onChange={(e) => setNewBlogContent(e.target.value)}
            ></textarea>
            <div className="modal-buttons">
              <button onClick={handleUpdateBlog}>Update</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
