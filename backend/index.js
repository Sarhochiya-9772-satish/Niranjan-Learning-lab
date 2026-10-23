import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import courseRoute from './routes/course.route.js';
import userRoute from './routes/user.route.js';
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload';
import adminRoute from "./routes/admin.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import paymentRoute from "./routes/payment.route.js";
import lectureRoute from "./routes/Lecture.route.js";

const app = express();
dotenv.config();
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
    
}))
const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;
//defining routes
app.use('/api/v1/course', courseRoute);
app.use('/api/v1/user', userRoute);
app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/lecture", lectureRoute);

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloud_name, 
        api_key: process.env.api_key, 
        api_secret: process.env.api_secret 
    });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

if (!DB_URI) {
  console.error("MONGO_URI is not configured; database features will be unavailable.");
} else {
  mongoose
    .connect(DB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection failed:", error.message));
}
