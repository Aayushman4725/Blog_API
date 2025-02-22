// src/components/BlogCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaThumbsUp, FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import TranslationSection from "./TranslationSection"; // Import the TranslationSection component

interface User {
  id: number;
}

interface Blog {
  id: number;
  title: string;
  blog: string;
  likes: number;
  user: User;
}

interface BlogCardProps {
  blog: Blog;
  loggedInUserId: number | undefined;
  likes: number;
  handleLike: (blogId: number) => void;
  handleEdit: (blog: Blog) => void;
  handleDelete: (blogId: number) => void;
  translatedContent: string; // Translated content that will replace the original content
  handleTranslate: (blogId: number, language: string) => void; // Function to handle translation
  selectedLanguage: string; // The selected language for translation
  setSelectedLanguage: (language: string) => void; // Function to update the selected language
}

// Helper function to truncate blog content
const truncateContent = (content: string, limit: number) => {
  if (content.length > limit) {
    return content.substring(0, limit) + "...";
  }
  return content;
};

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  loggedInUserId,
  likes,
  handleLike,
  handleEdit,
  handleDelete,
  translatedContent,
  handleTranslate,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <motion.div
      className="blog-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="blog-header">
        <FaUserCircle size={24} />
        <h2>
          <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        </h2>
      </div>
      <div className="blog-content">
        <p>{translatedContent ? truncateContent(translatedContent, 200) : truncateContent(blog.blog, 200)}</p> {/* Limit content to 200 characters */}
      </div>
      <div className="blog-actions">
        <button className="like-button" onClick={() => handleLike(blog.id)}>
          <FaThumbsUp /> {likes}
        </button>
        {blog.user.id === loggedInUserId && (
          <div className="blog-actions">
            <button onClick={() => handleEdit(blog)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handleDelete(blog.id)}>
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
      {/* Call the TranslationSection component */}
      <TranslationSection
        blogId={blog.id}
        handleTranslate={handleTranslate}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </motion.div>
  );
};

export default BlogCard;
