import React from "react";

// Rename Comment interface to BlogComment to avoid conflict with other types
interface BlogComment {
  id: number;
  comment_text: string;
  created_at: string;
}

interface CommentSectionProps {
  id: number; // Post ID
  comments: BlogComment[]; // Use BlogComment here
  commentInput: string;
  setCommentInput: (input: string) => void;
  postComment: (commentText: string) => void; // Modify postComment to accept comment text
}

const CommentSection: React.FC<CommentSectionProps> = ({
  id, // Post ID
  comments,
  commentInput,
  setCommentInput,
  postComment,
}) => {
  const handlePostComment = () => {
    if (!commentInput.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    // Post the comment associated with the post `id`
    console.log("Post ID:", id);
    postComment(commentInput); // Pass commentInput as the comment text
    setCommentInput(""); // Clear the input field after posting
  };

  return (
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
        placeholder="Write your comment..."
      />
      <button onClick={handlePostComment}>Post Comment</button>
    </div>
  );
};

export default CommentSection;
