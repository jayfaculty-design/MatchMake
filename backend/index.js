const express = require("express");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRequestRoutes = require("./routes/matchRequestRoutes");
const matchRoutes = require("./routes/matchRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");
require("dotenv").config();
const port = 3000;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://team-link.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the MatchMake backend");
});
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.team,
  });
});

// routes
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);
app.use("/match-requests", matchRequestRoutes);
app.use("/matches", matchRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
