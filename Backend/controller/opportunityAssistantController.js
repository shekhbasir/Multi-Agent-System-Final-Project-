import Opportunity from "../model/Opportunity.js";

// The assistant is NOT allowed to invent opportunities. It only ever
// reasons over the real documents currently in your database and is
// explicitly instructed not to fabricate anything beyond that.
export const askOpportunityAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI assistant is not configured (GEMINI_API_KEY missing).",
      });
    }

    const candidates = await Opportunity.find({})
      .sort({ postedAt: -1 })
      .limit(60)
      .select(
        "title company type location workMode skills deadline applyUrl source",
      );

    const dataForPrompt = candidates.map((c) => ({
      title: c.title,
      company: c.company,
      type: c.type,
      location: c.location,
      workMode: c.workMode,
      skills: c.skills,
      deadline: c.deadline,
      source: c.source,
    }));

    const prompt = `
You are an opportunity-discovery assistant inside a career platform.

You may ONLY reference opportunities from the JSON list below — this is
real, currently-live data. Do NOT invent companies, roles, or deadlines
that are not in this list. If nothing in the list fits the question, say
so plainly instead of making something up.

Opportunities:
${JSON.stringify(dataForPrompt)}

User question: "${question}"

Answer concisely, referencing specific titles/companies from the list
where relevant.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated.";

    res.status(200).json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
