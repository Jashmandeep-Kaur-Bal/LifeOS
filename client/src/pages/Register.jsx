import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/auth/roles")
      .then(({ data }) => setRoles(data.roles || []))
      .catch(() => setRoles([{ value: "user", label: "User", description: "" }]));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      localStorage.setItem("lifeos_token", data.token);
      localStorage.setItem("lifeos_user", JSON.stringify(data.user));
      localStorage.setItem("lifeos_authenticated", "true");
      // New accounts always start un-onboarded — send them to set their goals
      // before they ever see the dashboard.
      navigate("/onboarding");
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
            <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
            <p className="text-xs text-slate-400 mt-2">Join LifeOS to manage your daily workflow</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Aditya Bhatia"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none focus:border-fuchsia-400 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {roles.find((r) => r.value === role)?.description}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-fuchsia-400 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
