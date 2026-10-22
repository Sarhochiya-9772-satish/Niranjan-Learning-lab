import express from 'express';
import { login, signup, logout, purchase } from '../controllers/user.controller.js';
import userMiddleware from '../middlewares/user.mid.js';


const router = express.Router();

router.post('/signup', signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/purchases", userMiddleware, purchase);


export default router;
