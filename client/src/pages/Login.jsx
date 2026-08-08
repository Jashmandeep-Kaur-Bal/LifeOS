import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("lifeos_token", data.token);
      localStorage.setItem("lifeos_user", JSON.stringify(data.user));
      localStorage.setItem("lifeos_authenticated", "true");
      navigate(data.user.onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-2">Log in to your LifeOS workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-fuchsia-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
