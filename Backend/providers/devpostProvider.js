// Devpost exposes a public JSON endpoint listing currently open hackathons.
// No API key required. This is real, live hackathon data.
const DEVPOST_URL =
  "https://devpost.com/api/hackathons?status[]=open&per_page=40";

export const fetchDevpostHackathons = async () => {
  const res = await fetch(DEVPOST_URL, {
    headers: { "User-Agent": "OpportunityMap/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Devpost feed failed: ${res.status}`);
  }

  const data = await res.json();
  const hackathons = Array.isArray(data.hackathons) ? data.hackathons : [];

  return hackathons.map((h) => ({
    source: "Devpost",
    externalId: String(h.id),
    title: h.title,
    company: h.organization_name || "Devpost",
    companyLogo: h.thumbnail_url || "",
    type: "hackathon",
    description: (h.themes || []).map((t) => t.name).join(", "),
    skills: (h.themes || []).map((t) => t.name),
    location: h.displayed_location?.location || "Online",
    workMode: h.displayed_location?.location?.toLowerCase().includes("online")
      ? "remote"
      : "unspecified",
    experience: "",
    salary: h.prize_amount || "",
    deadline: h.submission_period_dates
      ? new Date(h.time_left_to_submission * 1000 + Date.now())
      : null,
    postedAt: new Date(),
    applyUrl: h.url,
    sourceUrl: h.url,
  }));
};
