import { createDieselEntry, listDieselEntries } from "../models/dieselModel.js";
import { estimateDieselPrice } from "../models/dieselModel.js";
import { findBusByNumber } from "../models/busModel.js";

export async function getDieselEntries(req, res) {
  const data = await listDieselEntries();
  res.json(data);
}

function normalizePayload(body = {}) {
  return {
    bus_id: Number(body.bus_id),
    litres: Number(body.litres),
    price: Number(body.price),
    odometer_reading: Number(body.odometer_reading),
    date: body.date
  };
}

function validatePayload(payload) {
  if (!Number.isInteger(payload.bus_id) || payload.bus_id <= 0) {
    return "bus_id must be a valid bus id";
  }

  if (!Number.isFinite(payload.litres) || payload.litres <= 0) {
    return "litres must be greater than 0";
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return "price must be greater than 0";
  }

  if (!Number.isFinite(payload.odometer_reading) || payload.odometer_reading < 0) {
    return "odometer_reading must be 0 or greater";
  }

  if (!payload.date || Number.isNaN(Date.parse(payload.date))) {
    return "date must be a valid date";
  }

  return null;
}

export async function addDieselEntry(req, res) {
  const payload = normalizePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const item = await createDieselEntry(payload);
  const data = await listDieselEntries();

  res.status(201).json({
    message: "Diesel entry created successfully",
    item,
    averages: data.averages,
    alerts: data.alerts
  });
}

export async function addQuickDieselEntry(req, res) {
  const busNumber = req.body.bus_number?.trim();
  const litres = Number(req.body.litres);
  const odometerReading = Number(req.body.odometer_reading);

  if (!busNumber) {
    return res.status(400).json({ message: "bus_number is required" });
  }

  if (!Number.isFinite(litres) || litres <= 0) {
    return res.status(400).json({ message: "litres must be greater than 0" });
  }

  if (!Number.isFinite(odometerReading) || odometerReading < 0) {
    return res.status(400).json({ message: "odometer_reading must be 0 or greater" });
  }

  const bus = await findBusByNumber(busNumber);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found for this bus number" });
  }

  const estimatedPrice = await estimateDieselPrice(litres, bus.id);
  const payload = {
    bus_id: bus.id,
    litres,
    price: estimatedPrice,
    odometer_reading: odometerReading,
    date: new Date().toISOString().slice(0, 10)
  };

  const item = await createDieselEntry(payload);
  const data = await listDieselEntries();

  res.status(201).json({
    message: "Quick diesel entry saved",
    item,
    averages: data.averages,
    alerts: data.alerts
  });
}
