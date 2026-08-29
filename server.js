const express = require("express");
const cors = require("cors");
const db = require("./app/config/db.js"); // MySQL connection

const app = express();

// CORS configuration
var corsOptions = {
  origin: "*" // Allow all origins for testing
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application.# No.1 Yaari#" });
});

// GET /users - fetch all users from database
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// POST /users - add a new user to database
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ id: results.insertId, name, email });
    }
  );
});

// load tutorial routes
require("./app/routes/tutorial.routes.js")(app);

// set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

