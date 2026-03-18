import { useState } from "react";

const initialForm = {
  bus_number: "",
  litres: "",
  odometer_reading: ""
};

export function DieselPage({ entries, averages = [], alerts = [], onQuickAdd }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await onQuickAdd(form);
      setSuccess("Diesel entry saved.");
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Diesel tracking</p>
          <h2>Fuel log overview</h2>
        </div>
        <p>Track refill behavior, cost, and route-level fuel spend.</p>
      </section>

      <section className="table-card quick-form-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick Entry / Jaldi Entry</p>
            <h3>Diesel bharo</h3>
          </div>
          <p>Only 3 fields. Date and price auto.</p>
        </div>

        <form className="quick-entry-form" onSubmit={handleSubmit}>
          <label>
            Bus No.
            <input
              type="text"
              value={form.bus_number}
              onChange={(event) =>
                setForm((current) => ({ ...current, bus_number: event.target.value }))
              }
              placeholder="KA-01-AB-2211"
            />
          </label>

          <label>
            Litres
            <input
              type="number"
              inputMode="decimal"
              value={form.litres}
              onChange={(event) =>
                setForm((current) => ({ ...current, litres: event.target.value }))
              }
              placeholder="50"
            />
          </label>

          <label>
            Odometer
            <input
              type="number"
              inputMode="numeric"
              value={form.odometer_reading}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  odometer_reading: event.target.value
                }))
              }
              placeholder="12540"
            />
          </label>

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Saving..." : "Save / Save"}
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}
      </section>

      <section className="metrics-grid">
        {averages.map((average) => (
          <article key={average.bus_id} className="metric-card">
            <p>{average.bus_number}</p>
            <strong>
              {average.average_mileage === null
                ? "N/A"
                : `${average.average_mileage} km/L`}
            </strong>
            <span>Average mileage</span>
          </article>
        ))}
      </section>

      {alerts.length > 0 ? (
        <section className="table-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Alerts</p>
              <h3>Abnormal mileage drops</h3>
            </div>
            <p>Entries that fell sharply below the recent mileage baseline.</p>
          </div>

          <div className="list-stack">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <span className={`severity-pill severity-${alert.severity}`}>
                  {alert.severity}
                </span>
                <p>
                  {alert.bus_number}: {alert.message} ({alert.drop_percentage}% drop)
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bus</th>
              <th>Litres</th>
              <th>Price</th>
              <th>Odometer</th>
              <th>Mileage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.bus_number}</td>
                <td>{entry.litres}</td>
                <td>Rs. {entry.price}</td>
                <td>{entry.odometer_reading}</td>
                <td>
                  {entry.mileage_per_entry === null
                    ? "N/A"
                    : `${entry.mileage_per_entry} km/L`}
                </td>
                <td>{entry.mileage_alert ? "Alert" : "Normal"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
