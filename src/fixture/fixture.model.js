import mongoose from "mongoose";

const fixtureSchema = new mongoose.Schema({
  api_fixture_id: {
    type: Number,
    unique: true,
    required: false,
  },
  home_team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  away_team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  home_team_players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  away_team_players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  home_team_lineups: {
    type: [mongoose.Schema.Types.Mixed],
  },
  away_team_lineups: {
    type: [mongoose.Schema.Types.Mixed],
  },
  home_team_meta: {
    type: [mongoose.Schema.Types.Mixed],
  },
  away_team_meta: {
    type: [mongoose.Schema.Types.Mixed],
  },
  metadata: {
    type: [mongoose.Schema.Types.Mixed],
  },
  home_team_formation: {
    type: String,
  },
  away_team_formation: {
    type: String,
  },
  home_team_score: {
    type: Number,
    default: 0,
  },
  away_team_score: {
    type: Number,
    default: 0,
  },
  season_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "season",
    required: false,
  },
  league_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "league",
    required: false,
  },
  sport_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sports",
    required: false,
  },
  stage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stages",
    required: false,
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  round_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "round",
    required: false,
  },
  predictions: {
    type: [mongoose.Schema.Types.Mixed],
  },
  referees: [
    {
      referee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referee",
      },
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
      },
    },
  ],
  weather_report: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  venue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "states",
  },
  xg_fixture: {
    type: [mongoose.Schema.Types.Mixed],
  },
  home_team_sidelines: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
      },
      category: {
        type: String,
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
        default: null,
      },
      games_missed: {
        type: Number,
      },
      completed: {
        type: Boolean,
      },
    },
  ],

  away_team_sidelines: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
      },
      category: {
        type: String,
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
        default: null,
      },
      games_missed: {
        type: Number,
      },
      completed: {
        type: Boolean,
      },
    },
  ],

  home_team_coach: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
  away_team_coach: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },

  starting_at: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["y", "n"],
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

const FixtureModel = mongoose.model("Fixture", fixtureSchema);

export default FixtureModel;
