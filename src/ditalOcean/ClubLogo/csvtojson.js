import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

// Resolve __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const csvFilePath = path.join(__dirname, "team_logos.csv");
const jsonFilePath = path.join(__dirname, "team_logos.json");

async function convertCSVtoJSON() {
  try {
    const jsonArray = await csv().fromFile(csvFilePath);
    await writeFile(jsonFilePath, JSON.stringify(jsonArray, null, 2));
    console.log(`✅ JSON file saved: ${jsonFilePath}`);
  } catch (err) {
    console.error("❌ Error converting CSV to JSON:", err);
  }
}

convertCSVtoJSON();
