const LOW_MILEAGE_RATIO = 0.8;
const HIGH_MAINTENANCE_THRESHOLD = 10000;
const INACTIVE_DAYS_THRESHOLD = 3;

function roundValue(value) {
  return Math.round(value * 100) / 100;
}

function parseDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function currentDateKey() {
  return formatDate(new Date());
}

function differenceInDays(fromDate, toDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((parseDate(toDate) - parseDate(fromDate)) / millisecondsPerDay);
}

function latestMileageEntryForBus(entries, busId) {
  return entries
    .filter((entry) => entry.bus_id === busId && entry.mileage_per_entry !== null)
    .sort((left, right) => {
      const dateCompare = right.date.localeCompare(left.date);
      return dateCompare !== 0 ? dateCompare : right.id - left.id;
    })[0];
}

function latestActivityDateForBus(busId, dieselEntries, expenses) {
  const activityDates = [
    ...dieselEntries.filter((entry) => entry.bus_id === busId).map((entry) => entry.date),
    ...expenses.filter((expense) => expense.bus_id === busId).map((expense) => expense.date)
  ].sort();

  return activityDates.length > 0 ? activityDates[activityDates.length - 1] : null;
}

export function generateFleetAlerts({
  buses,
  dieselEntries,
  mileageAverages,
  expenses,
  currentDate = currentDateKey(),
  maintenanceThreshold = HIGH_MAINTENANCE_THRESHOLD
}) {
  const alerts = [];

  for (const bus of buses) {
    const mileageAverage = mileageAverages.find((item) => item.bus_id === bus.id)?.average_mileage;
    const latestMileageEntry = latestMileageEntryForBus(dieselEntries, bus.id);

    if (
      mileageAverage !== null &&
      mileageAverage !== undefined &&
      latestMileageEntry?.mileage_per_entry !== null &&
      latestMileageEntry?.mileage_per_entry !== undefined &&
      latestMileageEntry.mileage_per_entry < mileageAverage * LOW_MILEAGE_RATIO
    ) {
      alerts.push({
        id: `low-mileage-${bus.id}-${latestMileageEntry.id}`,
        type: "low_mileage",
        severity: "high",
        bus_id: bus.id,
        bus_number: bus.bus_number,
        date: latestMileageEntry.date,
        title: `Low mileage detected for ${bus.bus_number}`,
        message: `Current mileage ${latestMileageEntry.mileage_per_entry} km/L is below 80% of average ${mileageAverage} km/L`,
        metadata: {
          current_mileage: latestMileageEntry.mileage_per_entry,
          average_mileage: mileageAverage,
          threshold_mileage: roundValue(mileageAverage * LOW_MILEAGE_RATIO)
        }
      });
    }

    const maintenanceCost = expenses
      .filter((expense) => expense.bus_id === bus.id && expense.type === "maintenance")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    if (maintenanceCost > maintenanceThreshold) {
      alerts.push({
        id: `high-maintenance-${bus.id}`,
        type: "high_maintenance",
        severity: "medium",
        bus_id: bus.id,
        bus_number: bus.bus_number,
        date: currentDate,
        title: `High maintenance cost for ${bus.bus_number}`,
        message: `Maintenance cost reached Rs. ${roundValue(maintenanceCost)}, above threshold Rs. ${maintenanceThreshold}`,
        metadata: {
          maintenance_cost: roundValue(maintenanceCost),
          threshold: maintenanceThreshold
        }
      });
    }

    const latestActivityDate = latestActivityDateForBus(bus.id, dieselEntries, expenses);

    if (!latestActivityDate) {
      alerts.push({
        id: `inactive-bus-${bus.id}`,
        type: "inactive_bus",
        severity: "medium",
        bus_id: bus.id,
        bus_number: bus.bus_number,
        date: currentDate,
        title: `Inactive bus: ${bus.bus_number}`,
        message: `No diesel or expense activity has been recorded for this bus`,
        metadata: {
          inactive_days: null,
          last_activity_date: null
        }
      });
      continue;
    }

    const inactiveDays = differenceInDays(latestActivityDate, currentDate);

    if (inactiveDays >= INACTIVE_DAYS_THRESHOLD) {
      alerts.push({
        id: `inactive-bus-${bus.id}-${latestActivityDate}`,
        type: "inactive_bus",
        severity: "medium",
        bus_id: bus.id,
        bus_number: bus.bus_number,
        date: currentDate,
        title: `Inactive bus: ${bus.bus_number}`,
        message: `No diesel or expense activity recorded for ${inactiveDays} days`,
        metadata: {
          inactive_days: inactiveDays,
          last_activity_date: latestActivityDate
        }
      });
    }
  }

  return alerts.sort((left, right) => {
    const severityRank = { high: 0, medium: 1, low: 2 };
    const severityCompare =
      (severityRank[left.severity] ?? 9) - (severityRank[right.severity] ?? 9);

    if (severityCompare !== 0) {
      return severityCompare;
    }

    return right.date.localeCompare(left.date);
  });
}
