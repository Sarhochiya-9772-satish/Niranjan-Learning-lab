import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin") || "null");
  const token = admin?.token; // optional chaining so a missing admin doesn't crash the page

  // Redirect to admin login (inside an effect, not during render)
  useEffect(() => {
    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
    }
  }, [token, navigate]);

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
        toast.error("Could not load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Delete course
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/course/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success(response.data.message);
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (error) {
      console.log("Error in deleting course ", error);
      toast.error(error.response?.data?.errors || "Error in deleting course");
    }
  };

  return (
    <div className="admin-courses-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .admin-courses-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[320px] w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-2 z-30 mt-2 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a1024]/70 px-3 py-2 backdrop-blur-md sm:top-3 sm:mt-3 sm:px-4">
          <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-2.5">
            <img
              src={logo}
              alt="Niranjan Learning Lab logo"
              className="h-9 w-9 rounded-full ring-2 ring-orange-500/70"
            />
            <div className="min-w-0 truncate font-bold leading-tight text-orange-500">
              <span className="block text-base sm:text-lg">NIRANJAN</span>
              <span className="block text-[9px] tracking-wide sm:text-[11px]">
                LEARNING LAB
              </span>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              to="/admin/dashboard"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 sm:block"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/create-course"
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Create
            </Link>
          </div>
        </header>

        {/* Title */}
        <section className="pt-8 pb-6">
          <h1 className="text-2xl font-extrabold sm:text-4xl">
            Our{" "}
            <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              courses
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {loading
              ? "Loading your courses..."
              : `${courses.length} ${courses.length === 1 ? "course" : "courses"} published.`}
          </p>
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
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-14 text-center backdrop-blur">
              <p className="text-sm text-gray-400">
                You have not created any course yet.
              </p>
              <Link
                to="/admin/create-course"
                className="mt-4 inline-block rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="overflow-hidden">
                    {course.image?.url ? (
                      <img
                        src={course.image.url}
                        alt={course.title}
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-white/10 text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {course.title}
                    </h2>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-400">
                      {course.description}
                    </p>
                    <p className="mt-3 text-xl font-bold text-emerald-400">
                      ₹{course.price}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                      <Link
                        to={`/admin/lectures/${course._id}`}
                        className="col-span-2 rounded-full border border-white/20 bg-white/5 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        Manage lectures
                      </Link>
                      <Link
                        to={`/admin/update-course/${course._id}`}
                        className="rounded-full bg-orange-500 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
                      >
                        Update
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id, course.title)}
                        className="rounded-full border border-red-500/40 bg-red-500/10 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
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

export default OurCourses;