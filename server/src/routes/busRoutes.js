import { Router } from "express";
import { addBus, editBus, getBuses } from "../controllers/busController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getBuses));
router.post("/", asyncHandler(addBus));
router.put("/:id", asyncHandler(editBus));

export default router;
