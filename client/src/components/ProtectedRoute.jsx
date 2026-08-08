import React from "react";
import { Navigate } from "react-router-dom";

// Wrap any route that needs a logged-in user. By default it also requires
// the user to have completed onboarding (so goals exist for a personalized
// dashboard) — pass requireOnboarded={false} for the onboarding page itself.
export default function ProtectedRoute({ children, requireOnboarded = true }) {
  const isAuthenticated = localStorage.getItem("lifeos_authenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarded) {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("lifeos_user") || "{}");
    } catch {
      user = {};
    }
    if (!user.onboarded) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
}
