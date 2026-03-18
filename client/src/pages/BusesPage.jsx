function getProfitTone(profitItem) {
  if (!profitItem) {
    return "average";
  }

  if (profitItem.profit_margin_percentage >= 20 || profitItem.total_profit >= 50000) {
    return "high";
  }

  if (profitItem.profit_margin_percentage >= 8 || profitItem.total_profit >= 15000) {
    return "average";
  }

  return "low";
}

function getProfitLabel(tone) {
  if (tone === "high") {
    return "High";
  }

  if (tone === "low") {
    return "Low";
  }

  return "Average";
}

export function BusesPage({ buses, profits = [] }) {
  const profitByBusId = new Map(profits.map((item) => [item.bus_id, item]));

  return (
    <div className="page">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Bus List / Soochi</p>
          <h2>Fleet buses</h2>
        </div>
        <p>Bus, driver aur profit simple view.</p>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Bus No.</th>
              <th>Model</th>
              <th>Year</th>
              <th>Driver</th>
              <th>Project</th>
              <th>Profit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => {
              const profitItem = profitByBusId.get(bus.id);
              const tone = getProfitTone(profitItem);

              return (
                <tr key={bus.id}>
                  <td>{bus.bus_number}</td>
                  <td>{bus.model}</td>
                  <td>{bus.year}</td>
                  <td>{bus.assigned_driver || "Unassigned"}</td>
                  <td>{bus.project}</td>
                  <td>
                    {profitItem ? `Rs. ${profitItem.total_profit}` : "Not available"}
                  </td>
                  <td>
                    <span className={`profit-pill profit-pill-${tone}`}>
                      {getProfitLabel(tone)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
