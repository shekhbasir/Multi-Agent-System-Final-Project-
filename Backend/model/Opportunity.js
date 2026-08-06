import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "job",
        "internship",
        "hackathon",
        "competition",
        "event",
        "scholarship",
        "fellowship",
        "workshop",
        "career-fair",
        "freelance",
      ],
      required: true,
    },
    description: { type: String, default: "" },
    skills: { type: [String], default: [] },
    location: { type: String, default: "Remote" },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "onsite", "unspecified"],
      default: "unspecified",
    },
    experience: { type: String, default: "" },
    salary: { type: String, default: "" },
    deadline: { type: Date, default: null },
    postedAt: { type: Date, default: Date.now },
    applyUrl: { type: String, required: true },
    sourceUrl: { type: String, default: "" },
    fetchedAt: { type: Date, default: Date.now },
    dedupeKey: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

OpportunitySchema.index({ type: 1, postedAt: -1 });
OpportunitySchema.index({ skills: 1 });
OpportunitySchema.index({ workMode: 1 });
OpportunitySchema.index({ deadline: 1 });
OpportunitySchema.index({
  title: "text",
  company: "text",
  description: "text",
});

const Opportunity = mongoose.model("Opportunity", OpportunitySchema);
export default Opportunity;
