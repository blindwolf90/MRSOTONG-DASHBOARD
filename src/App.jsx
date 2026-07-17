import { useState } from "react";
import packageJson from "../package.json";
import Live from "./Live.jsx";
import CommandCenter from "./CommandCenter.jsx";

const VERSION = `v${packageJson.version}`;

// v3.0 MVP-1 安全修复（v2.8 第一步）：密码不再写在源码。
// 部署前必须在 Vercel → Settings → Environment Variables 设置：
//   VITE_ADMIN_PASS / VITE_VIEW_PASS
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";
const VIEW_PASS = import.meta.env.VITE_VIEW_PASS || "";

// ============================================================
// v3.0.0-mvp.1（2026-07-17，CEO 批准 MVP 迭代）：
// - 新增 CEO Command Center 默认页（5 模块，唯一数据源 = n8n Data API）
// - 删除全部硬编码业务数据：June sales/target、Jan-May OVERVIEW（RM972k）、
//   roster 员工名单、reviews、online targets、旧 70/85 警报阈值
// - 旧页面暂时保留入口，显示「静态数据已移除」；实时数据看 Command Center / LIVE
// - AI Secretary 隐藏（不占位）；Store Captain 显示 Coming Soon（在 Command Center 内）
// ============================================================

const UPDATE_LOG = [
  { v: "v3.0.0-mvp.1", date: "2026-07-17", changes: [
    "新增 CEO Command Center 默认页：CEO Today / CEO Focus / Store Progress / Submission Status / Brand Summary，全部数据来自 n8n Data API，零硬编码",
    "CEO Focus 排序规则（CEO 批准）：① Missing Submission ② Target 落后 ③ 连续下滑 ④ Captain Issue ⑤ Captain Suggestion",
    "删除全部硬编码数据（June 销售/target、Jan-May 总览、roster 名单、reviews、online target）；密码移至环境变量（v2.8 第一步）",
    "旧页面保留入口但静态数据已下架；Store Captain = Coming Soon；AI Secretary 隐藏",
  ]},
  { v: "v2.7.0", date: "2026-07-15", changes: [
    "新增「实时 LIVE」默认页：Group Sales / Monthly Target / Achievement / 三品牌 / Store Ranking，全部数据来自 n8n Data API v1.0（实时读 Google Sheet Daily Sales，零硬编码）",
    "支持 /live 直达路径；每 5 分钟自动刷新 + 手动刷新 + cache-buster 防旧缓存",
    "旧页面零改动；总览/SALES 页历史数字为 Jan-May 静态基线，实时数据一律看 LIVE 页",
  ]},
  { v: "v2.4", date: "2026-06-03", changes: [
    "新增「战报」游戏页:每家店是 Q 版装甲战士,鱿鱼先生吉祥物 = 每日小怪,销售即伤害",
    "新增品牌切换器;在线销售独立成第六位置;Logo 放到底部",
    "汇总条只在总览页显示,不再每页重复",
  ]},
  { v: "v2.2", date: "2026-06-02", changes: ["登录分级 (管理员 / 访客) + 持久登录 + 看密码眼睛"] },
  { v: "v2.0", date: "2026-06-02", changes: ["新增总览;Sales 改版;真实六月 roster;更新日志"] },
  { v: "v1.0", date: "2026-06-01", changes: ["首版:Alerts / Roster / Sales / Online / Reviews"] },
];

const storeNames = { KSL: "KSL Mall", BI: "Bukit Indah", TEB: "AEON Tebrau", KOM: "Komtar JBCC", MA: "Mount Austin" };
const storeColors = { KSL: "#C8A97E", BI: "#A8C5A0", TEB: "#B8A0C8", KOM: "#9FB8C8", MA: "#C9A0A0" };

function ComingSoon({ brand }) {
  const names = { baker: "Mr Baker 🥖", jewel: "Oon Jewel 💎" };
  return (
    <div style={{ textAlign: "center", padding: "70px 20px", fontFamily: "monospace" }}>
      <div style={{ fontSize: 18, color: "#C8A97E", letterSpacing: 2 }}>{names[brand] || brand}</div>
      <div style={{ fontSize: 12, color: "#a89c8c", marginTop: 12 }}>数据待接入 · Data coming soon</div>
      <div style={{ fontSize: 10, color: "#4a4038", marginTop: 8, lineHeight: 1.6 }}>此品牌数据请看 Command Center 三品牌概况</div>
    </div>
  );
}

