// Import necessary modules
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Declare and initialize the `db` MySQL connection
const db = mysql.createConnection({
  host: "b0ljpkttwazie6ycf6rl-mysql.services.clever-cloud.com",
  user: "uv6ht2ulcibcvlkm",
  password: "ugh7ye7soD7bZqXQIGQ6", // Replace with your actual MySQL password
  database: "b0ljpkttwazie6ycf6rl", // Replace with your actual database name
  port:3306
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("Connected to the MySQL database.");
});

app.get("/",(req,res)=>{
  res.send("hello");
})

// Define routes (after `db` is initialized)
app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate input fields
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Invalid or missing 'name' field." });
  }
  if (!address || typeof address !== "string" || address.trim() === "") {
    return res.status(400).json({ error: "Invalid or missing 'address' field." });
  }
  if (
    latitude === undefined ||
    typeof latitude !== "number" ||
    latitude < -90 ||
    latitude > 90
  ) {
    return res.status(400).json({ error: "Invalid or missing 'latitude' field." });
  }
  if (
    longitude === undefined ||
    typeof longitude !== "number" ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({ error: "Invalid or missing 'longitude' field." });
  }

  // Insert data into the database
  const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error("Error inserting school:", err.message);
      return res.status(500).json({ error: "Failed to add the school." });
    }

    res.status(201).json({
      message: "School added successfully!",
      school: { id: result.insertId, name, address, latitude, longitude },
    });
  });
});

// /listSchools Route
app.get("/listSchools", (req, res) => {
    const { latitude, longitude } = req.query;
  
    // Validate latitude and longitude
    if (
      !latitude ||
      isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !longitude ||
      isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or missing latitude and longitude." });
    }
  
    // Query to fetch schools and calculate distance using Haversine formula
    const query = `
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        (
          6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(latitude))
          )
        ) AS distance
      FROM schools
      ORDER BY distance ASC;
    `;
  
    // Execute query with user coordinates
    db.query(query, [latitude, longitude, latitude], (err, results) => {
      if (err) {
        console.error("Error fetching schools:", err.message);
        return res.status(500).json({ error: "Failed to fetch schools." });
      }
  
      res.status(200).json({
        message: "Schools fetched successfully.",
        schools: results,
      });
    });
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
