import { useState } from "react";
import packageJson from "../package.json";
import Live from "./Live.jsx";

const VERSION = `v${packageJson.version}`;

const ADMIN_PASS = "rubytan91blindwolf90";
const VIEW_PASS = "sotong-team";

const FALLBACK_REVIEWS = [
  { store: "KSL", rating: 5.0, total: 2101 },
  { store: "BI", rating: 4.9, total: 1383 },
  { store: "KOM", rating: 5.0, total: 210 },
  { store: "MA", rating: 4.9, total: 487 },
  { store: "TEB", rating: 5.0, total: 741 },
];

const FALLBACK_SALES = [
  { store: "KSL", target: 311893, actual: 406768 },
  { store: "BI", target: 269813, actual: 261794 },
  { store: "KOM", target: 89125, actual: 135847 },
  { store: "TEB", target: 193124, actual: 220307 },
  { store: "MA", target: 107673, actual: 115357 },
];

const FALLBACK_ROSTER = [
  { store:"KSL", name:"LIEW WEN BIN", role:"OM", work:19, off:4, asst:4, notes:"" },
  { store:"KSL", name:"SAW KAI BIN", role:"JE", work:22, off:5, asst:0, notes:"" },
  { store:"KSL", name:"TEOH AI YUN", role:"JE", work:22, off:5, asst:0, notes:"" },
  { store:"KSL", name:"LEE RUI SHENG", role:"JE", work:22, off:5, asst:0, notes:"PENDING" },
  { store:"KSL", name:"MARCUS GOH", role:"SP", work:10, off:0, asst:0, notes:"3 HD" },
  { store:"BI", name:"JOSEPH TAN", role:"AM", work:17, off:4, asst:7, notes:"" },
  { store:"BI", name:"AARON CHUNG", role:"JE", work:0, off:0, asst:0, notes:"RESIGNED" },
  { store:"BI", name:"HOW YEN LING", role:"JE", work:19, off:8, asst:0, notes:"" },
  { store:"BI", name:"GOH SUET TENG", role:"JE", work:22, off:6, asst:0, notes:"PENDING" },
  { store:"BI", name:"TAN YI THIM", role:"SP", work:14, off:0, asst:0, notes:"" },
  { store:"BI", name:"LEONG KAR PEE", role:"SP", work:16, off:0, asst:0, notes:"PENDING" },
  { store:"TEB", name:"ALBERT HAU", role:"OM", work:19, off:4, asst:3, notes:"" },
  { store:"TEB", name:"PERRY LEE", role:"SP", work:2, off:1, asst:0, notes:"TO JEWELLERY" },
  { store:"TEB", name:"PHONG CHANG LE", role:"JE", work:22, off:7, asst:0, notes:"PENDING" },
  { store:"TEB", name:"TAN YUK ZHE", role:"SP", work:14, off:0, asst:0, notes:"PENDING" },
  { store:"TEB", name:"LISNA DAMAYANTI", role:"SP", work:27, off:2, asst:0, notes:"" },
  { store:"KOM", name:"YAP ZHEN YU", role:"JE", work:23, off:4, asst:0, notes:"LEADING" },
  { store:"KOM", name:"ISSAC LAU", role:"SP", work:10, off:0, asst:0, notes:"" },
  { store:"KOM", name:"SIEW YOU HONG", role:"SP", work:13, off:0, asst:0, notes:"PENDING" },
  { store:"KOM", name:"KELLY", role:"SP", work:10, off:0, asst:0, notes:"PENDING" },
  { store:"MA", name:"JEFFREY LIM", role:"JE", work:22, off:5, asst:0, notes:"" },
  { store:"MA", name:"MERI PERDANI", role:"SP", work:28, off:2, asst:0, notes:"" },
];

const FALLBACK_ONLINE = [
  { channel:"Shopee", target:25000, actual:null, orders:null },
  { channel:"Lazada", target:15000, actual:null, orders:null },
  { channel:"TikTok", target:20000, actual:null, orders:null },
];

const OVERVIEW = {
  totalSales: 971628, totalNetProfit: 165875, groupMargin: 17.1, activeStores: 5,
  source: "AutoCount 2026 Jan-May 月均 + 用户提供租金/人员 | 毛利 35%、佣金 2% | 净利不计总部/工厂分摊",
  stores: [
    { store:"KSL", name:"KSL (MR SOTONG)", sales:311893, netMargin:10.6, staffPct:6.2, occPct:13.5, safety:1.6 },
    { store:"BI", name:"AEON Bukit Indah", sales:269813, netMargin:24.2, staffPct:4.6, occPct:5.4, safety:3.8 },
    { store:"TEB", name:"AEON Tebrau", sales:193124, netMargin:20.1, staffPct:7.6, occPct:6.5, safety:2.7 },
    { store:"MA", name:"Mount Austin", sales:107673, netMargin:12.8, staffPct:9.2, occPct:10.2, safety:1.7 },
    { store:"KOM", name:"Komtar JBCC", sales:89125, netMargin:16.9, staffPct:8.1, occPct:8.2, safety:2.2 },
  ],
};

