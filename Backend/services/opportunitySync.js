// REPLACE the whole file with this version — same providers/dedupe logic
// as before, plus alert matching on genuinely NEW items only.
import crypto from "crypto";
import Opportunity from "../model/Opportunity.js";
import OpportunityAlert from "../model/OpportunityAlert.js";
import AlertMatch from "../model/AlertMatch.js";
import { fetchRemoteOkJobs } from "../providers/remoteOkProvider.js";
import { fetchDevpostHackathons } from "../providers/devpostProvider.js";
import { fetchAdzunaJobs } from "../providers/adzunaProvider.js";

const buildDedupeKey = (item) => {
  const raw = `${item.source}|${item.company}|${item.title}|${item.applyUrl}`
    .toLowerCase()
    .trim();
  return crypto.createHash("sha1").update(raw).digest("hex");
};

const PROVIDERS = [
  { name: "RemoteOK", fn: fetchRemoteOkJobs },
  { name: "Devpost", fn: fetchDevpostHackathons },
  { name: "Adzuna", fn: () => fetchAdzunaJobs({ country: "in" }) },
];

const matchNewItemsToAlerts = async (newOpportunities) => {
  if (newOpportunities.length === 0) return;

  const alerts = await OpportunityAlert.find({ active: true });
  if (alerts.length === 0) return;

  for (const opp of newOpportunities) {
    const haystack = `${opp.title} ${opp.description}`.toLowerCase();

    for (const alert of alerts) {
      const keywordHit = haystack.includes(alert.keyword.toLowerCase());
      if (!keywordHit) continue;
      if (alert.type && alert.type !== opp.type) continue;
      if (alert.workMode && alert.workMode !== opp.workMode) continue;

      try {
        await AlertMatch.create({
          alert: alert._id,
          opportunity: opp._id,
          user: alert.user,
        });
      } catch (error) {
        // duplicate match (unique index) — already notified, skip silently
      }
    }
  }
};

export const runOpportunitySync = async () => {
  const results = { ok: [], failed: [] };
  let allItems = [];

  for (const provider of PROVIDERS) {
    try {
      const items = await provider.fn();
      allItems = allItems.concat(items);
      results.ok.push(`${provider.name} (${items.length})`);
    } catch (error) {
      results.failed.push(`${provider.name}: ${error.message}`);
    }
  }

  let upserted = 0;
  const newlyCreated = [];

  for (const item of allItems) {
    if (!item.title || !item.applyUrl) continue;

    const dedupeKey = buildDedupeKey(item);

    try {
      const result = await Opportunity.findOneAndUpdate(
        { dedupeKey },
        { ...item, dedupeKey, fetchedAt: new Date() },
        { upsert: true, setDefaultsOnInsert: true, new: true, rawResult: true },
      );

      upserted++;

      // rawResult tells us whether this was a brand-new insert vs an
      // update to an existing doc — only brand-new ones trigger alerts,
      // so users aren't re-notified for opportunities that were already
      // in the database.
      if (!result.lastErrorObject?.updatedExisting) {
        newlyCreated.push(result.value);
      }
    } catch (error) {
      // duplicate key race — safe to skip, next sync retries
    }
  }

  await matchNewItemsToAlerts(newlyCreated);

  return results;
};

export const startOpportunitySyncScheduler = () => {
  runOpportunitySync();
  setInterval(runOpportunitySync, 15 * 60 * 1000);
};
