export function DriversPage({ drivers }) {
  return (
    <div className="page">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Driver management</p>
          <h2>Driver directory</h2>
        </div>
        <p>Keep licenses, availability, and contact details organized.</p>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>License</th>
              <th>Experience</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.experienceYears} years</td>
                <td>{driver.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

