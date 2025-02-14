import React, { useState } from "react";
import { signup } from "../api"; // Import the signup function from api.ts
import { AxiosError } from 'axios';
const Signup = () => {
  // States for email, password, username, and error message
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check if passwords match
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  // Prepare the form data to send to the API, with the correct field name
  const formData = {
    username: username,
    email: email,
    password: password,
    confirm_password: confirmPassword,  // Make sure this matches the backend field
  };

  try {
    // Call the signup function from api.ts
    const response = await signup(formData);
    console.log("Signup successful:", response);
    setSuccessMessage(
      "Registration successful! Please check your email to activate your account."
    );
    setError(""); // Clear any previous error
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error during signup:", error.response?.data);
      setError(error.response?.data?.detail || "An error occurred during registration.");
    } else {
      console.error("Unexpected error during signup:", error);
      setError("An unexpected error occurred.");
    }
  }
};

  

  return (
    <div>
      <h2>Signup</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
