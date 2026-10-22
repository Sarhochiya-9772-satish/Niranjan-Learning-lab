import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Check login
  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("user")));
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
      } catch (error) {
        console.log("error in fetchCourses ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const navLink =
    "rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <div className="courses-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .courses-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[320px] w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-2 z-30 mt-2 flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-[#0a1024]/70 px-3 py-2 backdrop-blur-md sm:top-3 sm:mt-3 sm:px-4">
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

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className={navLink}>
              Home
            </Link>
            <Link
              to="/courses"
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-orange-400"
            >
              Courses
            </Link>
            <Link to="/purchases" className={navLink}>
              Purchases
            </Link>
          </nav>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className={navLink}>
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Signup
              </Link>
            </div>
          )}
        </header>

        {/* Mobile nav */}
        <nav className="mt-3 flex items-center justify-center gap-1 md:hidden">
          <Link to="/" className={navLink}>
            Home
          </Link>
          <Link
            to="/courses"
            className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-orange-400"
          >
            Courses
          </Link>
          <Link to="/purchases" className={navLink}>
            Purchases
          </Link>
        </nav>

        {/* Title + search */}
        <section className="flex flex-col gap-4 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-4xl">
              Explore{" "}
              <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                courses
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Pick a course and start learning at your own pace.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pr-4 pl-11 text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
        </section>

        {/* Courses */}
        <main className="flex-1 pb-10">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="aspect-video bg-white/10" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                    <div className="h-3 w-full rounded bg-white/10" />
                    <div className="h-8 w-full rounded-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center text-sm text-gray-400">
              No course posted yet by admin.
            </p>
          ) : filteredCourses.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center text-sm text-gray-400">
              No course matches "{search}".
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="overflow-hidden">
                    <img
                      src={course.image?.url}
                      alt={course.title}
                      className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {course.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {course.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="text-xl font-bold text-emerald-400">
                        ₹{course.price}
                      </span>
                      <Link
                        to={`/buy/${course._id}`}
                        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Courses;
