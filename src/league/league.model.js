import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema({
  api_league_id: {
    type: Number,
    required: true,
    unique: true,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "country",
    required: true,
  },
  sport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sports",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  short_code: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  sub_type: {
    type: String,
    default: null,
  },
  has_jerseys: {
    type: Boolean,
    default: false,
  },
  last_played_at: {
    type: Date,
    default: null,
  },
  is_active: {
    type: String,
    enum: ["y", "n"],
    default: "y",
  },
  status: {
    type: String,
    enum: ["y", "n"],
    default: "y",
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

const LeagueModel = mongoose.model("league", leagueSchema);

export default LeagueModel;
