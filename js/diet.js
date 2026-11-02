/* =========================================================================
   DIET LEDGER MODULE (饮食账本) - Integrated into 推拉机 track-TOR
   ========================================================================= */
function latestDietOpenSet(days){
  const ks = Object.keys(days||{}).sort();
  return new Set(ks.length ? [ks[ks.length-1]] : []);
}

/* used only until the user fills in their own profile or weight */
const AGE_DEFAULT = 30, W_DEFAULT = 65, ACT_FACTOR = 0.5, TEF = 0.09, TEF_DEFAULT = 1850;

function numVal(v){ return (v===null||v===undefined||v===""||isNaN(+v)) ? null : +v; }
function f1Dec(v){ return v===null ? "–" : (Math.round(v*10)/10).toFixed(1).replace("-","−"); }
function f0Dec(v){ return v===null ? "–" : String(Math.round(v)).replace("-","−"); }
function escHtml(s){ return String(s??"").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function dotDateStr(s){ return String(s||"").replace(/-/g,"."); }
function ymdAdd(s,n){ const [y,m,d]=s.split("-").map(Number); const t=new Date(y,m-1,d); t.setDate(t.getDate()+n); return t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate()); }

function dietTotals(day){
  const t = { p:0, f:0, c:0, kcal:0, veg:0 };
  for(const it of (day.items||[])){
    t.p += numVal(it.p)||0;
    t.f += numVal(it.f)||0;
    t.c += numVal(it.c)||0;
    t.kcal += numVal(it.kcal)||0;
    t.veg += numVal(it.veg)||0;
  }
  return t;
}

function intakeOf(date){
  const d = state.diet[date];
  if(!d) return null;
  if(numVal(d.intakeOverride) !== null) return numVal(d.intakeOverride);
  return d.items && d.items.length ? dietTotals(d).kcal : null;
}

function profile(){ return state.settings || {}; }
function ageAtDate(date){
  const b = profile().b;
  /* birth month only (YYYY-MM); older saves may carry a full date, whose day is ignored */
  if(!/^\d{4}-\d{2}/.test(b||"")) return AGE_DEFAULT;
  const [by,bm] = b.split("-").map(Number), [y,m] = date.split("-").map(Number);
  return y - by - (m<bm ? 1 : 0);
}

/* the day's own weight (manual beats COROS), else the average of the 7 days up to it,
   else the latest one before it, else the earliest one on record */
function weightAtDate(date){
  const m = state.metrics[date];
  if(m && (m.weight!=null || m.weightC!=null)) return numVal(m.weight!=null ? m.weight : m.weightC);
  const pts = wtMerged();
  const win = pts.filter(p=>p.date<=date && p.date>=ymdAdd(date,-6));
  if(win.length) return win.reduce((a,p)=>a+p.y, 0) / win.length;
  const before = pts.filter(p=>p.date<=date);
  if(before.length) return before[before.length-1].y;
  return pts.length ? pts[0].y : W_DEFAULT;
}
function activeOf(date){ const m = state.metrics[date]; return m ? numVal(m.active) : null; }

/* Mifflin-St Jeor: +5 for men, -161 for women, the midpoint when sex is not set */
function bmrOfDate(date){
  const p = profile(), h = p.h ? p.h : 170 /* = H_FALLBACK */, sx = p.sex==="m" ? 5 : p.sex==="f" ? -161 : -78;
  return 10 * weightAtDate(date) + 6.25 * h - 5 * ageAtDate(date) + sx;
}

function burnOfDate(date){
  const d = state.diet[date];
  if(d && numVal(d.expendOverride) !== null) return numVal(d.expendOverride);
  const act = activeOf(date);
  if(act === null) return null;
  const intake = intakeOf(date);
  return bmrOfDate(date) + act * ACT_FACTOR + TEF * (intake===null ? TEF_DEFAULT : intake);
}

function dietRangeDates(){
  const end = today(), out = [];
  for(let i=dietState.range-1; i>=0; i--) out.push(ymdAdd(end, -i));
  return out;
}

function dietGapOf(d){
  const a = intakeOf(d), b = burnOfDate(d);
  return (a!==null && b!==null) ? b - a : null;
}

function dietMovingSum(date, n){
  let s = 0, c = 0;
  for(let i=0; i<n; i++){
    const g = dietGapOf(ymdAdd(date, -i));
    if(g !== null){ s += g; c++; }
  }
  return c===n ? { s, c } : null;
}

function renderDietStats(){
  let sum = 0, n = 0;
  for(const d of dietRangeDates()){
    const a = intakeOf(d), b = burnOfDate(d);
    if(a!==null && b!==null){ sum += b - a; n++; }
  }
  const avg = document.getElementById("dAvg"), s = document.getElementById("dSum"), kg = document.getElementById("dKg");
  if(!avg || !s || !kg) return;
  if(!n){
    avg.textContent = s.textContent = kg.textContent = "–";
    avg.className = s.className = kg.className = "num";
    return;
  }
  const cls = sum >= 0 ? "num g" : "num r";
  avg.textContent = f0Dec(sum/n);
  s.textContent = f0Dec(sum);
  kg.textContent = (Math.round(sum/7700*100)/100).toFixed(2).replace("-","−");
  avg.className = s.className = kg.className = cls;
}