// 旧页面占位：静态数据已按 CEO 指令下架（2026-07-17）
function Retired({ name }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "monospace" }}>
      <div style={{ fontSize: 13, color: "#a89c8c" }}>「{name}」静态数据已下架</div>
      <div style={{ fontSize: 10, color: "#6b5f52", marginTop: 10, lineHeight: 1.8 }}>
        原静态/硬编码数字（June 2026 基线）已按 CEO 指令于 2026-07-17 移除。<br />
        经验证的最新数据请看 ◆ Command Center；此页待对应数据源接入后恢复。
      </div>
    </div>
  );
}

function Login({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  const configured = Boolean(ADMIN_PASS || VIEW_PASS);
  const submit = () => {
    if (!pw) { setErr(true); return; }
    if (ADMIN_PASS && pw === ADMIN_PASS) onAuth("admin");
    else if (VIEW_PASS && pw === VIEW_PASS) onAuth("viewer");
    else setErr(true);
  };
  return (
    <div style={{ background: "#1a1612", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
      <div style={{ background: "#1e1a16", border: "1px solid #2a2520", borderRadius: 6, padding: "32px 28px", width: 300 }}>
        <div style={{ fontSize: 9, color: "#C8A97E", letterSpacing: 4, textTransform: "uppercase", fontFamily: "monospace" }}>Mr Sotong</div>
        <div style={{ fontSize: 18, color: "#f0e8dc", fontWeight: "bold", marginTop: 4, marginBottom: 18 }}>CEO Command Center</div>
        {!configured && (
          <div style={{ fontSize: 10, color: "#cc3333", fontFamily: "monospace", marginBottom: 12, lineHeight: 1.6 }}>
            ⚠ 登录密码未配置。请在 Vercel 环境变量设置 VITE_ADMIN_PASS / VITE_VIEW_PASS 后重新部署。
          </div>
        )}
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="输入密码 password"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 40px 10px 12px", background: "#141210", border: `1px solid ${err ? "#cc3333" : "#2a2520"}`, borderRadius: 3, color: "#e8e0d4", fontFamily: "monospace", fontSize: 13 }} />
          <span onClick={() => setShow(!show)} title="显示 / 隐藏密码" style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 15, userSelect: "none", opacity: 0.8 }}>{show ? "🙈" : "👁"}</span>
        </div>
        {err && <div style={{ fontSize: 10, color: "#cc3333", fontFamily: "monospace", marginTop: 6 }}>密码错误 wrong password</div>}
        <button onClick={submit} style={{ width: "100%", marginTop: 14, padding: "10px", background: "#C8A97E22", border: "1px solid #C8A97E", borderRadius: 3, color: "#C8A97E", fontFamily: "monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>进入 Enter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(() => { try { return localStorage.getItem("ms_role"); } catch (e) { return null; } });
  const isAdmin = role === "admin";
  const [tab, setTab] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.location.pathname === "/live") return "live";
      return "command"; // v3.0: CEO Command Center 为默认页
    } catch (e) { return "command"; }
  });
  const setAuth = (r) => { try { localStorage.setItem("ms_role", r); } catch (e) {} setTab("command"); setRole(r); };
  const logout = () => { try { localStorage.removeItem("ms_role"); } catch (e) {} setRole(null); };
  const [brand, setBrand] = useState("sotong");
  const todayStr = new Date().toLocaleDateString("zh-MY", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Kuala_Lumpur" });

  // 旧页面暂时保留入口（二级），静态数据已下架
  const legacyTabs = isAdmin
    ? [
        { id: "overview", label: "总览", name: "总览 Cost & Profit" },
        { id: "alerts", label: "Alerts", name: "Alerts" },
        { id: "roster", label: "Roster", name: "Roster" },
        { id: "sales", label: "Sales", name: "Sales（June 静态）" },
        { id: "online", label: "Online", name: "Online Channels" },
        { id: "reviews", label: "Reviews", name: "Google Reviews" },
      ]
    : [
        { id: "alerts", label: "紧急事项", name: "Alerts" },
        { id: "sales", label: "达标程度", name: "达标程度" },
      ];

  const tabs = [
    { id: "command", label: "◆ COMMAND CENTER" },
    { id: "live", label: "● LIVE 实时" },
    ...legacyTabs.map(({ id, label }) => ({ id, label })),
    ...(isAdmin ? [{ id: "log", label: "Update Log" }] : []),
  ];

  if (!role) return <Login onAuth={setAuth} />;

  const activeLegacy = legacyTabs.find((t) => t.id === tab);

  return (
    <div style={{ background: "#1a1612", minHeight: "100vh", fontFamily: "Georgia,serif", color: "#e8e0d4" }}>

      <div style={{ background: "#141210", borderBottom: "1px solid #2a2520", padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, color: "#C8A97E", letterSpacing: 4, textTransform: "uppercase", fontFamily: "monospace" }}>Malaysian Heritage Brands Group</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#f0e8dc", marginTop: 2 }}>CEO Command Center <span style={{ fontSize: 11, color: "#6b5f52", fontFamily: "monospace", fontWeight: "normal" }}>{VERSION}</span></div>
            <div style={{ fontSize: 10, color: "#4a4038", fontFamily: "monospace", marginTop: 2 }}>{todayStr}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 8 }}>
              {[["sotong", "MR SOTONG"], ["baker", "MR BAKER"], ["jewel", "OON JEWEL"]].map(([id, nm]) => (
                <button key={id} onClick={() => setBrand(id)} style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1, padding: "3px 9px", borderRadius: 2, cursor: "pointer", border: `1px solid ${brand === id ? "#C8A97E" : "#2a2520"}`, background: brand === id ? "#C8A97E22" : "transparent", color: brand === id ? "#C8A97E" : "#6b5f52" }}>{nm}</button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: "#6b5f52", fontFamily: "monospace", marginTop: 4 }}>{isAdmin ? "管理员 Admin" : "访客 Viewer"} · <span onClick={logout} style={{ color: "#C8A97E", cursor: "pointer" }}>登出</span></div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 18px", maxWidth: 860 }}>

        <div style={{ display: "flex", borderBottom: "1px solid #2a2520", marginBottom: 14, overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", background: "transparent", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", border: "none", marginBottom: -1, whiteSpace: "nowrap", borderBottom: tab === t.id ? `2px solid ${t.id === "command" ? "#C8A97E" : t.id === "live" ? "#A8C5A0" : "#6b5f52"}` : "2px solid transparent", color: tab === t.id ? (t.id === "command" ? "#C8A97E" : t.id === "live" ? "#A8C5A0" : "#a89c8c") : "#4a4038" }}>{t.label}</button>
          ))}
        </div>

        {tab === "command" && <CommandCenter />}
        {tab === "live" && <Live />}

        {activeLegacy && (brand !== "sotong"
          ? <ComingSoon brand={brand} />
          : <Retired name={activeLegacy.name} />)}

        {isAdmin && tab === "log" && (
          <div>
            <div style={{ fontSize: 9, color: "#4a4038", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>更新日志 · Update Log — Current {VERSION}</div>
            {UPDATE_LOG.map((rel) => (
              <div key={rel.v} style={{ background: "#1e1a16", border: "1px solid #2a2520", borderLeft: `3px solid ${rel.v === VERSION ? "#A8C5A0" : "#4a4038"}`, borderRadius: 3, padding: "12px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: rel.v === VERSION ? "#A8C5A0" : "#d4c8bc", fontFamily: "monospace", fontWeight: "bold" }}>{rel.v}{rel.v === VERSION ? " ← current" : ""}</span>
                  <span style={{ fontSize: 9, color: "#6b5f52", fontFamily: "monospace" }}>{rel.date}</span>
                </div>
                {rel.changes.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                    <span style={{ color: "#C8A97E", fontFamily: "monospace", fontSize: 11, flexShrink: 0 }}>+</span>
                    <span style={{ fontSize: 11, color: "#c8b898", lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #2a2520", padding: "20px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <img src="/logo.png" alt="Mr Sotong" style={{ height: 56, borderRadius: 10 }} />
        <div style={{ fontFamily: "monospace" }}>
          <div style={{ fontSize: 12, color: "#C8A97E", letterSpacing: 2 }}>MR SOTONG · 鱿鱼先生</div>
          <div style={{ fontSize: 8, color: "#4a4038", letterSpacing: 1, marginTop: 3 }}>Malaysian Heritage Brands Group</div>
        </div>
      </div>
    </div>
  );
}
