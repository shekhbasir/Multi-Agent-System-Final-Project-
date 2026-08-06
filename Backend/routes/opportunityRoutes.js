import express from "express";
import { isAuth } from "../middleware/isAuthenticated.js";
import {
  getOpportunities,
  getOpportunityById,
  getOpportunityStats,
  getOpportunityCategoryCounts,
  getRecommendedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  updateTrackStatus,
  getMySavedOpportunities,
} from "../controller/opportunityController.js";
import {
  createAlert,
  getMyAlerts,
  deleteAlert,
  getMyAlertMatches,
  markAlertMatchesSeen,
} from "../controller/opportunityAlertController.js";
import { askOpportunityAssistant } from "../controller/opportunityAssistantController.js";

const router = express.Router();

router.get("/", isAuth, getOpportunities);
router.get("/stats", isAuth, getOpportunityStats);
router.get("/categories", isAuth, getOpportunityCategoryCounts);
router.get("/recommended", isAuth, getRecommendedOpportunities);
router.get("/saved", isAuth, getMySavedOpportunities);

router.post("/assistant", isAuth, askOpportunityAssistant);

router.post("/alerts", isAuth, createAlert);
router.get("/alerts", isAuth, getMyAlerts);
router.delete("/alerts/:id", isAuth, deleteAlert);
router.get("/alerts/matches", isAuth, getMyAlertMatches);
router.patch("/alerts/matches/seen", isAuth, markAlertMatchesSeen);

router.get("/:id", isAuth, getOpportunityById);
router.post("/:id/save", isAuth, saveOpportunity);
router.delete("/:id/save", isAuth, unsaveOpportunity);
router.patch("/:id/track", isAuth, updateTrackStatus);

export default router;
