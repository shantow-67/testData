// const mongoose = require("mongoose");
import mongoose from "mongoose";

// Team Schema - matching your document structure
const teamSchema = new mongoose.Schema({
  api_team_id: {
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
  venue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  short_code: {
    type: String,
    required: true,
  },
  image_path: {
    type: String,
  },
  founded: {
    type: Number,
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Type",
    required: false,
  },
  placeholder: {
    type: Boolean,
    default: false,
  },
  last_played_at: {
    type: Date,
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

const TeamModel = mongoose.model("Team", teamSchema);

export default TeamModel;
