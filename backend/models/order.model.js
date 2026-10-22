import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  email: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  paymentId: String,
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "completed",
  },
  razorpayOrderId: {
  type: String,
  required: true,
  unique: true,
},
signature: {
  type: String,
},
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