function renderDietChart(){
  renderDietGap();
  const dates = dietRangeDates();
  const W=340,H=190,L=34,R=16,TP=10,B=22;
  /* 只画有饮食记录的日子，没记账的日子不单独画消耗 */
  const pts = dates.map(d=>{ const a = intakeOf(d); return { d, a, b: a===null ? null : burnOfDate(d) }; });
  const vals = pts.flatMap(p=>[p.a, p.b]).filter(v=>v!==null);
  let lo=1200, hi=2600;
  if(vals.length){
    lo = Math.min(lo, Math.floor(Math.min(...vals)/200)*200);
    hi = Math.max(hi, Math.ceil(Math.max(...vals)/200)*200);
  }
  const step = (W-L-R) / Math.max(1, dates.length-1);
  const x = i => L + i*step, y = v => TP + (hi-v)/(hi-lo)*(H-TP-B);
  let g = "";
  for(let v=lo; v<=hi; v += (hi-lo>1600 ? 400 : 200)){
    g += `<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-4}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  }
  const lab = dates.length<=14 ? 2 : (dates.length<=30 ? 7 : 14);
  dates.forEach((d,i)=>{
    if((dates.length-1-i)%lab===0){
      g += `<text x="${x(i)}" y="${H-6}" text-anchor="middle">${+d.slice(5,7)}.${+d.slice(8)}</text>`;
    }
  });
  const bw = Math.max(2, Math.min(10, step*0.6));
  pts.forEach((p,i)=>{
    if(p.a!==null && p.b!==null){
      const top = Math.min(y(p.a), y(p.b)), h = Math.abs(y(p.a) - y(p.b));
      g += `<rect x="${x(i)-bw/2}" y="${top}" width="${bw}" height="${Math.max(1,h)}" rx="1.5" fill="${p.b>=p.a ? "var(--gain)" : "var(--loss)"}" fill-opacity=".35"/>`;
    }
  });
  const line = (key) => {
    let d="", pen=false;
    pts.forEach((p,i)=>{
      const v = p[key]; if(v===null){ pen=false; return; }
      d += (pen?"L":"M") + x(i).toFixed(1) + " " + y(v).toFixed(1);
      pen = true;
    });
    return d;
  };
  const dotsFor = (key, col) => pts.map((p,i)=>p[key]===null?"":`<circle cx="${x(i)}" cy="${y(p[key])}" r="${dates.length>30?1.8:2.6}" fill="${col}"/>`).join("");
  const bm = dates.map(bmrOfDate);
  g += `<path d="${bm.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join("")}" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 3" stroke-opacity=".8"/><text x="${W-R}" y="${y(bm[bm.length-1])-5}" text-anchor="end">BMR ${Math.round(bm[bm.length-1])}</text>`;
  g += `<path d="${line("b")}" fill="none" stroke="var(--burn)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;
  g += `<path d="${line("a")}" fill="none" stroke="var(--intake)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  g += dotsFor("b", "var(--burn)") + dotsFor("a", "var(--intake)");
  g += `<line id="dxh" x1="0" x2="0" y1="${TP}" y2="${H-B}" stroke="var(--ink)" stroke-opacity=".35" stroke-width="1" visibility="hidden"/>`;
  
  const box = document.getElementById("dietChart");
  if(!box) return;
  box.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${T("摄入与估算总消耗","Intake vs estimated total burn")}">${g}</svg>`;
  const svg = box.querySelector("svg"), tip = document.getElementById("dietTip"), xh = svg.querySelector("#dxh");
  const pick = e => {
    const r = svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) / r.width * W;
    const i = Math.max(0, Math.min(dates.length-1, Math.round((sx-L)/step)));
    const p = pts[i];
    xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("visibility", "visible");
    const gap = (p.a!==null && p.b!==null) ? p.b - p.a : null;
    tip.innerHTML = `${dotDateStr(p.d).slice(5)}　${T("摄入","In")} <b>${f0Dec(p.a)}</b>　${T("消耗","Burn")} <b>${f0Dec(p.b)}</b>　${T("基代","BMR")} <b>${f0Dec(bmrOfDate(p.d))}</b>` + (gap===null ? "" : `　${gap>=0 ? T("缺口","Deficit") : T("盈余","Surplus")} <b>${f0Dec(Math.abs(gap))}</b>`);
    tip.hidden = false;
    const bbox = box.getBoundingClientRect();
    const px = r.left - bbox.left + x(i)/W * r.width;
    tip.style.left = Math.max(8, Math.min(bbox.width - tip.offsetWidth - 8, px - tip.offsetWidth/2)) + "px";
  };
  svg.addEventListener("pointermove", pick);
  svg.addEventListener("pointerdown", pick);
  svg.addEventListener("pointerleave", ()=>{ tip.hidden=true; xh.setAttribute("visibility","hidden"); });
}

