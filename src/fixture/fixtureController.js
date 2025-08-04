import FixtureModel from "./fixture.model.js";

export const getUpcomingFixtures = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10; // 10 matches per page
    const skip = (page - 1) * limit;

    const fixtures = await FixtureModel.find({
      starting_at: { $gte: new Date() }, // Only upcoming matches
    })
      .select("home_team_id away_team_id starting_at")
      .populate("home_team_id", "name")
      .populate("away_team_id", "name")
      .sort({ starting_at: 1 }) // 1 for ascending (oldest first), -1 for descending (newest first)
      .skip(skip)
      .limit(limit)
      .lean();

    if (!fixtures || fixtures.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No upcoming fixtures found",
      });
    }

    // Count total upcoming fixtures for pagination info
    const total = await FixtureModel.countDocuments({
      starting_at: { $gte: new Date() },
    });

    const simplifiedFixtures = fixtures.map((fixture) => ({
      id: fixture._id,
      date: fixture.starting_at,
      homeTeam: fixture.home_team_id?.name || "Unknown",
      awayTeam: fixture.away_team_id?.name || "Unknown",
    }));

    return res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFixtures: total,
      },
      data: simplifiedFixtures,
    });
  } catch (error) {
    console.error("Error fetching upcoming fixtures:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching fixtures",
    });
  }
};
