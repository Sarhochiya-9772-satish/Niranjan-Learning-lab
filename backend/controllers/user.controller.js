import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z.string().min(3, { message: "First name is required" }),
    lastName: z.string().min(3, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });
  const validatedData = userSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({ errors: validatedData.error.issues.map(err=>err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error in signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    // Check that the user exists before trying to read user.password.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(403).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_USER_PASSWORD, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).json({ message: "Error in login" });
  }
};

export const logout =  (req, res) => {
  try {
    if(!req.cookies.token){
        return res.status(400).json({message: "Kindly login first"})
    }
    res.clearCookie("token");
    
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout", error);
    return res.status(500).json({ message: "Error in logout" });
  }
};

export const purchase = async (req,res)=>{
  const userId = req.userId;

  try {
    const purchased = await Purchase.find({userId});

    let purchasedCourseId = [];

    for (let i = 0; i < purchased.length; i++) {
      purchasedCourseId.push(purchased[i].courseId);
    };
    const courseData = await Course.find({
        _id : {$in: purchasedCourseId},
    });
    res.status(200).json({purchased,courseData});
  } catch (error) {
    res.status(500).json({errors:"Error in purchase"});
    console.log("Error in purchase",error) ;
  }

}
