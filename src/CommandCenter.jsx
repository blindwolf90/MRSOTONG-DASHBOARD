import { useState, useEffect } from "react";

// ============================================================
// MSOS CEO Command Center v3.0 MVP-1 (D1)
// 数据源：n8n「MSOS - Dashboard Data API」webhook（唯一数据源）
// 铁律：Validated Data Only · fail-closed —— 无数据显示状态，不显示数字，
//       本文件零硬编码业务数据（无任何销售额 / target / 门店数字）。
// D1 范围（CEO 批准 2026-07-17）：
//   1 CEO Today · 2 CEO Focus · 3 Store Progress · 4 Submission Status · 5 Brand Summary
//   Store Captain = Coming Soon · AI Secretary = 隐藏（不占位）
// ============================================================

const API_URL = "https://blindwolf90.app.n8n.cloud/webhook/msos-dashboard-data";
const REFRESH_MS = 10 * 60 * 1000;

const C = {
  bg: "#1e1a16", border: "#2a2520", text: "#e8e0d4", dim: "#6b5f52", faint: "#4a4038",
  gold: "#C8A97E", green: "#A8C5A0", yellow: "#C8A97E", red: "#cc3333", blue: "#9FB8C8",
};

function fmtRM(n) { return n == null ? "—" : `RM ${Math.round(n).toLocaleString()}`; }
function fmtPct(n) { return n == null ? "—" : `${Number(n).toFixed(1)}%`; }

// ---- 契约适配层：接受 v1.1.0（v3 契约）与 v1.0 legacy 两种形态 ----
function normalize(json) {
  // v1.1.0 实测契约（2026-07-17 生产验证）：version:"3.0"、validatedOnly、pace、
  // group{yesterday,sales,mtd,lastMonth,target,achievement,light}、brands.*{yesterday,mtd,lastMonth,...}、
  // submission[{outlet,date,submitted}]、ceoFocus[{rank,fact}]、ranking（legacy 兼容）
  const isV3 = Boolean(json.version || json.pace != null || json.submission || json.ceoFocus);
  const month = json.month || null; // "2026-07"
  const dataThrough = json.dataThrough || null; // "YYYY-MM-DD"

  // pace（时间进度）：优先用 API 字段，否则由 dataThrough 推算
  let pace = json.pace != null ? Number(json.pace) : null;
  if (pace == null && month && dataThrough) {
    const [y, m] = month.split("-").map(Number);
    const day = Number(dataThrough.split("-")[2]);
    const dim = new Date(y, m, 0).getDate();
    if (y && m && day && dim) pace = (day / dim) * 100;
  }

  const stores = (json.ranking || []).map((r) => ({
    outlet: r.outlet, sales: r.sales ?? null, target: r.target ?? null,
    achievement: r.achievement ?? null, yesterday: r.yesterday ?? null,
  }));

  // 品牌/集团字段归一：v3 用 mtd，legacy 用 sales
  const normBrand = (d) => d ? { ...d, sales: d.mtd ?? d.sales ?? null } : d;
  const rawGroup = json.group || {};
  const group = { ...rawGroup, sales: rawGroup.mtd ?? rawGroup.sales ?? null };
  const brands = {};
  Object.entries(json.brands || {}).forEach(([k, v]) => { brands[k] = normBrand(v); });

  // submission 归一：v3 形态 {outlet,date,submitted:boolean}
  const submission = json.submission
    ? json.submission.map((s) => ({ outlet: s.outlet, date: s.date, ok: s.submitted === true || /^(✅|validated|ok|submitted)$/i.test(String(s.status || "")), partial: /^(⚠|partial)$/i.test(String(s.status || "")) }))
    : null;

  return {
    contract: isV3 ? `v1.1.0 (契约 v${json.version || "3.0"})` : "v1.0 legacy",
    validated: isV3 && json.validatedOnly !== false, // v1.1.0 只输出 Validation Gate ✅ 数据；legacy = 未验证
    month, dataThrough,
    generatedAt: json.generatedAt || null,
    pace,
    group,
    brands,
    stores,
    submission,
    ceoFocusApi: json.ceoFocus || null,    // v3: API 侧候选事实
    dailyTrend: json.dailyTrend || null,   // 连续下滑判断所需日序列（API v2.0）
    captainFeed: json.captainFeed || null, // Form 切 production 后才有
  };
}

// ---- 红黄绿（CEO 定案 2026-07-15：动态时间进度阈值）----
function light(achievement, pace) {
  if (achievement == null || pace == null) return { icon: "◌", color: C.faint, label: "无数据" };
  if (achievement >= pace) return { icon: "🟢", color: C.green, label: "达标" };
  if (achievement >= pace - 10) return { icon: "🟡", color: "#d4b06a", label: "接近" };
  return { icon: "🔴", color: C.red, label: "落后" };
}

