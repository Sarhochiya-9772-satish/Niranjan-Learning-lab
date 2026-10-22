import React, { useState } from "react";
import logo from "../assets/logo.webp.jpeg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BACKEND_URL } from "../utils/utils";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Admin login successful: ", response.data);
      toast.success(response.data.message);
      localStorage.setItem("admin", JSON.stringify(response.data));
      navigate("/admin/dashboard");
    } catch (error) {
      const errors = error.response?.data?.errors;
      setErrorMessage(
        Array.isArray(errors)
          ? errors.join(", ")
          : errors || "Admin login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-root relative h-dvh overflow-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .admin-auth-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-80 w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mt-2 flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md sm:mt-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Niranjan Learning Lab logo"
              className="h-9 w-9 rounded-full ring-2 ring-orange-500/70"
            />
            <div className="font-bold leading-tight text-orange-500">
              <span className="block text-base sm:text-lg">NIRANJAN</span>
              <span className="block text-[9px] tracking-wide sm:text-[11px]">
                LEARNING LAB
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              to="/admin/signup"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Signup
            </Link>
            <Link
              to="/"
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Form */}
        <main className="flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-7">
            <div className="mb-2 flex justify-center">
              <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                Admin
              </span>
            </div>
            <h1 className="text-center text-2xl font-extrabold sm:text-3xl">
              Admin login
            </h1>
            <p className="mt-1 mb-5 text-center text-sm text-gray-400">
              Login to access the admin dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="name@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login as admin"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-400">
              New admin?{" "}
              <Link
                to="/admin/signup"
                className="font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Create an admin account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLogin;
