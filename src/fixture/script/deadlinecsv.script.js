import fs from "fs";
import path from "path";
import { parse } from "json2csv";

// Paths
const INPUT_DIR = "./deadline-output-json";
const INPUT_FILE = path.join(INPUT_DIR, "all_gameweeks.json");
const CSV_FILE = path.join(INPUT_DIR, "all_gameweeks.csv");

// Define the fields you want in CSV (ordered)
const fields = [
  "fixture_id",
  "home_team_id",
  "away_team_id",
  "home_team_name",
  "away_team_name",
  "starting_at",
  "GW",
  "fantasy_deadline",
  "fantasy_deadline_bdt",
  "proprediction_deadline",
];

const opts = { fields };

const jsonToCsv = () => {
  try {
    const rawData = fs.readFileSync(INPUT_FILE, "utf-8");
    const jsonData = JSON.parse(rawData);

    const csv = parse(jsonData, opts);

    fs.writeFileSync(CSV_FILE, csv, "utf-8");
    console.log(`✅ CSV file created at: ${CSV_FILE}`);
  } catch (err) {
    console.error("❌ Error during conversion:", err.message);
  }
};

jsonToCsv();
