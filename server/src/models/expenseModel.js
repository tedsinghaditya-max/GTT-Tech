import { query } from "../config/db.js";

const fallbackExpenses = [
  {
    id: 1,
    bus_id: 1,
    bus_number: "KA-01-AB-2211",
    type: "maintenance",
    amount: 12500,
    date: "2026-03-11"
  },
  {
    id: 2,
    bus_id: 1,
    bus_number: "KA-01-AB-2211",
    type: "oil",
    amount: 3200,
    date: "2026-03-17"
  },
  {
    id: 3,
    bus_id: 2,
    bus_number: "KA-02-CD-4510",
    type: "tyre",
    amount: 18500,
    date: "2026-03-14"
  }
];

const fallbackBuses = [
  { id: 1, bus_number: "KA-01-AB-2211" },
  { id: 2, bus_number: "KA-02-CD-4510" }
];

let nextFallbackId = fallbackExpenses.length + 1;

function mapExpense(row) {
  return {
    id: row.id,
    bus_id: row.bus_id,
    bus_number: row.bus_number,
    type: row.type,
    amount: Number(row.amount),
    date: row.date
  };
}

export async function listExpenses() {
  try {
    const result = await query(
      `SELECT e.id,
              e.bus_id,
              b.bus_number,
              e.type,
              e.amount,
              e.expense_date AS date
       FROM expenses e
       INNER JOIN buses b ON b.id = e.bus_id
       ORDER BY e.expense_date DESC, e.id DESC`
    );

    return result.rows.map(mapExpense);
  } catch (error) {
    return [...fallbackExpenses].sort((left, right) => {
      const dateCompare = right.date.localeCompare(left.date);
      return dateCompare !== 0 ? dateCompare : right.id - left.id;
    });
  }
}

export async function createExpense(data) {
  try {
    const result = await query(
      `INSERT INTO expenses (bus_id, type, amount, expense_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, bus_id, type, amount, expense_date AS date`,
      [data.bus_id, data.type, data.amount, data.date]
    );

    const busResult = await query("SELECT bus_number FROM buses WHERE id = $1", [data.bus_id]);

    return {
      id: result.rows[0].id,
      bus_id: result.rows[0].bus_id,
      bus_number: busResult.rows[0]?.bus_number || "",
      type: result.rows[0].type,
      amount: Number(result.rows[0].amount),
      date: result.rows[0].date
    };
  } catch (error) {
    const bus = fallbackBuses.find((item) => item.id === data.bus_id);

    if (!bus) {
      error.status = 404;
      error.message = "Bus not found";
      throw error;
    }

    const item = {
      id: nextFallbackId++,
      bus_id: data.bus_id,
      bus_number: bus.bus_number,
      type: data.type,
      amount: data.amount,
      date: data.date
    };

    fallbackExpenses.unshift(item);
    return item;
  }
}
