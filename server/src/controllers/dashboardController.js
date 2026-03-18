import { listBuses } from "../models/busModel.js";
import { listDieselEntries } from "../models/dieselModel.js";
import { listExpenses } from "../models/expenseModel.js";
import { generateFleetAlerts } from "../services/alertService.js";
import { calculateMonthlyProfitPerBus } from "../services/profitService.js";

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export async function getDashboard(req, res) {
  const [busData, dieselData, expenseData] = await Promise.all([
    listBuses(),
    listDieselEntries(),
    listExpenses()
  ]);

  const month = currentMonthKey();
  const profitData = calculateMonthlyProfitPerBus({
    month,
    buses: busData,
    dieselEntries: dieselData.items,
    expenses: expenseData,
    revenueProvided: false,
    driverSalaryProvided: false
  });
  const fleetAlerts = generateFleetAlerts({
    buses: busData,
    dieselEntries: dieselData.items,
    mileageAverages: dieselData.averages,
    expenses: expenseData
  });
  const runningBuses = busData.filter((bus) => Boolean(bus.assigned_driver?.trim())).length;
  const dieselCost = profitData.summary.total_diesel;
  const totalRevenue = profitData.summary.total_revenue;
  const totalProfit = profitData.summary.total_profit;
  const maintenanceCost = profitData.summary.total_maintenance;
  const totalAlerts = fleetAlerts.length;

  res.json({
    metrics: [
      {
        key: "total_buses",
        label: "Total Buses",
        value: busData.length,
        delta: `${busData.length} fleet units registered`,
        tone: "default"
      },
      {
        key: "running_buses",
        label: "Running Buses",
        value: runningBuses,
        delta: `${Math.max(busData.length - runningBuses, 0)} currently not assigned`,
        tone: "success"
      },
      {
        key: "total_revenue",
        label: "Total Revenue",
        value: `Rs. ${roundCurrency(totalRevenue).toFixed(0)}`,
        delta: `${month} projection`,
        tone: "success"
      },
      {
        key: "diesel_cost",
        label: "Diesel Cost",
        value: `Rs. ${roundCurrency(dieselCost).toFixed(0)}`,
        delta: `${dieselData.items.filter((entry) => entry.date.startsWith(`${month}-`)).length} fuel entries`,
        tone: "warning"
      },
      {
        key: "profit",
        label: "Profit",
        value: `Rs. ${roundCurrency(totalProfit).toFixed(0)}`,
        delta: "After salary and maintenance",
        tone: totalProfit >= 0 ? "success" : "danger"
      },
      {
        key: "alerts",
        label: "Alerts",
        value: totalAlerts,
        delta: totalAlerts > 0 ? "Fleet attention needed" : "No critical anomalies",
        tone: totalAlerts > 0 ? "danger" : "success"
      }
    ],
    overview: {
      month,
      total_buses: busData.length,
      running_buses: runningBuses,
      total_revenue: roundCurrency(totalRevenue),
      diesel_cost: roundCurrency(dieselCost),
      maintenance_cost: roundCurrency(maintenanceCost),
      profit: roundCurrency(totalProfit),
      alerts: totalAlerts
    },
    recentAlerts: fleetAlerts.slice(0, 4).map((alert) => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      description: `${alert.message} on ${alert.date}`
    })),
    profitBreakdown: {
      revenue: roundCurrency(totalRevenue),
      diesel: roundCurrency(dieselCost),
      maintenance: roundCurrency(maintenanceCost),
      driver_salary: roundCurrency(profitData.summary.total_driver_salary),
      net_profit: roundCurrency(totalProfit)
    }
  });
}
