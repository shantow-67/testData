import RoundModel from "./round.model.js";

export const getRounds = async (req, res) => {
  try {
    const rounds = await RoundModel.find({})
      .select("name starting_at ending_at -_id")
      .lean();

    // Sort numerically and reformat objects
    const sortedRounds = rounds
      .sort((a, b) => Number(a.name) - Number(b.name))
      .map((round) => ({
        name: round.name,
        starting_at: round.starting_at,
        ending_at: round.ending_at,
      }));

    res.status(200).json({
      success: true,
      count: sortedRounds.length,
      data: sortedRounds,
      message: "Rounds retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving rounds",
      error: error.message,
    });
  }
};
