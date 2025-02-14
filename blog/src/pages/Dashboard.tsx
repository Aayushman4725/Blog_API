import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { profile, logoutUser, loading } = useAuth();

  if (loading) {
    return <p>Loading profile...</p>;
  }

  // Ensure full URL for the profile picture
  const profilePictureUrl = profile.profile_picture
    ? `http://127.0.0.1:8000${profile.profile_picture}`
    : "media/images/profile_picture/default-avatar.jpg";

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {profile ? (
        <div>
          <h2>Your Profile</h2>
          {/* Display profile picture with fallback */}
          <img src={profilePictureUrl} alt="Profile" width="100" height="100" />
          <p>Name: {profile.user || "N/A"}</p>
          <p>Email: {profile.email || "N/A"}</p>
          <p>Phone Number: {profile.phone_number || "Not provided"}</p>
          <p>About: {profile.about || "No information available"}</p>
        </div>
      ) : (
        <p>Profile not available</p>
      )}
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

export default Dashboard;
