import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import FixtureModel from "../fixture.model.js";
import RoundModel from "../../rounds/round.model.js";
import TeamModel from "../../teams/teamModel.js";

dotenv.config();

const OUTPUT_DIR = "./output";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const generateGameweekJson = async (gw) => {
  try {
    const round = await RoundModel.findOne({ name: gw.toString() });

    if (!round) {
      console.warn(`⚠️  Round with name "${gw}" not found`);
      return null;
    }

    const fixtures = await FixtureModel.find({ round_id: round._id })
      .select("home_team_id away_team_id starting_at")
      .populate("home_team_id", "name")
      .populate("away_team_id", "name")
      .sort({ starting_at: 1 })
      .lean();

    if (!fixtures || fixtures.length === 0) {
      console.warn(`⚠️  No fixtures found for gameweek ${gw}`);
      return null;
    }

    const simplifiedFixtures = fixtures.map((fixture) => {
      const bangladeshTime = new Date(fixture.starting_at).toLocaleString(
        "en-BD",
        {
          timeZone: "Asia/Dhaka",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );

      return {
        id: fixture._id,
        date: bangladeshTime,
        homeTeam: fixture.home_team_id?.name || "Unknown",
        awayTeam: fixture.away_team_id?.name || "Unknown",
      };
    });

    const jsonData = {
      gameweek: gw,
      totalFixtures: simplifiedFixtures.length,
      round_id: round._id,
      data: simplifiedFixtures,
    };

    const filePath = path.join(OUTPUT_DIR, `gameweek-${gw}.json`);
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

    console.log(`✅ Gameweek ${gw} saved to ${filePath}`);
  } catch (err) {
    console.error(`❌ Error generating Gameweek ${gw}:`, err.message);
  }
};

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    for (let gw = 1; gw <= 38; gw++) {
      await generateGameweekJson(gw);
    }

    console.log("🎉 All gameweeks processed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

main();
