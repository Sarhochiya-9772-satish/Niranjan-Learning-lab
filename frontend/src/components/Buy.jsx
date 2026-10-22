import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import logo from "../assets/logo.webp.jpeg";
import { BACKEND_URL } from "../utils/utils";

function Buy() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [course, setCourse] = useState({});
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.token;

  // Redirect to login (inside an effect, not during render)
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Load course information. Purchasing happens only after the user clicks Buy.
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/${courseId}`);
        setCourse(response.data.course);
      } catch (err) {
        setError(err?.response?.data?.errors || "Course details could not be loaded.");
      } finally {
        setFetching(false);
      }
    };
    fetchCourse();
  }, [courseId]);

const handlePurchase = async () => {
  if (!token) {
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    // Backend se safe Razorpay order lo.
    // Price frontend se nahi bhejni hai.
    const orderResponse = await axios.post(
      `${BACKEND_URL}/payment/create-order`,
      { courseId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { razorpayOrderId, amount, currency, key, courseTitle } =
      orderResponse.data;

    const options = {
      key,
      amount,
      currency,
      name: "Niranjan Learning Lab",
      description: courseTitle,
      order_id: razorpayOrderId,

      prefill: {
        name: `${user?.user?.firstName || ""} ${user?.user?.lastName || ""}`,
        email: user?.user?.email || "",
      },

      theme: {
        color: "#f97316",
      },

      handler: async function (paymentResponse) {
        try {
          await axios.post(
            `${BACKEND_URL}/payment/verify`,
            {
              courseId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          toast.success("Payment successful! Course added to purchases.");
          navigate("/purchases");
        } catch (verifyError) {
          toast.error(
            verifyError.response?.data?.errors ||
              "Payment received, but verification failed."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setLoading(false);
          toast("Payment cancelled.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    setLoading(false);

    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    toast.error(
      err.response?.data?.errors || "Could not start payment."
    );
  }
};

  return (
    <div className="buy-root relative min-h-dvh overflow-x-hidden bg-[#050816] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .buy-root { font-family: 'Poppins', system-ui, sans-serif; }
      `}</style>

      {/* Background glow (same as Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-80 w-[320px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-80 w-[320px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

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
          <Link
            to="/courses"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Back to courses
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          {error ? (
            <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur">
              <p className="text-base font-semibold text-red-300">{error}</p>
              <Link
                to="/purchases"
                className="mt-4 inline-block rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Go to Purchases
              </Link>
            </div>
          ) : (
            <div className="grid w-full max-w-4xl gap-5 md:grid-cols-2">
              {/* Order details */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
                <h1 className="text-xl font-extrabold sm:text-2xl">
                  Order{" "}
                  <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                    details
                  </span>
                </h1>

                {fetching ? (
                  <div className="mt-5 animate-pulse space-y-3">
                    <div className="aspect-video rounded-xl bg-white/10" />
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                    <div className="h-4 w-1/3 rounded bg-white/10" />
                  </div>
                ) : (
                  <>
                    {course.image?.url && (
                      <img
                        src={course.image.url}
                        alt={course.title}
                        className="mt-5 aspect-video w-full rounded-xl object-cover"
                      />
                    )}
                    <dl className="mt-5 space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-gray-400">Course</dt>
                        <dd className="text-right font-semibold capitalize">
                          {course.title}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                        <dt className="text-gray-400">Total price</dt>
                        <dd className="text-xl font-bold text-emerald-400">
                          ₹{course.price}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </section>

              {/* Payment */}
              <section className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
                <h2 className="text-xl font-extrabold sm:text-2xl">Payment</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Pay securely with UPI, cards, net banking or wallets.
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-200">
                  {["UPI", "Cards", "Net banking", "Wallets"].map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={loading || fetching}
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaLock className="text-xs" />
                  {loading
                    ? "Processing..."
                    : course.price
                    ? `Buy for ₹${course.price}`
                    : "Buy course"}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Your course will be added to your purchases after confirmation.
                </p>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Buy;
