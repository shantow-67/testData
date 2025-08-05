import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  api_city_id: {
    type: Number,
    unique: true,
    required: true,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  region_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
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

const CityModel = mongoose.model("City", citySchema);

export default CityModel;
