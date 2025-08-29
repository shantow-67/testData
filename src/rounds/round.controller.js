import RoundModel from "./round.model.js";

export const getRounds = async (req, res) => {
  try {
    const rounds = await RoundModel.find({})
      .select("name starting_at ending_at -_id")
      .lean();

    // Format date to Bangladesh time (UTC+6)
    const formatToBangladeshTime = (isoDate) => {
      if (!isoDate) return null;

      const date = new Date(isoDate);
      // Add 6 hours for UTC+6 (Bangladesh time)
      date.setHours(date.getHours() + 6);

      return date.toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Sort numerically and reformat objects
    const sortedRounds = rounds
      .sort((a, b) => Number(a.name) - Number(b.name))
      .map((round) => ({
        round: round.name,
        starting_at: formatToBangladeshTime(round.starting_at),
        ending_at: formatToBangladeshTime(round.ending_at),
        original_iso_start: round.starting_at, // Keep original ISO if needed
        original_iso_end: round.ending_at, // Keep original ISO if needed
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
