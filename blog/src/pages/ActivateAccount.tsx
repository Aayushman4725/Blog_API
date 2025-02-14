import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ActivateAccount = () => {
  const { uidb64, token } = useParams<{ uidb64?: string; token?: string }>();
  const [activationStatus, setActivationStatus] = useState<string>("");
  const navigate = useNavigate();

  // Handle account activation
  const activateAccount = async () => {
    if (!uidb64 || !token) {
      setActivationStatus("Invalid activation link.");
      return;
    }

    try {
      const response = await fetch(`/api/activate/${uidb64}/${token}/`);
      const data = await response.json();

      if (response.ok) {
        // Show success message
        setActivationStatus(data.detail);

        // Redirect to the login page using the `redirect_url` from the API response
        if (data.redirect_url) {
          navigate(data.redirect_url); // This will take you to /login/
        } else {
          // If the response doesn't contain a redirect_url, handle it gracefully
          setActivationStatus("Account activated successfully, but no redirect URL provided.");
        }
      } else {
        // Handle error from API response
        setActivationStatus(data.detail || "Account activation failed. Please try again.");
      }
    } catch (error) {
      setActivationStatus("An error occurred. Please try again later.");
    }
  };

  // Call activateAccount when the component mounts
  useEffect(() => {
    if (uidb64 && token) {
      activateAccount();
    }
  }, [uidb64, token]); // React will warn if missing deps, but uidb64 and token are correct

  return (
    <div>
      <h2>Account Activation</h2>
      <p>{activationStatus}</p>
    </div>
  );
};

export default ActivateAccount;
