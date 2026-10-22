import { v2 as cloudinary } from "cloudinary";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/Lecture.model.js";
import { Purchase } from "../models/purchase.model.js";

const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

// Makes a signed link for a private (authenticated) Cloudinary video
const signedVideoUrl = (public_id) =>
  cloudinary.url(public_id, {
    resource_type: "video",
    type: "authenticated",
    sign_url: true,
    secure: true,
    format: "mp4",
  });

const withVideoUrl = (lecture) => ({
  _id: lecture._id,
  title: lecture.title,
  duration: lecture.duration,
  position: lecture.position,
  videoUrl: signedVideoUrl(lecture.video.public_id),
});

// ADMIN: upload a video lecture into one of his own courses
export const addLecture = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ errors: "Lecture title is required" });
    }

    const course = await Course.findOne({ _id: courseId, creatorId: adminId });
    if (!course) {
      return res
        .status(404)
        .json({ errors: "Course not found or created by another admin" });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ errors: "No video uploaded" });
    }
    const { video } = req.files;
    if (!allowedVideoTypes.includes(video.mimetype)) {
      return res
        .status(400)
        .json({ errors: "Invalid format. Only MP4, WEBM and MOV are allowed" });
    }

    // upload_large sends the video in chunks (needed for big files)
    const cloudResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        video.tempFilePath,
        {
          resource_type: "video",
          type: "authenticated",
          folder: `courses/${courseId}`,
          chunk_size: 6 * 1024 * 1024,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        },
      );
    });

    const lectureCount = await Lecture.countDocuments({ courseId });
    const lecture = await Lecture.create({
      courseId,
      title,
      video: { public_id: cloudResponse.public_id },
      duration: cloudResponse.duration,
      position: lectureCount + 1,
    });

    res.status(201).json({
      message: "Lecture uploaded successfully",
      lecture: withVideoUrl(lecture),
    });
  } catch (error) {
    console.log("Error in addLecture ", error);
    res.status(500).json({
      errors: error?.message || "Error uploading lecture",
    });
  }
};

// ADMIN: list lectures of his own course
export const adminLectures = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  try {
    const course = await Course.findOne({ _id: courseId, creatorId: adminId });
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }
    const lectures = await Lecture.find({ courseId }).sort({ position: 1 });
    res.status(200).json({ lectures: lectures.map(withVideoUrl) });
  } catch (error) {
    console.log("Error in adminLectures ", error);
    res.status(500).json({ errors: "Error fetching lectures" });
  }
};

// ADMIN: delete a lecture (database entry + video from Cloudinary)
export const deleteLecture = async (req, res) => {
  const adminId = req.adminId;
  const { lectureId } = req.params;
  try {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ errors: "Lecture not found" });
    }
    const course = await Course.findOne({
      _id: lecture.courseId,
      creatorId: adminId,
    });
    if (!course) {
      return res.status(403).json({ errors: "You cannot delete this lecture" });
    }

    await cloudinary.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
      type: "authenticated",
    });
    await Lecture.findByIdAndDelete(lectureId);

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.log("Error in deleteLecture ", error);
    res.status(500).json({ errors: "Error deleting lecture" });
  }
};

// USER: lectures are visible only to people who bought the course
export const userLectures = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;
  try {
    const purchase = await Purchase.findOne({ userId, courseId });
    if (!purchase) {
      return res
        .status(403)
        .json({ errors: "Buy this course to watch its lectures" });
    }
    const lectures = await Lecture.find({ courseId }).sort({ position: 1 });
    res.status(200).json({ lectures: lectures.map(withVideoUrl) });
  } catch (error) {
    console.log("Error in userLectures ", error);
    res.status(500).json({ errors: "Error fetching lectures" });
  }
};