function renderDietGap(){
  const t = today();
  const gchips = document.getElementById("dietGchips");
  if(!gchips) return;
  gchips.innerHTML = [3,7,14,30].map(n=>{
    const m = dietMovingSum(t,n) || dietMovingSum(ymdAdd(t, -1), n);
    return `<button type="button" class="gchip" data-dw="${n}" aria-pressed="${n===dietState.gw}"><span>${T("近","Last")} ${n} ${T("天","d")}</span>${m ? `<b class="${m.s>=0 ? "g" : "r"}">${m.s>=0 ? "" : "−"}${Math.abs(Math.round(m.s))}</b>` : `<b>–</b>`}</button>`;
  }).join("");
  document.querySelectorAll("#dietGapBox .seg button").forEach(x=>x.setAttribute("aria-pressed", String(+x.dataset.dw===dietState.gw)));
  
  const dates = dietRangeDates(), N = dietState.gw;
  const W=340,H=170,L=40,R=16,TP=10,B=22;
  const pts = dates.map(d=>({ d, g:dietGapOf(d), m:dietMovingSum(d,N) }));
  const vals = pts.flatMap(p=>[p.g, p.m ? p.m.s : null]).filter(v=>v!==null);
  let lo = Math.min(-200, ...vals), hi = Math.max(200, ...vals);
  const span = hi - lo, stepV = span>3000 ? 1000 : (span>1200 ? 500 : (span>600 ? 200 : 100));
  lo = Math.floor(lo/stepV)*stepV; hi = Math.ceil(hi/stepV)*stepV;
  const step = (W-L-R) / Math.max(1, dates.length-1);
  const x = i => L + i*step, y = v => TP + (hi-v)/(hi-lo)*(H-TP-B);
  let g = "";
  for(let v=lo; v<=hi; v+=stepV){
    g += `<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="${v===0 ? 1.6 : 1}"${v===0 ? ' stroke-opacity="1"' : ''}/><text x="${L-4}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  }
  const lab = dates.length<=14 ? 2 : (dates.length<=30 ? 7 : 14);
  dates.forEach((d,i)=>{
    if((dates.length-1-i)%lab===0) g += `<text x="${x(i)}" y="${H-6}" text-anchor="middle">${+d.slice(5,7)}.${+d.slice(8)}</text>`;
  });
  const bw = Math.max(2, Math.min(10, step*0.6));
  pts.forEach((p,i)=>{
    if(p.g===null) return;
    const top = Math.min(y(0), y(p.g)), h = Math.abs(y(0) - y(p.g));
    g += `<rect x="${x(i)-bw/2}" y="${top}" width="${bw}" height="${Math.max(1,h)}" rx="1.5" fill="${p.g>=0 ? "var(--gain)" : "var(--loss)"}" fill-opacity=".35"/>`;
  });
  let d = "", pen = false;
  pts.forEach((p,i)=>{
    if(!p.m){ pen=false; return; }
    d += (pen?"L":"M") + x(i).toFixed(1) + " " + y(p.m.s).toFixed(1);
    pen = true;
  });
  g += `<path d="${d}" fill="none" stroke="var(--intake)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  g += pts.map((p,i)=>p.m ? `<circle cx="${x(i)}" cy="${y(p.m.s)}" r="${dates.length>30 ? 1.8 : 2.6}" fill="var(--intake)"/>` : "").join("");
  g += `<line id="dgxh" x1="0" x2="0" y1="${TP}" y2="${H-B}" stroke="var(--ink)" stroke-opacity=".35" stroke-width="1" visibility="hidden"/>`;
  
  const gbox = document.getElementById("dietGchart");
  if(!gbox) return;
  gbox.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${T("每日缺口与","Daily deficit & ")} ${N} ${T("天滚动累计","-day rolling total")}">${g}</svg>`;
  const svg = gbox.querySelector("svg"), tip = document.getElementById("dietGtip"), xh = svg.querySelector("#dgxh");
  const pick = e => {
    const r = svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) / r.width * W;
    const i = Math.max(0, Math.min(dates.length-1, Math.round((sx-L)/step)));
    const p = pts[i];
    xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("visibility", "visible");
    const gapTxt = v => (v>=0 ? T("缺口","Deficit")+" " : T("盈余","Surplus")+" ") + Math.abs(Math.round(v));
    tip.innerHTML = `${dotDateStr(p.d).slice(5)}　${T("当日","Today")} <b>${p.g===null ? "–" : gapTxt(p.g)}</b>　${T("近","Last")}${N}${T("天","d")} <b>${p.m ? gapTxt(p.m.s) : "–"}</b>${p.m ? `　${T("约","≈")} ${ (Math.abs(p.m.s)/7700).toFixed(2) }kg` : ""}`;
    tip.hidden = false;
    const bbox = gbox.getBoundingClientRect();
    const px = r.left - bbox.left + x(i)/W * r.width;
    tip.style.top = (r.top - bbox.top - 34) + "px";
    tip.style.left = Math.max(8, Math.min(bbox.width - tip.offsetWidth - 8, px - tip.offsetWidth/2)) + "px";
  };
  svg.addEventListener("pointermove", pick);
  svg.addEventListener("pointerdown", pick);
  svg.addEventListener("pointerleave", ()=>{ tip.hidden=true; xh.setAttribute("visibility","hidden"); });
}

function activeDietDayKeys(){
  const set = new Set([
    ...Object.keys(state.diet).filter(k=>{
      const d = state.diet[k];
      return d && ((d.items && d.items.length) || numVal(d.intakeOverride)!==null || numVal(d.expendOverride)!==null);
    })
  ]);
  return Array.from(set).sort().reverse();
}

