import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

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
}

const BlogDetail: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { blogId } = useParams<{ blogId: string }>(); // Get the blogId from the URL params
  const [blog, setBlog] = useState<Blog | null>(null); // State for single blog
  const [comments, setComments] = useState<Comment[]>([]); // State for all comments of the blog
  const [commentInput, setCommentInput] = useState(""); // State for comment input
  const [likes, setLikes] = useState(0); // State for like count
  const navigate = useNavigate();
  const [likesMap, setLikesMap] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (blogId) {
      // Fetch blog details by ID
      axios
        .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/`)
        .then((response) => {
          setBlog(response.data);
          setLikes(response.data.likes); // Set initial like count
        })
        .catch((error) => {
          console.error("Error fetching blog details:", error);
        });

      // Fetch all comments for this specific blog
      axios
        .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`)
        .then((response) => {
          setComments(response.data); // Set comments for this blog
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
        });
    }
  }, [blogId]);

  const handleLike = (blogId: number) => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if the user is not authenticated
      return;
    }
  
    const token = localStorage.getItem("access") || user?.token;
  
    // Send the like request to the API (whether it's to like or unlike, backend handles it)
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
        // Fetch the updated blog data after liking/unliking
        axios
          .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/`)
          .then((response) => {
            const updatedBlog = response.data;
            setLikes(updatedBlog.likes); // Update the likes count from the backend response
          })
          .catch((error) => {
            console.error("Error fetching updated blog data:", error);
          });
      })
      .catch((error) => {
        console.error("Error liking/unliking blog:", error);
      });
  };
  
  

  const postComment = () => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    if (!commentInput.trim()) {
      console.error("Comment cannot be empty");
      return;
    }

    // Send the comment to the API
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`,
        { comment_text: commentInput }, // Payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setCommentInput(""); // Clear the comment input
        // Reload comments
        axios
          .get(`http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`)
          .then((response) => {
            setComments(response.data); // Update comments
          })
          .catch((error) => {
            console.error("Error fetching comments:", error);
          });
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  // Event handler for button click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, blogId: number) => {
    event.preventDefault(); // Prevent default button behavior if necessary
    handleLike(blogId); // Call your existing handleLike function with the blogId
  };

  if (!blog) {
    return <p>Loading...</p>;
  }

  return (
    <div className="blog-detail-container">
      <motion.div
        className="blog-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>{blog.title}</h1>
        <p>{blog.blog}</p>
        <div className="like-section">
        <button onClick={(e) => handleClick(e, blog.id)}>
  Like 
</button>

          <p>{likes} Likes</p>
        </div>

        <div className="comment-section">
          <h3>Comments:</h3>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <p>{comment.comment_text}</p>
                <small>{comment.created_at}</small>
              </div>
            ))}
          </div>

          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={postComment}>Post Comment</button>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogDetail;
