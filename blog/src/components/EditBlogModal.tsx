// src/components/EditBlogModal.tsx
import React from "react";
import "../styles/EditBlogModal.css";

interface EditBlogModalProps {
  show: boolean;
  onClose: () => void;
  onUpdate: (title: string, content: string) => void;
  newBlogTitle: string;
  setNewBlogTitle: (title: string) => void;
  newBlogContent: string;
  setNewBlogContent: (content: string) => void;
}

const EditBlogModal: React.FC<EditBlogModalProps> = ({
  show,
  onClose,
  onUpdate,
  newBlogTitle,
  setNewBlogTitle,
  newBlogContent,
  setNewBlogContent,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button onClick={() => onUpdate(newBlogTitle, newBlogContent)}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditBlogModal;
