import { createBus, listBuses, updateBus } from "../models/busModel.js";

function normalizeBusPayload(body = {}) {
  return {
    bus_number: body.bus_number?.trim(),
    model: body.model?.trim(),
    year: Number(body.year),
    assigned_driver: body.assigned_driver?.trim() || "",
    project: body.project?.trim()
  };
}

function validateBusPayload(payload) {
  if (!payload.bus_number || !payload.model || !payload.project || !payload.year) {
    return "bus_number, model, year, and project are required";
  }

  if (!Number.isInteger(payload.year) || payload.year < 1980 || payload.year > 2100) {
    return "year must be a valid 4-digit year between 1980 and 2100";
  }

  return null;
}

export async function getBuses(req, res) {
  const items = await listBuses();
  res.json({ items });
}

export async function addBus(req, res) {
  const payload = normalizeBusPayload(req.body);
  const validationError = validateBusPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const bus = await createBus(payload);
  res.status(201).json({
    message: "Bus created successfully",
    item: bus
  });
}

export async function editBus(req, res) {
  const id = Number(req.params.id);
  const payload = normalizeBusPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "A valid bus id is required" });
  }

  const validationError = validateBusPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const bus = await updateBus(id, payload);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.json({
    message: "Bus updated successfully",
    item: bus
  });
}
