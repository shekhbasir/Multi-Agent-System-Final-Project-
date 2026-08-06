// RemoteOK publishes a public JSON feed of real, currently-open remote jobs.
// No API key required. This is genuinely live data, not mock data.
const REMOTEOK_URL = "https://remoteok.com/api";

export const fetchRemoteOkJobs = async () => {
  const res = await fetch(REMOTEOK_URL, {
    headers: { "User-Agent": "OpportunityMap/1.0" },
  });

  if (!res.ok) {
    throw new Error(`RemoteOK feed failed: ${res.status}`);
  }

  const raw = await res.json();
  // First element is legal/meta info, not a job — skip it.
  const jobs = raw.filter((item) => item && item.id && item.position);

  return jobs.map((job) => ({
    source: "RemoteOK",
    externalId: String(job.id),
    title: job.position,
    company: job.company || "Unknown",
    companyLogo: job.company_logo || job.logo || "",
    type: "job",
    description: (job.description || "").replace(/<[^>]+>/g, "").slice(0, 600),
    skills: Array.isArray(job.tags) ? job.tags.slice(0, 10) : [],
    location: job.location || "Remote",
    workMode: "remote",
    experience: "",
    salary:
      job.salary_min && job.salary_max
        ? `$${job.salary_min} - $${job.salary_max}`
        : "",
    deadline: null,
    postedAt: job.date ? new Date(job.date) : new Date(),
    applyUrl:
      job.url || job.apply_url || `https://remoteok.com/remote-jobs/${job.id}`,
    sourceUrl: job.url || "",
  }));
};
