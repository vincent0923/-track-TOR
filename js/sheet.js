/* ---------- diet data source: an online table ----------
   The user pastes the table's ordinary share link (shared so anyone with the link can view).
   Columns date,item,p,f,c,veg,kcal, one food per row. Pulled only when the user taps Pull.
   Days found in the sheet replace the local diet for those dates; other dates, and every
   non-diet record (weight, waist, heart rate, training), are left alone. */
const SHEET_URL_K = "dietSheetUrl", SHEET_STATUS_K = LS + "-sheet-status";
const SHEET_COLS = ["date","item","p","f","c","veg","kcal"];
const PROMPT_VER_K = LS + "-prompt-ver";

/* RFC 4180: quoted fields may hold the delimiter, line breaks and doubled quotes ("").
   The delimiter is guessed from the first line: comma, tab or semicolon. */
function parseCsv(text){
  const rows = []; let row = [], field = "", q = false, i = 0;
  text = String(text).replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/, 1)[0];
  const D = first.includes("\t") ? "\t" : (first.split(";").length > first.split(",").length ? ";" : ",");
  while(i < text.length){
    const ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ field += '"'; i += 2; continue; } q = false; i++; continue; }
      field += ch; i++; continue;
    }
    if(ch === '"' && field === ""){ q = true; i++; continue; }
    if(ch === D){ row.push(field); field = ""; i++; continue; }
    if(ch === "\r" || ch === "\n"){
      row.push(field); rows.push(row); row = []; field = "";
      i += (ch === "\r" && text[i+1] === "\n") ? 2 : 1; continue;
    }
    field += ch; i++;
  }
  if(field !== "" || row.length){ row.push(field); rows.push(row); }
  return rows;
}

