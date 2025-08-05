import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  api_player_id: {
    type: Number,
    unique: true,
    required: true,
  },
  sport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sports",
    required: false,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "country",
    required: false,
  },
  nationality_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "country",
    required: false,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: false,
  },
  position: {
    type: String,
    required: false,
  },
  position_group: {
    type: String,
    enum: ["FWD", "MID", "DEF", "GK", "MNG"],
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  first_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  display_name: {
    type: String,
  },
  type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Type",
    required: false,
  },
  common_name: {
    type: String,
  },
  image: {
    type: String,
  },
  date_of_birth: {
    type: Date,
    required: false,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: false,
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

const PlayerModel = mongoose.model("Player", playerSchema);

export default PlayerModel;
