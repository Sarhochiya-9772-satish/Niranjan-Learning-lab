import dotenv from "dotenv";

dotenv.config();


const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export default {
  JWT_USER_PASSWORD,
  JWT_ADMIN_PASSWORD,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_KEY_ID
};
