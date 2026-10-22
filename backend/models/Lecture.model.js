import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    // Only the public_id is stored. The playable link is generated
    // (signed) on the server each time an allowed user asks for it.
    video: {
      public_id: { type: String, required: true },
    },
    duration: Number, // seconds
    position: { type: Number, default: 0 }, // lecture order inside the course
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);