const fallbackRevenueByBus = {
  "KA-01-AB-2211": 185000,
  "KA-02-CD-4510": 142000
};

const fallbackDriverSalaryByName = {
  "Ravi Kumar": 32000,
  "Suresh Naik": 29000
};

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function roundMetric(value) {
  return Math.round(value * 100) / 100;
}

function matchesMonth(date, month) {
  return typeof date === "string" && date.startsWith(`${month}-`);
}

function buildRevenueLookup(revenueInput = {}) {
  if (Array.isArray(revenueInput)) {
    return revenueInput.reduce((accumulator, item) => {
      if (item?.bus_number) {
        accumulator[item.bus_number] = Number(item.revenue || 0);
      }

      if (item?.bus_id) {
        accumulator[`id:${item.bus_id}`] = Number(item.revenue || 0);
      }

      return accumulator;
    }, {});
  }

  return { ...revenueInput };
}

function buildDriverSalaryLookup(driverSalaryInput = {}) {
  if (Array.isArray(driverSalaryInput)) {
    return driverSalaryInput.reduce((accumulator, item) => {
      if (item?.bus_number) {
        accumulator[`bus:${item.bus_number}`] = Number(item.driver_salary || 0);
      }

      if (item?.bus_id) {
        accumulator[`id:${item.bus_id}`] = Number(item.driver_salary || 0);
      }

      if (item?.assigned_driver) {
        accumulator[`driver:${item.assigned_driver}`] = Number(item.driver_salary || 0);
      }

      return accumulator;
    }, {});
  }

  return { ...driverSalaryInput };
}

function calculateMonthlyDistance(dieselEntries, busId, month) {
  const entries = dieselEntries
    .filter((entry) => entry.bus_id === busId && matchesMonth(entry.date, month))
    .sort((left, right) => {
      const dateCompare = left.date.localeCompare(right.date);
      return dateCompare !== 0 ? dateCompare : left.id - right.id;
    });

  let distance = 0;
  let previousOdometer = null;

  for (const entry of entries) {
    if (previousOdometer !== null) {
      const segmentDistance = Number(entry.odometer_reading) - Number(previousOdometer);

      if (segmentDistance > 0) {
        distance += segmentDistance;
      }
    }

    previousOdometer = Number(entry.odometer_reading);
  }

  return roundMetric(distance);
}

export function calculateMonthlyProfitPerBus({
  month,
  buses,
  dieselEntries,
  expenses,
  revenueByBus = fallbackRevenueByBus,
  driverSalaryByName = fallbackDriverSalaryByName,
  revenueProvided = false,
  driverSalaryProvided = false
}) {
  const revenueLookup = buildRevenueLookup(revenueByBus);
  const driverSalaryLookup = buildDriverSalaryLookup(driverSalaryByName);

  const items = buses.map((bus) => {
    const dieselCost = dieselEntries
      .filter((entry) => entry.bus_id === bus.id && matchesMonth(entry.date, month))
      .reduce((sum, entry) => sum + Number(entry.price || 0), 0);

    const maintenanceCost = expenses
      .filter(
        (expense) =>
          expense.bus_id === bus.id &&
          expense.type === "maintenance" &&
          matchesMonth(expense.date, month)
      )
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    const totalKm = calculateMonthlyDistance(dieselEntries, bus.id, month);
    const revenue = Number(
      revenueLookup[`id:${bus.id}`] ?? revenueLookup[bus.bus_number] ?? fallbackRevenueByBus[bus.bus_number] ?? 0
    );
    const driverSalary = Number(
      driverSalaryLookup[`id:${bus.id}`] ??
        driverSalaryLookup[`bus:${bus.bus_number}`] ??
        driverSalaryLookup[`driver:${bus.assigned_driver}`] ??
        driverSalaryByName[bus.assigned_driver] ??
        0
    );
    const totalProfit = revenue - dieselCost - driverSalary - maintenanceCost;
    const profitPerKm = totalKm > 0 ? totalProfit / totalKm : null;
    const profitMargin = revenue > 0 ? (totalProfit / revenue) * 100 : null;

    return {
      bus_id: bus.id,
      bus_number: bus.bus_number,
      project: bus.project,
      assigned_driver: bus.assigned_driver || "",
      month,
      breakdown: {
        revenue: roundCurrency(revenue),
        diesel: roundCurrency(dieselCost),
        driver_salary: roundCurrency(driverSalary),
        maintenance: roundCurrency(maintenanceCost)
      },
      total_km: totalKm,
      total_profit: roundCurrency(totalProfit),
      profit_per_km: profitPerKm === null ? null : roundMetric(profitPerKm),
      profit_margin_percentage: profitMargin === null ? null : roundMetric(profitMargin),
      profit: roundCurrency(totalProfit)
    };
  });

  const summary = {
    total_revenue: roundCurrency(items.reduce((sum, item) => sum + item.breakdown.revenue, 0)),
    total_diesel: roundCurrency(items.reduce((sum, item) => sum + item.breakdown.diesel, 0)),
    total_driver_salary: roundCurrency(
      items.reduce((sum, item) => sum + item.breakdown.driver_salary, 0)
    ),
    total_maintenance: roundCurrency(
      items.reduce((sum, item) => sum + item.breakdown.maintenance, 0)
    ),
    total_profit: roundCurrency(items.reduce((sum, item) => sum + item.total_profit, 0)),
    total_km: roundMetric(items.reduce((sum, item) => sum + item.total_km, 0)),
    average_profit_per_km: roundMetric(
      (() => {
        const profitPerKmItems = items.filter((item) => item.profit_per_km !== null);
        if (profitPerKmItems.length === 0) {
          return 0;
        }

        return (
          profitPerKmItems.reduce((sum, item) => sum + item.profit_per_km, 0) /
          profitPerKmItems.length
        );
      })()
    ),
    average_profit_margin_percentage: roundMetric(
      (() => {
        const marginItems = items.filter((item) => item.profit_margin_percentage !== null);
        if (marginItems.length === 0) {
          return 0;
        }

        return (
          marginItems.reduce((sum, item) => sum + item.profit_margin_percentage, 0) /
          marginItems.length
        );
      })()
    )
  };

  return {
    month,
    items,
    summary,
    assumptions: {
      revenue_source: revenueProvided
        ? "manual revenue input with fallback defaults"
        : "fallback per-bus revenue map",
      driver_salary_source: driverSalaryProvided
        ? "manual driver salary input with fallback defaults"
        : "fallback per-driver salary map"
    }
  };
}
