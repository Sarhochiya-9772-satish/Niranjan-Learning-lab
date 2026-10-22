import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";
import config from "../config.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// Step 1: Razorpay order create karna
export const createRazorpayOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    const alreadyPurchased = await Purchase.findOne({ userId, courseId });
    if (alreadyPurchased) {
      return res.status(400).json({ errors: "Course already purchased" });
    }

    // Razorpay amount paisa mein leta hai: ₹499 => 49900 paisa
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(course.price) * 100),
      currency: "INR",
      receipt: `course_${course._id}_${Date.now()}`,
    });

    await Order.create({
      userId,
      courseId,
      razorpayOrderId: razorpayOrder.id,
      amount: course.price,
      status: "created",
    });

    return res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: config.RAZORPAY_KEY_ID,
      courseTitle: course.title,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({ errors: "Could not create payment order" });
  }
};

// Step 2: Payment ke baad signature verify karna
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      courseId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    const userId = req.userId;

    // Client se aaye order ID par blindly trust nahi karna
    const order = await Order.findOne({
      userId,
      courseId,
      razorpayOrderId: razorpay_order_id,
      status: "created",
    });

    if (!order) {
      return res.status(400).json({ errors: "Invalid payment order" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ errors: "Payment verification failed" });
    }

    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (!existingPurchase) {
      await Purchase.create({ userId, courseId });
    }

    order.paymentId = razorpay_payment_id;
    order.signature = razorpay_signature;
    order.status = "paid";
    await order.save();

    return res.status(200).json({
      message: "Payment verified. Course added to your purchases.",
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({ errors: "Payment verification failed" });
  }
};