function renderDietDays(){
  const box = document.getElementById("dietDays");
  if(!box) return;
  const keys = activeDietDayKeys();
  if(!keys.length){
    box.innerHTML = `<div class="empty">${T("还没有饮食记录。","No diet logs yet.")}<br>${T("点击上方「+ 记录热量 / 饮食」录入当天吃的内容。","Tap \"+ Log Food/Kcal\" above to log what you ate today.")}</div>`;
    return;
  }
    const allOpen = keys.every(k=>dietState.open.has(k));
  box.innerHTML = `<div class="dbar"><h2>${T("每日记录","Daily logs")}</h2><div class="dbar-actions"><button class="btn ghost" type="button" data-dallopen style="padding:4px 9px;font-size:12px">${allOpen ? T("全部收起","Collapse all") : T("全部展开","Expand all")}</button></div></div>` + keys.map(k=>{
    const d = state.diet[k] || { items:[] }, t = dietTotals(d), intake = intakeOf(k), b = burnOfDate(k);
    const gap = (b===null || intake===null) ? null : b - intake;
    const rows = (d.items||[]).map(it=>`<tr><td class="f">${escHtml(it.name)}</td><td>${f1Dec(numVal(it.p))}</td><td>${f1Dec(numVal(it.f))}</td><td>${f1Dec(numVal(it.c))}</td><td>${f0Dec(numVal(it.kcal))}</td><td>${numVal(it.veg) ? f0Dec(numVal(it.veg)) : "–"}</td></tr>`).join("");
    const cAct = activeOf(k);
    const wKg = weightAtDate(k);
    const metaTags = [];
    if(cAct!==null) metaTags.push(`${T("手表活动","Watch activity")} ${f0Dec(cAct)} kcal`);
    if(numVal(d.expendOverride)!==null) metaTags.push(`${T("手动总消耗","Manual total burn")} ${f0Dec(d.expendOverride)} kcal`);
    if(wKg!==null) metaTags.push(`${T("体重","Weight")} ${f1Dec(wKg)} kg`);
    const metaLine = metaTags.length ? `<p class="note"${dietState.open.has(k)?"":" hidden"} style="padding-top:6px;padding-bottom:${d.note?2:10}px">${metaTags.join(" · ")}</p>` : "";
    return `<article class="diet-day">
      <div class="dhead"><h3><button class="dtoggle" type="button" data-dtoggle="${k}" aria-expanded="${dietState.open.has(k)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${dotDateStr(k)}</button>${d.src==="feed" ? `<span class="dfeed" title="${T("来自饮食账本","From the diet ledger")}">☁</span>` : ""}</h3>
        <div class="pills"><span class="pill">${T("摄入","In")} <b>${f0Dec(intake)}</b></span><span class="pill">${T("消耗","Burn")} <b>${f0Dec(b)}</b></span>${gap===null ? "" : `<span class="pill ${gap>=0 ? "g" : "r"}">${gap>=0 ? T("缺口","Deficit") : T("盈余","Surplus")} <b>${f0Dec(Math.abs(gap))}</b></span>`}
        <button class="chedit" type="button" data-dedit="${k}" aria-label="${T("编辑","Edit")}" title="${T("编辑","Edit")}">${PENCIL_ICON}</button></div></div>
      <div class="tbl"${dietState.open.has(k) ? "" : " hidden"}><table><thead><tr><th>${T("食物","Food")}</th><th>${T("蛋白质","Protein")}<small>g</small></th><th>${T("脂肪","Fat")}<small>g</small></th><th>${T("碳水","Carbs")}<small>g</small></th><th>${T("热量","kcal")}<small>kcal</small></th><th>${T("蔬菜","Veg")}<small>g</small></th></tr></thead>
      <tbody>${rows}<tr class="tot"><td class="f"><b>${T("合计","Total")}</b></td><td>${f1Dec(t.p)}</td><td>${f1Dec(t.f)}</td><td>${f1Dec(t.c)}</td><td>${f0Dec(intake)}</td><td>${t.veg ? f0Dec(t.veg) : "–"}</td></tr></tbody></table></div>
      ${metaLine}
      ${d.note ? `<p class="note"${dietState.open.has(k) ? "" : " hidden"}>${escHtml(d.note)}</p>` : ""}
    </article>`;
  }).join("");
}

function renderDietAll(){
  renderDietStats();
  renderDietChart();
  renderDietDays();
}

/* the newest logged day starts expanded; then fetch the online ledger, if one is set */
function initDiet(){
  dietState.open = latestDietOpenSet(state.diet);
  renderDietAll();
  paintFeedBtn();
  pullDietFeed(true);
}

/* ---------- online diet ledger ----------
   A diet.json in the "tracktor-diet" format (see the diet-ledger repo) hosted anywhere that allows
   cross-site reads, e.g. GitHub Pages. Its days replace the local copy, except days saved in the app (own). */
const FEED_LAST_K = LS + "-dietfeed-last";
function feedJsonUrl(u){
  u = String(u||"").trim(); if(!u) return "";
  if(!/^https?:\/\//i.test(u)) u = "https://" + u;
  return /\.json(\?|$)/i.test(u) ? u : u.replace(/\/?$/, "/") + "diet.json";
}
function paintFeedBtn(){ const b = document.getElementById("dietFeedBtn"); if(b) b.classList.toggle("on", !!state.settings.dietFeed); }
function mergeDietFeed(j){
  if(!j || j.format!=="tracktor-diet" || !j.days || typeof j.days!=="object") throw new Error("format");
  let added = 0, kept = 0;
  const num = v => { const n = +v; return isFinite(n) ? n : 0; };
  for(const [date, day] of Object.entries(j.days)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !day || !Array.isArray(day.items)) continue;
    const local = state.diet[date];
    if(local && local.own){ kept++; continue; }
    const doc = { items: day.items.map(i=>({ name: String(i.name||""), p: num(i.p), f: num(i.f), c: num(i.c), veg: num(i.veg), kcal: num(i.kcal) })), src: "feed" };
    if(day.note) doc.note = String(day.note);
    if(local && numVal(local.expendOverride) !== null) doc.expendOverride = local.expendOverride;
    state.diet[date] = doc; added++;
  }
  return { added, kept };
}
async function pullDietFeed(quiet){
  const url = feedJsonUrl(state.settings.dietFeed);
  if(!url) return null;
  try{
    const r = await fetch(url, { cache: "no-store" });
    if(!r.ok) throw new Error("HTTP " + r.status);
    const res = mergeDietFeed(await r.json());
    lsSave(); dietState.open = latestDietOpenSet(state.diet); renderDietAll(); renderAll();
    const d = new Date();
    try{ localStorage.setItem(FEED_LAST_K, today() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + " · " + res.added); }catch(e){}
    if(!quiet) toast(T("已读取 " + res.added + " 天饮食" + (res.kept ? "，" + res.kept + " 天保留你在推拉机里改的" : ""), "Loaded " + res.added + " days" + (res.kept ? ", kept " + res.kept + " days you edited here" : "")));
    return res;
  }catch(e){
    if(!quiet) toast(T("读取饮食账本失败：", "Couldn't read the diet ledger: ") + (e.message==="format" ? T("不是饮食账本格式", "not a diet ledger file") : (e.message || e)));
    return null;
  }
}
function openDietFeedSheet(){
  const m = document.createElement("div");
  m.className = "mask";
  let last = ""; try{ last = localStorage.getItem(FEED_LAST_K) || ""; }catch(e){}
  m.innerHTML = `<div class="sheet" role="dialog" aria-label="${T("饮食账本","Diet ledger")}" style="max-width:480px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <b style="font-size:16px">☁ ${T("饮食账本","Diet ledger")}</b>
      <button type="button" data-close class="iconbtn" aria-label="${T("关闭","Close")}">${CLOSE_ICON}</button>
    </div>
    <div style="display:grid;gap:10px">
      <p class="sub" style="margin:0">${T("填你的饮食账本网址，打开推拉机时自动读取每日饮食。在推拉机里改过的那天不会被覆盖。","Enter your diet ledger link. track-TOR reads your daily food from it each time it opens. Days you edited here are kept.")}</p>
      <div class="field"><label for="dfUrl">${T("网址","Link")}</label><input id="dfUrl" type="url" inputmode="url" placeholder="https://…github.io/diet-ledger/" value="${escHtml(state.settings.dietFeed||"")}"></div>
      ${last ? `<p class="note" style="margin:0">${T("上次读取：","Last read: ")}${escHtml(last.split(" · ")[0])} · ${escHtml(last.split(" · ")[1]||"0")} ${T("天","days")}</p>` : ""}
    </div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn" id="dfGo" style="background:var(--burn);color:#fff">${T("保存并读取","Save & load")}</button></div>
  </div>`;
  document.body.appendChild(m);
  const close = ()=>m.remove();
  m.querySelector("[data-close]").addEventListener("click", close);
  m.addEventListener("click", e=>{ if(e.target===m) close(); });
  m.querySelector("#dfGo").addEventListener("click", async ()=>{
    const v = m.querySelector("#dfUrl").value.trim();
    state.settings.dietFeed = v || null; lsSave(); paintFeedBtn();
    close();
    if(v) await pullDietFeed(false); else toast(T("已关闭饮食账本","Diet ledger turned off"));
  });
}
document.getElementById("dietFeedBtn").addEventListener("click", openDietFeedSheet);


