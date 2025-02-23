import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaThumbsUp, FaComment, FaUserCircle } from "react-icons/fa"; // Icons for edit, delete, like, and comment
import "../styles/BlogDetail.css"; // Import the updated CSS file
import "../styles/CreateBlogModal.css"
import "../styles/EditBlogModal.css"

interface Comment {
  id: number;
  comment_text: string;
  created_at: string;
}

interface Blog {
  id: number;
  title: string;
  blog: string;
  likes: number;
  user: {
    id: number;
  };
}

const BlogDetail: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { blogId } = useParams<{ blogId: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [translatedContent, setTranslatedContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (blogId) {
      fetchBlogDetails();
      fetchComments();
    }
  }, [blogId]);

  const fetchBlogDetails = () => {
    axios
      .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/`)
      .then((response) => {
        setBlog(response.data);
        setLikes(response.data.likes);
        setEditTitle(response.data.title);
        setEditContent(response.data.blog);
      })
      .catch((error) => {
        console.error("Error fetching blog details:", error);
      });
  };

  const fetchComments = () => {
    axios
      .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

  const handleLike = () => {
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
        fetchBlogDetails();
      })
      .catch((error) => {
        console.error("Error liking blog:", error);
      });
  };

  const postComment = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    if (!commentInput.trim()) {
      alert("Please enter a valid comment.");
      return;
    }

    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`,
        { comment_text: commentInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setCommentInput("");
        fetchComments();
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      alert("Please select a language.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/translate/`,
        { language: selectedLanguage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access") || user?.token}`,
          },
        }
      );
      setTranslatedContent(response.data.translated_content);
    } catch (error) {
      console.error("Error translating blog:", error);
      alert("Translation failed. Please try again.");
    }
  };

  const handleEditBlog = () => {
    if (!isAuthenticated || !blog || blog.user.id !== user?.id) {
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    axios
      .put(
        `http://127.0.0.1:8000/api/blog/edit/${blogId}/`,
        { title: editTitle, blog: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setShowEditModal(false);
        fetchBlogDetails();
      })
      .catch((error) => {
        console.error("Error updating blog:", error);
      });
  };

  const handleDeleteBlog = () => {
    if (!isAuthenticated || !blog || blog.user.id !== user?.id) {
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
        navigate("/");
      })
      .catch((error) => {
        console.error("Error deleting blog:", error);
      });
  };

  if (!blog) {
    return <p>Loading...</p>;
  }

  return (
    <div className="blog-detail-container">
      <motion.div
        className="blog-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Blog Header */}
        <div className="blog-header">
          <FaUserCircle size={32} />
          <h1>{blog.title}</h1>
        </div>

        {/* Blog Content */}
        <div className="blog-content">
          <p>{blog.blog}</p>
          {translatedContent && (
            <div className="translated-content">
              <h3>Translated Content:</h3>
              <p>{translatedContent}</p>
            </div>
          )}
        </div>

        {/* Translation Section */}
        <div className="translation-section">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
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
          <button onClick={handleTranslate}>Translate</button>
        </div>

        {/* Like Section */}
        <div className="like-section">
          <button onClick={handleLike}>
            <FaThumbsUp /> Like
          </button>
          <p>{likes} Likes</p>
        </div>

        {/* Edit and Delete Buttons (for blog owner) */}
        {blog.user.id === user?.id && (
          <div className="blog-actions">
            <button onClick={() => setShowEditModal(true)}>
              <FaEdit /> Edit
            </button>
            <button onClick={handleDeleteBlog}>
              <FaTrash /> Delete
            </button>
          </div>
        )}

        {/* Comment Section inside Blog Card */}
        <div className="comment-section">
          <h3><FaComment /> Comments:</h3>
          <div className="comments-list">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                className="comment-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p>{comment.comment_text}</p>
                <small>{comment.created_at}</small>
              </motion.div>
            ))}
          </div>
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={postComment}>
            <FaComment /> Post Comment
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Blog</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Content"
            />
            <div className="modal-buttons">
              <button onClick={handleEditBlog}>Save</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
