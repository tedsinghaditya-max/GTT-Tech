const drivers = [
  {
    id: 1,
    name: "Ravi Kumar",
    phone: "+91 9876543210",
    licenseNumber: "DL-09-2020456",
    experienceYears: 8,
    status: "Available"
  },
  {
    id: 2,
    name: "Suresh Naik",
    phone: "+91 9988776655",
    licenseNumber: "DL-11-2021888",
    experienceYears: 5,
    status: "On Route"
  }
];

export async function getDrivers(req, res) {
  res.json({ items: drivers });
}

