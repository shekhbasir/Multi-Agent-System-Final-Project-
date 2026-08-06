import mongoose from "mongoose";

const OpportunityAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    keyword: { type: String, required: true, trim: true },
    type: { type: String, default: "" },
    workMode: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const OpportunityAlert = mongoose.model(
  "OpportunityAlert",
  OpportunityAlertSchema,
);
export default OpportunityAlert;
