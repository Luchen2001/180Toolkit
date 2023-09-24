import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cap: {
      type: Number,
      required: true,
    },
    cash: {
      type: Object,
      default: {},
    },
    industry: {
      type: String,
      required: false,
    },
    isMiningComp: {
      type: Boolean,
      required: false,
    },
    commodities: {
      type: String,
      required: false,
    },
    last_price: {
        type: Number,
        required: false,
        default: 0,
      },
      change_in_percent: {
        type: String,
        required: false,
        default: '0%',
      },
      volume: {
        type: Number,
        required: false,
        default: 0,
      },
      bid_price: {
        type: Number,
        required: false,
        default: 0,
      },
      offer_price: {
        type: Number,
        required: false,
        default: 0,
      },
      previous_close_price: {
        type: Number,
        required: false,
        default: 0,
      },
      average_daily_volume: {
        type: Number,
        required: false,
        default: 0,
      },
      market_cap: {
        type: Number,
        required: false,
        default: 0,
      }
  },
  { timestamps: true }
);

let model;

// Check if the model is already initialized
if (mongoose.models.Company) {
  model = mongoose.model("Company");
} else {
  model = mongoose.model("Company", companySchema);
}

export default model;