/* Sheets may turn a typed date into its own display format, so accept the common ones */
function sheetDate(s){
  s = String(s||"").trim(); let m;
  if((m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s))) return m[1]+"-"+pad(+m[2])+"-"+pad(+m[3]);
  if((m = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(s))){         /* D/M/YYYY, or M/D/YYYY when the 2nd part can't be a month */
    const a = +m[1], b = +m[2], [d, mo] = b > 12 ? [b, a] : [a, b];
    return m[3]+"-"+pad(mo)+"-"+pad(d);
  }
  return null;
}
function sheetNum(s){
  s = String(s||"").trim();
  if(/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");   /* 1,234 → 1234 */
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}

/* rows → { days: {date: [items]}, rows: n }; columns found by header name when there is one */
function sheetDays(rows){
  let idx = {date:0,item:1,p:2,f:3,c:4,veg:5,kcal:6}, start = 0;
  const head = (rows[0]||[]).map(x=>String(x).trim().toLowerCase());
  if(head.includes("date")){ idx = {}; SHEET_COLS.forEach(k=>{ idx[k] = head.indexOf(k); }); start = 1; }
  const days = {}; let n = 0;
  for(let r = start; r < rows.length; r++){
    const row = rows[r], get = k => idx[k] >= 0 ? row[idx[k]] : "";
    if(!String(get("date")||"").trim()) continue;
    const date = sheetDate(get("date"));
    if(!date) continue;
    (days[date] = days[date] || []).push({ name: String(get("item")||"").trim(), p: sheetNum(get("p")), f: sheetNum(get("f")), c: sheetNum(get("c")), veg: sheetNum(get("veg")), kcal: sheetNum(get("kcal")) });
    n++;
  }
  return { days, rows: n };
}

/* replace only the food of the pulled dates; a manual burn override on that day stays */
function applySheetDays(days){
  for(const [date, items] of Object.entries(days)){
    const local = state.diet[date] || {};
    const doc = { items, src: "sheet" };
    if(local.note) doc.note = local.note;
    if(numVal(local.expendOverride) !== null) doc.expendOverride = local.expendOverride;
    state.diet[date] = doc;
  }
}

/* ---------- reading any table, wherever it is hosted ----------
   The app doesn't care whose cloud the table lives in. It tries the link as given, plus the data
   exports that common services offer for the same table, and takes the first reply in which it
   finds the header date,item,p,f,c,veg,kcal followed by rows: delimited text, an HTML table,
   JSON, JSONP, or compressed blobs inside JSON. */
function sheetCandidates(u){
  const out = [];
  let m;
  if((m = /docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/i.exec(u)) && m[1] !== "e"){
    const g = /[#&?]gid=(\d+)/.exec(u);
    out.push({ how:"gviz", url:"https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv&headers=1" + (g ? "&gid=" + g[1] : "") });
  }
  if((m = /docs\.qq\.com\/sheet\/([A-Za-z0-9_-]+)/i.exec(u))){
    const tab = /[?&]tab=([A-Za-z0-9_-]+)/.exec(u);
    const base = "https://docs.qq.com/dop-api/opendoc?id=" + m[1] + "&outformat=1&normal=1&startrow=0&endrow=3000&wb=1&nowb=0" + (tab ? "&tab=" + tab[1] : "");
    out.push({ how:"opendoc", url: base });
    out.push({ how:"opendoc-jsonp", url: base, jsonp: true });
  }
  out.push({ how:"direct", url: u });
  return out;
}
const HEAD = ["date","item","p","f","c","veg","kcal"];
/* a flat list of cell texts → rows, starting after the header sequence */
function tokensToRows(tokens){
  const t = tokens.map(x=>String(x).trim());
  for(let k = 0; k + 7 <= t.length; k++){
    if(t[k].toLowerCase() !== "date") continue;
    if(!HEAD.every((h,i)=>t[k+i].toLowerCase() === h)) continue;
    const rows = [HEAD.slice()];
    for(let r = k + 7; r + 7 <= t.length; r += 7){
      if(!sheetDate(t[r])) break;
      rows.push(t.slice(r, r + 7));
    }
    if(rows.length > 1) return rows;
  }
  return null;
}
function jsonStrings(v, out){
  if(v == null) return out;
  if(typeof v === "string" || typeof v === "number") out.push(String(v));
  else if(Array.isArray(v)) v.forEach(x=>jsonStrings(x, out));
  else if(typeof v === "object") Object.values(v).forEach(x=>jsonStrings(x, out));
  return out;
}
/* arrays of rows ([["date",...],[...]]) or arrays of objects ({date, item, ...}) anywhere in the JSON */
function jsonTable(v){
  if(Array.isArray(v)){
    if(v.length && Array.isArray(v[0]) && v[0].length >= 7 && HEAD.every((h,i)=>String(v[0][i]).trim().toLowerCase() === h)) return v.map(r=>r.map(x=>x==null?"":String(x)));
    if(v.length && v[0] && typeof v[0] === "object" && !Array.isArray(v[0]) && "date" in v[0] && "kcal" in v[0]) return [HEAD.slice()].concat(v.map(o=>HEAD.map(h=>o[h]==null?"":String(o[h]))));
    for(const x of v){ const t = jsonTable(x); if(t) return t; }
  }else if(v && typeof v === "object"){ for(const x of Object.values(v)){ const t = jsonTable(x); if(t) return t; } }
  return null;
}
async function inflateB64(b64){
  let bytes; try{ bytes = Uint8Array.from(atob(b64.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0)); }catch(e){ return []; }
  const outs = [];
  if(typeof DecompressionStream === "function"){
    for(const fmt of ["deflate","deflate-raw","gzip"]){
      try{ outs.push(new TextDecoder().decode(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream(fmt))).arrayBuffer())); break; }catch(e){}
    }
  }
  outs.push(new TextDecoder().decode(bytes));
  return outs;
}
/* any reply text → rows (with header) or null */
async function rowsFromText(text, depth){
  depth = depth || 0;
  text = String(text||"");
  const trimmed = text.trim();
  /* 1. delimited text: needs the header row (title rows above it are skipped) */
  if(!/^[<{\[]/.test(trimmed) && !/^[\w$.]+\s*\(/.test(trimmed)){
    const rows = parseCsv(text);
    const h = rows.findIndex(r=>{ const c = r.map(x=>String(x).trim().toLowerCase()); return c.includes("date") && c.includes("kcal"); });
    if(h >= 0 && sheetDays(rows.slice(h)).rows) return rows.slice(h);
  }
  /* 2. JSON or JSONP */
  let js = null;
  const jp = /^[\w$.]+\s*\(([\s\S]*)\)\s*;?\s*$/.exec(trimmed);
  try{ js = JSON.parse(jp ? jp[1] : trimmed); }catch(e){}
  if(js != null){
    const tbl = jsonTable(js); if(tbl && sheetDays(tbl).rows) return tbl;
    const strs = jsonStrings(js, []);
    let t = tokensToRows(strs); if(t) return t;
    /* compressed blobs: inflate, then read either a nested reply or cell texts between control bytes */
    if(depth < 2) for(const s of strs.filter(x=>x.length > 80 && /^[A-Za-z0-9+/_=-]+$/.test(x))){
      for(const dec of await inflateB64(s)){
        const inner = await rowsFromText(dec, depth + 1).catch(()=>null);
        if(inner) return inner;
        t = tokensToRows(dec.split(/[\u0000-\u001f\u007f�]+/)); if(t) return t;
      }
    }
  }
  /* 3. HTML: a real <table>, or cell texts sitting in the page's script data */
  if(/<\w+[\s>]/.test(trimmed.slice(0, 2000))){
    try{
      const doc = new DOMParser().parseFromString(text, "text/html");
      for(const tb of doc.querySelectorAll("table")){
        const rows = [...tb.querySelectorAll("tr")].map(tr=>[...tr.querySelectorAll("td,th")].map(td=>td.textContent.trim()));
        const t = tokensToRows(rows.flat()); if(t) return t;
      }
    }catch(e){}
    const lits = []; text.replace(/"((?:[^"\\]|\\.){0,400})"/g, (_, x)=>{ try{ lits.push(JSON.parse('"' + x + '"')); }catch(e){ lits.push(x); } return ""; });
    const t = tokensToRows(lits); if(t) return t;
  }
  return null;
}
/* JSONP: a script tag, which a site may allow even when it blocks cross-site reads */
function loadJsonp(url){
  return new Promise((ok, no)=>{
    const cb = "__tt_cb" + Date.now() + Math.floor(Math.random()*1e4), sc = document.createElement("script");
    const done = ()=>{ try{ delete window[cb]; }catch(e){ window[cb] = undefined; } sc.remove(); clearTimeout(tm); };
    const tm = setTimeout(()=>{ done(); no(new Error("timeout")); }, 15000);
    window[cb] = data=>{ done(); ok(JSON.stringify(data)); };
    sc.onerror = ()=>{ done(); no(new Error("script")); };
    sc.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cb;
    document.head.appendChild(sc);
  });
}
/* try each way in turn; notes say how each one failed, for the status line */
async function readSheetRows(u){
  const notes = [];
  for(const c of sheetCandidates(u)){
    let text;
    try{
      if(c.jsonp) text = await loadJsonp(c.url);
      else{
        const r = await fetch(c.url, { cache: "no-store" });
        if(!r.ok){ notes.push(c.how + " " + r.status); continue; }
        text = await r.text();
      }
    }catch(e){ notes.push(c.how + " ✕"); continue; }
    const rows = await rowsFromText(text).catch(()=>null);
    if(rows) return { rows, how: c.how };
    notes.push(c.how + " ∅" + text.length);
  }
  return { rows: null, notes };
}

function paintSheetStatus(){
  const el = document.getElementById("dsrcStatus"); if(!el) return;
  let s = null; try{ s = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "null"); }catch(e){}
  el.classList.toggle("err", !!(s && !s.ok));
  if(!s){ el.textContent = T("状态：还没有同步", "Status: not synced yet"); return; }
  const last = s.at ? T("上次同步 ", "Last synced ") + s.at + T(" · " + s.rows + " 条 / " + s.days + " 天", " · " + s.rows + " rows / " + s.days + " days") : "";
  el.textContent = T("状态：", "Status: ") + (s.ok ? last : (s.msg + (last ? T("（", " (") + last + T("）", ")") : "")));
}
function setSheetStatus(patch){
  let s = {}; try{ s = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; }catch(e){}
  s = Object.assign(s, patch);
  try{ localStorage.setItem(SHEET_STATUS_K, JSON.stringify(s)); }catch(e){}
  paintSheetStatus();
}

