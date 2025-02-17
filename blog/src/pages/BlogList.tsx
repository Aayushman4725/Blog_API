import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../BlogList.css"; // Import CSS file
import { useAuth } from "../context/AuthContext";
 // Icons for edit, delete, and create
 import { FaThumbsUp, FaComment, FaEdit, FaTrash, FaPlus, FaUserCircle } from "react-icons/fa";
// Define the User interface
interface User {
  id: number;
  // Add other fields if needed, e.g., username, email, etc.
}

// Define the Blog interface
interface Blog {
  id: number;
  title: string;
  blog: string;
  translated_content:string;
  likes: number;
  user: User; // user is now an object of type User
  user_name: string;
  created_at: string;
}

interface Comment {
  id: number;
  comment_text: string;
  created_at: string;
}

const BlogList: React.FC = () => {
  const { isAuthenticated, user,profile, logoutUser } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [commentsMap, setCommentsMap] = useState<{ [key: number]: Comment[] }>({});
  const [likesMap, setLikesMap] = useState<{ [key: number]: number }>({});
  const [showCreateModal, setShowCreateModal] = useState(false); // State for create modal
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null); // Current blog for editing
  const [newBlogTitle, setNewBlogTitle] = useState(""); // New blog title
  const [newBlogContent, setNewBlogContent] = useState(""); // New blog content
  const navigate = useNavigate();
  const [translatedContent, setTranslatedContent] = useState<{ [key: number]: string }>({}); // Store translated content for each blog
const [selectedLanguage, setSelectedLanguage] = useState<{ [key: number]: string }>({}); // Store selected language for each blog
const loggedInUserId = user?.id;
  // Fetch blog list
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    axios
      .get("http://127.0.0.1:8000/api/blog/blog_list/")
      .then((response) => {
        setBlogs(response.data);
        setLoading(false);
        const initialLikes = response.data.reduce((acc: { [key: number]: number }, blog: Blog) => {
          acc[blog.id] = blog.likes;
          return acc;
        }, {});
        setLikesMap(initialLikes);

        response.data.forEach((blog: Blog) => {
          fetchComments(blog.id);
        });
      })
      .catch(() => {
        setError("Error fetching blogs");
        setLoading(false);
      });
  };

  // Fetch comments for a specific blog
  const fetchComments = (blogId: number) => {
    axios
      .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`)
      .then((response) => {
        const latestComment = response.data.sort((a: Comment, b: Comment) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })[0];

        setCommentsMap((prev) => ({
          ...prev,
          [blogId]: latestComment ? [latestComment] : [],
        }));
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

  // Post a comment for a specific blog
  const postComment = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    if (!token) {
      navigate("/login");
      return;
    }

    if (!commentInputs[blogId]?.trim()) {
      console.error("Comment is empty");
      return;
    }

    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`,
        { comment_text: commentInputs[blogId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setCommentInputs((prev) => ({ ...prev, [blogId]: "" }));
        fetchComments(blogId);
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        if (error.response) {
          console.log(error.response.data);
        }
      });
  };

  // Handle like/unlike
  const handleLike = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        fetchBlogs(); // Refresh the blog list to update like counts
      })
      .catch((error) => {
        console.error("Error liking blog:", error);
      });
  };

  // Handle blog creation
  const handleCreateBlog = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    axios
      .post(
        "http://127.0.0.1:8000/api/blog/create/",
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        setShowCreateModal(false);
        setNewBlogTitle("");
        setNewBlogContent("");
        fetchBlogs(); // Refresh the blog list
      })
      .catch((error) => {
        console.error("Error creating blog:", error);
      });
  };

  // Handle blog update
  const handleUpdateBlog = () => {
    if (!isAuthenticated || !currentBlog) {
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    axios
      .put(
        `http://127.0.0.1:8000/api/blog/edit/${currentBlog.id}/`,
        { title: newBlogTitle, blog: newBlogContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setShowEditModal(false);
        setNewBlogTitle("");
        setNewBlogContent("");
        fetchBlogs(); // Refresh the blog list
      })
      .catch((error) => {
        console.error("Error updating blog:", error);
      });
  };

  // Handle blog deletion
  const handleDeleteBlog = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    axios
      .delete(`http://127.0.0.1:8000/api/blog/delete/${blogId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchBlogs(); // Refresh the blog list
      })
      .catch((error) => {
        console.error("Error deleting blog:", error);
      });
  };

  const handleTranslate = async (blogId: number, text: string) => {
    const language = selectedLanguage[blogId];
    if (!language) {
      alert("Please select a language.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/translate/`, // Include blog ID in the URL
        { language }
      );
  
      setTranslatedContent((prev) => ({
        ...prev,
        [blogId]: response.data.translated_content, // Assuming the API returns { translated_text: "..." }
      }));
    } catch (error) {
      console.error("Error translating blog:", error);
      alert("Translation failed. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="blog-container">
      <h1>Blog List</h1>
      <button className="create-blog-button" onClick={() => setShowCreateModal(true)}>
        <FaPlus /> Create Blog
      </button>
      <div className="blog-list">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <motion.div
              key={blog.id}
              className="blog-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
           <div className="blog-card">
  {/* Header */}
  <div className="blog-header">
    <FaUserCircle size={24} />
    <h2>
      <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
    </h2>
  </div>

  {/* Content */}
  <div className="blog-content">
    <p>{blog.blog}</p>
    <p>Posted by: {blog.user_name}</p>
     <p>Posted {blog.created_at}</p>
    {translatedContent[blog.id] && (
      <p>Translated content: {translatedContent[blog.id]}</p>
    )}
  </div>

  {/* Actions */}
  <div className="blog-actions">
    <button className="like-button" onClick={() => handleLike(blog.id)}>
      <FaThumbsUp /> {likesMap[blog.id] || blog.likes}
    </button>
    

    {blog.user == profile.userId && (
  <div className="blog-actions">
    <button
      onClick={() => {
        setCurrentBlog(blog); // Set the current blog
        setNewBlogTitle(blog.title); // Pre-populate the title
        setNewBlogContent(blog.blog); // Pre-populate the content
        setShowEditModal(true); // Open the modal
      }}
    >
      <FaEdit /> Edit
    </button>
    <button onClick={() => handleDeleteBlog(blog.id)}>
      <FaTrash /> Delete
    </button>
  </div>
)}
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
    <button onClick={() => handleTranslate(blog.id, blog.blog)}>Translate</button>
  </div>
{/* Comments Section */}
<div className="comment-section">
    <h3><FaComment /> Comments:</h3>
    <div className="comments-list">
      {commentsMap[blog.id]?.map((comment) => (
        <div key={comment.id} className="comment-card">
          <p>{comment.comment_text}</p>
          <small>{comment.created_at}</small>
        </div>
      ))}
    </div>
    <textarea
      value={commentInputs[blog.id] || ""}
      onChange={(e) =>
        setCommentInputs((prev) => ({
          ...prev,
          [blog.id]: e.target.value,
        }))
      }
      placeholder="Write your comment..."
    ></textarea>
    <button onClick={() => postComment(blog.id)}>
      <FaComment /> Post Comment
    </button>
  </div>
</div>


            </motion.div>
          ))
        ) : (
          <p>No blogs available</p>
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
        maxLength={5000}  // Ensure this matches the backend limit
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

export default BlogList;