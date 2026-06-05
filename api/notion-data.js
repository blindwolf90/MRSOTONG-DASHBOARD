// api/notion-data.js - Vercel serverless function
// Reads live sales from the Notion "Sales Data" database so the dashboard
// always shows the latest numbers the nightly scrape writes into Notion.

const SALES_DB = "2986bd13-3e67-4cc1-a6f5-eead3e716837";

// Fallback monthly targets per store (used if a row has no Target set).
const TARGETS = { KSL: 311893, BI: 269813, TEB: 193124, KOM: 89125, MA: 107673 };

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
          edited: p.last_edited_time,
        };
      })
      .filter((x) => x.store);

    const latest = {};
    for (const row of rows) {
      if (!latest[row.store] || row.edited > latest[row.store].edited) {
        latest[row.store] = row;
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
