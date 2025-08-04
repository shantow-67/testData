import TeamModel from "./teamModel.js";

export const getAllTeam = async (req, res) => {
  try {
    // Fetch all teams but only return the name field
    const teams = await TeamModel.find({}, { name: 1, _id: 0 }).sort({
      name: 1,
    });

    // Extract just the team names as an array of strings
    const teamNames = teams.map((team) => team.name);

    res.json({
      success: true,
      count: teamNames.length,
      teams: teamNames,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch teams",
      message: error.message,
    });
  }
};
