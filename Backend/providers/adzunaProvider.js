// Adzuna has a genuine, free-tier job search API for India/global jobs.
// Sign up (free) at https://developer.adzuna.com to get APP_ID + APP_KEY,
// then set ADZUNA_APP_ID / ADZUNA_APP_KEY in your .env.
// Until those are set, this provider is skipped entirely — it will
// NEVER return fake data as a fallback.
export const fetchAdzunaJobs = async ({ country = "in", what = "" } = {}) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return []; // provider not connected yet — intentionally empty, not fake
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=40&what=${encodeURIComponent(what)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Adzuna failed: ${res.status}`);

  const data = await res.json();
  const jobs = Array.isArray(data.results) ? data.results : [];

  return jobs.map((job) => ({
    source: "Adzuna",
    externalId: String(job.id),
    title: job.title,
    company: job.company?.display_name || "Unknown",
    companyLogo: "",
    type: "job",
    description: (job.description || "").slice(0, 600),
    skills: [],
    location: job.location?.display_name || "",
    workMode: "unspecified",
    experience: "",
    salary:
      job.salary_min && job.salary_max
        ? `₹${Math.round(job.salary_min)} - ₹${Math.round(job.salary_max)}`
        : "",
    deadline: null,
    postedAt: job.created ? new Date(job.created) : new Date(),
    applyUrl: job.redirect_url,
    sourceUrl: job.redirect_url,
  }));
};
