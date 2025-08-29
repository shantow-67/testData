import TeamOfSeason from "./teamOfSeason.model.js";
import TeamModel from "../teams/teamModel.js";
import PlayerModel from "../players/player.model.js";
import CoachModel from "../coach/coach.model.js";
import fs from "fs";
import { Parser } from "json2csv";

export const getSeasonSquads = async (req, reply) => {
  try {
    const { seasonId, leagueId } = req.params;

    // Fetch all teams of the season
    const teamsOfSeason = await TeamOfSeason.find({
      season_id: seasonId,
      league_id: leagueId,
    }).lean();

    if (!teamsOfSeason.length) {
      return reply.status(404).send({
        success: false,
        message: "No teams found for this season and league",
      });
    }

    const teamCount = teamsOfSeason.length;
    // Extract all unique IDs needed
    const teamIds = teamsOfSeason.map((t) => t.team_id);
    const playerIds = [
      ...new Set(
        teamsOfSeason.flatMap((t) => t.player_ids.map((id) => id.toString()))
      ),
    ];
    const coachIds = [
      ...new Set(
        teamsOfSeason.flatMap((t) =>
          t.coaches.map((c) => c.coach_id.toString())
        )
      ),
    ];

    // Fetch all related data in parallel
    const [teams, players, coaches] = await Promise.all([
      TeamModel.find({ _id: { $in: teamIds } })
        .select("name image_path short_code")
        .lean(),
      PlayerModel.find({ _id: { $in: playerIds } })
        .select("name position image")
        .lean(),
      CoachModel.find({ _id: { $in: coachIds } })
        .select("name")
        .lean(),
    ]);

    // Create lookup maps for faster access
    const teamMap = teams.reduce((acc, team) => {
      acc[team._id.toString()] = team;
      return acc;
    }, {});

    const playerMap = players.reduce((acc, player) => {
      acc[player._id.toString()] = player;
      return acc;
    }, {});

    const coachMap = coaches.reduce((acc, coach) => {
      acc[coach._id.toString()] = coach;
      return acc;
    }, {});

    // Build the response
    const result = teamsOfSeason.map((tos) => {
      const team = teamMap[tos.team_id.toString()] || {};

      // Find the active coach (only one)
      const activeCoachData = tos.coaches.find((c) => c.active === true);
      const activeCoach = activeCoachData
        ? coachMap[activeCoachData.coach_id.toString()]
        : null;

      const teamPlayers = tos.player_ids
        .map((id) => playerMap[id.toString()])
        .filter(Boolean)
        .map((player) => ({
          player_id: player._id,
          player_name: player.name,
          position: player.position,
          image: player.image,
        }));

      return {
        team_id: tos.team_id,
        team_name: team.name,
        team_image: team.image_path,
        team_code: team.short_code,
        coach_name: activeCoach?.name || "No active coach",
        playersCount: teamPlayers.length,
        players: teamPlayers,
      };
    });

    reply.send({
      success: true,
      teamCount: teamCount,
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllTeamOfTheSeason:", error);
    reply.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSingleTeamSquad = async (req, reply) => {
  try {
    const { seasonId, leagueId, teamId } = req.params;

    // Fetch the specific team of season
    const teamOfSeason = await TeamOfSeason.findOne({
      season_id: seasonId,
      league_id: leagueId,
      team_id: teamId,
    }).lean();

    if (!teamOfSeason) {
      return reply.status(404).send({
        success: false,
        message: "Team not found for this season and league combination",
      });
    }

    // Extract all unique IDs needed for this single team
    const playerIds = teamOfSeason.player_ids.map((id) => id.toString());
    const coachIds = teamOfSeason.coaches.map((c) => c.coach_id.toString());

    // Fetch all related data in parallel
    const [team, players, coaches] = await Promise.all([
      TeamModel.findById(teamId).select("name image_path short_code").lean(),
      PlayerModel.find({ _id: { $in: playerIds } })
        .select("name common_name position price image")
        .lean(),
      CoachModel.find({ _id: { $in: coachIds } })
        .select("name common_name image_path")
        .lean(),
    ]);

    if (!team) {
      return reply.status(404).send({
        success: false,
        message: "Team details not found",
      });
    }

    // Create lookup maps for faster access
    const playerMap = players.reduce((acc, player) => {
      acc[player._id.toString()] = player;
      return acc;
    }, {});

    const coachMap = coaches.reduce((acc, coach) => {
      acc[coach._id.toString()] = coach;
      return acc;
    }, {});

    // Find the active coach (only one)
    const activeCoachData = teamOfSeason.coaches.find((c) => c.active === true);
    const activeCoach = activeCoachData
      ? coachMap[activeCoachData.coach_id.toString()]
      : null;

    // Format players and group by position
    const teamPlayers = teamOfSeason.player_ids
      .map((id) => playerMap[id.toString()])
      .filter(Boolean)
      .map((player) => ({
        player_id: player._id,
        player_name: player.name,
        common_name: player.common_name,
        position: player.position,
        price: player.price,
        image_path: player.image,
      }));

    // Group players by position
    const positionGroups = teamPlayers.reduce((acc, player) => {
      const position = player.position;

      // Initialize the position group if it doesn't exist
      if (!acc[position]) {
        acc[position] = {
          count: 0,
          data: [],
        };
      }

      // Add player to the group
      acc[position].count++;
      acc[position].data.push(player);

      return acc;
    }, {});

    // Format the position groups into the desired structure
    const groupedPlayers = {};
    for (const [position, group] of Object.entries(positionGroups)) {
      // Create a more readable key (e.g., "goalkeepers" instead of "Goalkeeper")
      const groupKey = `${position.toLowerCase()}s`;
      groupedPlayers[groupKey] = {
        count: group.count,
        data: group.data,
      };
    }

    // Format all coaches (not just active)
    const teamCoaches = teamOfSeason.coaches.map((coachData) => {
      const coach = coachMap[coachData.coach_id.toString()] || {};
      return {
        coach_id: coach._id,
        coach_name: coach.name,
        coach_image: coach.image_path,
        position_id: coachData.position_id,
        active: coachData.active,
        start_date: coachData.start,
        end_date: coachData.end,
        temporary: coachData.temporary,
      };
    });

    // Build the response
    const response = {
      team_id: team._id,
      team_name: team.name,
      team_image: team.image_path,
      team_code: team.short_code,
      active_coach: activeCoach
        ? {
            coach_id: activeCoach._id,
            coach_name: activeCoach.name,
            coach_image: activeCoach.image_path,
          }
        : null,
      all_coaches: teamCoaches,
      playerCount: teamPlayers.length,
      players: groupedPlayers, // Now using the grouped players structure
      season_id: seasonId,
      league_id: leagueId,
    };

    reply.send({
      success: true,
      data: response,
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const getSingleTeamPlayers = async (req, reply) => {
//   try {
//     const { seasonId, leagueId, teamId } = req.params;

//     // Fetch the specific team of season
//     const teamOfSeason = await TeamOfSeason.findOne({
//       season_id: seasonId,
//       league_id: leagueId,
//       team_id: teamId,
//     }).lean();

//     if (!teamOfSeason) {
//       return reply.status(404).send({
//         success: false,
//         message: "Team not found for this season and league combination",
//       });
//     }

//     // Extract player IDs
//     const playerIds = teamOfSeason.player_ids.map((id) => id.toString());

//     // Fetch only required player fields
//     const players = await PlayerModel.find(
//       { _id: { $in: playerIds } },
//       { name: 1, price: 1, position: 1, status: 1 } // fetch required fields + _id
//     ).lean();

//     // Format players into required structure
//     const formattedPlayers = players.map((player) => ({
//       player_id: player._id,
//       player_name: player.name,
//       price: player.price,
//       position: player.position,
//       status: player.status,
//     }));

//     reply.send({
//       success: true,
//       data: {
//         count: formattedPlayers.length,
//         players: formattedPlayers,
//       },
//     });
//   } catch (error) {
//     reply.status(500).send({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const getSingleTeamPlayers = async (req, reply) => {
  try {
    const { seasonId, leagueId, teamId } = req.params;

    // Fetch the specific team of season
    const teamOfSeason = await TeamOfSeason.findOne({
      season_id: seasonId,
      league_id: leagueId,
      team_id: teamId,
    }).lean();

    if (!teamOfSeason) {
      return reply.status(404).send({
        success: false,
        message: "Team not found for this season and league combination",
      });
    }

    // Extract player IDs
    const playerIds = teamOfSeason.player_ids.map((id) => id.toString());

    // Fetch only required player fields
    const players = await PlayerModel.find(
      { _id: { $in: playerIds } },
      { name: 1, price: 1, position: 1, status: 1 }
    ).lean();

    // Format players into required structure
    const formattedPlayers = players.map((player) => ({
      player_id: player._id,
      player_name: player.name,
      price: player.price,
      position: player.position,
      status: player.status,
    }));

    // ---- CSV Writing Part ----
    // if (formattedPlayers.length > 0) {
    //   try {
    //     const fields = [
    //       "player_id",
    //       "player_name",
    //       "price",
    //       "position",
    //       "status",
    //     ];
    //     const parser = new Parser({ fields });
    //     const csv = parser.parse(formattedPlayers);

    //     const filePath = `./team_${teamId}_players.csv`;
    //     fs.writeFileSync(filePath, csv, "utf8");
    //     console.log(`CSV file written: ${filePath}`);
    //   } catch (csvError) {
    //     console.error("Error writing CSV:", csvError);
    //   }
    // }

    // ---- Send API response ----
    reply.send({
      success: true,
      data: {
        count: formattedPlayers.length,
        players: formattedPlayers,
      },
    });
  } catch (error) {
    reply.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTeamsList = async (req, reply) => {
  try {
    const { seasonId, leagueId } = req.params;
    const { team_id: includeTeamId = "true" } = req.query; // Default to true if not specified

    // Find all teamOfSeason entries for the given season and league
    const teamsOfSeason = await TeamOfSeason.find({
      season_id: seasonId,
      league_id: leagueId,
    })
      .select("team_id") // Only select team_id field
      .lean();

    if (!teamsOfSeason.length) {
      return reply.status(404).send({
        success: false,
        message: "No teams found for this season and league combination",
      });
    }

    const teamCount = teamsOfSeason.length;
    // Extract team IDs
    const teamIds = teamsOfSeason.map((t) => t.team_id);

    // Fetch team names
    const teams = await TeamModel.find({ _id: { $in: teamIds } })
      .select("name _id image_path") // Only select name and _id image
      .lean();

    // Format the response based on the query parameter
    const result =
      includeTeamId === "false"
        ? teams.map((team) => team.name) // Return array of names only
        : teams.map((team) => ({
            // Return array of objects with id and name
            team_id: team._id,
            team_name: team.name,
            image: team.image_path,
          }));

    reply.send({
      success: true,
      teamCount: teamCount,
      data: result,
    });
  } catch (error) {
    console.error("Error in getTeamsBySeasonAndLeague:", error);
    reply.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSportMonkImageOfSeason = async (req, reply) => {
  try {
    const { seasonId, leagueId } = req.params;

    // Fetch all teams of the season
    const teamsOfSeason = await TeamOfSeason.find({
      season_id: seasonId,
      league_id: leagueId,
    }).lean();

    if (!teamsOfSeason.length) {
      return reply.status(404).send({
        success: false,
        message: "No teams found for this season and league",
      });
    }

    // Extract all unique IDs
    const teamIds = teamsOfSeason.map((t) => t.team_id);
    const playerIds = [
      ...new Set(
        teamsOfSeason.flatMap((t) => t.player_ids.map((id) => id.toString()))
      ),
    ];

    // Fetch teams & players
    const [teams, players] = await Promise.all([
      TeamModel.find({ _id: { $in: teamIds } })
        .select("name")
        .lean(),
      PlayerModel.find({ _id: { $in: playerIds } })
        .select("name image")
        .lean(),
    ]);

    // Lookup maps
    const teamMap = teams.reduce((acc, team) => {
      acc[team._id.toString()] = team;
      return acc;
    }, {});

    const playerMap = players.reduce((acc, player) => {
      acc[player._id.toString()] = player;
      return acc;
    }, {});

    // Build the response
    const result = teamsOfSeason
      .map((tos) => {
        const team = teamMap[tos.team_id.toString()] || {};

        const filteredPlayers = tos.player_ids
          .map((id) => playerMap[id.toString()])
          .filter(
            (player) =>
              player &&
              typeof player.image === "string" &&
              player.image.includes("https://cdn.sportmonks.com")
          )
          .map((player) => ({
            team_name: team.name || "Unknown",
            player_id: player._id,
            player_name: player.name,
            player_image: player.image,
          }));

        return filteredPlayers;
      })
      .flat();

    reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getSeasonSquads:", error);
    reply.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
