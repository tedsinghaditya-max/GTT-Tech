function alertReasonLabel(type) {
  if (type === "low_mileage") {
    return "Low mileage";
  }

  if (type === "high_maintenance") {
    return "High expense";
  }

  if (type === "inactive_bus") {
    return "Inactive bus";
  }

  return "Issue";
}

export function ProblemBusesPage({ alerts = [] }) {
  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Problem Buses</p>
          <h2>Problem buses today</h2>
        </div>
        <p className="hero-copy">
          Jaldi dekho kaunsi bus pe aaj action lena hai.
        </p>
      </section>

      <section className="table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Alert List</p>
            <h3>Problem buses today</h3>
          </div>
          <p>{alerts.length} buses need attention.</p>
        </div>

        <div className="problem-bus-list">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <article key={alert.id} className="problem-bus-card">
                <div className="problem-bus-main">
                  <strong>{alert.bus_number}</strong>
                  <span className={`severity-pill severity-${alert.severity}`}>
                    {alertReasonLabel(alert.type)}
                  </span>
                </div>
                <p>{alert.message}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <strong>No problem buses</strong>
              <p>Aaj koi critical issue nahi hai.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