const UPDATE_LOG = [
  { v:"v2.7.0", date:"2026-07-15", changes:[
    "新增「实时 LIVE」默认页：Group Sales / Monthly Target / Achievement / 三品牌 / Store Ranking，全部数据来自 n8n Data API v1.0（实时读 Google Sheet Daily Sales，零硬编码）",
    "支持 /live 直达路径；每 5 分钟自动刷新 + 手动刷新 + cache-buster 防旧缓存",
    "旧页面零改动；总览/SALES 页历史数字为 Jan-May 静态基线，实时数据一律看 LIVE 页",
  ]},
  { v:"v2.4", date:"2026-06-03", changes:[
    "新增「战报」游戏页:每家店是 Q 版装甲战士,鱿鱼先生吉祥物 = 每日小怪,销售即伤害",
    "新增品牌切换器;在线销售独立成第六位置;Logo 放到底部",
    "汇总条只在总览页显示,不再每页重复",
  ]},
  { v:"v2.2", date:"2026-06-02", changes:["登录分级 (管理员 / 访客) + 持久登录 + 看密码眼睛"] },
  { v:"v2.0", date:"2026-06-02", changes:["新增总览;Sales 改版;真实六月 roster;更新日志"] },
  { v:"v1.0", date:"2026-06-01", changes:["首版:Alerts / Roster / Sales / Online / Reviews"] },
];

const SYSTEMS = [
  { n:1, type:"Connector", name:"Notion — 数据中心 (Sales / Reviews / Roster DB)" },
  { n:2, type:"Connector", name:"Google Sheets — 备份数据" },
  { n:3, type:"Connector", name:"Google Drive — HR 排班 + AutoCount 导出" },
  { n:4, type:"Skill", name:"n8n_1 — 1 星评价即时邮件提醒" },
  { n:5, type:"Skill", name:"n8n_2 — 每日 Google Review 同步" },
  { n:6, type:"Skill", name:"n8n_3 — 每月 e-dashboard 提醒" },
];

function generateAlerts(sales, roster, reviews) {
  const alerts = [];
  sales.forEach(d => {
    if (!d.actual) return;
    const pct = d.actual / d.target * 100;
    if (pct < 70) alerts.push({ level:"URGENT", store:d.store, title:`${d.store} Sales Critical — ${pct.toFixed(0)}%`, message:`Actual RM${d.actual.toLocaleString()} vs target RM${d.target.toLocaleString()}.`, recommendations:["Visit store today","Check stock level","Review staffing","Run a flash promo"] });
    else if (pct < 85) alerts.push({ level:"WARNING", store:d.store, title:`${d.store} Sales Below Target — ${pct.toFixed(0)}%`, message:`Tracking RM${(d.target-d.actual).toLocaleString()} behind.`, recommendations:["Push sampling","Bundle promo","Check competitors"] });
  });
  const storeMinStaff = { KSL:3, BI:3, KOM:2, MA:2 };
  ["KSL","BI","KOM","MA"].forEach(s => {
    const active = roster.filter(r => r.store===s && r.work>0 && !r.notes?.includes("RESIGNED"));
    if (active.length < storeMinStaff[s]) alerts.push({ level:"URGENT", store:s, title:`${s} Understaffed — ${active.length}/${storeMinStaff[s]}`, message:`Active staff ${active.length}, min ${storeMinStaff[s]}.`, recommendations:["Reassign ASST staff","OM cover floor","Hire part-timer"] });
  });
  reviews.forEach(r => {
    if (r.rating < 4.0) alerts.push({ level:"URGENT", store:r.store, title:`${r.store} Rating ${r.rating} ⭐ Below Acceptable`, message:`Rating ${r.rating} with ${r.total} reviews.`, recommendations:["Read 1-2 star reviews","Identify themes","Brief OM","Reply within 24h"] });
  });
  return alerts;
}

