const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const db = require("../config/db");

router.get("/", authMiddleware, async (req, res) => {
  const team_id = req.team.id;

  const result = await db.query(`SELECT * FROM teams WHERE id = $1`, [team_id]);
  const team = await result.rows[0];
  if (!team)
    return res.status(403).json({
      message: "Cannot find team",
    });

  res.status(200).json({
    team_data: team,
  });
});

module.exports = router;
