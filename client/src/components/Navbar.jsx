import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const isAuthenticated = localStorage.getItem("lifeos_authenticated") === "true";

  const handleLogout = () => {
    localStorage.removeItem("lifeos_authenticated");
    localStorage.removeItem("lifeos_token");
    localStorage.removeItem("lifeos_user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/60 border-b border-indigo-900/40 px-6 py-4 transition-all">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl md:text-3xl font-black tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          LifeOS
        </Link>

        <div className="flex items-center gap-6 md:gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-violet-300 ${
              isActive("/") ? "text-violet-400 font-semibold" : "text-slate-300"
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-violet-300 ${
              isActive("/dashboard") ? "text-violet-400 font-semibold" : "text-slate-300"
            }`}
          >
            Dashboard
          </Link>

          {isAuthenticated && (
            <Link
              to="/agent-tasks"
              className={`text-sm font-medium transition-colors hover:text-violet-300 ${
                isActive("/agent-tasks") ? "text-violet-400 font-semibold" : "text-slate-300"
              }`}
            >
              Agent Tasks
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors hover:text-violet-300 ${
                  isActive("/login") ? "text-violet-400 font-semibold" : "text-slate-300"
                }`}
              >
                Login
              </Link>

              <Link to="/register">
                <button className="px-5 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:from-violet-300 hover:to-fuchsia-300 shadow-[0_0_15px_rgba(167,139,250,0.4)] active:scale-95 transition-all cursor-pointer">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}