const storeNames = { KSL:"KSL Mall", BI:"Bukit Indah", TEB:"AEON Tebrau", KOM:"Komtar JBCC", MA:"Mount Austin" };
const storeColors = { KSL:"#C8A97E", BI:"#A8C5A0", TEB:"#B8A0C8", KOM:"#9FB8C8", MA:"#C9A0A0" };
const roleColors = { OM:"#C8A97E", AM:"#b89060", JE:"#7a7a8a", SP:"#6a6a7a", "—":"#3a3530" };
const TIKTOK_COLOR = "#69C9D0";
const channelColors = { Shopee:TIKTOK_COLOR, Lazada:TIKTOK_COLOR, TikTok:TIKTOK_COLOR };

function marginColor(p) { return p >= 18 ? "#A8C5A0" : p >= 12 ? "#C8A97E" : "#cc3333"; }
function safetyColor(x) { return x >= 2.5 ? "#A8C5A0" : x >= 1.7 ? "#C8A97E" : "#cc3333"; }

function Stars({ rating }) {
  const r = parseFloat(rating) || 0;
  return <span style={{ fontFamily:"monospace", fontSize:13, color:"#C8A97E" }}>{"★".repeat(Math.floor(r))}{"☆".repeat(5-Math.floor(r))} {r.toFixed(1)}</span>;
}

