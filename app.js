import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import { getAllTeam } from "./src/teams/teamController.js";
import { getUpcomingFixtures } from "./src/fixture/fixtureController.js";
import { getRounds } from "./src/rounds/round.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB connection
connectDB();

// Middleware
app.use(express.json());

// CORS middleware (optional, for frontend access)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/teams", getAllTeam);
app.get("/fixtures", getUpcomingFixtures);
app.get("/rounds", getRounds);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
