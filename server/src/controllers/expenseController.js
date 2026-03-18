import { createExpense, listExpenses } from "../models/expenseModel.js";

const allowedTypes = new Set(["maintenance", "tyre", "oil"]);

function normalizePayload(body = {}) {
  return {
    bus_id: Number(body.bus_id),
    type: body.type?.trim().toLowerCase(),
    amount: Number(body.amount),
    date: body.date
  };
}

function validatePayload(payload) {
  if (!Number.isInteger(payload.bus_id) || payload.bus_id <= 0) {
    return "bus_id must be a valid bus id";
  }

  if (!allowedTypes.has(payload.type)) {
    return "type must be one of: maintenance, tyre, oil";
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return "amount must be greater than 0";
  }

  if (!payload.date || Number.isNaN(Date.parse(payload.date))) {
    return "date must be a valid date";
  }

  return null;
}

export async function getExpenses(req, res) {
  const items = await listExpenses();
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  res.json({
    items,
    summary: {
      total_amount: Math.round(totalAmount * 100) / 100
    }
  });
}

export async function addExpense(req, res) {
  const payload = normalizePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const item = await createExpense(payload);
  const items = await listExpenses();
  const totalAmount = items.reduce((sum, entry) => sum + entry.amount, 0);

  res.status(201).json({
    message: "Expense created successfully",
    item,
    summary: {
      total_amount: Math.round(totalAmount * 100) / 100
    }
  });
}
