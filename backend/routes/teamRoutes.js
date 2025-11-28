const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const bcrypt = require("bcrypt");

// get all teams
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, logo_url, location, description, skill_level, created_at FROM teams`
    );
    res.status(200).json({
      teams: result.rows,
    });
  } catch (error) {
    console.log("Error getting teams", error);
    res.status(403).json({
      message: "Error getting teams",
    });
  }
});

// create/update team profile
// router.put("/create-profile", authMiddleware, async (req, res) => {
//   const team_id = req.team.id;
//   const {
//     email,
//     teamName,
//     logo_url,
//     location,
//     description,
//     skillLevel,
//     contact,
//   } = req.body;

//   try {
//     const result = await db.query("SELECT * FROM teams WHERE id = $1", [
//       team_id,
//     ]);
//     const team = result.rows[0];
//     if (!team)
//       return res.status(403).json({
//         message: "Unauthorized user",
//       });

//     const updatedTeam = await db.query(`
//       UPDATE teams

//       `)
//   } catch (error) {}
// });

// get one team
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT id, name, email, logo_url, location, description, skill_level, created_at FROM teams WHERE id = $1`,
      [id]
    );
    const team = result.rows;
    if (team.length < 1)
      return res.status(404).json({
        message: "No team found",
      });
    res.status(200).json({
      team: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting team", error);
    res.status(403).json({
      message: "Error getting team",
    });
  }
});

// get authorized team
router.get("/me/my-team", authMiddleware, async (req, res) => {
  const team_id = req.team.id;

  try {
    const result = await db.query(`SELECT * FROM teams WHERE id = $1`, [
      team_id,
    ]);
    if (result.rows.length === 0)
      return res.status(403).json({
        message: "Team not found, Unauthorized",
      });
    res.status(200).json({
      message: "Team details fetched successfully",
      team: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting team", error);
    res.status(403).json({
      message: "Error getting team",
    });
  }
});

// update team profile
router.put("/create-profile", authMiddleware, async (req, res) => {
  const id = req.team.id;
  const { teamName, email, logo_url, location, description, skill_level } =
    req.body;

  try {
    const teamResult = await db.query("SELECT * FROM teams WHERE id = $1", [
      id,
    ]);

    // checking if team exists
    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        message: "Not authorized team",
      });
    }

    // update team
    const updatedTeam = await db.query(
      `UPDATE teams
      SET 
      name = COALESCE($1, name),
      logo_url = COALESCE($2, logo_url),
      email = COALESCE($3, email),
      skill_level = COALESCE($4, skill_level),
      description = COALESCE($5, description),
      location = COALESCE($6, location)
      WHERE id = $7
      RETURNING id, email, name, logo_url, location, skill_level, description, created_at
      `,
      [teamName, logo_url, email, skill_level, description, location, id]
    );
    res.status(200).json({
      message: `Team details updated successfully`,
      team: updatedTeam.rows[0],
    });
  } catch (error) {
    console.error("Error updating the team", error);
    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
});

// delete team
router.delete("/", authMiddleware, async (req, res) => {
  const id = req.team.id;

  try {
    const team = await db.query(`SELECT * FROM teams WHERE id = $1`, [id]);
    if (team.rows.length === 0) {
      return res.status(500).json({
        message: "Cannot delete team, Unauthorized",
      });
    }
    const deletedUser = await db.query(
      `DELETE FROM teams WHERE id = $1 RETURNING name`,
      [id]
    );
    res.status(200).json({
      message: "Team deleted successfully",
      deletedTeam: deletedUser.rows[0],
    });
  } catch (error) {
    console.error("Error deleting team", error);
    res.status(404).json({
      message: "Error deleting team ",
    });
  }
});

module.exports = router;
