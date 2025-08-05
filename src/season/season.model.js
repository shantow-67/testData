import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema({
  api_season_id: {
    type: Number,
    unique: true,
    required: true,
  },
  sport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sports",
    required: true,
  },
  league_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "league",
    required: true,
  },
  tie_breaker_rule_id: {
    type: Number,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  is_active: {
    type: String,
    enum: ["y", "n"],
    default: "y",
  },
  start_at: {
    type: Date,
    required: true,
  },
  end_at: {
    type: Date,
    required: true,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  is_current: {
    type: Boolean,
    default: false,
  },
  standings_recalculated_at: {
    type: Date,
    default: null,
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

const SeasonsModel = mongoose.model("season", seasonSchema);

export default SeasonsModel;
