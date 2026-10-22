import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCloudUploadAlt, FaPlay, FaTrash } from "react-icons/fa";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

function ManageLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0); // used to clear the file input
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playingId, setPlayingId] = useState(null);

  const admin = JSON.parse(localStorage.getItem("admin") || "null");
  const token = admin?.token;

  // Redirect to admin login (inside an effect, not during render)
  useEffect(() => {
    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  // Load course title + its lectures
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [courseRes, lecturesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/course/${courseId}`),
          axios.get(`${BACKEND_URL}/lecture/admin/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ]);
        setCourseTitle(courseRes.data.course?.title || "");
        setLectures(lecturesRes.data.lectures);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.errors || "Could not load lectures");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }
    if (!videoFile) {
      toast.error("Please choose a video file");
      return;
    }

    // This is the code that sends the video to the backend
    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", videoFile);

    setUploading(true);
    setProgress(0);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/lecture/${courseId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          onUploadProgress: (e) =>
            setProgress(Math.round((e.loaded * 100) / e.total)),
        }
      );
      toast.success(response.data.message || "Lecture uploaded");
      setLectures((prev) => [...prev, response.data.lecture]);
      setTitle("");
      setVideoFile(null);
      setFileInputKey((k) => k + 1);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.errors || "Could not upload the video");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (lectureId, lectureTitle) => {
    if (!window.confirm(`Delete "${lectureTitle}"? This cannot be undone.`)) return;
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/lecture/delete/${lectureId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setLectures((prev) => prev.filter((l) => l._id !== lectureId));
    } catch (error) {
      toast.error(error.response?.data?.errors || "Error in deleting lecture");
    }
  };

  return (
    <div className="lectures-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .lectures-root { font-family: 'Poppins', system-ui, sans-serif; }
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
          <Link
            to="/admin/our-courses"
            className="shrink-0 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
          >
            Courses
          </Link>
        </header>

        {/* Title */}
        <section className="pt-8 pb-6">
          <h1 className="text-2xl font-extrabold sm:text-4xl">
            Course{" "}
            <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              lectures
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400 capitalize">
            {courseTitle || "Upload and manage the videos of this course."}
          </p>
        </section>

        <main className="grid flex-1 gap-5 pb-10 lg:grid-cols-5">
          {/* Upload form */}
          <section className="h-fit rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/40 backdrop-blur lg:col-span-2">
            <h2 className="text-lg font-bold">Add a lecture</h2>

            <form onSubmit={handleUpload} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="lecture-title" className="mb-1 block text-xs text-gray-300">
                  Lecture title
                </label>
                <input
                  id="lecture-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lesson 1: Introduction"
                  className={inputClass}
                  disabled={uploading}
                />
              </div>

              <div>
                <span className="mb-1 block text-xs text-gray-300">Video file</span>
                <label
                  htmlFor="lecture-video"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-gray-400 transition hover:border-orange-500/60"
                >
                  <FaCloudUploadAlt className="text-3xl text-orange-400" />
                  {videoFile ? (
                    <span className="break-all text-white">{videoFile.name}</span>
                  ) : (
                    "Click to choose an MP4, WEBM or MOV video"
                  )}
                </label>
                <input
                  key={fileInputKey}
                  id="lecture-video"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Max file size depends on your Cloudinary plan (free plan: 100 MB).
                </p>
              </div>

              {uploading && (
                <div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-gray-400">
                    {progress < 100
                      ? `Uploading... ${progress}%`
                      : "Almost done, saving the video to the cloud..."}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload lecture"}
              </button>
            </form>
          </section>

          {/* Lectures list */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center text-sm text-gray-400">
                No lectures yet. Upload the first video from the form.
              </p>
            ) : (
              <ul className="space-y-3">
                {lectures.map((lecture, index) => (
                  <li
                    key={lecture._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40 backdrop-blur"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {index + 1}. {lecture.title}
                        </p>
                        {lecture.duration ? (
                          <p className="text-xs text-gray-400">
                            {formatDuration(lecture.duration)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() =>
                            setPlayingId(playingId === lecture._id ? null : lecture._id)
                          }
                          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/15"
                        >
                          <FaPlay className="text-[10px] text-orange-400" />
                          {playingId === lecture._id ? "Close" : "Play"}
                        </button>
                        <button
                          onClick={() => handleDelete(lecture._id, lecture.title)}
                          aria-label="Delete lecture"
                          className="rounded-full border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {playingId === lecture._id && (
                      <video
                        src={lecture.videoUrl}
                        controls
                        autoPlay
                        controlsList="nodownload"
                        className="mt-4 aspect-video w-full rounded-xl bg-black"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default ManageLectures;