import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { promises as fs } from "fs";

const s3Client = new S3Client({
  region: "sgp1",
  endpoint: "https://sgp1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: "DO00CWUMPJHTA9MGJWDM",
    secretAccessKey: "kIOfM2V2hzs+GFZ8ns6QUZI0wYWy5RDL6eLRECc+PuE",
  },
  forcePathStyle: true,
});

async function fetchLogos() {
  const data = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: "fantasyfootball",
      Prefix: "EPL/Logo/",
    })
  );

  return data.Contents.filter((file) => file.Key.includes("round.png")).map(
    (file) => {
      const filename = file.Key.split("/").pop();
      return `https://fantasyfootball.sgp1.cdn.digitaloceanspaces.com/EPL/Logo/${encodeURIComponent(
        filename
      )}`;
    }
  );
}

async function saveLogoUrls() {
  try {
    const logos = await fetchLogos();
    const jsContent = `// Auto-generated at ${new Date().toISOString()}
const premierLeagueLogos = ${JSON.stringify(logos, null, 2)};
module.exports = premierLeagueLogos;`;

    await fs.writeFile("eplLogos.js", jsContent);
    console.log("✅ CDN logo URLs saved to eplLogos.js");
    console.log("Sample CDN URL:", logos[0]);
  } catch (error) {
    console.error("Error:", error);
  }
}

saveLogoUrls();