function Badge({ role }) {
  return <span style={{ fontSize:9, padding:"2px 6px", borderRadius:2, fontFamily:"monospace", letterSpacing:1, background:`${roleColors[role]||"#3a3530"}22`, color:roleColors[role]||"#6b5f52", border:`1px solid ${roleColors[role]||"#3a3530"}44` }}>{role}</span>;
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:"#1e1a16", borderRadius:3, padding:"12px 14px", border:"1px solid #2a2520" }}>
      <div style={{ fontSize:8, color:"#4a4038", letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:20, color:color||"#f0e8dc", fontFamily:"monospace", fontWeight:"bold", marginTop:4 }}>{value}</div>
      {sub && <div style={{ fontSize:8, color:"#6b5f52", fontFamily:"monospace", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, display, max, color }) {
  return (
    <div style={{ marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:10, color:"#a89c8c", fontFamily:"monospace" }}>{label}</span>
        <span style={{ fontSize:11, color:color, fontFamily:"monospace", fontWeight:"bold" }}>{display}</span>
      </div>
      <div style={{ height:8, background:"#2a2520", borderRadius:2 }}>
        <div style={{ height:"100%", width:`${Math.max(2, Math.min(100, value/max*100))}%`, background:color, borderRadius:2 }} />
      </div>
    </div>
  );
}

function AlertCard({ alert }) {
  const [open, setOpen] = useState(false);
  const isUrgent = alert.level === "URGENT";
  return (
    <div style={{ background: isUrgent?"#1e1010":"#1e1a10", border:`1px solid ${isUrgent?"#8B2020":"#5a4a10"}`, borderLeft:`3px solid ${isUrgent?"#cc3333":"#C8A97E"}`, borderRadius:3, padding:"10px 14px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setOpen(!open)}>
        <div>
          <span style={{ fontSize:9, color:isUrgent?"#cc3333":"#C8A97E", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>{isUrgent?"🚨 URGENT":"⚠ WARNING"} — {alert.store}</span>
          <div style={{ fontSize:12, color:"#d4c8bc", marginTop:3, fontWeight:"bold" }}>{alert.title}</div>
          <div style={{ fontSize:11, color:isUrgent?"#c08080":"#a09050", marginTop:3, lineHeight:1.5 }}>{alert.message}</div>
        </div>
        <div style={{ color:"#4a4038", fontSize:16, marginLeft:12 }}>{open?"▲":"▼"}</div>
      </div>
      {open && (
        <div style={{ marginTop:10, borderTop:"1px solid #2a2520", paddingTop:10 }}>
          {alert.recommendations.map((rec,i)=>(
            <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
              <span style={{ color:"#C8A97E", fontFamily:"monospace", fontSize:11, flexShrink:0 }}>{i+1}.</span>
              <span style={{ fontSize:11, color:"#c8b898", lineHeight:1.5 }}>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComingSoon({ brand }) {
  const names = { baker:"Mr Baker 🥖", jewel:"Oon Jewel 💎" };
  return (
    <div style={{ textAlign:"center", padding:"70px 20px", fontFamily:"monospace" }}>
      <div style={{ fontSize:18, color:"#C8A97E", letterSpacing:2 }}>{names[brand] || brand}</div>
      <div style={{ fontSize:12, color:"#a89c8c", marginTop:12 }}>数据待接入 · Data coming soon</div>
      <div style={{ fontSize:10, color:"#4a4038", marginTop:8, lineHeight:1.6 }}>此品牌的销售 / 成本 / 排班数据尚未录入</div>
    </div>
  );
}

function Login({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  const submit = () => {
    if (pw === ADMIN_PASS) onAuth("admin");
    else if (pw === VIEW_PASS) onAuth("viewer");
    else setErr(true);
  };
  return (
    <div style={{ background:"#1a1612", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
      <div style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:6, padding:"32px 28px", width:300 }}>
        <div style={{ fontSize:9, color:"#C8A97E", letterSpacing:4, textTransform:"uppercase", fontFamily:"monospace" }}>Mr Sotong</div>
        <div style={{ fontSize:18, color:"#f0e8dc", fontWeight:"bold", marginTop:4, marginBottom:18 }}>Operations Dashboard</div>
        <div style={{ position:"relative" }}>
          <input type={show?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>{if(e.key==="Enter")submit();}} placeholder="输入密码 password"
            style={{ width:"100%", boxSizing:"border-box", padding:"10px 40px 10px 12px", background:"#141210", border:`1px solid ${err?"#cc3333":"#2a2520"}`, borderRadius:3, color:"#e8e0d4", fontFamily:"monospace", fontSize:13 }} />
          <span onClick={()=>setShow(!show)} title="显示 / 隐藏密码" style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:15, userSelect:"none", opacity:0.8 }}>{show?"🙈":"👁"}</span>
        </div>
        {err && <div style={{ fontSize:10, color:"#cc3333", fontFamily:"monospace", marginTop:6 }}>密码错误 wrong password</div>}
        <button onClick={submit} style={{ width:"100%", marginTop:14, padding:"10px", background:"#C8A97E22", border:"1px solid #C8A97E", borderRadius:3, color:"#C8A97E", fontFamily:"monospace", fontSize:12, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>进入 Enter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(() => { try { return localStorage.getItem("ms_role"); } catch(e){ return null; } });
  const isAdmin = role === "admin";
  const [tab, setTab] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.location.pathname === "/live") return "live";
      return "live"; // v2.7.0: LIVE 实时页为默认页
    } catch(e){ return "live"; }
  });
  const setAuth = (r) => { try { localStorage.setItem("ms_role", r); } catch(e){} setTab("live"); setRole(r); };
  const logout = () => { try { localStorage.removeItem("ms_role"); } catch(e){} setRole(null); };
  const [brand, setBrand] = useState("sotong");
  const [store, setStore] = useState("KSL");
  const [reviews] = useState(FALLBACK_REVIEWS);
  const [sales] = useState(FALLBACK_SALES);
  const [roster] = useState(FALLBACK_ROSTER);
  const [online] = useState(FALLBACK_ONLINE);

  const alerts = generateAlerts(sales, roster, reviews);
  const urgent = alerts.filter(a=>a.level==="URGENT").length;
  const warning = alerts.filter(a=>a.level==="WARNING").length;
  const storeRoster = roster.filter(r=>r.store===store);
  const todayStr = new Date().toLocaleDateString("zh-MY",{weekday:"short",year:"numeric",month:"short",day:"numeric",timeZone:"Asia/Kuala_Lumpur"});
  const totalOnlineTarget = online.reduce((s,o)=>s+(o.target||0),0);
  const maxSales = Math.max(...OVERVIEW.stores.map(s=>s.sales));
  const maxCostPct = Math.max(...OVERVIEW.stores.map(s=>Math.max(s.staffPct, s.occPct)));
  const maxSafety = Math.max(...OVERVIEW.stores.map(s=>s.safety));

  const tabs = isAdmin ? [
    { id:"live", label:"● LIVE 实时" },
    { id:"overview", label:"总览" },
    { id:"alerts", label:`Alerts${urgent>0?` 🚨${urgent}`:""}` },
    { id:"roster", label:"Roster" },
    { id:"sales", label:"Sales" },
    { id:"online", label:"Online" },
    { id:"reviews", label:"Reviews" },
    { id:"log", label:"Update Log" },
  ] : [
    { id:"live", label:"● LIVE 实时" },
    { id:"alerts", label:`紧急事项${urgent>0?` 🚨${urgent}`:""}` },
    { id:"sales", label:"达标程度" },
  ];

  if (!role) return <Login onAuth={setAuth} />;

  return (
    <div style={{ background:"#1a1612", minHeight:"100vh", fontFamily:"Georgia,serif", color:"#e8e0d4" }}>

      <div style={{ background:"#141210", borderBottom:"1px solid #2a2520", padding:"14px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:9, color:"#C8A97E", letterSpacing:4, textTransform:"uppercase", fontFamily:"monospace" }}>Malaysian Heritage Brands Group</div>
            <div style={{ fontSize:22, fontWeight:"bold", color:"#f0e8dc", marginTop:2 }}>Operations Dashboard <span style={{ fontSize:11, color:"#6b5f52", fontFamily:"monospace", fontWeight:"normal" }}>{VERSION}</span></div>
            <div style={{ fontSize:10, color:"#4a4038", fontFamily:"monospace", marginTop:2 }}>{todayStr}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginBottom:8 }}>
              {[["sotong","MR SOTONG"],["baker","MR BAKER"],["jewel","OON JEWEL"]].map(([id,nm])=>(
                <button key={id} onClick={()=>setBrand(id)} style={{ fontSize:9, fontFamily:"monospace", letterSpacing:1, padding:"3px 9px", borderRadius:2, cursor:"pointer", border:`1px solid ${brand===id?"#C8A97E":"#2a2520"}`, background:brand===id?"#C8A97E22":"transparent", color:brand===id?"#C8A97E":"#6b5f52" }}>{nm}</button>
              ))}
            </div>
            {urgent > 0 && <div style={{ fontSize:11, color:"#cc3333", fontFamily:"monospace", fontWeight:"bold" }}>🚨 {urgent} URGENT</div>}
            <div style={{ fontSize:9, color:"#6b5f52", fontFamily:"monospace", marginTop:4 }}>{isAdmin?"管理员 Admin":"访客 Viewer"} · <span onClick={logout} style={{ color:"#C8A97E", cursor:"pointer" }}>登出</span></div>
          </div>
        </div>

        <div style={{ display:"flex", gap:8, marginTop:14, overflowX:"auto" }}>
          {Object.keys(storeNames).map(s => (
            <button key={s} onClick={()=>setStore(s)} style={{ padding:"5px 14px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:11, letterSpacing:2, textTransform:"uppercase", border:"none", background: store===s ? `${storeColors[s]}22` : "transparent", color: store===s ? storeColors[s] : "#4a4038", borderBottom: store===s ? `2px solid ${storeColors[s]}` : "2px solid transparent" }}>{s}</button>
          ))}
          {isAdmin && <button onClick={()=>setTab("online")} style={{ padding:"5px 14px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:11, letterSpacing:2, textTransform:"uppercase", border:"none", background: tab==="online"?"#69C9D022":"transparent", color: tab==="online"?"#69C9D0":"#4a4038", borderBottom: tab==="online"?"2px solid #69C9D0":"2px solid transparent" }}>线上</button>}
        </div>
      </div>

      <div style={{ padding:"14px 18px", maxWidth:860 }}>

        {brand !== "sotong" && tab !== "live" && <ComingSoon brand={brand} />}
        {(brand === "sotong" || tab === "live") && (<>

          <div style={{ display:"flex", borderBottom:"1px solid #2a2520", marginBottom:14, overflowX:"auto" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"8px 14px", background:"transparent", cursor:"pointer", fontFamily:"monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", border:"none", marginBottom:-1, whiteSpace:"nowrap", borderBottom: tab===t.id ? `2px solid ${t.id==="live"?"#A8C5A0":storeColors[store]}` : "2px solid transparent", color: tab===t.id ? (t.id==="live"?"#A8C5A0":storeColors[store]) : "#4a4038" }}>{t.label}</button>
            ))}
          </div>

          {tab==="live" && <Live />}

          {brand === "sotong" && (<>

          {isAdmin && tab==="overview" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>门店总览 · Cost & Profit</div>
              <div style={{ fontSize:9, color:"#6b5f52", fontFamily:"monospace", marginBottom:14, lineHeight:1.5 }}>{OVERVIEW.source}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                <StatCard label="5 店月销售合计" value={`RM ${(OVERVIEW.totalSales/1000).toFixed(0)}k`} sub="月均" color="#f0e8dc" />
                <StatCard label="月净利合计" value={`RM ${(OVERVIEW.totalNetProfit/1000).toFixed(0)}k`} sub="扣 AM 后" color="#A8C5A0" />
                <StatCard label="集团净利率" value={`${OVERVIEW.groupMargin}%`} sub="扣 AM 后" color="#A8C5A0" />
                <StatCard label="活跃门店" value={OVERVIEW.activeStores} sub="A · B · C 级" color="#9FB8C8" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#d4c8bc", fontWeight:"bold", marginBottom:12 }}>月均销售 (RM)</div>
                  {OVERVIEW.stores.map(s=>(<BarRow key={s.store} label={s.name} value={s.sales} display={`${(s.sales/1000).toFixed(0)}k`} max={maxSales} color={storeColors[s.store]} />))}
                </div>
                <div style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#d4c8bc", fontWeight:"bold", marginBottom:12 }}>净利率 % (扣 AM 后)</div>
                  {OVERVIEW.stores.map(s=>(<BarRow key={s.store} label={s.name} value={s.netMargin} display={`${s.netMargin}%`} max={26} color={marginColor(s.netMargin)} />))}
                </div>
                <div style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#d4c8bc", fontWeight:"bold", marginBottom:6 }}>员工占比 vs 占用占比 (% 销售)</div>
                  <div style={{ display:"flex", gap:14, marginBottom:10 }}>
                    <span style={{ fontSize:9, color:"#9FB8C8", fontFamily:"monospace" }}>■ 员工</span>
                    <span style={{ fontSize:9, color:"#C8A97E", fontFamily:"monospace" }}>■ 占用</span>
                  </div>
                  {OVERVIEW.stores.map(s=>(
                    <div key={s.store} style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, color:"#a89c8c", fontFamily:"monospace", marginBottom:3 }}>{s.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                        <div style={{ flex:1, height:6, background:"#2a2520", borderRadius:2 }}><div style={{ height:"100%", width:`${s.staffPct/maxCostPct*100}%`, background:"#9FB8C8", borderRadius:2 }} /></div>
                        <span style={{ fontSize:9, color:"#9FB8C8", fontFamily:"monospace", width:34, textAlign:"right" }}>{s.staffPct}%</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ flex:1, height:6, background:"#2a2520", borderRadius:2 }}><div style={{ height:"100%", width:`${s.occPct/maxCostPct*100}%`, background:"#C8A97E", borderRadius:2 }} /></div>
                        <span style={{ fontSize:9, color:"#C8A97E", fontFamily:"monospace", width:34, textAlign:"right" }}>{s.occPct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#d4c8bc", fontWeight:"bold", marginBottom:4 }}>安全倍数 (月均 ÷ 损益平衡线)</div>
                  <div style={{ fontSize:9, color:"#6b5f52", fontFamily:"monospace", marginBottom:12 }}>越高越安全 · 1.0 = 打平</div>
                  {OVERVIEW.stores.map(s=>(<BarRow key={s.store} label={s.name} value={s.safety} display={`${s.safety}x`} max={maxSafety} color={safetyColor(s.safety)} />))}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:18 }}>
                <StatCard label="Active Alerts" value={alerts.length} color={alerts.length>0?"#cc3333":"#A8C5A0"} />
                <StatCard label="Avg Review" value="4.9 ⭐" color="#C8A97E" />
                <StatCard label="Group Net Margin" value={`${OVERVIEW.groupMargin}%`} color="#A8C5A0" />
                <StatCard label="Jun Target" value="RM 971K" color="#A8C5A0" />
              </div>
            </div>
          )}

          {tab==="alerts" && (
            <div>
              {alerts.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#3a3530", fontFamily:"monospace" }}>
                  <div style={{ fontSize:32 }}>✓</div>
                  <div style={{ marginTop:8, fontSize:12 }}>All stores operating normally</div>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
                    {[{ label:"Urgent", val:urgent, color:"#cc3333" },{ label:"Warning", val:warning, color:"#C8A97E" },{ label:"Stores", val:[...new Set(alerts.map(a=>a.store))].length, color:"#9FB8C8" }].map(s=>(
                      <div key={s.label} style={{ background:"#1e1a16", borderRadius:3, padding:"10px 12px", border:"1px solid #2a2520" }}>
                        <div style={{ fontSize:22, color:s.color, fontFamily:"monospace", fontWeight:"bold" }}>{s.val}</div>
                        <div style={{ fontSize:8, color:"#4a4038", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {alerts.map((a,i)=><AlertCard key={i} alert={a} />)}
                </>
              )}
            </div>
          )}

          {isAdmin && tab==="roster" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{storeNames[store]} — June 2026</div>
              {storeRoster.map((emp,i)=>(
                <div key={i} style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"12px 14px", marginBottom:8, opacity:emp.notes?.includes("RESIGNED")?0.5:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Badge role={emp.role} />
                      <span style={{ fontSize:13, color:"#d4c8bc" }}>{emp.name}</span>
                      {emp.notes && <span style={{ fontSize:10, color:emp.notes.includes("RESIGNED")?"#cc3333":"#C8A97E", fontFamily:"monospace" }}>{emp.notes}</span>}
                    </div>
                    {emp.work>0 && (
                      <div style={{ display:"flex", gap:14 }}>
                        {[["Work",emp.work,"#A8C5A0"],["Off",emp.off,"#6b5f52"],["ASST",emp.asst,"#c4a0c4"]].filter(([,v])=>v>0).map(([l,v,c])=>(
                          <div key={l} style={{ textAlign:"center" }}>
                            <div style={{ fontSize:15, color:c, fontFamily:"monospace", fontWeight:"bold" }}>{v}</div>
                            <div style={{ fontSize:7, color:"#4a4038", letterSpacing:1, textTransform:"uppercase" }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {emp.work>0 && (
                    <div style={{ display:"flex", gap:2, height:4, marginTop:10 }}>
                      {Array.from({length:30}).map((_,d)=>(<div key={d} style={{ flex:1, borderRadius:1, background:d<emp.work?storeColors[store]:"#2a2520" }} />))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAdmin && tab==="sales" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Retail Sales — June 2026</div>
              {sales.map(d=>{
                const pct = d.actual ? Math.round(d.actual/d.target*100) : null;
                const statusColor = !pct ? "#3a3530" : pct>=100 ? "#A8C5A0" : pct>=85 ? "#C8A97E" : "#cc3333";
                const frac = d.actual ? d.actual/d.target : 0;
                const segLabels = ["Day 1-10","Day 11-20","Day 21-30"];
                return (
                  <div key={d.store} style={{ background:"#1e1a16", border:`1px solid ${store===d.store?storeColors[d.store]+"44":"#2a2520"}`, borderRadius:3, padding:"16px 18px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:16 }}>
                      <div>
                        <div style={{ fontSize:10, color:storeColors[d.store], fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>{d.store} — {storeNames[d.store]}</div>
                        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                          <span style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:1 }}>TARGET</span>
                          <span style={{ fontSize:23, color:"#d4c8bc", fontFamily:"monospace", fontWeight:"bold" }}>RM {d.target.toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:1 }}>ACTUAL SALES</div>
                        <div style={{ fontSize:30, color:statusColor, fontFamily:"monospace", fontWeight:"bold", lineHeight:1.15 }}>RM {d.actual.toLocaleString()}</div>
                        <div style={{ fontSize:13, color:statusColor, fontFamily:"monospace", fontWeight:"bold" }}>{pct}% of target</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      {[0,1,2].map(seg=>{
                        const segFill = Math.max(0, Math.min(100, (frac*3 - seg)*100));
                        return (
                          <div key={seg} style={{ flex:1 }}>
                            <div style={{ height:10, background:"#2a2520", borderRadius:3, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${segFill}%`, background:statusColor, transition:"width 0.4s" }} />
                            </div>
                            <div style={{ fontSize:7, color:"#4a4038", fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase", marginTop:4, textAlign:"center" }}>{segLabels[seg]}</div>
                          </div>
                        );
                      })}
                    </div>
                    {pct!==null && pct < 85 && (<div style={{ fontSize:10, color:"#c87040", marginTop:8, fontFamily:"monospace" }}>⚠ RM {(d.target-d.actual).toLocaleString()} behind</div>)}
                  </div>
                );
              })}
            </div>
          )}

          {!isAdmin && tab==="sales" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>达标程度 · Sales Achievement — June 2026</div>
              {sales.map(d=>{
                const pct = d.actual ? Math.round(d.actual/d.target*100) : null;
                const c = !pct ? "#3a3530" : pct>=100 ? "#A8C5A0" : pct>=85 ? "#C8A97E" : "#cc3333";
                const status = !pct ? "待更新" : pct>=100 ? "达标" : pct>=85 ? "接近" : "落后";
                return (
                  <div key={d.store} style={{ background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                      <span style={{ fontSize:11, color:storeColors[d.store], fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase" }}>{d.store} — {storeNames[d.store]}</span>
                      <span style={{ fontSize:22, color:c, fontFamily:"monospace", fontWeight:"bold" }}>{pct!==null?`${pct}%`:"—"}</span>
                    </div>
                    <div style={{ height:8, background:"#2a2520", borderRadius:3 }}><div style={{ height:"100%", width:`${pct?Math.min(pct,100):0}%`, background:c, borderRadius:3 }} /></div>
                    <div style={{ fontSize:10, color:c, fontFamily:"monospace", marginTop:6 }}>{status}</div>
                  </div>
                );
              })}
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", marginTop:8 }}>仅显示达标程度;详细财务需管理员权限</div>
            </div>
          )}

          {isAdmin && tab==="online" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Online Channels — June 2026</div>
              {online.map(o=>{
                const c = channelColors[o.channel] || TIKTOK_COLOR;
                return (
                  <div key={o.channel} style={{ background:"#1e1a16", border:`1px solid #2a2520`, borderLeft:`3px solid ${c}`, borderRadius:3, padding:"14px 16px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:13, color:c, fontFamily:"monospace", fontWeight:"bold", letterSpacing:1 }}>{o.channel}</span>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace" }}>TARGET</div>
                        <div style={{ fontSize:15, color:"#d4c8bc", fontFamily:"monospace", fontWeight:"bold" }}>RM {o.target.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ flex:1, height:6, background:"#2a2520", borderRadius:3 }} />
                      <span style={{ fontSize:9, color:"#3a3530", fontFamily:"monospace" }}>待录入数据</span>
                    </div>
                  </div>
                );
              })}
              <div style={{ background:"#141210", border:"1px solid #2a2520", borderRadius:3, padding:"14px 16px", marginTop:4, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#6b5f52", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>Total Online</span>
                <span style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace" }}>Target: RM {totalOnlineTarget.toLocaleString()}</span>
              </div>
            </div>
          )}

          {isAdmin && tab==="reviews" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Google Reviews — 5 Outlets</div>
              {[...reviews].sort((a,b)=>b.rating-a.rating).map((r,i)=>(
                <div key={i} style={{ background: r.rating<4?"#1e1010":"#1e1a16", border: r.rating<4?"1px solid #8B2020":"1px solid #2a2520", borderLeft:`3px solid ${storeColors[r.store]||"#C8A97E"}`, borderRadius:3, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:9, color:storeColors[r.store]||"#C8A97E", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>{r.store} — {storeNames[r.store] || r.store}</div>
                      <div style={{ marginTop:6 }}><Stars rating={r.rating} /></div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, color:"#d4c8bc", fontFamily:"monospace", fontWeight:"bold" }}>{(r.total||0).toLocaleString()}</div>
                      <div style={{ fontSize:7, color:"#4a4038", letterSpacing:1, textTransform:"uppercase" }}>reviews</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin && tab==="log" && (
            <div>
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>更新日志 · Update Log — Current {VERSION}</div>
              {UPDATE_LOG.map(rel=>(
                <div key={rel.v} style={{ background:"#1e1a16", border:"1px solid #2a2520", borderLeft:`3px solid ${rel.v===VERSION?"#A8C5A0":"#4a4038"}`, borderRadius:3, padding:"12px 16px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                    <span style={{ fontSize:14, color:rel.v===VERSION?"#A8C5A0":"#d4c8bc", fontFamily:"monospace", fontWeight:"bold" }}>{rel.v}{rel.v===VERSION?" ← current":""}</span>
                    <span style={{ fontSize:9, color:"#6b5f52", fontFamily:"monospace" }}>{rel.date}</span>
                  </div>
                  {rel.changes.map((c,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                      <span style={{ color:"#C8A97E", fontFamily:"monospace", fontSize:11, flexShrink:0 }}>+</span>
                      <span style={{ fontSize:11, color:"#c8b898", lineHeight:1.5 }}>{c}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", margin:"18px 0 10px" }}>系统连接器 / 技能</div>
              {SYSTEMS.map(sys=>(
                <div key={sys.n} style={{ display:"flex", alignItems:"center", gap:10, background:"#1e1a16", border:"1px solid #2a2520", borderRadius:3, padding:"9px 14px", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"#C8A97E", fontFamily:"monospace", fontWeight:"bold", width:18 }}>{sys.n}</span>
                  <span style={{ fontSize:9, padding:"2px 7px", borderRadius:2, fontFamily:"monospace", letterSpacing:1, background: sys.type==="Connector"?"#9FB8C822":"#A8C5A022", color: sys.type==="Connector"?"#9FB8C8":"#A8C5A0", border:`1px solid ${sys.type==="Connector"?"#9FB8C844":"#A8C5A044"}` }}>{sys.type}</span>
                  <span style={{ fontSize:11, color:"#c8b898", fontFamily:"monospace" }}>{sys.name}</span>
                </div>
              ))}
            </div>
          )}

          </>)}

        </>)}
      </div>

      <div style={{ borderTop:"1px solid #2a2520", padding:"20px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
        <img src="/logo.png" alt="Mr Sotong" style={{ height:56, borderRadius:10 }} />
        <div style={{ fontFamily:"monospace" }}>
          <div style={{ fontSize:12, color:"#C8A97E", letterSpacing:2 }}>MR SOTONG · 鱿鱼先生</div>
          <div style={{ fontSize:8, color:"#4a4038", letterSpacing:1, marginTop:3 }}>Malaysian Heritage Brands Group</div>
        </div>
      </div>
    </div>
  );
}
