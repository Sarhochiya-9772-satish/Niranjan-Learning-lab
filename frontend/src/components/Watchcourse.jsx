import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

function WatchCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.token;

  // Redirect to login (inside an effect, not during render)
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [courseRes, lecturesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/course/${courseId}`),
          axios.get(`${BACKEND_URL}/lecture/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ]);
        setCourseTitle(courseRes.data.course?.title || "");
        setLectures(lecturesRes.data.lectures);
        setActiveLecture(lecturesRes.data.lectures[0] || null);
      } catch (err) {
        console.log(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("user");
          toast.error("Your session has expired. Please log in again.");
          navigate("/login");
          return;
        }
        setError(
          err.response?.data?.errors || "Could not load the lectures of this course."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  return (
    <div className="watch-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .watch-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-80 w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-2 z-30 mt-2 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a1024]/70 px-3 py-2 backdrop-blur-md sm:top-3 sm:mt-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
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
          <Link
            to="/purchases"
            className="shrink-0 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
          >
            My purchases
          </Link>
        </header>

        {/* Title */}
        <section className="pt-6 pb-4">
          <h1 className="text-xl font-extrabold capitalize sm:text-3xl">
            {courseTitle || "Course"}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {loading
              ? "Loading lectures..."
              : `${lectures.length} ${lectures.length === 1 ? "lecture" : "lectures"}`}
          </p>
        </section>

        <main className="flex-1 pb-10">
          {loading ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="aspect-video animate-pulse rounded-2xl bg-white/5 lg:col-span-2" />
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur">
              <p className="text-base font-semibold text-red-300">{error}</p>
              <Link
                to={`/buy/${courseId}`}
                className="mt-4 inline-block rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Go to course
              </Link>
            </div>
          ) : lectures.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center text-sm text-gray-400">
              The instructor has not added any lecture to this course yet.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Player */}
              <section className="lg:col-span-2">
                <video
                  key={activeLecture?._id}
                  src={activeLecture?.videoUrl}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="aspect-video w-full rounded-2xl bg-black shadow-xl shadow-black/40"
                />
                <h2 className="mt-4 text-lg font-semibold">
                  {activeLecture?.title}
                </h2>
              </section>

              {/* Lecture list */}
              <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <h3 className="px-2 pb-2 text-sm font-semibold text-gray-300">
                  Lectures
                </h3>
                <ul className="max-h-[60vh] space-y-1.5 overflow-y-auto">
                  {lectures.map((lecture, index) => {
                    const active = lecture._id === activeLecture?._id;
                    return (
                      <li key={lecture._id}>
                        <button
                          onClick={() => setActiveLecture(lecture)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            active
                              ? "bg-orange-500/20 text-orange-300"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                              active ? "bg-orange-500 text-white" : "bg-white/10"
                            }`}
                          >
                            {active ? <FaPlay className="text-[9px]" /> : index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {lecture.title}
                          </span>
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatDuration(lecture.duration)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default WatchCourse;