const CALC_WARN_DIFF = 100;
function openDietEntryModal(initDate){
  const m = document.createElement("div");
  m.className = "mask";

  const TOTAL_NAME = () => T("当日合计（手动录入）","Daily total (manual)");
  const emptyTotal = () => ({ kcal:"", p:"", f:"", c:"", veg:"" });
  let curDate = initDate || today();
  let moreOpen = false;
  let mode, total, formState;

  function getDayState(dt){
    const d = state.diet[dt] || { items:[] };
    const mt = state.metrics[dt] || {};
    return {
      items: JSON.parse(JSON.stringify(d.items && d.items.length ? d.items : [])),
      note: d.note || "",
      expendOverride: numVal(d.expendOverride),
      active: numVal(mt.active),
      kg: numVal(mt.weight)          /* only a manual weight; a COROS one shows as the placeholder */
    };
  }

  function dayTotal(items){
    if(!items.length) return emptyTotal();
    const t = dietTotals({ items });
    const show = v => v ? +v.toFixed(1) : "";
    return { kcal: t.kcal ? Math.round(t.kcal) : "", p: show(t.p), f: show(t.f), c: show(t.c), veg: show(t.veg) };
  }

  /* a day logged item by item opens on its details; everything else opens on the five totals */
  function loadDay(dt){
    formState = getDayState(dt);
    total = dayTotal(formState.items);
    const one = formState.items.length === 1 && String(formState.items[0].name||"").includes("当日合计");
    mode = (formState.items.length && !one) ? "items" : "total";
  }
  loadDay(curDate);

  function burnPreviewHtml(){
    const bmr = Math.round(bmrOfDate(curDate));
    const intake = mode === "total" ? numVal(total.kcal) : dietTotals({ items: formState.items }).kcal;
    const estBurn = formState.expendOverride !== null
      ? Math.round(formState.expendOverride)
      : (formState.active !== null ? Math.round(bmr + formState.active*ACT_FACTOR + TEF*(intake || TEF_DEFAULT)) : null);
    return `${T("基代","BMR")} <b>${bmr}</b> kcal · ${T("预计总消耗","Est. total burn")}：<b>${estBurn!==null ? estBurn+" kcal" : T("待输入活动消耗或总消耗","enter activity or total burn")}</b>`;
  }

  function renderModal(){
    const t = dietTotals({ items: formState.items });
    const hasDay = !!state.diet[curDate];
    const numInp = (id, label, val, step) => `<label class="flabel">${label}<input type="number" inputmode="decimal" step="${step}" id="${id}" value="${val??""}"></label>`;

    m.innerHTML = `<div class="sheet" role="dialog" aria-label="${T("记录饮食","Log food")}">
      <h3>
        <span>${T("记录饮食","Log food")}</span>
        <button class="iconbtn" type="button" data-close aria-label="${T("关闭","Close")}" title="${T("关闭","Close")}">${CLOSE_ICON}</button>
      </h3>
      <div class="form-body">
        <label class="flabel">${T("日期","Date")}
          <input type="date" id="fdDate" value="${curDate}">
        </label>

        <div class="mode-tabs" role="tablist">
          <button type="button" class="${mode==="total" ? "active" : ""}" data-fmode="total">${T("总热量","Total")}</button>
          <button type="button" class="${mode==="items" ? "active" : ""}" data-fmode="items">📋 ${T("当日明细","Day details")}</button>
        </div>

        ${mode==="total" ? `
          <div class="burn-box">
            <div class="kcal-row">
              ${numInp("tdKcal", T("总热量 kcal","Total kcal"), total.kcal, 1)}
              <button class="calc-btn" type="button" id="tdCalc" aria-label="${T("按蛋白、脂肪、碳水估算总热量","Estimate calories from protein, fat and carbs")}" title="${T("按蛋白、脂肪、碳水估算总热量","Estimate calories from protein, fat and carbs")}"${macroKcal(total)===null ? " disabled" : ""}>${CALC_ICON}</button>
            </div>
            <p class="calc-msg" id="tdCalcMsg" aria-live="polite" hidden></p>
            <div class="total-grid">
              ${numInp("tdP", T("蛋白 g","Protein g"), total.p, 0.1)}
              ${numInp("tdF", T("脂肪 g","Fat g"), total.f, 0.1)}
              ${numInp("tdC", T("碳水 g","Carbs g"), total.c, 0.1)}
              ${numInp("tdVeg", T("蔬菜 g","Veg g"), total.veg, 1)}
            </div>
          </div>
        ` : `
          <div class="burn-box">
            <h4>
              <span>${T("合计","Total")} <b class="num">${f0Dec(t.kcal)}</b> kcal</span>
              <button class="btn ghost" type="button" id="daddItemRowBtn" style="padding:3px 8px;font-size:12px">+ ${T("加一行","Add row")}</button>
            </h4>
            <div class="item-list" id="ditemListBox">
              ${(formState.items.length ? formState.items : [{name:"",kcal:"",p:"",f:"",c:"",veg:""}]).map((it,idx)=>`
                <div class="item-row" data-idx="${idx}">
                  <div class="iname-wrap">
                    <input class="iname" type="text" placeholder="${T("食物","Food")}" aria-label="${T("食物","Food")}" value="${escHtml(it.name||"")}" data-f="name">
                    <button type="button" class="del-btn" data-ddel="${idx}" aria-label="${T("删除这一行","Delete row")}" title="${T("删除这一行","Delete row")}">✕</button>
                  </div>
                  ${[["kcal",T("热量","kcal"),1],["p",T("蛋白","Prot."),0.1],["f",T("脂肪","Fat"),0.1],["c",T("碳水","Carbs"),0.1],["veg",T("蔬菜","Veg"),1]].map(([k,lab,st])=>`<label class="ifield">${lab}<input type="number" inputmode="decimal" step="${st}" value="${it[k]??""}" data-f="${k}"></label>`).join("")}
                </div>
              `).join("")}
            </div>
          </div>
        `}

        <details class="fd-more" id="fdMore"${moreOpen ? " open" : ""}>
          <summary>${T("体重、消耗和备注（选填）","Weight, burn and note (optional)")}</summary>
          <div class="fgrid">
            <label class="flabel">${T("当日体重 kg","Weight kg")}
              <input type="number" inputmode="decimal" step="0.1" id="fdWeight" placeholder="${T("默认","Default")} ${weightAtDate(curDate).toFixed(1)}" value="${formState.kg!==null ? formState.kg : ""}">
            </label>
            <label class="flabel">${T("手表活动消耗 kcal","Watch active kcal")}
              <input type="number" inputmode="decimal" step="1" id="fdActive" value="${formState.active!==null ? formState.active : ""}">
            </label>
            <label class="flabel" style="grid-column:1 / -1">${T("或直接填当日总消耗 kcal","Or enter total burn kcal")}
              <input type="number" inputmode="decimal" step="1" id="fdExpendOverride" placeholder="${T("留空自动计算","Blank = auto")}" value="${formState.expendOverride!==null ? formState.expendOverride : ""}">
            </label>
          </div>
          <div class="burn-preview" id="dburnPreview" style="margin-bottom:8px">${burnPreviewHtml()}</div>
          <label class="flabel">${T("备注","Note")}
            <input type="text" id="fdNote" placeholder="${T("例如：推拉训练 1.5 小时","e.g. push/pull session 1.5 h")}" value="${escHtml(formState.note)}">
          </label>
        </details>
      </div>
      <div class="row" style="justify-content:space-between">
        ${hasDay ? `<button class="btn ghost" type="button" id="ddelDayBtn" style="color:var(--push);border-color:var(--push);padding:8px 12px">${T("删除当日","Delete day")}</button>` : "<span></span>"}
        <button class="btn recsave" type="button" data-dsave aria-label="${T("保存并关闭","Save and close")}" title="${T("保存并关闭","Save and close")}">${SAVE_ICON}</button>
      </div>
    </div>`;

    bindModalEvents();
  }

  /* 热量留空时按 4/9/4 由营养素算 */
  function normalizeItem(raw){
    const p = numVal(raw.p)||0, f = numVal(raw.f)||0, c = numVal(raw.c)||0, veg = numVal(raw.veg)||0;
    let kcal = numVal(raw.kcal);
    if(kcal === null && (p || f || c)) kcal = Math.round(p*4 + f*9 + c*4);
    const name = String(raw.name||"").trim();
    if(!name && kcal === null && !veg) return null;
    return { name: name || (kcal!==null ? TOTAL_NAME() : T("未命名食物","Unnamed food")), p, f, c, kcal: kcal||0, veg };
  }

  function syncFormFromDOM(){
    const wEl = m.querySelector("#fdWeight");
    if(wEl) formState.kg = numVal(wEl.value);
    const actEl = m.querySelector("#fdActive");
    if(actEl) formState.active = numVal(actEl.value);
    const expEl = m.querySelector("#fdExpendOverride");
    if(expEl) formState.expendOverride = numVal(expEl.value);
    const noteEl = m.querySelector("#fdNote");
    if(noteEl) formState.note = noteEl.value.trim();
    const moreEl = m.querySelector("#fdMore");
    if(moreEl) moreOpen = moreEl.open;

    if(mode === "total"){
      const val = id => m.querySelector(id)?.value ?? "";
      total = { kcal:val("#tdKcal"), p:val("#tdP"), f:val("#tdF"), c:val("#tdC"), veg:val("#tdVeg") };
    } else {
      const field = (r,k) => r.querySelector(`[data-f="${k}"]`)?.value ?? "";
      formState.items = Array.from(m.querySelectorAll(".item-row")).map(r=>normalizeItem({
        name:field(r,"name"), kcal:field(r,"kcal"), p:field(r,"p"), f:field(r,"f"), c:field(r,"c"), veg:field(r,"veg")
      })).filter(Boolean);
    }
  }

  function commitDay(){
    if(formState.items.length || formState.expendOverride !== null || formState.note){
      const dayDoc = { items: formState.items };
      if(formState.note) dayDoc.note = formState.note;
      if(formState.expendOverride !== null) dayDoc.expendOverride = formState.expendOverride;
      dayDoc.own = 1;                    /* saved in the app: the online ledger no longer overwrites this day */
      state.diet[curDate] = dayDoc;
      dietState.open.add(curDate);
    } else {
      delete state.diet[curDate];
    }
    if(formState.active !== null || formState.kg !== null) saveMetric(curDate, { active: formState.active, weight: formState.kg });
    lsSave();
    renderDietAll();
    renderAll();
  }

  /* 蛋白、脂肪、碳水都填了才有估算值，按 4/9/4 算；0 也算填了 */
  function macroKcal(v){
    const p = numVal(v.p), f = numVal(v.f), c = numVal(v.c);
    return (p === null || f === null || c === null) ? null : Math.round(p*4 + f*9 + c*4);
  }

  function sameTotal(a,b){ return ["kcal","p","f","c","veg"].every(k=>(numVal(a[k])||0)===(numVal(b[k])||0)); }

  /* 总热量视图写回当天：没改就保留原有明细，改了才换成一条合计。返回 false 表示需要留在面板里 */
  function applyTotal(){
    const saved = dayTotal(formState.items);
    if(sameTotal(total, saved)) return true;
    if(numVal(total.kcal) === null){
      toast(T("先填总热量","Enter total calories first"));
      m.querySelector("#tdKcal").focus();
      return false;
    }
    if(formState.items.length > 1 && !confirm(T("保存后会用这个总数替换当天的 "+formState.items.length+" 项明细，继续吗？","Saving replaces this day's "+formState.items.length+" items with this total. Continue?"))) return false;
    formState.items = [{ name: TOTAL_NAME(), kcal: numVal(total.kcal), p: numVal(total.p)||0, f: numVal(total.f)||0, c: numVal(total.c)||0, veg: numVal(total.veg)||0 }];
    return true;
  }

  function bindModalEvents(){
    m.querySelector("[data-close]").addEventListener("click", ()=>m.remove());
    m.querySelector("#fdDate").addEventListener("change", e=>{
      syncFormFromDOM();
      curDate = e.target.value || today();
      loadDay(curDate);
      renderModal();
    });
    m.querySelectorAll("[data-fmode]").forEach(b=>{
      b.addEventListener("click", ()=>{
        syncFormFromDOM();
        if(mode === "total" && b.dataset.fmode === "items" && !applyTotal()) return;
        if(mode === "items" && b.dataset.fmode === "total") total = dayTotal(formState.items);
        mode = b.dataset.fmode;
        renderModal();
      });
    });
    const calcBtn = m.querySelector("#tdCalc");
    if(calcBtn){
      const calcMsg = m.querySelector("#tdCalcMsg");
      m.querySelectorAll("#tdKcal,#tdP,#tdF,#tdC").forEach(inp=>{
        inp.addEventListener("input", ()=>{
          syncFormFromDOM();
          calcBtn.disabled = macroKcal(total) === null;
          calcMsg.hidden = true;
        });
      });
      /* 总热量留空才填入估算值；已有数字不覆盖，只显示差额（已填 − 估算） */
      calcBtn.addEventListener("click", ()=>{
        syncFormFromDOM();
        const est = macroKcal(total), entered = numVal(total.kcal);
        if(entered === null){
          m.querySelector("#tdKcal").value = est;
          syncFormFromDOM();
          m.querySelector("#dburnPreview").innerHTML = burnPreviewHtml();
          return;
        }
        const diff = Math.round(entered - est);
        const signed = diff > 0 ? "+" + diff : String(diff);
        const big = Math.abs(diff) > CALC_WARN_DIFF;
        calcMsg.textContent = T("估算 "+est+"，差额 "+signed, "Estimate "+est+", difference "+signed)
          + (big ? T("，请检查有无酒精/酱料等卡路里估算", ". Check for calories from alcohol, sauces, etc.") : "");
        calcMsg.classList.toggle("warn", big);
        calcMsg.hidden = false;
      });
    }
    const addRowBtn = m.querySelector("#daddItemRowBtn");
    if(addRowBtn){
      addRowBtn.addEventListener("click", ()=>{
        syncFormFromDOM();
        formState.items.push({ name:"", kcal:"", p:"", f:"", c:"", veg:"" });
        renderModal();
      });
    }
    m.querySelectorAll("[data-ddel]").forEach(b=>{
      b.addEventListener("click", ()=>{
        syncFormFromDOM();
        formState.items.splice(+b.dataset.ddel, 1);
        renderModal();
      });
    });
    m.querySelectorAll("#fdWeight,#fdActive,#fdExpendOverride").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        syncFormFromDOM();
        m.querySelector("#dburnPreview").innerHTML = burnPreviewHtml();
      });
    });
    const delBtn = m.querySelector("#ddelDayBtn");
    if(delBtn){
      delBtn.addEventListener("click", ()=>{
        if(!confirm(T("删除 "+curDate+" 的全部饮食记录？","Delete all food logs for "+curDate+"?"))) return;
        delete state.diet[curDate];
        lsSave();
        renderDietAll();
        m.remove();
      });
    }
    m.querySelector("[data-dsave]").addEventListener("click", ()=>{
      syncFormFromDOM();
      if(mode === "total" && !applyTotal()) return;
      commitDay();
      toast(T("饮食记录已保存","Diet log saved"));
      m.remove();
    });
  }

  document.body.appendChild(m);
  renderModal();
}


