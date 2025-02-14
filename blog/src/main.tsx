import React from "react"; // Ensure this import is here, even if unused
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    
    <Router>
    
    <AuthProvider>  {/* ✅ Then wrap the context */}
        <App />
      </AuthProvider>
    </Router>
    
  </React.StrictMode>
);
