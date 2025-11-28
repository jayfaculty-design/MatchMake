const db = require("../config/db");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();
const router = express.Router();

// register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if email exists
    const existingEmail = await db.query(
      `SELECT * FROM teams WHERE email = $1`,
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    if (email === "" && password === "") {
      return res.status(400).json({
        message: "Please fill in all the fields",
      });
    }

    const result = await db.query(
      `INSERT INTO teams (email, password) VALUES ($1, $2) RETURNING id, email`,
      [email, hashedPassword]
    );

    const token = jwt.sign(
      {
        id: result.rows[0].id,
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Team account created successfully",
      team: result.rows[0],
      token: token,
    });
  } catch (err) {
    console.error("Error creating team account", err);
    res.status(401).json({
      message: "Error creating team account",
    });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(`SELECT * FROM teams WHERE email = $1`, [
      email,
    ]);
    const team = result.rows[0];

    if (!team)
      return res.status(403).json({
        message: "Team not found",
      });

    // check if password is valid
    const isValid = await bcrypt.compare(password, team.password);
    if (!isValid) {
      return res.status(400).json({
        message: "Password does not match",
      });
    }

    // create a token if it matches the team credentials
    const token = jwt.sign(
      {
        id: team.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: token,
      message: "Login successful",
      team: {
        team_id: team.id,
        email: team.email,
        team_name: team.name,
      },
    });
  } catch (error) {
    console.error("Error loggin in", error);
    res.status(500).json({
      message: "Error logging in",
    });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});
module.exports = router;