// ---- CEO Focus 生成（CEO 批准排序 2026-07-17）----
// 1 Missing Submission → 2 Target 落后 → 3 连续下滑 → 4 Captain Issue → 5 Captain Suggestion
const RULE_NAMES = { 1: "未提交", 2: "Target 落后", 3: "连续下滑", 4: "Captain 问题", 5: "Captain 建议" };
function buildFocus(n) {
  const facts = [];
  if (n.submission) {
    n.submission
      .filter((s) => !s.ok)
      .forEach((s) => facts.push({ rule: 1, text: `${s.outlet} 昨日数据未提交 / 未验证` }));
  }
  if (n.pace != null) {
    n.stores
      .filter((s) => s.target != null && s.achievement != null && s.achievement < n.pace)
      .sort((a, b) => (n.pace - b.achievement) - (n.pace - a.achievement))
      .forEach((s) => facts.push({ rule: 2, text: `${s.outlet} 落后进度 ${(n.pace - s.achievement).toFixed(1)}pp（达成 ${fmtPct(s.achievement)} / 应达 ${fmtPct(n.pace)}）` }));
  }
  if (n.dailyTrend) {
    Object.entries(n.dailyTrend).forEach(([outlet, days]) => {
      if (Array.isArray(days) && days.length >= 3 && days.slice(-3).every((v, i, a) => i === 0 || v < a[i - 1])) {
        facts.push({ rule: 3, text: `${outlet} 连续 3 天销售下滑` });
      }
    });
  }
  if (n.captainFeed) {
    n.captainFeed.filter((f) => f.type === "issue").forEach((f) => facts.push({ rule: 4, text: `${f.outlet}：${f.text}` }));
    n.captainFeed.filter((f) => f.type === "suggestion").forEach((f) => facts.push({ rule: 5, text: `${f.outlet}：${f.text}` }));
  }
  facts.sort((a, b) => a.rule - b.rule);
  return facts.slice(0, 3);
}

// ---- UI 基件 ----
function Section({ title, children, footer }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: C.faint, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      {children}
      {footer && <Contract {...footer} />}
    </div>
  );
}

// 统一数据契约脚注：data_date / validation_status / source / owner / updated_at
function Contract({ data_date, validation_status, source, owner, updated_at }) {
  const vColor = validation_status === "validated" ? C.green : validation_status === "pending_integration" ? C.blue : "#d4b06a";
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 8, fontSize: 8, color: C.faint, fontFamily: "monospace", lineHeight: 1.7 }}>
      data_date: {data_date || "—"} · validation_status: <span style={{ color: vColor }}>{validation_status}</span> · source: {source} · owner: {owner} · updated_at: {updated_at || "—"}
    </div>
  );
}

function Unavailable({ reason }) {
  return (
    <div style={{ padding: "18px 0", textAlign: "center", fontFamily: "monospace" }}>
      <div style={{ fontSize: 12, color: C.dim }}>⛔ 数据不可用（fail-closed，不显示未验证数字）</div>
      <div style={{ fontSize: 9, color: C.faint, marginTop: 6 }}>{reason}</div>
    </div>
  );
}

export default function CommandCenter() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr(null); setLoading(true);
      const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(normalize(await res.json()));
    } catch (e) { setErr(String((e && e.message) || e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const id = setInterval(load, REFRESH_MS); return () => clearInterval(id); }, []);

  if (err && !data) return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "monospace" }}>
      <div style={{ fontSize: 14, color: C.red }}>⚠ Command Center 数据 API 无法连接</div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>{err}</div>
      <button onClick={load} style={{ marginTop: 16, padding: "8px 20px", background: "#C8A97E22", border: `1px solid ${C.gold}`, borderRadius: 3, color: C.gold, fontFamily: "monospace", fontSize: 11, letterSpacing: 2, cursor: "pointer" }}>重试 RETRY</button>
    </div>
  );
  if (!data) return <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "monospace", color: C.dim, fontSize: 12 }}>加载 Command Center…</div>;

  const n = data;
  const vStatus = n.validated ? "validated" : "unverified";
  const focus = buildFocus(n);
  const g = n.group;
  const gLight = light(g.achievement, n.pace);
  const brandCards = [
    { key: "mrSotong", name: "MR SOTONG · 鱿鱼先生", d: n.brands.mrSotong },
    { key: "mrBaker", name: "MR BAKER", d: n.brands.mrBaker },
    { key: "oonJewel", name: "OON JEWEL", d: n.brands.oonJewel },
  ];
  const isJuly = n.month === "2026-07";

  return (
    <div>
      {/* 数据状态横幅 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.faint, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase" }}>
          <span style={{ color: C.gold }}>◆ CEO COMMAND CENTER</span> — {n.month || "—"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 9, color: C.dim, fontFamily: "monospace" }}>数据至 {n.dataThrough || "—"} · 快照 {n.generatedAt || "—"} · 契约 {n.contract}</span>
          <button onClick={load} disabled={loading} style={{ padding: "3px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 2, color: C.gold, fontFamily: "monospace", fontSize: 10, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>{loading ? "…" : "↻ 刷新"}</button>
        </div>
      </div>

      {!n.validated && (
        <div style={{ background: "#2a2010", border: "1px solid #5a4a10", borderLeft: "3px solid #d4b06a", borderRadius: 3, padding: "10px 14px", marginBottom: 14, fontFamily: "monospace" }}>
          <div style={{ fontSize: 11, color: "#d4b06a", fontWeight: "bold" }}>⚠ 数据未经 Validation Gate 确认</div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 4, lineHeight: 1.6 }}>API 当前返回 v1.0 legacy 契约（无 validation / submission / pace 字段）。按 MSOS 铁律，以下数字仅供系统验收参考，不作决策依据。待 n8n API v1.1.0 恢复后本横幅自动消失。</div>
        </div>
      )}

      {/* 模块 1 · CEO Today */}
      <Section title="1 · CEO Today — 今日集团概况"
        footer={{ data_date: n.dataThrough, validation_status: vStatus, source: "daily_sales_sheet + target_v1_sheet", owner: "store_captain / ceo", updated_at: n.generatedAt }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            ["Yesterday", g.yesterday != null ? fmtRM(g.yesterday) : "—", g.yesterday == null ? "待 API v1.1.0 字段" : "", C.text],
            ["MTD Sales", fmtRM(g.sales), "", C.text],
            ["Monthly Target", fmtRM(g.target), g.targetNote || "", C.gold],
            ["Achievement vs 进度", `${fmtPct(g.achievement)} / ${fmtPct(n.pace)}`, `${gLight.icon} ${gLight.label}`, gLight.color],
          ].map(([label, value, sub, color]) => (
            <div key={label} style={{ background: "#141210", borderRadius: 3, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.faint, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 18, color, fontFamily: "monospace", fontWeight: "bold", marginTop: 4 }}>{value}</div>
              {sub && <div style={{ fontSize: 8, color: C.dim, fontFamily: "monospace", marginTop: 2 }}>{sub}</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* 模块 2 · CEO Focus */}
      <Section title="2 · CEO Focus — 今天最需要关注的 3 件事"
        footer={{ data_date: n.dataThrough, validation_status: vStatus, source: "validation_db + daily_sales_sheet (+captain_form 待接入)", owner: "engineer(规则) / ceo(批准)", updated_at: n.generatedAt }}>
        {focus.length === 0 ? (
          <Unavailable reason="当前可用事实池无触发项（规则 1 需 submission 字段、规则 3 需日序列、规则 4/5 需 Captain Form —— 均待数据源接入）" />
        ) : focus.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", background: "#141210", border: `1px solid ${C.border}`, borderLeft: `3px solid ${f.rule <= 2 ? C.red : C.gold}`, borderRadius: 3, padding: "10px 14px", marginBottom: 8 }}>
            <span style={{ fontSize: 16, color: C.gold, fontFamily: "monospace", fontWeight: "bold" }}>{i + 1}</span>
            <div>
              <span style={{ fontSize: 8, color: C.faint, fontFamily: "monospace", letterSpacing: 1, textTransform: "uppercase" }}>规则 {f.rule} · {RULE_NAMES[f.rule]}</span>
              <div style={{ fontSize: 12, color: C.text, marginTop: 3 }}>{f.text}</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 8, color: C.faint, fontFamily: "monospace", marginTop: 6, lineHeight: 1.6 }}>
          排序规则（CEO 批准 2026-07-17）：① Missing Submission ② Target 落后 ③ 连续下滑 ④ Captain Issue ⑤ Captain Suggestion · 只引用 Validated 事实，无数据不生成
        </div>
      </Section>

      {/* 模块 3 · Store Progress */}
      <Section title="3 · Store Progress — 门店 Target 进度（动态阈值）"
        footer={{ data_date: n.dataThrough, validation_status: vStatus, source: "daily_sales_sheet + target_v1_sheet", owner: "store_captain", updated_at: n.generatedAt }}>
        {n.stores.length === 0 ? <Unavailable reason="API 未返回门店数据" /> : n.stores.map((s) => {
          const L = light(s.achievement, n.pace);
          return (
            <div key={s.outlet} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "#a89c8c", fontFamily: "monospace" }}>{L.icon} {s.outlet}</span>
                <span style={{ fontSize: 11, color: L.color, fontFamily: "monospace", fontWeight: "bold" }}>
                  {fmtRM(s.sales)}
                  <span style={{ color: C.dim, fontWeight: "normal", marginLeft: 8 }}>
                    {s.target != null ? `${fmtPct(s.achievement)} / 应达 ${fmtPct(n.pace)}` : "target 未设定"}
                  </span>
                </span>
              </div>
              <div style={{ position: "relative", height: 8, background: "#2a2520", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${Math.max(1, Math.min(100, s.achievement || 0))}%`, background: L.color, borderRadius: 2 }} />
                {n.pace != null && <div title="时间进度" style={{ position: "absolute", top: -2, bottom: -2, left: `${Math.min(100, n.pace)}%`, width: 2, background: "#f0e8dc55" }} />}
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 8, color: C.faint, fontFamily: "monospace", marginTop: 4 }}>🟢 达成率 ≥ 时间进度 · 🟡 差距 ≤ 10pp · 🔴 差距 &gt; 10pp（竖线 = 今日应达进度）</div>
      </Section>

      {/* 模块 4 · Submission Status */}
      <Section title="4 · Submission Status — 7 门店昨日提交状态"
        footer={{ data_date: n.dataThrough, validation_status: n.submission ? vStatus : "pending_integration", source: "validation_db", owner: "store_captain / engineer", updated_at: n.generatedAt }}>
        {n.submission ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
            {n.submission.map((s) => (
              <div key={s.outlet} style={{ background: "#141210", border: `1px solid ${C.border}`, borderRadius: 3, padding: "10px 12px", fontFamily: "monospace" }}>
                <span style={{ fontSize: 13 }}>{s.ok ? "✅" : s.partial ? "⚠" : "❌"}</span>
                <span style={{ fontSize: 10, color: s.ok ? C.green : s.partial ? "#d4b06a" : C.red, marginLeft: 8 }}>{s.outlet}</span>
                {s.date && <span style={{ fontSize: 8, color: C.faint, marginLeft: 6 }}>{s.date}</span>}
              </div>
            ))}
          </div>
        ) : (
          <Unavailable reason="API 未返回 submission 字段（Validation DB 数据）— 待 n8n API v1.1.0 恢复" />
        )}
      </Section>

      {/* 模块 5 · Brand Summary */}
      <Section title="5 · Brand Summary — 三品牌概况"
        footer={{ data_date: n.dataThrough, validation_status: vStatus, source: "daily_sales_sheet + target_v1_sheet", owner: "store_captain", updated_at: n.generatedAt }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {brandCards.map((bc) => (
            <div key={bc.key} style={{ background: "#141210", border: `1px solid ${C.border}`, borderRadius: 3, padding: "12px 14px", fontFamily: "monospace" }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{bc.name}</div>
              {[
                ["Yesterday", bc.d && bc.d.yesterday != null ? fmtRM(bc.d.yesterday) : "— 待 API 字段"],
                ["MTD", fmtRM(bc.d && bc.d.sales)],
                ["Last Month", bc.d && bc.d.lastMonth != null ? fmtRM(bc.d.lastMonth) : "— 待 API 字段"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: C.faint }}>{l}</span>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: "bold" }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 8, color: C.dim, marginTop: 6 }}>
                Target {bc.d && bc.d.target != null ? fmtRM(bc.d.target) : "未设定"} · 达成 {fmtPct(bc.d && bc.d.achievement)}
              </div>
              {isJuly && <div style={{ fontSize: 8, color: C.faint, marginTop: 4 }}>⚠ Last Month（June）数据不完整（6/22–30 缺）</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* Store Captain — Coming Soon（CEO 指示 2026-07-17） */}
      <Section title="Store Captain Feed"
        footer={{ data_date: "—", validation_status: "pending_integration", source: "captain_form_sheet", owner: "hr / arthur(拍板切换日)", updated_at: "—" }}>
        <div style={{ textAlign: "center", padding: "20px 0", fontFamily: "monospace" }}>
          <div style={{ fontSize: 14, color: C.gold, letterSpacing: 3 }}>COMING SOON</div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 6 }}>Store Captain Form 切换 production 后接入</div>
        </div>
      </Section>

      {err && data && <div style={{ fontSize: 9, color: C.red, fontFamily: "monospace", marginTop: 4 }}>⚠ 最近一次刷新失败（{err}），当前显示为上一次成功数据</div>}
      <div style={{ fontSize: 8, color: C.faint, fontFamily: "monospace", marginTop: 8, lineHeight: 1.6 }}>
        MSOS CEO Command Center v3.0 MVP-1 · 唯一数据源：n8n Data API（Validated snapshot）· 本页零硬编码业务数据 · fail-closed
      </div>
    </div>
  );
}
