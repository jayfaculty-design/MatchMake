const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// create a match when a team accept a match request
router.post("/", authMiddleware, async (req, res) => {
  const { team2_id, date, time, location, status } = req.body;
  // logged in team
  const team1_id = req.team.id;

  try {
    const match = await db.query(
      `INSERT INTO matches (team1_id, team2_id, date, time, location, status)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [team1_id, team2_id, date, time, location, status]
    );
    res.status(200).json({
      message: "Match created successfully",
      match: match.rows[0],
    });
  } catch (error) {
    console.error("Error creating a match", error);
    res.status(404).json({
      message: "Error creating a match",
    });
  }
});

// get all matches
router.get("/", async (req, res) => {
  try {
    const allMatches = await db.query(
      `SELECT m.*, 
            t1.name AS team1_name, 
            t2.name AS team2_name 
       FROM matches m
       JOIN teams t1 ON m.team1_id = t1.id
       JOIN teams t2 ON m.team2_id = t2.id
       ORDER BY m.created_at DESC`
    );
    res.json({
      matches: allMatches.rows,
    });
  } catch (error) {
    console.error("Failed to fetch matches", error);
    res.status(500).json({
      message: "Failed to fetch matches",
    });
  }
});

// get a single match by match id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const singleMatch = await db.query(`SELECT * FROM matches WHERE id = $1`, [
      id,
    ]);
    if (singleMatch.rows.length < 1)
      return res.status(403).json({
        message: "Match not found",
      });
    res.status(200).json({
      message: "Match Found",
      match: singleMatch.rows[0],
    });
  } catch (error) {
    console.error("Error getting match", error);
    res.status(500).json({
      message: "Error retrieving match",
    });
  }
});

// update match status by created team
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const match = await db.query(`SELECT * FROM matches WEHRE id = $1`, [id]);
    if (!match)
      return res.status(500).json({
        message: "Match not found",
      });

    if (
      match.rows[0].team1_id !== req.team.id &&
      match.rows[0].team2_id !== req.team.id
    )
      return res.status(403).json({
        message: "Not authroized to update this match",
      });
    const updatedMatchStatus = await db.query(
      `
        UPDATE matches
        SET status = $1
        WHERE id = $2
        `,
      [status, id]
    );
    res.status(200).json({
      message: "Match updated successfully",
      updatedMatchStatus: updatedMatchStatus.rows[0],
    });
  } catch (error) {
    console.error("Error updating match status", error);
    res.status(500).json({
      message: "Error updating match status",
    });
  }
});

// delete match, only team1 can delete it
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const match = await db.query(`SELECT * FROM matches WHERE id = $1`, [id]);

    if (match.rows.length < 1)
      return res.status(500).json({
        message: "Match not found",
      });

    if (
      match.rows[0].team1_id !== req.team.id &&
      match.rows[0].team2_id !== req.team.id
    )
      return res.status(403).json({
        message: "Cannot delete match, Unauthorized user",
      });

    const deletedMatch = await db.query(
      `DELETE FROM matches WHERE id = $1 RETURNING *`,
      [id]
    );
    res.status(200).json({
      message: "Match deleted",
      deletdMatch: deletedMatch.rows[0],
    });
  } catch (error) {
    console.error("Error deleting a match", error);
    res.status(404).json({
      message: "Error deleting a match",
    });
  }
});

module.exports = router;
