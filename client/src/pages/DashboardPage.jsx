export function DashboardPage({ dashboard }) {
  const metrics = dashboard.metrics || [];
  const alerts = dashboard.recentAlerts || [];
  const profitBreakdown = dashboard.profitBreakdown || {};

  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Today / Aaj</p>
          <h2>Bus ka status, cost aur profit ek jagah.</h2>
        </div>
        <p className="hero-copy">
          Jaldi dekho kya chal raha hai, kya ruk gaya hai, aur kahan alert hai.
        </p>
      </section>

      <section className="dashboard-metrics-grid">
        {metrics.map((metric) => (
          <article
            key={metric.key || metric.label}
            className={`metric-card metric-card-${metric.tone || "default"}`}
          >
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.delta}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-detail-grid">
        <article className="table-card finance-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Financial summary</p>
              <h3>Profit / Munafa</h3>
            </div>
            <p>Revenue se diesel, salary aur maintenance minus.</p>
          </div>

          <div className="finance-breakdown">
            <div className="finance-row">
              <span>Revenue</span>
              <strong>Rs. {profitBreakdown.revenue ?? 0}</strong>
            </div>
            <div className="finance-row">
              <span>Diesel</span>
              <strong>Rs. {profitBreakdown.diesel ?? 0}</strong>
            </div>
            <div className="finance-row">
              <span>Driver Salary / Tankha</span>
              <strong>Rs. {profitBreakdown.driver_salary ?? 0}</strong>
            </div>
            <div className="finance-row">
              <span>Maintenance / Repair</span>
              <strong>Rs. {profitBreakdown.maintenance ?? 0}</strong>
            </div>
            <div className="finance-row finance-row-total">
              <span>Net Profit / Final</span>
              <strong>Rs. {profitBreakdown.net_profit ?? 0}</strong>
            </div>
          </div>
        </article>

        <article className="table-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Alerts</p>
              <h3>Alerts / Dhyan</h3>
            </div>
            <p>Low mileage, repair aur inactive bus alerts.</p>
          </div>

          <div className="list-stack">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="alert-item alert-item-card">
                  <span className={`severity-pill severity-${alert.severity}`}>
                    {alert.severity}
                  </span>
                  <div className="alert-copy">
                    <p>{alert.title}</p>
                    <span>{alert.description || "Action required."}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <strong>No active alerts</strong>
                <p>Abhi sab theek chal raha hai.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
