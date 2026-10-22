import express from "express";
import {
  addLecture,
  adminLectures,
  deleteLecture,
  userLectures,
} from "../controllers/Lecture.controller.js";
import userMiddleware from "../middlewares/user.mid.js";
import adminMiddleware from "../middlewares/admin.mid.js"; // use your admin middleware file name

const router = express.Router();

// admin
router.post("/:courseId", adminMiddleware, addLecture);
router.get("/admin/:courseId", adminMiddleware, adminLectures);
router.delete("/delete/:lectureId", adminMiddleware, deleteLecture);

// user (only after purchase)
router.get("/:courseId", userMiddleware, userLectures);

export default router;