function parseMcpResponseText(ct, raw){
  if(!raw || !raw.trim()) return {};
  if(ct && ct.toLowerCase().includes("text/event-stream")){
    const payloads = [];
    let cur = [];
    for(const line of raw.split(/\r?\n/)){
      if(!line.trim()){
        if(cur.length){ payloads.push(cur.join("\n")); cur = []; }
        continue;
      }
      if(line.startsWith("data:")) cur.push(line.slice(5).trimStart());
    }
    if(cur.length) payloads.push(cur.join("\n"));
    return payloads.length ? JSON.parse(payloads[payloads.length - 1]) : {};
  }
  return JSON.parse(raw);
}

/* 用 refresh_token 换新令牌。失败时保留现有令牌，下次再试 */
async function refreshCorosToken(tk){
  if(!tk || !tk.refresh_token) return false;
  try{
    const issuer = (tk.issuer || "https://mcpus.coros.com").replace(/\/+$/, "");
    const r = await fetch(issuer + "/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", client_id: tk.client_id || "", refresh_token: tk.refresh_token }).toString()
    });
    if(!r.ok) return false;
    const j = await r.json();
    if(!j.access_token) return false;
    tk.access_token = j.access_token;
    if(j.refresh_token) tk.refresh_token = j.refresh_token;
    if(j.expires_in) tk.expires_at_epoch = Math.floor(Date.now()/1000) + Number(j.expires_in);
    localStorage.setItem("tracktor-coros-token", JSON.stringify(tk));
    return true;
  }catch(e){ return false; }
}

