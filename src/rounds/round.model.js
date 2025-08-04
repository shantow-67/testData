import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  api_round_id: {
    type: Number,
    unique: true,
  },
  sport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sports",
  },
  league_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "league",
  },
  season_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "season",
  },
  stage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stage",
  },
  name: {
    type: String,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  is_current: {
    type: Boolean,
    default: false,
  },
  starting_at: {
    type: Date,
  },
  ending_at: {
    type: Date,
  },
  games_in_current_week: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const RoundModel = mongoose.model("round", roundSchema);

export default RoundModel;
