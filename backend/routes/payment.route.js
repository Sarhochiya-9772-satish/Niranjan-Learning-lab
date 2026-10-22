import express from "express";
import userMiddleware from "../middlewares/user.mid.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", userMiddleware, createRazorpayOrder);
router.post("/verify", userMiddleware, verifyRazorpayPayment);

export default router;