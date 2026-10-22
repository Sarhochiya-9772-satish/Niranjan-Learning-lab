import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.token; // optional chaining so the app doesn't crash

  // Login check + redirect (inside an effect, not during render)
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch purchases
  useEffect(() => {
    if (!token) return;

    const fetchPurchases = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPurchases(response.data.courseData || []);
      } catch (error) {
        console.log("error in fetchPurchases ", error);
        setErrorMessage("Failed to fetch purchase data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
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
      navigate("/login");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const navLink =
    "rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";
  const activeNav =
    "rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-orange-400";

  return (
    <div className="purchases-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .purchases-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-80 w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
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
            <Link to="/courses" className={navLink}>
              Courses
            </Link>
            <Link to="/purchases" className={activeNav}>
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
            <Link
              to="/login"
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Login
            </Link>
          )}
        </header>

        {/* Mobile nav */}
        <nav className="mt-3 flex items-center justify-center gap-1 md:hidden">
          <Link to="/" className={navLink}>
            Home
          </Link>
          <Link to="/courses" className={navLink}>
            Courses
          </Link>
          <Link to="/purchases" className={activeNav}>
            Purchases
          </Link>
        </nav>

        {/* Title */}
        <section className="pt-8 pb-6">
          <h1 className="text-2xl font-extrabold sm:text-4xl">
            My{" "}
            <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              purchases
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            All the courses you have bought live here.
          </p>
        </section>

        {/* Content */}
        <main className="flex-1 pb-10">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
            >
              {errorMessage}
            </div>
          )}

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
                  </div>
                </div>
              ))}
            </div>
          ) : purchases.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {purchases.map((purchase, index) => (
                <div
                  key={purchase._id || index}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="relative overflow-hidden">
                    {purchase.image?.url ? (
                      <img
                        src={purchase.image.url}
                        alt={purchase.title}
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-white/10 text-sm text-gray-400">
                        No image
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                      Purchased
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {purchase.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {purchase.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <p className="text-sm font-semibold text-emerald-400">
                        ₹{purchase.price}
                      </p>
                      <Link
                        to={`/watch/${purchase._id}`}
                        className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
                      >
                        Watch course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !errorMessage && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-14 text-center backdrop-blur">
                <p className="text-sm text-gray-400">
                  You have no purchases yet.
                </p>
                <Link
                  to="/courses"
                  className="mt-4 inline-block rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
                >
                  Explore courses
                </Link>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default Purchases;