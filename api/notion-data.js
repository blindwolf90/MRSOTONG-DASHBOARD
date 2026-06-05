// api/notion-data.js - Vercel serverless function
// Reads live sales from the Notion "Sales Data" database so the dashboard
// always shows the latest month the nightly scrape writes into Notion.

const SALES_DB = "2986bd13-3e67-4cc1-a6f5-eead3e716837";
const TARGETS = { KSL: 311893, BI: 269813, TEB: 193124, KOM: 89125, MA: 107673 };
const MONTHS = { january:1, february:2, march:3, april:4, may:5, june:6, july:7, august:8, september:9, october:10, november:11, december:12 };
function monthKey(m) {
  const parts = String(m || "").trim().toLowerCase().split(/\s+/);
  const mo = MONTHS[parts[0]] || 0;
  const yr = parseInt(parts[1], 10) || 0;
  return yr * 100 + mo;
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  if (!token) {
    return res.status(500).json({ error: "NOTION_TOKEN not configured" });
  }
  try {
    const r = await fetch(
      `https://api.notion.com/v1/databases/${SALES_DB}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100 }),
      }
    );
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data });

    const rows = (data.results || [])
      .map((p) => {
        const props = p.properties || {};
        return {
          month: props.Month?.title?.[0]?.plain_text || "",
          store: props.Store?.select?.name || "",
          actual: props.Actual?.number ?? null,
          target: props.Target?.number ?? null,
        };
      })
      .filter((x) => x.store);

    // Pick the row with the latest Month per store (e.g. "June 2026").
    const latest = {};
    for (const row of rows) {
      const k = monthKey(row.month);
      if (!latest[row.store] || k > latest[row.store]._k) {
        latest[row.store] = Object.assign({ _k: k }, row);
      }
    }

    const sales = Object.keys(TARGETS).map((s) => {
      const row = latest[s];
      const target = (row && row.target) || TARGETS[s];
      return {
        store: s,
        target,
        actual: row ? row.actual : null,
        normalTarget: target,
        lowTarget: Math.round(target * 0.83),
        month: row ? row.month : null,
      };
    });

    return res.status(200).json({ sales, lastSync: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
