import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CoachSchema = new Schema({
  api_coach_id: { type: Number, required: true, unique: true },
  player_id: { type: Schema.Types.ObjectId, ref: "player", default: null },
  sport_id: { type: Schema.Types.ObjectId, ref: "sport", default: null },
  country_id: { type: Schema.Types.ObjectId, ref: "country", default: null },
  nationality_id: {
    type: Schema.Types.ObjectId,
    ref: "country",
    default: null,
  },
  city_id: { type: Schema.Types.ObjectId, ref: "city", default: null },
  common_name: String,
  firstname: String,
  lastname: String,
  name: String,
  display_name: String,
  image_path: String,
  height: Number,
  weight: Number,
  date_of_birth: Date,
  gender: { type: String, enum: ["male", "female", "other"] },
});

const CoachModel = mongoose.model("Coach", CoachSchema);
export default CoachModel;
