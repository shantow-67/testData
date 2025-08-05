import mongoose from "mongoose";

const coachAssignmentSchema = new mongoose.Schema(
  {
    coach_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coach",
      required: true,
    },
    position_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "type",
      required: true,
    },
    active: { type: Boolean, default: true },
    start: { type: Date, required: false },
    end: { type: Date, required: false },
    temporary: { type: Boolean, default: false },
  },
  { _id: false }
);

const teamOfSeasonSchema = new mongoose.Schema(
  {
    season_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },
    league_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League",
      required: true,
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    player_ids: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    ],
    coaches: [coachAssignmentSchema],
  },
  { timestamps: true }
);

const TeamOfSeason = mongoose.model("TeamOfSeason", teamOfSeasonSchema);

export default TeamOfSeason;
