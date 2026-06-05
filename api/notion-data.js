// ───────────────────────────────────────────────────────────────
// REPLACE the existing useEffect (the Google Sheets block, the one
// that starts with `if (SHEETS_ID === "YOUR_GOOGLE_SHEETS_ID_HERE") return;`)
// with the block below. Sales now comes LIVE from Notion via /api/notion-data.
// Reviews / Roster / Online stay on fallback data for now.
// You may also delete the now-unused SHEETS_ID and SHEETS_URL constants.
// ───────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    fetch("/api/notion-data")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.sales)) {
          setSales(
            d.sales.map((r) => ({
              store: r.store,
              target: r.target,
              actual: r.actual != null ? r.actual : null,
              normalTarget: r.normalTarget,
              lowTarget: r.lowTarget,
            }))
          );
          setLastSync(
            new Date().toLocaleString("zh-MY", { timeZone: "Asia/Kuala_Lumpur" })
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
