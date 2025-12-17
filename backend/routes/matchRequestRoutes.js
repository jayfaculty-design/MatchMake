const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// create a new match request
router.post("/", authMiddleware, async (req, res) => {
  const team_id = req.team.id;
  const { date, time, location, message } = req.body;

  try {
    const team = await db.query(`SELECT * FROM teams WHERE id = $1`, [team_id]);
    const team_name = team.rows[0].name;
    if (team.rows.length === 0) {
      return res.status(403).json({
        message: "Cannot create match request because team is not found",
      });
    }
    const requestedMatch = await db.query(
      `INSERT INTO match_requests (team_id, date, time, location, message, team_name)
       VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
      [team_id, date, time, location, message, team_name]
    );
    res.status(200).json({
      message: "Request created successfully",
      requestedMatch: requestedMatch.rows[0],
    });
  } catch (error) {
    console.error("Error creating match request", error);
    res.status(404).json({
      message: "Error creating a match request",
    });
  }
});

// create a direct challenge
router.post("/send-challenge", authMiddleware, async (req, res) => {
  const { date, location, message, match_time, team1_id, team2_id } = req.body;
  const userId = req.team.id;

  try {
    const teamResult = await db.query(`SELECT * FROM teams WHERE id = $1`, [
      userId,
    ]);
    if (teamResult.rows.length === 0)
      return res.status(403).json({
        message: "Unauthorized team",
      });
    const team = teamResult.rows[0];

    const team2result = await db.query(`SELECT * FROM teams WHERE id = $1`, [
      team2_id,
    ]);
    if (team2result.rows.length === 0)
      return res.status(403).json({
        message: "Cannot find team",
      });

    if (team1_id === team2_id)
      return res.status(400).json({
        message: "Cannot challenge your own team",
      });

    const result = await db.query(
      `INSERT into match_challenge (team1_id, team2_id, date, location, message, match_time, team_name, team2_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        team.id,
        team2_id,
        date,
        location,
        message,
        match_time,
        team.name,
        team2result.rows[0].name,
      ]
    );
    res.json({
      success: true,
      message: "Match request sent",
      incomingRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Error sending request", error);
    res.status(500).json({
      message: "Cannot send match request, error",
    });
  }
});

// accept a challenge reque
router.post("/challenges/:id/accept", authMiddleware, async (req, res) => {
  const teamId = req.team.id;
  const challengeId = req.params.id;

  try {
    const verifyTeam = await db.query(
      `SELECT * FROM match_challenge WHERE team2_id = $1 AND id = $2`,
      [teamId, challengeId]
    );
    if (verifyTeam.rows.length === 0)
      return res.status(403).json({
        message: "No match challenge received",
      });

    const team = verifyTeam.rows[0]; // sender

    await db.query(
      `UPDATE match_challenge SET 
       status = COALESCE($1, status)
       WHERE team2_id = $2 AND id = $3`,
      ["accepted", teamId, challengeId]
    );

    // DELETE FROM RECEIVED CHALLENGES AFTER ACCEPTING
    await db.query(`DELETE FROM match_challenge WHERE id = $1`, [challengeId]);

    const createMatch = await db.query(
      `INSERT into matches (team1_id, team2_id, date, time, location, status, team_2_name)
      VALUES($1, $2, $3, $4, $5, 'upcoming', $6)
      RETURNING *`,
      [
        teamId,
        team.team1_id,
        team.date,
        team.match_time,
        team.location,
        team.team_name,
      ]
    );
    res.status(200).json({
      success: true,
      message: "Match challenge accepted",
      match: createMatch.rows,
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot accept challenge",
    });
  }
});

// reject match challenge
router.delete("/challenges/:id/reject", authMiddleware, async (req, res) => {
  const teamId = req.team.id;
  const challengeId = req.params.id;

  try {
    const verifyTeam = await db.query(
      `SELECT * FROM match_challenge WHERE team2_id = $1 AND id = $2`,
      [teamId, challengeId]
    );
    if (verifyTeam.rows.length === 0)
      return res.status(403).json({
        message: "No match challenge received",
      });

    const reject = await db.query(`DELETE FROM match_challenge WHERE id = $1`, [
      challengeId,
    ]);
    res.status(200).json({
      success: true,
      message: "Rejected challenge",
      rejectedChallenge: reject.rows[0],
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

// get sent match challenges
router.get("/challenges/sent", authMiddleware, async (req, res) => {
  const teamId = req.team.id;

  try {
    const result = await db.query(
      `SELECT * FROM match_challenge WHERE team1_id = $1`,
      [teamId]
    );
    if (result.rows.length === 0)
      return res.status(403).json({
        message: "No challenge sent",
      });
    res.status(200).json({
      success: true,
      sentChallenges: result.rows,
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, cannot get sent challenges",
    });
  }
});

// cancel or delete sent challenges
router.delete("/challenges/sent/:id", authMiddleware, async (req, res) => {
  const teamId = req.team.id;
  const challengeId = req.params.id;

  try {
    const result = await db.query(
      `SELECT * FROM match_challenge WHERE team1_id = $1 AND id = $2`,
      [teamId, challengeId]
    );
    if (result.rows.length === 0)
      return res.status(403).json({
        message: "Challenge does not exist",
      });

    await db.query(
      `DELETE FROM match_challenge WHERE team1_id = $1 AND id = $2`,
      [teamId, challengeId]
    );

    res.status(200).json({
      success: true,
      message: "Canceled match challenge",
    });
  } catch (error) {
    console.error("Something went wrong, cannot cancel challenge", error);
    res.status(500).json({
      message: "Something went wrong, cannot cancel challenge",
    });
  }
});

// get received match challenges
router.get("/challenges/received", authMiddleware, async (req, res) => {
  const teamId = req.team.id;

  try {
    const result = await db.query(
      `SELECT * FROM match_challenge WHERE team2_id = $1`,
      [teamId]
    );
    if (result.rows.length === 0)
      return res.status(403).json({
        message: "No challenge received",
      });
    res.status(200).json({
      success: true,
      challengesCount: result.rows.length,
      challenges: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving challenges", error);
    res.status(500).json({
      message: "Error retrieving challenges",
    });
  }
});

// join a match request
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const team2_id = req.team.id;

    const matchRequest = await db.query(
      `SELECT * FROM match_requests WHERE id = $1`,
      [id]
    );
    const request = matchRequest.rows[0];
    if (!request)
      return res.status(500).json({
        message: "Match request not found",
      });

    if (request.status !== "open")
      return res.status(400).json({
        message: "Match request has already been closed",
      });

    // preventing the same team from joining their own request
    if (request.team_id === team2_id)
      return res.status(403).json({
        message: "Cannot join your own match request",
      });

    // get the team_2 info
    const getTeam2Info = await db.query(`SELECT * FROM teams WHERE id = $1`, [
      team2_id,
    ]);
    const team2 = getTeam2Info.rows[0];

    // joining a match request
    const match = await db.query(
      `INSERT into teams_joined_requests(team_id, team_name, team_location, team_skill_level, match_request_id, request_owner_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        team2_id,
        team2.name,
        team2.location,
        team2.skill_level,
        request.id,
        request.team_id,
      ]
    );

    res.status(201).json({
      message: "Joined request successfully",
      match: match,
    });
  } catch (error) {
    console.error("Failed to join match request", error);
    res.status(404).json({
      message: "Failed to join match request",
    });
  }
});

// get received match requests
router.get("/received-requests", authMiddleware, async (req, res) => {
  const team_id = req.team.id;
  try {
    const team = await db.query(
      `SELECT * FROM teams_joined_requests  
       WHERE request_owner_id = $1`,
      [team_id]
    );

    if (team.rows.length === 0)
      return res.status(403).json({
        message: "No team has joined your request",
      });
    res.json({
      message: "Received match requests successfully",
      receivedRequests: team.rows,
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// get all accepted requests
router.get("/accepted", authMiddleware, async (req, res) => {
  const status = "upcoming";
  const team_id = req.team.id;
  try {
    const response = await db.query(
      `SELECT * FROM matches WHERE team1_id = $1 AND status = $2`,
      [team_id, status]
    );
    res.status(200).json({
      message: "Accepted match requests fetched",
      count: response.rows.length,
      acceptedRequests: response.rows,
    });
  } catch (error) {
    console.error("Error getting accepted requests");
    res.status(500).json({
      message: "Error getting accepted match requests",
    });
  }
});

// Gett all open requests
router.get("/opened", async (req, res) => {
  const status = "open";
  try {
    const openRequest = await db.query(
      `SELECT * FROM match_requests WHERE status = $1`,
      [status]
    );
    if (!status) {
      return res.status(403).json({
        message: "Match request is closed",
      });
    }
    res.status(202).json({
      message: "All opened matches",
      count: openRequest.rows.length,
      openedRequests: openRequest.rows,
    });
  } catch (error) {
    console.error("Error getting open match requests");
    res.status(404).json({
      message: "Error getting open match requests",
    });
  }
});

// getting a single request
router.get("/:id", async (req, res) => {
  const requestId = req.params.id;
  try {
    const matchRequest = await db.query(
      `SELECT * FROM match_requests WHERE id = $1`,
      [requestId]
    );
    if (matchRequest.rows.length < 1)
      return res.status(403).json({
        message: "Match request not found",
      });
    res.status(200).json({
      matchRequest: matchRequest.rows[0],
    });
  } catch (error) {
    console.error("Error getting match request");
    res.status(500).json({
      message: "Error getting match request",
    });
  }
});

// getting all requests based on the logged in team
router.get("/", authMiddleware, async (req, res) => {
  const teamId = req.team.id;
  try {
    const response = await db.query(
      `SELECT * FROM match_requests WHERE team_id = $1`,
      [teamId]
    );
    if (response.rows.length === 0)
      return res.status(403).json({
        message: "No request found for this team",
      });
    res.status(200).json({
      message: "Team match requests loaded successfully",
      matchRequest: response.rows,
    });
  } catch (error) {
    console.error("Error occured getting requests", error);
    res.status(500).json({
      message: "Error occured",
    });
  }
});

// updating match request, only team who create it
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const team_id = req.team.id;
  const { date, time, location, message } = req.body.updates;

  try {
    const matchRequest = await db.query(
      `SELECT * FROM match_requests WHERE id = $1`,
      [id]
    );
    if (matchRequest.rows.length === 0) {
      return res.status(403).json({
        message: "Cannot update match because match request cannot be found",
      });
    }
    if (team_id !== matchRequest.rows[0].team_id)
      return res.json(403).json({
        message: "Not authorized to update this match request",
      });

    const updatedMatchRequest = await db.query(
      `UPDATE match_requests 
         SET
         date = COALESCE($1, date),
         time = COALESCE($2, time),
         location = COALESCE($3, location),
         message = COALESCE($4, message)
         WHERE id = $5 AND team_id = $6
         RETURNING *
        `,
      [date, time, location, message, id, team_id]
    );
    res.status(200).json({
      message: "Match request updated",
      updatedMatchRequest: updatedMatchRequest.rows[0],
    });
  } catch (error) {
    console.error("Error updating match request", error);
    res.status(500).json({
      message: "Error updaing match request",
    });
  }
});

// delete match request, only owner of the request
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const team_id = req.team.id;

  try {
    const matchRequest = await db.query(
      `SELECT * FROM match_requests WHERE id = $1`,
      [id]
    );
    if (matchRequest.rows.length < 1) {
      return res.status(403).json({
        message: "Match request cannot be found",
      });
    }
    if (team_id !== matchRequest.rows[0].team_id)
      return res.status(403).json({
        message: "You are not authorized to delete this match request",
      });

    const deletedMatchRequest = await db.query(
      `DELETE FROM match_requests WHERE id = $1 RETURNING *`,
      [id]
    );
    res.status(200).json({
      message: "Match request deleted",
      deletedMatchRequest: deletedMatchRequest.rows[0],
    });
  } catch (error) {
    console.error("Error deleting match request", error);
    res.status(500).json({
      message: "Error deleting match request",
    });
  }
});

module.exports = router;
