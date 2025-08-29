import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import FixtureModel from "../fixture.model.js";
import RoundModel from "../../rounds/round.model.js";
import TeamModel from "../../teams/teamModel.js";

// Load .env if needed
dotenv.config();

const OUTPUT_DIR = "./deadline-output-json";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "all_gameweeks.json");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Convert to Bangladesh time in readable format
const toBangladeshTimeString = (date) => {
  return new Date(date).toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Main logic
const generateAllGameweeksJson = async () => {
  try {
    await mongoose.connect("db_uri", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    const allFixtures = [];

    for (let gw = 1; gw <= 38; gw++) {
      const round = await RoundModel.findOne({ name: gw.toString() });

      if (!round) {
        console.warn(`⚠️  Round with name "${gw}" not found`);
        continue;
      }

      const fixtures = await FixtureModel.find({ round_id: round._id })
        .select("home_team_id away_team_id starting_at")
        .populate("home_team_id", "name")
        .populate("away_team_id", "name")
        .sort({ starting_at: 1 }) // important to get the earliest match
        .lean();

      if (!fixtures || fixtures.length === 0) {
        console.warn(`⚠️  No fixtures found for gameweek ${gw}`);
        continue;
      }

      const firstFixtureDate = new Date(fixtures[0].starting_at);

      const fantasyDeadline = new Date(
        firstFixtureDate.getTime() - 60 * 60 * 1000
      );
      const propredictionDeadline = new Date(
        firstFixtureDate.getTime() - 24 * 60 * 60 * 1000
      );

      for (const fixture of fixtures) {
        allFixtures.push({
          fixture_id: fixture._id,
          home_team_id: fixture.home_team_id?._id || null,
          away_team_id: fixture.away_team_id?._id || null,
          home_team_name: fixture.home_team_id?.name || "Unknown",
          away_team_name: fixture.away_team_id?.name || "Unknown",
          starting_at: fixture.starting_at,
          GW: gw,
          fantasy_deadline: fantasyDeadline.toISOString(),
          fantasy_deadline_bdt: toBangladeshTimeString(fantasyDeadline),
          proprediction_deadline: propredictionDeadline.toISOString(),
        });
      }
    }

    // Sort all fixtures by GW
    allFixtures.sort((a, b) => a.GW - b.GW);

    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(allFixtures, null, 2),
      "utf-8"
    );

    console.log(`🎉 All fixtures saved to ${OUTPUT_FILE}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

generateAllGameweeksJson();
