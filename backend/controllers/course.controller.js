import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/purchase.model.js";
import { Order } from "../models/order.model.js";


export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;
  console.log(title, description, price);

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ errors: "No file uploaded" });
    }
    const { image } = req.files;
    const allowedFormate = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedFormate.includes(image.mimetype)) {
      return res.status(400).json({
        errors: "Invalid image format only jpeg, jpg and png are allowed",
      });
    }
    // cloudinary code
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloud_response || cloud_response.error) {
      return res
        .status(500)
        .json({ errors: "Error uploading image to Cloudinary" });
    }
    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.url,
      },
      creatorId: adminId,
    };
    const course = await Course.create(courseData);
    res.json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: "Error creating course" });
  }
};

export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    const { title, description, price } = req.body;
    const courseToUpdate = await Course.findOne({
      _id: courseId,
      creatorId: adminId,
    });

    if (!courseToUpdate) {
      return res
        .status(404)
        .json({ errors: "Course not found or you are not allowed to update it" });
    }

    const updateData = { title, description, price };
    let previousImagePublicId;

    // Image is optional during an update. When no new file is uploaded, leave
    // the existing Cloudinary image untouched.
    if (req.files?.image) {
      const image = req.files.image;
      const allowedFormate = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedFormate.includes(image.mimetype)) {
        return res.status(400).json({
          errors: "Invalid image format only jpeg, jpg and png are allowed",
        });
      }

      const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
      if (!cloudResponse || cloudResponse.error) {
        return res
          .status(500)
          .json({ errors: "Error uploading image to Cloudinary" });
      }

      updateData.image = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.secure_url || cloudResponse.url,
      };
      previousImagePublicId = courseToUpdate.image?.public_id;
    }

    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        creatorId: adminId,
      },
      updateData,
      { new: true, runValidators: true },
    );

    // The new image is safely stored before removing the old Cloudinary asset.
    if (previousImagePublicId) {
      try {
        await cloudinary.uploader.destroy(previousImagePublicId);
      } catch (cleanupError) {
        // The database already points to the new image, so a cleanup failure
        // must not turn an otherwise successful update into an error response.
        console.log("Error removing previous course image", cleanupError);
      }
    }

    res.status(201).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ errors: "Error updating course" });
    console.log("Error in course updating", error);
  }
};

export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  try {
    const course = await Course.findByIdAndDelete({
      _id: courseId,
      creatorId: adminId,
    });
    if (!course) {
      return res.status(404).json({ errors:"Can't delete, created by other admin" });
    }
    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ errors: "Error deleting course" });
    console.log("Error in course deleting", error);
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(201).json({ courses });
  } catch (error) {
    res.status(500).json({ errors: "Error fetching courses" });
    console.log("Error in fetching courses", error);
  }
};

export const courseDetails = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }
    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ errors: "Error fetching course details" });
    console.log("Error in fetching course details", error);
  }
};

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ errors: "User has already purchased this course" });
    }
    const newPurchase = await Purchase.create({ userId, courseId });

    // Keep the order data on the server. The price and user ID must not come
    // from the browser, since both can be modified by a client.
    try {
      await Order.create({
        userId,
        courseId,
        amount: course.price,
        status: "completed",
      });
    } catch (orderError) {
      // Do not leave a purchase behind if its matching order was not saved.
      await Purchase.findByIdAndDelete(newPurchase._id);
      throw orderError;
    }

    res
      .status(201)
      .json({ message: "course purchase successfully", newPurchase });
  } catch (error) {
    res.status(500).json({ errors: "Error purchasing course" });
    console.log("error in course buying", error);
  }
};