async function callCorosDirectBrowser(toolName, args){
  let tk = null;
  try{ tk = JSON.parse(localStorage.getItem("tracktor-coros-token") || "null"); }catch(e){}
  if(!tk || !tk.access_token){
    const err = new Error("needs_reauth"); err.code = "needs_reauth"; throw err;
  }
  const issuer = (tk.issuer || "https://mcpus.coros.com").replace(/\/+$/, "");
  if(tk.expires_at_epoch && Date.now()/1000 >= tk.expires_at_epoch - 60) await refreshCorosToken(tk);
  const send = async () => {
    const headers = {
      "Authorization": (tk.token_type || "Bearer") + " " + tk.access_token,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    };
    await fetch(issuer + "/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "COROS MCP Gateway CLI", version: "1.0.0" } }
      })
    });
    return fetch(issuer + "/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: toolName, arguments: args || {} }
      })
    });
  };
  let callResp = await send();
  /* 令牌被拒就先自动续期再试一次，续期也失败才需要用户重新授权 */
  if(callResp.status === 401 && await refreshCorosToken(tk)) callResp = await send();
  const raw = await callResp.text();
  if(callResp.status === 401){
    const err = new Error("needs_reauth"); err.code = "needs_reauth"; throw err;
  }
  const rpc = parseMcpResponseText(callResp.headers.get("content-type") || "", raw);
  if(!callResp.ok || rpc.error || !rpc.result){
    const err = new Error((rpc.error && rpc.error.message) || "mcp call failed");
    err.code = "mcp_error";
    throw err;
  }
  return rpc.result;
}

