import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.webp.jpeg";
import { FaFacebook, FaInstagram, FaTwitter, FaPlay } from "react-icons/fa";
import axios from "axios";
import * as Slick from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BACKEND_URL } from "../utils/utils";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const Slider = Slick.default?.default ?? Slick.default;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
       const response = await axios.get(`${BACKEND_URL}/course/courses`,
          { withCredentials: true }
        );
        setCourses(response.data.courses);
      } catch (error) {
        console.log("error in fetchCourses ", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const updateSlides = () => {
      setSlidesToShow(
        window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3
      );
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const settings = {
    dots: true,
    infinite: courses.length > slidesToShow,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    slidesToShow,
    slidesToScroll: 1,
    initialSlide: 0,
  };

  return (
    <div className="home-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .home-root { font-family: 'Poppins', system-ui, sans-serif; }
        .home-root .slick-dots li button:before { color: #fff; opacity: .35; font-size: 9px; }
        .home-root .slick-dots li.slick-active button:before { color: #f97316; opacity: 1; }
        .home-root .slick-dots { bottom: -28px; }
        .home-root .slick-prev, .home-root .slick-next { z-index: 10; width: 32px; height: 32px; }
        .home-root .slick-prev { left: -26px; }
        .home-root .slick-next { right: -26px; }
        .home-root .slick-prev:before, .home-root .slick-next:before { font-size: 28px; color: #f97316; opacity: .9; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .bubble-a { animation: floaty 6s ease-in-out infinite; }
        .bubble-b { animation: floaty 7s ease-in-out infinite reverse; }
        @media (prefers-reduced-motion: reduce) { .bubble-a, .bubble-b { animation: none; } }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[320px] w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      {/* Everything lives in one screen-height column */}
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
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
              to="/login"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              Signup
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative shrink-0 px-2 pt-4 text-center sm:pt-6">
          <div className="bubble-a absolute left-2 top-6 hidden rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur lg:block xl:left-12">
            Hello! How are you?
          </div>
          <div className="bubble-b absolute right-2 top-14 hidden rounded-2xl rounded-br-sm bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-orange-500/30 lg:block xl:right-12">
            I'm great, thank you!
          </div>

          <h1 className="mx-auto max-w-3xl text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Speak English with{" "}
            <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              confidence
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-gray-300 sm:text-sm">
            Recorded courses by Niranjan Learning Lab. Learn at your own pace,
            from anywhere.
          </p>

          <div className="mt-3 flex flex-row items-center justify-center gap-2 sm:mt-4 sm:gap-3">
            <Link
              to="/courses"
              className="whitespace-nowrap rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-400 sm:px-5 sm:text-sm"
            >
              Explore courses
            </Link>
            <a
              href="https://youtube.com/@niranjanlearninglab?si=pfwl-XWPMTT5xAhE"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs sm:px-5 sm:text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <FaPlay className="text-[10px] text-orange-400" />
              Course videos
            </a>
          </div>

          <div className="mt-3 hidden flex-wrap items-center justify-center gap-2 text-xs text-gray-200 md:flex">
            {["Recorded lessons", "Lifetime access", "Speaking practice"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </section>

        {/* Courses: takes all remaining height, card size adapts to screen height */}
        <section className="flex flex-1 items-center justify-center py-2 pb-9">
          <div className="w-full max-w-6xl px-7">
            {courses.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 py-8 text-center text-sm text-gray-400">
                Courses are loading. If nothing shows up, check that the server
                is running.
              </p>
            ) : (
              <Slider {...settings}>
                {courses.map((course) => (
                  <div key={course._id || course.id} className="px-2">
                    <div
                      className="group mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-500/50"
                      style={{
                        maxWidth: "clamp(10rem, calc((100dvh - 30rem) * 1.6), 22rem)",
                      }}
                    >
                      <div className="overflow-hidden">
                        <img
                          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                          src={course.image?.url}
                          alt={course.title}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3">
                        <div className="min-w-0 text-left">
                          <h3 className="truncate text-sm font-semibold capitalize">
                            {course.title}
                          </h3>
                          {course.price !== undefined && (
                            <p className="text-xs font-medium text-emerald-400">
                              ₹{course.price}
                            </p>
                          )}
                        </div>
                        <Link
                          to="/courses"
                          className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-400"
                        >
                          Enroll Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </section>

        {/* Footer (compact, 3 columns on every screen) */}
        <footer className="shrink-0 border-t border-white/10 py-3 text-[10px] text-gray-400 sm:text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 md:gap-6">
            {/* Brand + social: full row on mobile */}
            <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:flex-col md:items-start md:justify-start">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" className="h-7 w-7 rounded-full" />
                <div className="font-bold leading-tight text-orange-500">
                  <span className="block text-sm">NIRANJAN</span>
                  <span className="block text-[9px] tracking-wide">LEARNING LAB</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <span className="hidden md:inline">Follow us</span>
                <a href="#" aria-label="Facebook" className="text-base transition hover:text-blue-400"><FaFacebook /></a>
                <a href="https://www.instagram.com/niranjan_learning_lab?srtk=NGtrZmEya2hmY3Vv" aria-label="Instagram" className="text-base transition hover:text-pink-500"><FaInstagram /></a>
                <a href="#" aria-label="Twitter" className="text-base transition hover:text-sky-400"><FaTwitter /></a>
              </div>
            </div>

            <div className="min-w-0 md:text-center">
              <h3 className="mb-1 font-semibold text-white">Connect</h3>
              <ul className="space-y-0.5">
                <li className="cursor-pointer break-words transition hover:text-white">YouTube: Niranjan Learning Lab</li>
                <li className="cursor-pointer break-words transition hover:text-white">Telegram: Learn English</li>
                <li className="cursor-pointer break-words transition hover:text-white">Instagram:  Niranjan Learning Lab</li>
              </ul>
            </div>

            <div className="min-w-0 md:text-center">
              <h3 className="mb-1 font-semibold text-white">&#169; 2026</h3>
              <ul className="space-y-0.5">
                <li className="cursor-pointer break-words transition hover:text-white">Terms &amp; Conditions</li>
                <li className="cursor-pointer break-words transition hover:text-white">Privacy Policy</li>
                <li className="cursor-pointer break-words transition hover:text-white">Refund &amp; Cancellation</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
