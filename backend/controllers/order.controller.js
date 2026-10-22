import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

export const orderData = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;
    const userId = req.userId;

    if (!courseId) {
      return res.status(400).json({ errors: "Course ID is required" });
    }

    // The authenticated user's ID and the course price must come from the
    // server, not from a browser request.
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(409).json({ errors: "User has already purchased this course" });
    }

    const purchase = await Purchase.create({ userId, courseId });
    try {
      const orderInfo = await Order.create({
        userId,
        courseId,
        paymentId,
        amount: course.price,
        status: "completed",
      });
      return res.status(201).json({ message: "Order created successfully", orderInfo });
    } catch (orderError) {
      await Purchase.findByIdAndDelete(purchase._id);
      throw orderError;
    }
  } catch (error) {
    console.log("Error in order: ", error);
    return res.status(500).json({ errors: "Error in order creation" });
  }
};
