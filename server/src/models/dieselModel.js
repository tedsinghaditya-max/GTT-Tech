import { query } from "../config/db.js";

const fallbackEntries = [
  {
    id: 1,
    bus_id: 1,
    bus_number: "KA-01-AB-2211",
    litres: 60,
    price: 5880,
    odometer_reading: 12000,
    date: "2026-03-10"
  },
  {
    id: 2,
    bus_id: 1,
    bus_number: "KA-01-AB-2211",
    litres: 55,
    price: 5445,
    odometer_reading: 12330,
    date: "2026-03-15"
  },
  {
    id: 3,
    bus_id: 1,
    bus_number: "KA-01-AB-2211",
    litres: 60,
    price: 6120,
    odometer_reading: 12540,
    date: "2026-03-18"
  },
  {
    id: 4,
    bus_id: 2,
    bus_number: "KA-02-CD-4510",
    litres: 50,
    price: 4900,
    odometer_reading: 8700,
    date: "2026-03-12"
  },
  {
    id: 5,
    bus_id: 2,
    bus_number: "KA-02-CD-4510",
    litres: 48,
    price: 4704,
    odometer_reading: 8988,
    date: "2026-03-16"
  }
];

const fallbackBuses = [
  { id: 1, bus_number: "KA-01-AB-2211" },
  { id: 2, bus_number: "KA-02-CD-4510" }
];

let nextFallbackId = fallbackEntries.length + 1;
const MILEAGE_DROP_RATIO = 0.8;
const MIN_DROP_DELTA = 1;

function toNumber(value) {
  return Number(value);
}

function roundMileage(value) {
  return Math.round(value * 100) / 100;
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function mapEntry(row) {
  return {
    id: row.id,
    bus_id: row.bus_id,
    bus_number: row.bus_number,
    litres: toNumber(row.litres),
    price: toNumber(row.price),
    odometer_reading: toNumber(row.odometer_reading),
    date: row.date
  };
}

function computeMileageData(entries) {
  const grouped = new Map();

  for (const entry of entries) {
    if (!grouped.has(entry.bus_id)) {
      grouped.set(entry.bus_id, []);
    }

    grouped.get(entry.bus_id).push(entry);
  }

  const averageMileageByBus = [];
  const enrichedEntries = [];
  const alerts = [];

  for (const [busId, busEntries] of grouped.entries()) {
    const orderedEntries = [...busEntries].sort((left, right) => {
      const dateCompare = left.date.localeCompare(right.date);
      return dateCompare !== 0 ? dateCompare : left.id - right.id;
    });

    let previousOdometer = null;
    let previousMileage = null;
    let totalMileage = 0;
    let mileageCount = 0;
    let historicalMileageTotal = 0;
    let historicalMileageCount = 0;

    for (const entry of orderedEntries) {
      let mileage_per_entry = null;
      let mileage_alert = null;

      if (previousOdometer !== null) {
        const distance = entry.odometer_reading - previousOdometer;

        if (distance >= 0 && entry.litres > 0) {
          mileage_per_entry = roundMileage(distance / entry.litres);
          totalMileage += mileage_per_entry;
          mileageCount += 1;

          const historicalAverage =
            historicalMileageCount > 0
              ? roundMileage(historicalMileageTotal / historicalMileageCount)
              : null;
          const baselineMileage = historicalAverage ?? previousMileage;

          if (
            baselineMileage !== null &&
            mileage_per_entry <= baselineMileage * MILEAGE_DROP_RATIO &&
            baselineMileage - mileage_per_entry >= MIN_DROP_DELTA
          ) {
            mileage_alert = {
              type: "abnormal_mileage_drop",
              severity: "high",
              baseline_mileage: baselineMileage,
              drop_percentage: roundMileage(
                ((baselineMileage - mileage_per_entry) / baselineMileage) * 100
              ),
              message: `Mileage dropped from ${baselineMileage} to ${mileage_per_entry} km/L`
            };

            alerts.push({
              id: `mileage-drop-${entry.id}`,
              type: "abnormal_mileage_drop",
              severity: "high",
              bus_id: entry.bus_id,
              bus_number: entry.bus_number,
              entry_id: entry.id,
              date: entry.date,
              current_mileage: mileage_per_entry,
              baseline_mileage: baselineMileage,
              drop_percentage: mileage_alert.drop_percentage,
              title: `Abnormal mileage drop detected for ${entry.bus_number}`,
              message: mileage_alert.message
            });
          }

          historicalMileageTotal += mileage_per_entry;
          historicalMileageCount += 1;
          previousMileage = mileage_per_entry;
        }
      }

      previousOdometer = entry.odometer_reading;
      enrichedEntries.push({
        ...entry,
        mileage_per_entry,
        mileage_alert
      });
    }

    averageMileageByBus.push({
      bus_id: busId,
      bus_number: orderedEntries[0]?.bus_number || "",
      average_mileage: mileageCount > 0 ? roundMileage(totalMileage / mileageCount) : null
    });
  }

  enrichedEntries.sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date);
    return dateCompare !== 0 ? dateCompare : right.id - left.id;
  });

  averageMileageByBus.sort((left, right) => left.bus_number.localeCompare(right.bus_number));

  return {
    items: enrichedEntries,
    averages: averageMileageByBus,
    alerts
  };
}

