import TeamOfSeason from "./teamOfSeason.model.js";
import TeamModel from "../teams/teamModel.js";
import PlayerModel from "../players/player.model.js";
import CoachModel from "../coach/coach.model.js";

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
        .select("name position")
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
        }));

      return {
        team_id: tos.team_id,
        team_name: team.name,
        team_image: team.image_path,
        team_code: team.short_code,
        coach_name: activeCoach?.name || "No active coach",
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
        .select("name position image_path")
        .lean(),
      CoachModel.find({ _id: { $in: coachIds } })
        .select("name image_path")
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

    // Format players
    const teamPlayers = teamOfSeason.player_ids
      .map((id) => playerMap[id.toString()])
      .filter(Boolean)
      .map((player) => ({
        player_id: player._id,
        player_name: player.name,
        position: player.position,
        image_path: player.image_path,
      }));
    const playerCount = teamPlayers.length;
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
      playerCount: playerCount,
      players: teamPlayers,
      season_id: seasonId,
      league_id: leagueId,
    };

    reply.send({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in getSingleTeamSquad:", error);
    reply.status(500).send({
      success: false,
      message: "Server error",
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
      .select("name _id") // Only select name and _id
      .lean();

    // Format the response based on the query parameter
    const result =
      includeTeamId === "false"
        ? teams.map((team) => team.name) // Return array of names only
        : teams.map((team) => ({
            // Return array of objects with id and name
            team_id: team._id,
            team_name: team.name,
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
