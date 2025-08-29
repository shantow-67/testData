import PlayerModel from "./player.model.js";
import TeamModel from "../teams/teamModel.js";

export const getPlayersWithSportmonksImage = async (req, res) => {
  try {
    const players = await PlayerModel.find({
      image: { $regex: "^https://cdn\\.sportmonks\\.com" },
    }).select("_id display_name image");
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const getPlayersWithSportmonksImage = async (req, res) => {
//   try {
//     const players = await PlayerModel.find({
//       image: { $regex: "^https://cdn\\.sportmonks\\.com" },
//     })
//       .select("_id display_name image team")
//       .populate({
//         path: "team",
//         select: "name",
//       });
//     res.json(players);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
