import { listBuses } from "../models/busModel.js";
import { listDieselEntries } from "../models/dieselModel.js";
import { listExpenses } from "../models/expenseModel.js";
import { generateFleetAlerts } from "../services/alertService.js";

export async function getAlerts(req, res) {
  const [buses, dieselData, expenses] = await Promise.all([
    listBuses(),
    listDieselEntries(),
    listExpenses()
  ]);

  const items = generateFleetAlerts({
    buses,
    dieselEntries: dieselData.items,
    mileageAverages: dieselData.averages,
    expenses
  });

  res.json({
    items,
    summary: {
      total: items.length,
      high: items.filter((item) => item.severity === "high").length,
      medium: items.filter((item) => item.severity === "medium").length,
      low: items.filter((item) => item.severity === "low").length
    },
    rules: {
      low_mileage: "Current mileage below 80% of average",
      high_maintenance: "Maintenance cost above Rs. 10000",
      inactive_bus: "No activity for 3 days"
    }
  });
}
