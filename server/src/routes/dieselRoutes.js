import { Router } from "express";
import {
  addDieselEntry,
  addQuickDieselEntry,
  getDieselEntries
} from "../controllers/dieselController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getDieselEntries));
router.post("/", asyncHandler(addDieselEntry));
router.post("/quick", asyncHandler(addQuickDieselEntry));

export default router;
