import mongoose from "mongoose";

const pruchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  courseId: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
  },
  
}, { timestamps: true });

// A user should have only one purchase record for a course, even if the Buy
// button is clicked twice or two requests arrive together.
pruchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Purchase = mongoose.model("Purchase", pruchaseSchema);
