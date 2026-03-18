import { Router } from "express";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import busRoutes from "./busRoutes.js";
import dieselRoutes from "./dieselRoutes.js";
import driverRoutes from "./driverRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import profitRoutes from "./profitRoutes.js";
import alertRoutes from "./alertRoutes.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "fleet-management-api" });
});

router.use("/auth", authRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/buses", requireAuth, busRoutes);
router.use("/diesel", requireAuth, dieselRoutes);
router.use("/expenses", requireAuth, expenseRoutes);
router.use("/profits", requireAuth, profitRoutes);
router.use("/alerts", requireAuth, alertRoutes);
router.use("/drivers", requireAuth, driverRoutes);

export default router;
