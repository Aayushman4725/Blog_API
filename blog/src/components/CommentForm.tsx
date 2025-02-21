import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming you have an AuthContext to get user info

const CommentForm = ({ blogId }: { blogId: number }) => {
  const [commentInput, setCommentInput] = useState<string>("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const postComment = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("access") || user?.token;

    if (!token) {
      navigate("/login");
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
        fetchComments(blogId);
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        if (error.response?.status === 401) {
          console.log("Token expired or invalid. Please log in again.");
          navigate("/login");
        }
      });
  };

  const fetchComments = (blogId: number) => {
    console.log(`Fetching comments for blog ID: ${blogId}`);
  };

  return (
    <div>
      <textarea
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        placeholder="Write your comment"
        rows={4}
        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button 
        onClick={postComment} 
        style={{ marginTop: "8px", padding: "8px 12px", borderRadius: "4px", backgroundColor: "#1abc9c", color: "white", border: "none", cursor: "pointer" }}
      >
        Post Comment
      </button>
    </div>
  );
};

export default CommentForm;
