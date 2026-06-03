import { useState } from "react";

const STORES = [
  { store:"KSL", col:"#C8A97E", sales:406768, tgt:311893 },
  { store:"BI", col:"#A8C5A0", sales:261794, tgt:269813 },
  { store:"TEB", col:"#B8A0C8", sales:220307, tgt:193124 },
  { store:"KOM", col:"#9FB8C8", sales:135847, tgt:89125 },
  { store:"MA", col:"#C9A0A0", sales:115357, tgt:107673 },
];
const fmtRM = n => "RM " + Math.round(n).toLocaleString("en-US");

function Marine({ color, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" style={{ display:"block", filter:"drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}>
      <rect x="26" y="21" width="12" height="5" rx="1.5" fill="#2a2520" />
      <rect x="1" y="19" width="13" height="12" rx="5" fill={color} stroke="#15110d" strokeWidth="1.5" />
      <rect x="26" y="19" width="13" height="12" rx="5" fill={color} stroke="#15110d" strokeWidth="1.5" />
      <rect x="12" y="19" width="16" height="21" rx="4" fill={color} stroke="#15110d" strokeWidth="1.5" />
      <rect x="17" y="24" width="6" height="11" rx="2" fill="#15110d" opacity="0.35" />
      <rect x="10.5" y="2.5" width="19" height="18" rx="7" fill={color} stroke="#15110d" strokeWidth="1.5" />
      <rect x="13.5" y="9" width="13" height="4.2" rx="2.1" fill="#69C9D0" />
      <rect x="19" y="2.5" width="2" height="6" rx="1" fill="#15110d" opacity="0.4" />
    </svg>
  );
}

export default function Battle() {
  const dailyTgt = Math.round(STORES.reduce((a,s)=>a+s.tgt,0)/30);
  const [hp, setHp] = useState(dailyTgt);
  const [floats, setFloats] = useState([]);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const fight = async () => {
    if (busy) return;
    setBusy(true); setResult(null); setHp(dailyTgt);
    let cur = dailyTgt;
    for (let i=0; i<STORES.length; i++) {
      const s = STORES[i];
      const dmg = Math.round(s.sales/30);
      cur = Math.max(0, cur - dmg); setHp(cur);
      setShake(true); setTimeout(()=>setShake(false), 250);
      const id = Date.now() + i;
      setFloats(f => [...f, { id, col:s.col, dmg }]);
      setTimeout(()=>setFloats(f => f.filter(x=>x.id!==id)), 1000);
      await new Promise(r=>setTimeout(r, 520));
      if (cur <= 0) break;
    }
    const totalDaily = Math.round(STORES.reduce((a,s)=>a+s.sales,0)/30);
    setResult(cur<=0 ? { win:true, total:totalDaily } : { win:false, left:cur });
    setBusy(false);
  };

  return (
    <div>
      <style>{"@keyframes msFloat{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-44px)}}@keyframes msShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}"}</style>
      <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
        战报 · Store Battle —— 鱿鱼先生 每日小怪
      </div>
      <div style={{ position:"relative", height:320, background:"#15240f", border:"1px solid #2a2520", borderRadius:10, overflow:"hidden", fontFamily:"monospace" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:64, background:"#3a5a22" }} />
        {STORES.map((s,i)=>{
          const pct = Math.round(s.sales/s.tgt*100);
          const size = 38 + Math.round(Math.min(18, (pct-90)*0.7));
          return (
            <div key={s.store} style={{ position:"absolute", left:16, top:20+i*56, display:"flex", alignItems:"center", gap:8 }}>
              <Marine color={s.col} size={size} />
              <div style={{ lineHeight:1.2 }}>
                <div style={{ fontSize:10, color:s.col, letterSpacing:1 }}>{s.store} {pct>=100?"★":""}</div>
                <div style={{ fontSize:9, color:"#8a8275" }}>力 {pct}%</div>
              </div>
            </div>
          );
        })}
        <div style={{ position:"absolute", right:24, top:92, textAlign:"center", width:150 }}>
          <div style={{ background:"#2a1010", border:"1px solid #8B2020", borderRadius:4, height:14, overflow:"hidden", position:"relative", marginBottom:8 }}>
            <div style={{ height:"100%", width:`${hp/dailyTgt*100}%`, background:"#cc3333", transition:"width 0.4s" }} />
            <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff" }}>HP {fmtRM(hp)}</span>
          </div>
          <img src="/logo.png" alt="鱿鱼怪" style={{ width:96, height:96, borderRadius:14, animation: shake?"msShake 0.25s":"none" }} />
          <div style={{ fontSize:9, color:"#c08080", letterSpacing:1, marginTop:4 }}>每日小怪 · 日均目标</div>
          {floats.map(f=>(
            <div key={f.id} style={{ position:"absolute", right:30, top:30, fontFamily:"monospace", fontWeight:"bold", fontSize:13, color:f.col, animation:"msFloat 1s ease-out forwards" }}>-{fmtRM(f.dmg)}</div>
          ))}
        </div>
        {result && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(10,18,6,0.82)" }}>
            {result.win ? (
              <>
                <div style={{ fontSize:30, color:"#ffd86b", letterSpacing:4 }}>VICTORY 通关!</div>
                <div style={{ fontSize:12, color:"#A8C5A0", marginTop:10 }}>五店日均合力打出 {fmtRM(result.total)}</div>
                <div style={{ fontSize:11, color:"#c8b898", marginTop:4 }}>超过日均目标 {fmtRM(result.total - dailyTgt)} · MVP：KOM 152%</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:22, color:"#cc3333" }}>小怪未打爆</div>
                <div style={{ fontSize:11, color:"#c8b898", marginTop:8 }}>还差 {fmtRM(result.left)}</div>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:12 }}>
        <button onClick={fight} style={{ flex:1, padding:11, background:"#C8A97E22", border:"1px solid #C8A97E", borderRadius:4, color:"#C8A97E", fontFamily:"monospace", fontSize:13, letterSpacing:3, cursor:"pointer", opacity:busy?0.5:1 }}>⚔ 开战 FIGHT</button>
        <button onClick={()=>{setHp(dailyTgt);setResult(null);}} style={{ padding:"11px 14px", background:"transparent", border:"1px solid #2a2520", borderRadius:4, color:"#6b5f52", fontFamily:"monospace", fontSize:12, cursor:"pointer" }}>重置</button>
      </div>
      <div style={{ fontSize:9, color:"#4a4038", fontFamily:"monospace", marginTop:10, lineHeight:1.6 }}>
        玩法：每家分店 = 一个 Q 版装甲战士,攻击力 = 当月达标程度,伤害 = 日均销售。打爆「每日小怪」即通关。<br/>
        接上每日 AutoCount 数据后,用真实当日销售来打,每天一只小怪、月底大 Boss。
      </div>
    </div>
  );
}
