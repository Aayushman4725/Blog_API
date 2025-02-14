import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // Assuming you have an AuthContext to get user info

const CommentForm = ({ blogId }: { blogId: number }) => {
  const [commentInput, setCommentInput] = useState<string>("");
  const { isAuthenticated, user } = useAuth(); // Get user and auth status from context
  const navigate = useNavigate();

  const postComment = () => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    // Get the token from localStorage or from the user object in context
    const token = localStorage.getItem("access") || user?.token;

    if (!token) {
      navigate("/login"); // If no token, redirect to login
      return;
    }

    // Send the comment to the API
    axios
      .post(
        `http://127.0.0.1:8000/api/blog/blogs/${blogId}/comments/`,
        { text: commentInput }, // Payload for the comment
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        }
      )
      .then((response) => {
        setCommentInput(""); // Clear the comment input after successful post
        fetchComments(blogId); // Optionally, reload the comments
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized error (e.g., token expired)
          console.log("Token expired or invalid. Please log in again.");
          navigate("/login"); // Redirect to login
        }
      });
  };

  const fetchComments = (blogId: number) => {
    // Fetch comments for the blog (you can implement this according to your app)
    console.log(`Fetching comments for blog ID: ${blogId}`);
  };

  return (
    <div>
      <textarea
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        placeholder="Write your comment"
      />
      <button onClick={postComment}>Post Comment</button>
    </div>
  );
};

export default CommentForm;
