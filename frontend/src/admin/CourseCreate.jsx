import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 sm:py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

function CourseCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin") || "null");
  const token = admin?.token; // optional chaining so a missing admin doesn't crash the page

  // Redirect to admin login (inside an effect, not during render)
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  const changePhotoHandler = (e) => {
    const file = e.target.files?.[0];
    if (!file) return; // user cancelled the file picker

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/admin/login");
      return;
    }
    if (!image) {
      toast.error("Please choose a course image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/course/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log(response.data);
      toast.success(response.data.message || "Course created successfully");
      navigate("/admin/our-courses");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.errors || "Could not create the course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-create-root relative h-dvh overflow-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .course-create-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-80 w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
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
              to="/admin/our-courses"
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Courses
            </Link>
          </div>
        </header>

        {/* Form */}
        <main className="flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
            <h1 className="text-xl font-extrabold sm:text-3xl">
              Create{" "}
              <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                course
              </span>
            </h1>
            <p className="mt-1 mb-3 text-xs text-gray-400 sm:mb-5 sm:text-sm">
              Fill in the details and upload a cover image.
            </p>

            <form
              onSubmit={handleCreateCourse}
              className="grid gap-3 md:grid-cols-2 md:gap-6"
            >
              {/* Left: details */}
              <div className="space-y-2.5 sm:space-y-4">
                <div>
                  <label htmlFor="title" className="mb-1 block text-xs text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Enter your course title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-1 block text-xs text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Enter your course description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClass} resize-none`}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="mb-1 block text-xs text-gray-300">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    placeholder="Enter your course price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Right: image upload */}
              <div className="flex flex-col">
                <span className="mb-1 block text-xs text-gray-300">
                  Course image
                </span>
                <label
                  htmlFor="image"
                  className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-white/5 transition hover:border-orange-500/60 md:aspect-video md:h-auto"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium opacity-0 transition group-hover:opacity-100">
                        Change image
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-gray-400">
                      <FaCloudUploadAlt className="text-3xl text-orange-400" />
                      Click to upload a course image
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={changePhotoHandler}
                  className="hidden"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 md:mt-auto"
                >
                  {loading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseCreate;