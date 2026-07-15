import { useState, useEffect } from "react";

// MSOS - Dashboard Data API v1.0.0 (n8n webhook, workflow WYdYbfvSuaF4gUOS)
// 实时读 Daily Sales Sheet 三品牌 tab。所有数字来自 API，本文件零硬编码数据。
const API_URL = "https://blindwolf90.app.n8n.cloud/webhook/msos-dashboard-data";
const REFRESH_MS = 5 * 60 * 1000; // 每 5 分钟自动刷新

const rankColors = ["#C8A97E", "#A8C5A0", "#B8A0C8", "#9FB8C8", "#C9A0A0", "#69C9D0", "#d4b0d4"];

function fmtRM(n) {
  return n == null ? "—" : `RM ${Math.round(n).toLocaleString()}`;
}
function fmtPct(n) {
  return n == null ? "—" : `${n}%`;
}
function achColor(p) {
  if (p == null) return "#3a3530";
  return p >= 100 ? "#A8C5A0" : p >= 85 ? "#C8A97E" : "#9FB8C8";
}

function LiveStat({ label, value, sub, color }) {
  return (
    <div style={{ background: "#1e1a16", borderRadius: 3, padding: "12px 14px", border: "1px solid #2a2520" }}>
      <div style={{ fontSize: 8, color: "#4a4038", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 20, color: color || "#f0e8dc", fontFamily: "monospace", fontWeight: "bold", marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: "#6b5f52", fontFamily: "monospace", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Live() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);

  const load = async () => {
    try {
      setErr(null);
      setLoading(true);
      // cache-buster：确保每次都拿最新数据，绕过任何 HTTP/CDN 缓存
      const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setFetchedAt(new Date());
    } catch (e) {
      setErr(String((e && e.message) || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (err && !data) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "monospace" }}>
        <div style={{ fontSize: 14, color: "#cc3333" }}>⚠ 实时数据 API 无法连接</div>
        <div style={{ fontSize: 10, color: "#6b5f52", marginTop: 8 }}>{err}</div>
        <button onClick={load} style={{ marginTop: 16, padding: "8px 20px", background: "#C8A97E22", border: "1px solid #C8A97E", borderRadius: 3, color: "#C8A97E", fontFamily: "monospace", fontSize: 11, letterSpacing: 2, cursor: "pointer" }}>重试 RETRY</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "monospace", color: "#6b5f52", fontSize: 12 }}>
        加载实时数据中 · Loading live data…
      </div>
    );
  }

  const g = data.group || {};
  const b = data.brands || {};
  const ranking = data.ranking || [];
  const maxSales = Math.max(1, ...ranking.map((r) => r.sales || 0));
  const brandCards = [
    { key: "mrSotong", name: "MR SOTONG · 鱿鱼先生", d: b.mrSotong },
    { key: "mrBaker", name: "MR BAKER", d: b.mrBaker },
    { key: "oonJewel", name: "OON JEWEL", d: b.oonJewel },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 9, color: "#4a4038", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase" }}>
          <span style={{ color: "#A8C5A0" }}>● LIVE</span> 实时销售 — {data.month || "—"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 9, color: "#6b5f52", fontFamily: "monospace" }}>
            数据至 {data.dataThrough || "—"} · API 生成 {data.generatedAt || "—"}
          </span>
          <button onClick={load} disabled={loading} title="刷新" style={{ padding: "3px 10px", background: "transparent", border: "1px solid #2a2520", borderRadius: 2, color: "#C8A97E", fontFamily: "monospace", fontSize: 10, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "…" : "↻ 刷新"}
          </button>
        </div>
      </div>
      {fetchedAt && (
        <div style={{ fontSize: 8, color: "#4a4038", fontFamily: "monospace", marginBottom: 12 }}>
          页面刷新于 {fetchedAt.toLocaleTimeString("zh-MY", { timeZone: "Asia/Kuala_Lumpur" })} MYT · 每 5 分钟自动更新
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <LiveStat label="Group Sales (MTD)" value={fmtRM(g.sales)} sub={g.targetNote || ""} color="#f0e8dc" />
        <LiveStat label="Monthly Target" value={fmtRM(g.target)} sub="JULY 2026 baseline" color="#C8A97E" />
        <LiveStat label="Achievement" value={fmtPct(g.achievement)} color={achColor(g.achievement)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {brandCards.map((bc) => (
          <div key={bc.key} style={{ background: "#1e1a16", border: "1px solid #2a2520", borderRadius: 3, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#C8A97E", fontFamily: "monospace", letterSpacing: 1, textTransform: "uppercase" }}>{bc.name}</div>
            <div style={{ fontSize: 18, color: "#f0e8dc", fontFamily: "monospace", fontWeight: "bold", marginTop: 6 }}>{fmtRM(bc.d && bc.d.sales)}</div>
            <div style={{ fontSize: 9, color: "#6b5f52", fontFamily: "monospace", marginTop: 4 }}>
              Target {bc.d && bc.d.target != null ? fmtRM(bc.d.target) : "未设定"} · 达成 {fmtPct(bc.d && bc.d.achievement)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: "#4a4038", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Store Ranking (MTD)</div>
      <div style={{ background: "#1e1a16", border: "1px solid #2a2520", borderRadius: 3, padding: "14px 16px" }}>
        {ranking.map((r, i) => (
          <div key={r.outlet || i} style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "#a89c8c", fontFamily: "monospace" }}>
                {i + 1}. {r.outlet}
              </span>
              <span style={{ fontSize: 11, color: rankColors[i % rankColors.length], fontFamily: "monospace", fontWeight: "bold" }}>
                {fmtRM(r.sales)}
                <span style={{ color: "#6b5f52", fontWeight: "normal", marginLeft: 8 }}>
                  {r.target != null ? `${fmtPct(r.achievement)} of ${fmtRM(r.target)}` : "target 未设定"}
                </span>
              </span>
            </div>
            <div style={{ height: 8, background: "#2a2520", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${Math.max(2, ((r.sales || 0) / maxSales) * 100)}%`, background: rankColors[i % rankColors.length], borderRadius: 2 }} />
            </div>
          </div>
        ))}
        {ranking.length === 0 && <div style={{ fontSize: 10, color: "#6b5f52", fontFamily: "monospace" }}>无排名数据</div>}
      </div>

      {err && data && (
        <div style={{ fontSize: 9, color: "#cc3333", fontFamily: "monospace", marginTop: 10 }}>⚠ 最近一次刷新失败（{err}），当前显示为上一次成功数据</div>
      )}
      <div style={{ fontSize: 8, color: "#4a4038", fontFamily: "monospace", marginTop: 12, lineHeight: 1.6 }}>
        数据源：Google Sheet Daily Sales → n8n Data API v1.0（无任何硬编码数字）· Target = JULY 2026 官方 baseline，换月需更新 n8n Compute 节点
      </div>
    </div>
  );
}