export async function listDieselEntries() {
  try {
    const result = await query(
      `SELECT d.id,
              d.bus_id,
              b.bus_number,
              d.litres,
              d.price,
              d.odometer_reading,
              d.entry_date AS date
       FROM diesel_logs d
       INNER JOIN buses b ON b.id = d.bus_id
       ORDER BY d.entry_date DESC, d.id DESC`
    );

    return computeMileageData(result.rows.map(mapEntry));
  } catch (error) {
    return computeMileageData([...fallbackEntries]);
  }
}

export async function createDieselEntry(data) {
  try {
    const result = await query(
      `INSERT INTO diesel_logs (bus_id, litres, price, odometer_reading, entry_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, bus_id, litres, price, odometer_reading, entry_date AS date`,
      [data.bus_id, data.litres, data.price, data.odometer_reading, data.date]
    );

    const busResult = await query("SELECT bus_number FROM buses WHERE id = $1", [data.bus_id]);
    const busNumber = busResult.rows[0]?.bus_number;

    return {
      id: result.rows[0].id,
      bus_id: result.rows[0].bus_id,
      bus_number: busNumber || "",
      litres: toNumber(result.rows[0].litres),
      price: toNumber(result.rows[0].price),
      odometer_reading: toNumber(result.rows[0].odometer_reading),
      date: result.rows[0].date
    };
  } catch (error) {
    const bus = fallbackBuses.find((item) => item.id === data.bus_id);

    if (!bus) {
      error.status = 404;
      error.message = "Bus not found";
      throw error;
    }

    const newEntry = {
      id: nextFallbackId++,
      bus_id: data.bus_id,
      bus_number: bus.bus_number,
      litres: data.litres,
      price: data.price,
      odometer_reading: data.odometer_reading,
      date: data.date
    };

    fallbackEntries.push(newEntry);
    return newEntry;
  }
}

export async function estimateDieselPrice(litres, busId = null) {
  const safeLitres = Number(litres);

  if (!Number.isFinite(safeLitres) || safeLitres <= 0) {
    return 0;
  }

  try {
    const result = await query(
      `SELECT price, litres
       FROM diesel_logs
       WHERE ($1::integer IS NULL OR bus_id = $1)
       ORDER BY entry_date DESC, id DESC
       LIMIT 5`,
      [busId]
    );

    const entries = result.rows
      .map((row) => ({
        price: Number(row.price),
        litres: Number(row.litres)
      }))
      .filter((entry) => entry.price > 0 && entry.litres > 0);

    if (entries.length > 0) {
      const averageRate =
        entries.reduce((sum, entry) => sum + entry.price / entry.litres, 0) / entries.length;
      return roundCurrency(averageRate * safeLitres);
    }
  } catch (error) {
  }

  const fallbackEntriesForBus = fallbackEntries.filter(
    (entry) => busId === null || entry.bus_id === busId
  );
  const entries = fallbackEntriesForBus.length > 0 ? fallbackEntriesForBus : fallbackEntries;
  const averageRate =
    entries.reduce((sum, entry) => sum + entry.price / entry.litres, 0) / entries.length;

  return roundCurrency(averageRate * safeLitres);
}
