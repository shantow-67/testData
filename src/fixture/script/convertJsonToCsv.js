import fs from "fs";
import path from "path";
import { parse } from "json2csv";

const inputDir = "./output-json"; // Folder containing your 38 JSON files
const outputDir = "./output-csv"; // Output folder for CSV files

// Desired CSV headers in order
const fields = [
  "fixture_id",
  "date",
  "homeTeam",
  "awayTeam",
  "gameweek",
  "round_id",
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir).forEach((file) => {
  if (file.endsWith(".json")) {
    const jsonPath = path.join(inputDir, file);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    try {
      const csv = parse(jsonData, { fields });
      const outputFileName = file.replace(".json", ".csv");
      const outputPath = path.join(outputDir, outputFileName);
      fs.writeFileSync(outputPath, csv, "utf-8");
      console.log(`✅ Converted: ${file} -> ${outputFileName}`);
    } catch (err) {
      console.error(`❌ Error converting ${file}:`, err.message);
    }
  }
});
