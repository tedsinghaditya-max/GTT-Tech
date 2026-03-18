import { Router } from "express";
import { getAlerts } from "../controllers/alertController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getAlerts));

export default router;