async function pullSheet(){
  const inp = document.getElementById("dsrcUrl"), btn = document.getElementById("dsrcPull");
  let url = inp.value.trim();
  try{ if(url) localStorage.setItem(SHEET_URL_K, url); else localStorage.removeItem(SHEET_URL_K); }catch(e){}
  const fail = msg => setSheetStatus({ ok:false, msg });
  if(!url) return fail(T("先粘贴表格链接", "Paste the sheet link first"));
  if(!/^https?:\/\//i.test(url)) url = "https://" + url;
  if(navigator.onLine === false) return fail(T("没有网络，连上后再拉取", "You're offline; pull again once connected"));
  btn.disabled = true;
  const old = btn.innerHTML; btn.textContent = T("读取中…", "Reading…");
  try{
    const res = await readSheetRows(url);
    /* ✕ = blocked or unreachable, ∅ = reply had no table, a number = HTTP status */
    if(!res.rows) return fail(T("读不到表格数据。请确认：① 表格设成了所有人（知道链接的任何人）可查看；② 第一行表头是 date,item,p,f,c,veg,kcal。", "Couldn't read table data. Check: ① anyone with the link can view the sheet; ② row 1 is date,item,p,f,c,veg,kcal.") + "（" + res.notes.join(" · ") + "）");
    const { days, rows } = sheetDays(res.rows);
    const nDays = Object.keys(days).length;
    applySheetDays(days);
    lsSave(); dietState.open = latestDietOpenSet(state.diet); renderDietAll();
    const d = new Date();
    setSheetStatus({ ok:true, msg:"", at: pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()), rows, days: nDays });
    toast(T("已拉取 " + rows + " 条 / " + nDays + " 天", "Pulled " + rows + " rows / " + nDays + " days"));
  }finally{ btn.disabled = false; btn.innerHTML = old; }
}

