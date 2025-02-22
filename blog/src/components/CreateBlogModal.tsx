// src/components/CreateBlogModal.tsx
import React from "react";
import "../styles/CreateBlogModal.css";

interface CreateBlogModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string) => void;
  newBlogTitle: string;
  setNewBlogTitle: (title: string) => void;
  newBlogContent: string;
  setNewBlogContent: (content: string) => void;
}

const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
  show,
  onClose,
  onCreate,
  newBlogTitle,
  setNewBlogTitle,
  newBlogContent,
  setNewBlogContent,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button onClick={() => onCreate(newBlogTitle, newBlogContent)}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogModal;
