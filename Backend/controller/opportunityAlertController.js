import OpportunityAlert from "../model/OpportunityAlert.js";
import AlertMatch from "../model/AlertMatch.js";

export const createAlert = async (req, res) => {
  try {
    const { keyword, type, workMode } = req.body;
    if (!keyword?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword is required" });
    }

    const alert = await OpportunityAlert.create({
      user: req.user._id,
      keyword: keyword.trim(),
      type: type || "",
      workMode: workMode || "",
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAlerts = async (req, res) => {
  try {
    const alerts = await OpportunityAlert.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    await OpportunityAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    await AlertMatch.deleteMany({ alert: req.params.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Polled by the frontend every ~60s — lightweight, no socket changes needed.
export const getMyAlertMatches = async (req, res) => {
  try {
    const matches = await AlertMatch.find({ user: req.user._id, seen: false })
      .populate("opportunity")
      .populate("alert", "keyword")
      .sort({ createdAt: -1 })
      .limit(20);

    res
      .status(200)
      .json({ success: true, unreadCount: matches.length, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAlertMatchesSeen = async (req, res) => {
  try {
    await AlertMatch.updateMany(
      { user: req.user._id, seen: false },
      { seen: true },
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