function copyText(t){
  if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
  return new Promise((ok, no)=>{
    const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy") ? ok() : no(); }catch(e){ no(e); } finally{ ta.remove(); }
  });
}

(function initSheetSource(){
  const inp = document.getElementById("dsrcUrl"), info = document.getElementById("dsrcInfo"), ib = document.getElementById("dsrcInfoBtn");
  try{ inp.value = localStorage.getItem(SHEET_URL_K) || ""; }catch(e){}
  ib.addEventListener("click", ()=>{ info.hidden = !info.hidden; ib.setAttribute("aria-expanded", String(!info.hidden)); });
  document.getElementById("dsrcPull").addEventListener("click", pullSheet);
  inp.addEventListener("keydown", e=>{ if(e.key === "Enter") pullSheet(); });
  /* two prompt versions: Google Sheets (global) and Tencent Docs with WorkBuddy (China) */
  let ver = null; try{ ver = localStorage.getItem(PROMPT_VER_K); }catch(e){}
  if(ver !== "g" && ver !== "t"){ let tz = ""; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){} ver = /^Asia\/(Shanghai|Urumqi|Chongqing|Harbin)$/.test(tz) ? "t" : "g"; }
  const setVer = v=>{
    ver = v; try{ localStorage.setItem(PROMPT_VER_K, v); }catch(e){}
    document.querySelectorAll("#dsrcVer [data-ver]").forEach(b=>{ b.classList.toggle("active", b.dataset.ver===v); b.setAttribute("aria-selected", String(b.dataset.ver===v)); });
    document.querySelectorAll("#dsrcInfo [data-verpane]").forEach(p=>{ p.hidden = p.dataset.verpane !== v; });
  };
  setVer(ver);
  document.getElementById("dsrcVer").addEventListener("click", e=>{ const b = e.target.closest("[data-ver]"); if(b) setVer(b.dataset.ver); });
  info.addEventListener("click", e=>{
    const cb = e.target.closest("[data-copy]"); if(!cb) return;
    /* the prompt carries the user's own sheet link, so the AI knows where to write */
    const link = document.getElementById("dsrcUrl").value.trim();
    const txt = cb.dataset.copy === "t"
      ? document.getElementById("dsrcPromptT").textContent.replace("不要再新建。", "不要再新建。" + (/docs\.qq\.com/i.test(link) ? "\n我的表格链接：" + link : ""))
      : document.getElementById("dsrcPromptG").textContent.replace("（复制时自动填入你在上面粘贴的表格链接）", link || "（把你的表格链接粘在这里）");
    copyText(txt)
      .then(()=>{ cb.textContent = T("已复制", "Copied"); setTimeout(()=>{ cb.innerHTML = '<span class="zh">复制</span><span class="en">Copy</span>'; }, 1500); })
      .catch(()=>toast(T("复制失败，请长按选择文字复制", "Couldn't copy; select the text and copy it")));
  });
  paintSheetStatus();
})();
/* placeholder and status follow the language switch */
function paintSheetLang(){
  const inp = document.getElementById("dsrcUrl"); if(inp) inp.placeholder = T("粘贴表格的分享链接", "Paste your sheet's share link");
  paintSheetStatus();
}
paintSheetLang();
