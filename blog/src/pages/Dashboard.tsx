import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaUserCircle, FaSave } from "react-icons/fa"; // Added FaSave for save button
import "../Dashboard.css"; // Import CSS file for styling
import { Link } from "react-router-dom";
import "../BlogList.css";

const Dashboard = () => {
  const { profile, logoutUser, loading, user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<"profile" | "blog">(
    "profile"
  );
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<any>(null);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<{
    [key: number]: string;
  }>({});
  const [translatedContent, setTranslatedContent] = useState<{
    [key: number]: string;
  }>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false); // State for profile edit mode
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    phone_number: "",
    about: "",
    profile_picture: null as File | null, // Add profile_picture field
  });

  // Fetch user's blogs
  useEffect(() => {
    if (activeSection === "blog") {
      fetchUserBlogs();
    }
  }, [activeSection, user]);

  // Initialize editedProfile when profile data is available
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.user || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        about: profile.about || "",
        profile_picture: null, // Initialize profile_picture as null
      });
    }
  }, [profile]);

  const fetchUserBlogs = async () => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/blog/blog_list_user/user/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserBlogs(response.data);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
    }
  };

  // Handle profile update
  // Handle profile update
  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("access") || user?.token;

    const formData = new FormData();
    formData.append("user[username]", editedProfile.name); // Update username
    formData.append("phone_number", editedProfile.phone_number);
    formData.append("about", editedProfile.about);

    if (editedProfile.profile_picture) {
      formData.append("profile_picture", editedProfile.profile_picture); // Append profile picture
    }

    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/user/profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Set content type for file upload
          },
        }
      );

      // Update the profile in the frontend state
      updateProfile(response.data);
      setIsEditingProfile(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setEditedProfile({
        ...editedProfile,
        profile_picture: e.target.files[0],
      });
    }
  };

  // Handle blog creation
  const handleCreateBlog = async () => {
    // Validate title and content
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      alert("Title and content cannot be empty.");
      return;
    }
    if (newBlogContent.length > 5000) {
      alert("Cannot be more than 116 characters");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/blog/create/",
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowCreateModal(false);
      setNewBlogTitle("");
      setNewBlogContent("");
      fetchUserBlogs(); // Refresh the blog list
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    }
  };

  // Handle blog update
  const handleUpdateBlog = async () => {
    const token = localStorage.getItem("access") || user?.token;

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/blog/edit/${currentBlog.id}/`,
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUserBlogs(); // Refresh the blog list
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleTranslate = async (blogId: number, text: string) => {
    const language = selectedLanguage[blogId];
    if (!language) {
      alert("Please select a language.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/translate/`,
        { language }
      );
      setTranslatedContent((prev) => ({
        ...prev,
        [blogId]: response.data.translated_content,
      }));
    } catch (error) {
      console.error("Error translating blog:", error);
      alert("Translation failed. Please try again.");
    }
  };

  // Ensure full URL for the profile picture
  const profilePictureUrl = profile?.profile_picture
    ? `http://127.0.0.1:8000${profile.profile_picture}`
    : "media/images/profile_picture/default-avatar.jpg";

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button
          className={`sidebar-button ${
            activeSection === "profile" ? "active" : ""
          }`}
          onClick={() => setActiveSection("profile")}
        >
          Profile
        </button>
        <button
          className={`sidebar-button ${
            activeSection === "blog" ? "active" : ""
          }`}
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
                <div className="profile-header">
                  <h2>Your Profile</h2>
                  <button
                    className="edit-profile-button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <FaEdit /> {isEditingProfile ? "Cancel" : "Edit"}
                  </button>
                </div>
                <img
                  src={
                    editedProfile.profile_picture
                      ? URL.createObjectURL(editedProfile.profile_picture)
                      : profilePictureUrl
                  }
                  alt="Profile"
                  width="100"
                  height="100"
                />
                {isEditingProfile ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleProfileUpdate();
                    }}
                  >
                    <label>
                      Phone Number:
                      <input
                        type="text"
                        value={editedProfile.phone_number}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            phone_number: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      About:
                      <textarea
                        value={editedProfile.about}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            about: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      Profile Picture:
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                    <button type="submit" className="save-profile-button">
                      <FaSave /> Save
                    </button>
                  </form>
                ) : (
                  <>
                    <p>Name: {profile.user || "N/A"}</p>
                    <p>Email: {profile.email || "N/A"}</p>
                    <p>
                      Phone Number: {profile.phone_number || "Not provided"}
                    </p>
                    <p>About: {profile.about || "No information available"}</p>
                  </>
                )}
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
            <button
              className="create-blog-button"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Create Blog
            </button>
            {userBlogs.length > 0 ? (
              userBlogs.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <div className="blog-header">
                    <FaUserCircle size={24} />
                    <h2>
                      <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                    </h2>
                  </div>
                  <div className="blog-content">
                    <p>{blog.blog}</p>
                    <p>Posted by: {blog.user_name}</p>
                    <p>Posted {blog.created_at}</p>
                    {translatedContent[blog.id] && (
                      <p>Translated content: {translatedContent[blog.id]}</p>
                    )}
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
                  {/* Translation Section */}
                  <div className="translation-section">
                    <select
                      value={selectedLanguage[blog.id] || ""}
                      onChange={(e) =>
                        setSelectedLanguage((prev) => ({
                          ...prev,
                          [blog.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Language</option>
                      <option value="de">German</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="it">Italian</option>
                      <option value="zh-cn">Chinese (Simplified)</option>
                      <option value="ar">Arabic</option>
                      <option value="ru">Russian</option>
                      <option value="nl">Dutch</option>
                      <option value="hi">Hindi</option>
                      <option value="sv">Swedish</option>
                      <option value="da">Danish</option>
                      <option value="fi">Finnish</option>
                      <option value="cs">Czech</option>
                      <option value="he">Hebrew</option>
                      <option value="bg">Bulgarian</option>
                      <option value="uk">Ukrainian</option>
                      <option value="ro">Romanian</option>
                      <option value="id">Indonesian</option>
                      <option value="ms">Malay</option>
                      <option value="th">Thai</option>
                      <option value="vi">Vietnamese</option>
                      <option value="no">Norwegian</option>
                      <option value="hu">Hungarian</option>
                      <option value="lt">Lithuanian</option>
                      <option value="lv">Latvian</option>
                      <option value="et">Estonian</option>
                      <option value="sk">Slovak</option>
                      <option value="sl">Slovenian</option>
                      <option value="el">Greek</option>
                      <option value="sw">Swahili</option>
                    </select>
                    <button onClick={() => handleTranslate(blog.id, blog.blog)}>
                      Translate
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
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
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
              maxLength={5000} // Ensure this matches the backend limit
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
