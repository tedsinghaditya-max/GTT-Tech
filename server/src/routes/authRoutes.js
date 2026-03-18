import { Router } from "express";
import { getProfile, login, signup } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/signup", asyncHandler(signup));
router.get("/me", requireAuth, asyncHandler(getProfile));

export default router;
