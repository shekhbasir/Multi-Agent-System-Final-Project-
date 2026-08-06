import mongoose from "mongoose";

const SavedOpportunitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "saved",
        "interested",
        "preparing",
        "applied",
        "interview",
        "rejected",
        "selected",
      ],
      default: "saved",
    },
  },
  { timestamps: true },
);

SavedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

const SavedOpportunity = mongoose.model(
  "SavedOpportunity",
  SavedOpportunitySchema,
);
export default SavedOpportunity;
