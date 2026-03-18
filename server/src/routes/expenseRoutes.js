import { Router } from "express";
import { addExpense, getExpenses } from "../controllers/expenseController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getExpenses));
router.post("/", asyncHandler(addExpense));

export default router;
