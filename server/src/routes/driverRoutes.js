import { Router } from "express";
import { getDrivers } from "../controllers/driverController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getDrivers));

export default router;

