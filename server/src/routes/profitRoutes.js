import { Router } from "express";
import {
  calculateMonthlyProfit,
  getMonthlyProfitPerBus
} from "../controllers/profitController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/monthly", asyncHandler(getMonthlyProfitPerBus));
router.post("/monthly/calculate", asyncHandler(calculateMonthlyProfit));

export default router;
