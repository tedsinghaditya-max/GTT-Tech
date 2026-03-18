import { listBuses } from "../models/busModel.js";
import { listDieselEntries } from "../models/dieselModel.js";
import { listExpenses } from "../models/expenseModel.js";
import { calculateMonthlyProfitPerBus } from "../services/profitService.js";

function getMonthFromQuery(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 7);
  }

  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [, monthPart] = value.split("-");
  const monthNumber = Number(monthPart);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return value;
}

export async function getMonthlyProfitPerBus(req, res) {
  const month = getMonthFromQuery(req.query.month);

  if (!month) {
    return res.status(400).json({ message: "month must be in YYYY-MM format" });
  }

  const [buses, dieselData, expenses] = await Promise.all([
    listBuses(),
    listDieselEntries(),
    listExpenses()
  ]);

  const data = calculateMonthlyProfitPerBus({
    month,
    buses,
    dieselEntries: dieselData.items,
    expenses,
    revenueProvided: false,
    driverSalaryProvided: false
  });

  res.json(data);
}

export async function calculateMonthlyProfit(req, res) {
  const month = getMonthFromQuery(req.body.month || req.query.month);

  if (!month) {
    return res.status(400).json({ message: "month must be in YYYY-MM format" });
  }

  const [buses, dieselData, expenses] = await Promise.all([
    listBuses(),
    listDieselEntries(),
    listExpenses()
  ]);

  const revenueInput = req.body.revenue_by_bus || {};
  const driverSalaryInput =
    req.body.driver_salary_by_bus || req.body.driver_salary_by_name || {};

  const data = calculateMonthlyProfitPerBus({
    month,
    buses,
    dieselEntries: dieselData.items,
    expenses,
    revenueByBus: revenueInput,
    driverSalaryByName: driverSalaryInput,
    revenueProvided: Object.keys(revenueInput).length > 0 || Array.isArray(revenueInput),
    driverSalaryProvided:
      Object.keys(driverSalaryInput).length > 0 || Array.isArray(driverSalaryInput)
  });

  res.json(data);
}
