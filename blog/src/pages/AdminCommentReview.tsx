import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminReviewComment.css";
const AdminCommentReview: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assuming the token is stored in localStorage after login
  const token = localStorage.getItem("access") 
  console.log("Auth Token:", token); // Debugging line

  useEffect(() => {
    // Check if the token is present
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    // Fetch comments needing review from backend
    axios
      .get("http://127.0.0.1:8000/api/blog/admin/review-comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setComments(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
        setError("Error fetching comments for review.");
        setLoading(false);
      });
  }, [token]); // Dependency on token to re-fetch when it changes

  // Handle approve comment action
  const handleApprove = (commentId: number) => {
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/approve_comment/${commentId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        ); // Remove approved comment
      })
      .catch((error) => {
        setError("Error approving comment. Please try again.");
        console.error("Error approving comment:", error);
      });
  };

  // Handle delete comment action
  const handleDelete = (commentId: number) => {
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/delete_comment/${commentId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        ); // Remove deleted comment
      })
      .catch((error) => {
        setError("Error deleting comment. Please try again.");
        console.error("Error deleting comment:", error);
      });
  };

  // Loading state
  if (loading) return <p>Loading...</p>;

  // Error handling
  if (error) return <p>{error}</p>;

  // Render the comment review interface
  return (
    <div className="admin-comment-review">
      <h1>Admin Comment Review</h1>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <p>{comment.comment_text}</p>
            <small>{comment.created_at}</small>
            <div>
              <button onClick={() => handleApprove(comment.id)}>Approve</button>
              <button onClick={() => handleDelete(comment.id)}>Delete</button>
            </div>
          </div>
        ))
      ) : (
        <p>No comments needing review</p>
      )}
    </div>
  );
};

export default AdminCommentReview;
