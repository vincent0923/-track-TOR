/* ---------- diet data source: a Google Sheets "Publish to web" CSV ----------
   Columns date,item,p,f,c,veg,kcal, one food per row. Pulled only when the user taps Pull.
   Days found in the sheet replace the local diet for those dates; other dates, and every
   non-diet record (weight, waist, heart rate, training), are left alone. */
const SHEET_URL_K = "dietSheetUrl", SHEET_STATUS_K = LS + "-sheet-status";
const SHEET_COLS = ["date","item","p","f","c","veg","kcal"];

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
  if((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) return m[3]+"-"+pad(+m[1])+"-"+pad(+m[2]);   /* US M/D/YYYY */
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

function sheetUrlProblem(u){
  if(!u) return T("先粘贴链接", "Paste the link first");
  if(!/^https?:\/\//i.test(u)) return T("这不是网址", "That isn't a web address");
  if(/docs\.google\.com\/spreadsheets\/d\/(?!e\/)[^/]+\/(edit|view)/i.test(u) || /docs\.google\.com\/spreadsheets\/d\/(?!e\/)[^/?#]+\/?([?#]|$)/i.test(u))
    return T("这是编辑链接，需要用『发布到网络 → CSV』得到的链接", "This is an edit link. Use the link from “Publish to web → CSV”.");
  return null;
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
  const bad = sheetUrlProblem(url);
  if(bad){ setSheetStatus({ ok:false, msg:bad }); return; }
  btn.disabled = true;
  const fail = msg => setSheetStatus({ ok:false, msg });
  try{
    let r;
    try{ r = await fetch(url, { cache: "no-store" }); }
    catch(e){ return fail(T("请求失败，检查网络或链接", "Request failed; check the connection or the link")); }
    if(!r.ok) return fail(T("链接返回 " + r.status + "，检查是否已发布到网络", "The link returned " + r.status + "; check it is published to the web"));
    const text = await r.text(), ct = r.headers.get("content-type") || "";
    if(/text\/html/i.test(ct) || /^\s*</.test(text)) return fail(T("返回的是网页不是 CSV，发布时格式要选「逗号分隔值 (.csv)」", "Got a web page, not CSV; publish as “Comma-separated values (.csv)”"));
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
  const cb = document.getElementById("dsrcCopy");
  cb.addEventListener("click", ()=>{
    copyText(document.getElementById("dsrcPrompt").textContent)
      .then(()=>{ cb.textContent = T("已复制", "Copied"); setTimeout(()=>{ cb.innerHTML = '<span class="zh">复制</span><span class="en">Copy</span>'; }, 1500); })
      .catch(()=>toast(T("复制失败，请长按选择文字复制", "Couldn't copy; select the text and copy it")));
  });
  paintSheetStatus();
})();
/* placeholder and status follow the language switch */
function paintSheetLang(){
  const inp = document.getElementById("dsrcUrl"); if(inp) inp.placeholder = T("粘贴 Google Sheets CSV 发布链接", "Paste the Google Sheets CSV publish link");
  paintSheetStatus();
}
paintSheetLang();
