import mongoose from "mongoose";

const AlertMatchSchema = new mongoose.Schema(
  {
    alert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OpportunityAlert",
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AlertMatchSchema.index({ alert: 1, opportunity: 1 }, { unique: true });

const AlertMatch = mongoose.model("AlertMatch", AlertMatchSchema);
export default AlertMatch;
