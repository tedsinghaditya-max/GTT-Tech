\c fleet_management;

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Fleet Admin',
  'admin@fleetflow.com',
  '$2b$10$rJfC9QzM2lWwXkQJtP8AiuxU2JwR4h7YQ1vB9JmAqQ0M6M1M6j0kG',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO drivers (name, phone, license_number, experience_years, status)
VALUES
  ('Ravi Kumar', '+91 9876543210', 'DL-09-2020456', 8, 'Available'),
  ('Suresh Naik', '+91 9988776655', 'DL-11-2021888', 5, 'On Route')
ON CONFLICT (license_number) DO NOTHING;

INSERT INTO buses (bus_number, model, year, assigned_driver, project)
VALUES
  ('KA-01-AB-2211', 'Volvo 9400', 2022, 'Ravi Kumar', 'Airport Shuttle'),
  ('KA-02-CD-4510', 'Ashok Leyland Oyster', 2021, 'Suresh Naik', 'City Express')
ON CONFLICT (bus_number) DO NOTHING;

INSERT INTO diesel_logs (bus_id, litres, price, odometer_reading, entry_date)
VALUES
  (1, 60, 5880, 12000, '2026-03-10'),
  (1, 55, 5445, 12330, '2026-03-15'),
  (1, 60, 6120, 12540, '2026-03-18'),
  (2, 50, 4900, 8700, '2026-03-12'),
  (2, 48, 4704, 8988, '2026-03-16');

INSERT INTO expenses (bus_id, type, amount, expense_date)
VALUES
  (1, 'maintenance', 12500, '2026-03-11'),
  (1, 'oil', 3200, '2026-03-17'),
  (2, 'tyre', 18500, '2026-03-14');
