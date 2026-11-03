/* ---------- diet data source: a Google Sheet ----------
   The user pastes the sheet's ordinary share link (shared as "anyone with the link can view");
   it is turned into Google's CSV query URL. A "Publish to web" CSV link works as is.
   Columns date,item,p,f,c,veg,kcal, one food per row. Pulled only when the user taps Pull.
   Days found in the sheet replace the local diet for those dates; other dates, and every
   non-diet record (weight, waist, heart rate, training), are left alone. */
const SHEET_URL_K = "dietSheetUrl", SHEET_STATUS_K = LS + "-sheet-status";
const SHEET_COLS = ["date","item","p","f","c","veg","kcal"];
const PROMPT_VER_K = LS + "-prompt-ver";

/* RFC 4180: quoted fields may hold commas, line breaks and doubled quotes ("") */
function parseCsv(text){
  const rows = []; let row = [], field = "", q = false, i = 0;
  text = String(text).replace(/^﻿/, "");
  while(i < text.length){
    const ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ field += '"'; i += 2; continue; } q = false; i++; continue; }
      field += ch; i++; continue;
    }
    if(ch === '"' && field === ""){ q = true; i++; continue; }
    if(ch === ","){ row.push(field); field = ""; i++; continue; }
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

/* share/edit link → CSV query URL (keeps the tab given by gid); a published CSV link is used as is */
function sheetCsvUrl(u){
  u = String(u||"").trim();
  if(!u) return { err: T("先粘贴表格链接", "Paste the sheet link first") };
  if(!/^https?:\/\//i.test(u)) u = "https://" + u;
  const m = /docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/i.exec(u);
  if(m && m[1] !== "e"){
    const g = /[#&?]gid=(\d+)/.exec(u);
    return { url: "https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv&headers=1" + (g ? "&gid=" + g[1] : "") };
  }
  if(/docs\.qq\.com\//i.test(u)) return { err: T("腾讯文档读取还在接入中，暂时只能拉取 Google 表格", "Reading Tencent Docs is still being added; only Google Sheets can be pulled for now") };
  if(/docs\.google\.com\/spreadsheets\/d\/e\//i.test(u) || /output=csv|\.csv(\?|$)/i.test(u)) return { url: u };
  return { err: T("这不是 Google 表格的链接，请在表格里点「共享 → 复制链接」", "That isn't a Google Sheets link; in the sheet tap Share → Copy link") };
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
  const url = inp.value.trim();
  try{ if(url) localStorage.setItem(SHEET_URL_K, url); else localStorage.removeItem(SHEET_URL_K); }catch(e){}
  const src = sheetCsvUrl(url);
  if(src.err){ setSheetStatus({ ok:false, msg:src.err }); return; }
  const NOT_SHARED = T("读不到表格：在 Google 表格里点「共享」，把一般访问权限改成「知道链接的任何人」", "Can't read the sheet: in Google Sheets tap Share and set General access to “Anyone with the link”");
  btn.disabled = true;
  const fail = msg => setSheetStatus({ ok:false, msg });
  try{
    let r;
    /* a sheet that isn't shared answers with a sign-in page, which the browser reports as a failed request */
    try{ r = await fetch(src.url, { cache: "no-store" }); }
    catch(e){ return fail(navigator.onLine === false ? T("没有网络，连上后再拉取", "You're offline; pull again once connected") : NOT_SHARED); }
    if(r.status === 401 || r.status === 403) return fail(NOT_SHARED);
    if(r.status === 404) return fail(T("找不到这张表格，检查链接是否完整", "Sheet not found; check the link is complete"));
    if(!r.ok) return fail(T("Google 返回 " + r.status + "，稍后再试", "Google returned " + r.status + "; try again later"));
    const text = await r.text(), ct = r.headers.get("content-type") || "";
    if(/text\/html/i.test(ct) || /^\s*</.test(text)) return fail(NOT_SHARED);
    const { days, rows } = sheetDays(parseCsv(text));
    const nDays = Object.keys(days).length;
    if(!rows) return fail(T("没有读到有效记录，检查表头是否为 date,item,p,f,c,veg,kcal，日期是否为 YYYY-MM-DD", "No valid rows; check the header is date,item,p,f,c,veg,kcal and dates are YYYY-MM-DD"));
    applySheetDays(days);
    lsSave(); dietState.open = latestDietOpenSet(state.diet); renderDietAll();
    const d = new Date();
    setSheetStatus({ ok:true, msg:"", at: pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()), rows, days: nDays });
    toast(T("已拉取 " + rows + " 条 / " + nDays + " 天", "Pulled " + rows + " rows / " + nDays + " days"));
  }finally{ btn.disabled = false; }
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
  const inp = document.getElementById("dsrcUrl"); if(inp) inp.placeholder = T("粘贴 Google 表格的分享链接", "Paste your Google Sheet's share link");
  paintSheetStatus();
}
paintSheetLang();
