import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBookOpen, FaPlusCircle, FaHome } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

const actions = [
  {
    to: "/admin/our-courses",
    title: "Our Courses",
    desc: "View, edit and manage all your courses.",
    Icon: FaBookOpen,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    to: "/admin/create-course",
    title: "Create Course",
    desc: "Add a new course with image, price and details.",
    Icon: FaPlusCircle,
    accent: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    to: "/",
    title: "Home",
    desc: "Go back to the public website.",
    Icon: FaHome,
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  // Only logged-in admins can see this page
  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    } finally {
      localStorage.removeItem("admin");
      navigate("/admin/login");
    }
  };

  return (
    <div className="admin-dash-root relative h-dvh overflow-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .admin-dash-root { font-family: 'Poppins', system-ui, sans-serif; }
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
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 sm:inline">
              Admin
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center py-4">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold sm:text-4xl lg:text-5xl">
              Welcome,{" "}
              <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-xs text-gray-300 sm:text-sm">
              Manage your courses and keep Niranjan Learning Lab growing.
            </p>
          </div>

          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-5">
            {actions.map(({ to, title, desc, Icon, accent }) => (
              <Link
                key={title}
                to={to}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 sm:flex-col sm:items-start sm:gap-3 sm:p-5"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg ${accent}`}
                >
                  <Icon />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{title}</h2>
                  <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;