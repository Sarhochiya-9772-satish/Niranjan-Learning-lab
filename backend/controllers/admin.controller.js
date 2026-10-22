
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";


export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "First name is required" }),
    lastName: z.string().min(3, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });
  const validatedData = adminSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({ errors: validatedData.error.issues.map(err=>err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const newAdmin = new Admin({ firstName, lastName, email, password: hashedPassword });
    await newAdmin.save();
    return res.status(201).json({ message: "Admin created successfully", newAdmin });
  } catch (error) {
    return res.status(500).json({ message: "Error in signup" });
  }
};

export const login = async (req, res)=>{
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email: email }).select("+password");
    const isPasswordValid =  await bcrypt.compare(password,admin.password) ;
    if(!admin || !isPasswordValid){
      return res.status(403).json({ message: "Invalid email or password" });
    }

    //JWT code
    const token = jwt.sign(
      {
        id: admin._id,
      },
      config.JWT_ADMIN_PASSWORD,
      {expiresIn:"1d"}
    );
    const cookieOptions ={
      expires: new Date(Date.now()+ 24*60*60*1000), //1 day
      httpOnly: true,
      secure : process.env.NODE_ENV==="production",
      sameSite : "Strict"
    };
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ message: "Login successful", admin, token });
  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).json({ message: "Error in login" });
  }
}

export const logout =  (req, res) => {
  try {
    if(!req.cookies.token){
        return res.status(400).json({message: "Kindly login first"})
    }
    res.clearCookie("jwt");
    
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout", error);
    return res.status(500).json({ message: "Error in logout" });
  }
};