function parseDailyHealthText(text){
  const out = {};
  const re = /---\s*(\d{4})(\d{2})(\d{2})\s*---([\s\S]*?)(?=---\s*\d{8}\s*---|$)/g;
  let m;
  while((m = re.exec(text))){
    const body = m[4];
    const cal = body.match(/Calories:\s*([\d,]+)\s*kcal/i);
    const st = body.match(/Steps:\s*([\d,]+)/i);
    if(cal){
      out[`${m[1]}-${m[2]}-${m[3]}`] = {
        active: +cal[1].replace(/,/g,""),
        steps: st ? +st[1].replace(/,/g,"") : null
      };
    }
  }
  return out;
}

document.addEventListener("click", e=>{
  const b = e.target.closest("[data-dr]");
  if(b){
    dietState.range = +b.dataset.dr;
    document.querySelectorAll("[data-dr]").forEach(x=>x.setAttribute("aria-pressed", String(x===b)));
    renderDietStats();
    renderDietChart();
    return;
  }
  const gwB = e.target.closest("[data-dw]");
  if(gwB){
    dietState.gw = +gwB.dataset.dw;
    renderDietGap();
    return;
  }
  const tog = e.target.closest("[data-dtoggle]");
  if(tog){
    const k = tog.dataset.dtoggle;
    if(dietState.open.has(k)) dietState.open.delete(k); else dietState.open.add(k);
    renderDietDays();
    return;
  }
  if(e.target.closest("[data-dallopen]")){
    const keys = activeDietDayKeys();
    const allOpen = keys.every(k=>dietState.open.has(k));
    dietState.open = allOpen ? new Set() : new Set(keys);
    renderDietDays();
    return;
  }
  const ed = e.target.closest("[data-dedit]");
  if(ed){ openDietEntryModal(ed.dataset.dedit); return; }
});

const addEntryBtn = document.getElementById("addDietEntryBtn");
if(addEntryBtn) addEntryBtn.addEventListener("click", ()=>openDietEntryModal());
