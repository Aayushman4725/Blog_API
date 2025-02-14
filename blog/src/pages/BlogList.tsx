import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../BlogList.css"; // Import CSS file
import { useAuth } from "../context/AuthContext";

interface Blog {
  id: number;
  title: string;
  blog: string;
  likes: number;
}

interface Comment {
  id: number;
  comment_text: string;
  created_at: string;
}

const BlogList: React.FC = () => {
  const { isAuthenticated, user, logoutUser } = useAuth(); // Use useAuth for authentication status
  const [blogs, setBlogs] = useState<Blog[]>([]); // List of blogs
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({}); // Map of comment inputs per blog
  const [commentsMap, setCommentsMap] = useState<{ [key: number]: Comment[] }>({}); // Map of comments for each blog
  const [likesMap, setLikesMap] = useState<{ [key: number]: number }>({}); // Store the current like count for each blog
  const navigate = useNavigate();

  // Fetch blog list
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/blog/blog_list/")
      .then((response) => {
        setBlogs(response.data);
        setLoading(false);
        // Initialize likesMap with the initial like count
        const initialLikes = response.data.reduce((acc: { [key: number]: number }, blog: Blog) => {
          acc[blog.id] = blog.likes;
          return acc;
        }, {});
        setLikesMap(initialLikes);

        // Fetch comments for each blog
        response.data.forEach((blog: Blog) => {
          fetchComments(blog.id);
        });
      })
      .catch(() => {
        setError("Error fetching blogs");
        setLoading(false);
      });
  }, []);

  // Fetch comments for a specific blog
  const fetchComments = (blogId: number) => {
    axios
      .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`)
      .then((response) => {
        // Get the latest comment by sorting the comments based on creation date
        const latestComment = response.data.sort((a: Comment, b: Comment) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })[0]; // Get the most recent comment
  
        setCommentsMap((prev) => ({
          ...prev,
          [blogId]: latestComment ? [latestComment] : [], // Store only the most recent comment
        }));
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };
  

  // Post a comment for a specific blog
  const postComment = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    if (!token) {
      navigate("/login"); // If no token, redirect to login
      return;
    }

    // Check if the comment input is valid
    if (!commentInputs[blogId]?.trim()) {
      console.error("Comment is empty");
      return; // Don't post an empty comment
    }

    // Send the comment to the API
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`,
        { comment_text: commentInputs[blogId] }, // Payload
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in header
          },
        }
      )
      .then((response) => {
        setCommentInputs((prev) => ({ ...prev, [blogId]: "" })); // Clear the input for this blog
        fetchComments(blogId); // Reload comments for this specific blog
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        if (error.response) {
          console.log(error.response.data); // Log the backend error response
        }
      });
  };

  const handleLike = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if the user is not authenticated
      return;
    }
  
    const token = localStorage.getItem("access") || user?.token;
  
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/like/`,
        {}, // Empty payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // After the like action, fetch the updated like count for this blog
        axios
          .get(`http://127.0.0.1:8000/api/blog/blog_list/`)
          .then((response) => {
            // Update the blogs state with the updated like counts
            const updatedBlogs = response.data.map((blog: Blog) => {
              if (blog.id === blogId) {
                return { ...blog, likes: blog.likes }; // Ensure the like count is updated
              }
              return blog;
            });
            setBlogs(updatedBlogs);
  
            // Optionally, update the likesMap if needed
            setLikesMap((prev) => ({
              ...prev,
              [blogId]: updatedBlogs.find((b) => b.id === blogId)?.likes || 0,
            }));
          })
          .catch((error) => {
            console.error("Error fetching updated like count:", error);
          });
      })
      .catch((error) => {
        console.error("Error liking blog:", error);
      });
  };
  
  const handleUnlike = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  
    const token = localStorage.getItem("access") || user?.token;
  
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/like/`,
        {}, // Empty payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // After the unlike action, fetch the updated like count for this blog
        axios
          .get(`http://127.0.0.1:8000/api/blog/blog_list/`)
          .then((response) => {
            // Update the blogs state with the updated like counts
            const updatedBlogs = response.data.map((blog: Blog) => {
              if (blog.id === blogId) {
                return { ...blog, likes: blog.likes }; // Ensure the like count is updated
              }
              return blog;
            });
            setBlogs(updatedBlogs);
  
            // Optionally, update the likesMap if needed
            setLikesMap((prev) => ({
              ...prev,
              [blogId]: updatedBlogs.find((b) => b.id === blogId)?.likes || 0,
            }));
          })
          .catch((error) => {
            console.error("Error fetching updated like count:", error);
          });
      })
      .catch((error) => {
        console.error("Error unliking blog:", error);
      });
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="blog-container">
      <h1>Blog List</h1>
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
              <h2>
                <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
              </h2>
              <p>{blog.blog}</p>
              <button onClick={() => handleLike(blog.id)}>Like</button>
              <p>{likesMap[blog.id] || blog.likes}</p> {/* Display the real-time like count */}
              <div className="comment-section">
              <h3>Comments:</h3>
              <div className="comments-list">
                {/* Display only the most recent comment */}
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
                placeholder="Write your comment"
              ></textarea>
              <button onClick={() => postComment(blog.id)}>Post Comment</button>
            </div>
            </motion.div>
          ))
        ) : (
          <p>No blogs available</p>
        )}
      </div>
    </div>
  );
};

export default BlogList;
