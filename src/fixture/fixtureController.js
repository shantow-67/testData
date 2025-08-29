import FixtureModel from "./fixture.model.js";
import RoundModel from "../rounds/round.model.js";

export const getUpcomingFixtures = async (req, res) => {
  try {
    const gw = req.query.gw; // Gameweek provided as a query param, like ?gw=1

    if (!gw) {
      return res.status(400).json({
        success: false,
        message: "Gameweek (gw) query parameter is required",
      });
    }

    // Step 1: Find the round by name (e.g., "1", "2", etc.)
    const round = await RoundModel.findOne({ name: gw });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round with name "${gw}" not found`,
      });
    }

    // Step 2: Find fixtures that belong to this round
    const fixtures = await FixtureModel.find({ round_id: round._id })
      .select("home_team_id away_team_id starting_at")
      .populate("home_team_id", "name")
      .populate("away_team_id", "name")
      .sort({ starting_at: 1 })
      .lean();

    if (!fixtures || fixtures.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No fixtures found for gameweek ${gw}`,
      });
    }

    // Step 3: Format each fixture to return BD time and team names
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

    return res.status(200).json({
      success: true,
      gameweek: parseInt(round.name), // Send the round name as number
      totalFixtures: fixtures.length,
      round_id: round._id,
      data: simplifiedFixtures,
    });
  } catch (error) {
    console.error("Error fetching fixtures by round/gameweek:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching fixtures",
    });
  }
};
