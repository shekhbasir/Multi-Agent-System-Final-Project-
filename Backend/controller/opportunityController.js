import Opportunity from "../model/Opportunity.js";
import SavedOpportunity from "../model/SavedOpportunity.js";

export const getOpportunities = async (req, res) => {
  try {
    const { q, type, workMode, skills, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (workMode) filter.workMode = workMode;
    if (skills) filter.skills = { $in: skills.split(",") };
    if (q) filter.$text = { $search: q };

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, parseInt(limit));

    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .sort({ postedAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Opportunity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pageSize,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOpportunityById = async (req, res) => {
  try {
    const item = await Opportunity.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOpportunityStats = async (req, res) => {
  try {
    const [total, todayCount, closingSoon] = await Promise.all([
      Opportunity.countDocuments({}),
      Opportunity.countDocuments({
        postedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Opportunity.countDocuments({
        deadline: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, newToday: todayCount, closingSoon },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simple, transparent match score — no black box, no randomness.
// Uses the logged-in user's `skills` field if your User model has one;
// if not present, falls back to 0% skill match rather than guessing.
export const getRecommendedOpportunities = async (req, res) => {
  try {
    const userSkills = (req.user.skills || []).map((s) => s.toLowerCase());

    const items = await Opportunity.find({}).sort({ postedAt: -1 }).limit(100);

    const scored = items.map((item) => {
      const itemSkills = (item.skills || []).map((s) => s.toLowerCase());
      const overlap = itemSkills.filter((s) => userSkills.includes(s));
      const skillMatch = itemSkills.length
        ? Math.round((overlap.length / itemSkills.length) * 100)
        : 0;

      return {
        ...item.toObject(),
        matchScore: skillMatch,
        matchReasons: overlap,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, items: scored.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const saved = await SavedOpportunity.findOneAndUpdate(
      { user: req.user._id, opportunity: id },
      { $setOnInsert: { status: "saved" } },
      { upsert: true, new: true },
    );
    res.status(200).json({ success: true, saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unsaveOpportunity = async (req, res) => {
  try {
    await SavedOpportunity.findOneAndDelete({
      user: req.user._id,
      opportunity: req.params.id,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const saved = await SavedOpportunity.findOneAndUpdate(
      { user: req.user._id, opportunity: req.params.id },
      { status },
      { new: true },
    );
    if (!saved) {
      return res.status(404).json({ success: false, message: "Not saved yet" });
    }
    res.status(200).json({ success: true, saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Real aggregation from your actual DB — used by the 3D globe to show
// genuine category counts, not fabricated numbers.
export const getOpportunityCategoryCounts = async (req, res) => {
  try {
    const counts = await Opportunity.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      counts: counts.map((c) => ({ type: c._id, count: c.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySavedOpportunities = async (req, res) => {
  try {
    const saved = await SavedOpportunity.find({ user: req.user._id })
      .populate("opportunity")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
