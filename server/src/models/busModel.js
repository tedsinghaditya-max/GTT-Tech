import { query } from "../config/db.js";

const fallbackBuses = [
  {
    id: 1,
    bus_number: "KA-01-AB-2211",
    model: "Volvo 9400",
    year: 2022,
    assigned_driver: "Ravi Kumar",
    project: "Airport Shuttle"
  },
  {
    id: 2,
    bus_number: "KA-02-CD-4510",
    model: "Ashok Leyland Oyster",
    year: 2021,
    assigned_driver: "Suresh Naik",
    project: "City Express"
  }
];

let nextFallbackId = fallbackBuses.length + 1;

function mapBus(row) {
  return {
    id: row.id,
    bus_number: row.bus_number,
    model: row.model,
    year: Number(row.year),
    assigned_driver: row.assigned_driver || "",
    project: row.project
  };
}

export async function listBuses() {
  try {
    const result = await query(
      `SELECT id, bus_number, model, year, assigned_driver, project
       FROM buses
       ORDER BY id DESC`
    );

    return result.rows.map(mapBus);
  } catch (error) {
    return [...fallbackBuses];
  }
}

export async function findBusByNumber(busNumber) {
  const normalizedBusNumber = busNumber?.trim();

  if (!normalizedBusNumber) {
    return null;
  }

  try {
    const result = await query(
      `SELECT id, bus_number, model, year, assigned_driver, project
       FROM buses
       WHERE LOWER(bus_number) = LOWER($1)
       LIMIT 1`,
      [normalizedBusNumber]
    );

    return result.rows[0] ? mapBus(result.rows[0]) : null;
  } catch (error) {
    return (
      fallbackBuses.find(
        (bus) => bus.bus_number.toLowerCase() === normalizedBusNumber.toLowerCase()
      ) || null
    );
  }
}

export async function createBus(data) {
  try {
    const result = await query(
      `INSERT INTO buses (bus_number, model, year, assigned_driver, project)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, bus_number, model, year, assigned_driver, project`,
      [
        data.bus_number,
        data.model,
        data.year,
        data.assigned_driver || null,
        data.project
      ]
    );

    return mapBus(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      error.status = 409;
      error.message = "Bus number already exists";
      throw error;
    }

    const bus = {
      id: nextFallbackId++,
      bus_number: data.bus_number,
      model: data.model,
      year: data.year,
      assigned_driver: data.assigned_driver || "",
      project: data.project
    };

    fallbackBuses.unshift(bus);
    return bus;
  }
}

export async function updateBus(id, data) {
  try {
    const result = await query(
      `UPDATE buses
       SET bus_number = $1,
           model = $2,
           year = $3,
           assigned_driver = $4,
           project = $5
       WHERE id = $6
       RETURNING id, bus_number, model, year, assigned_driver, project`,
      [
        data.bus_number,
        data.model,
        data.year,
        data.assigned_driver || null,
        data.project,
        id
      ]
    );

    if (!result.rows[0]) {
      return null;
    }

    return mapBus(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      error.status = 409;
      error.message = "Bus number already exists";
      throw error;
    }

    const busIndex = fallbackBuses.findIndex((bus) => bus.id === id);

    if (busIndex === -1) {
      return null;
    }

    fallbackBuses[busIndex] = {
      ...fallbackBuses[busIndex],
      ...data,
      assigned_driver: data.assigned_driver || ""
    };

    return fallbackBuses[busIndex];
  }
}
