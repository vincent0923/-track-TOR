/* ---------- COROS sync ---------- */
let mcp=null, syncing=false, mcpReady=false;
const SYNC_K=LS+"-lastsync";
function lastSync(){try{return localStorage.getItem(SYNC_K)||""}catch(e){return ""}}
function syncUI(){
  const b=document.getElementById("syncBtn");
  const co=document.getElementById("coOut");if(co){const has=!!readCorosToken();if(co.hidden===has){co.hidden=!has;coOutStep(0)}}
  if(syncing){b.className="syncbtn busy";b.textContent=T("同步中…","Syncing…");return}
  if(!mcpReady){b.className="syncbtn off";b.textContent=mcp===null?T("连接高驰","Connect COROS"):T("同步高驰mcp","Sync COROS");return}
  const ls=lastSync();
  if(ls.slice(0,10)===today()){b.className="syncbtn done";b.textContent=T("已同步 ","Synced ")+ls.slice(11,16)}
  else{b.className="syncbtn";b.textContent=T("同步高驰mcp","Sync COROS")}
}
let msgT;
function syncMsg(t){const el=document.getElementById("toast");el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,5000)}
function ymdOffset(days){const d=new Date();d.setDate(d.getDate()+days);return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())}
function parseSleep(text){
  /* tolerant like HRV: replies may arrive JSON-encoded with literal "\n", so don't rely on line breaks. A date followed by a time belongs to a sleep window, not a record header */
  const out=[];const re=/(20\d{2}-\d{2}-\d{2})(?!\s+\d{1,2}:\d{2})/g;const hits=[];let m;
  while((m=re.exec(text)))hits.push({i:m.index,d:m[1]});
  hits.forEach((h,k)=>{const seg=text.slice(h.i,k+1<hits.length?hits[k+1].i:text.length);
    const s=/sleep\s*score:\s*(-?\d+)/i.exec(seg);if(!s||+s[1]<=0)return; /* 0 = not scored yet, -1 = no score */
    const t=/daily\s*sleep:\s*(?:(\d+)h\s*)?(\d+)\s*min/i.exec(seg);
    out.push({date:h.d,sleep:+s[1],sleepH:t?+((+(t[1]||0))+(+t[2])/60).toFixed(2):null})});
  return out;
}
/* HRV replies are parsed tolerantly: dated text lines or JSON */
function toText(r){let t=typeof r.payload==="string"?r.payload:"";
  if(!t&&r.content)t=r.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
  if(!t&&r.payload)t=JSON.stringify(r.payload);return t||""}
function normDate(d){d=String(d);const m=/^(20\d{2})-?(\d{2})-?(\d{2})/.exec(d);return m?m[1]+"-"+m[2]+"-"+m[3]:null}
function parseHrv(text){
  const out={};const re=/(20\d{2}-\d{2}-\d{2}|\b20\d{6}\b)/g;const hits=[];let m;
  while((m=re.exec(text)))hits.push({i:m.index,d:normDate(m[1])});
  hits.forEach((h,k)=>{const seg=text.slice(h.i,k+1<hits.length?hits[k+1].i:text.length);
    const v=/(?:avg\s*)?(?:hrv|rmssd)[^0-9\n]{0,30}?(\d{1,3}(?:\.\d+)?)/i.exec(seg)||/(?:average|avg|mean|value)[^0-9\n]{0,20}?(\d{1,3}(?:\.\d+)?)\s*ms/i.exec(seg);
    if(h.d&&v){const n=+v[1];if(n>=5&&n<=300&&out[h.d]==null)out[h.d]=Math.round(n)}});
  return Object.keys(out).sort().map(d=>({date:d,hrv:out[d]}));
}
const ymdOf=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
async function hrvRange(from,to){const r=await mcp.callTool("COROS","querySleepHrv",{startDate:from,endDate:to});const t=toText(r);return {text:t,rows:parseHrv(t)}}
/* older history, 60 days per request, going back from the earliest night on record until COROS returns an empty stretch; runs once per kind */
async function backfill(flag,first,fetchRange,saveRow,has,what){
  let done=false;try{done=localStorage.getItem(LS+flag)==="done"}catch(e){}
  if(done)return null;
  let end=new Date(first?first.date+"T12:00":Date.now());end.setDate(end.getDate()-1);
  let added=0,earliest=null;
  for(let k=0;k<24;k++){
    const start=new Date(end);start.setDate(start.getDate()-59);
    syncMsg(T("正在回填更早的"+what+"："+ymdOf(start).slice(0,6)+"…","Backfilling older "+what+": "+ymdOf(start).slice(0,6)+"…"));
    let rows;try{rows=await fetchRange(ymdOf(start),ymdOf(end))}catch(e){break}
    if(!rows.length){try{localStorage.setItem(LS+flag,"done")}catch(e){}break}
    for(const x of rows){if(!has(x)){await saveRow(x);added++}}
    earliest=rows.map(x=>x.date).sort()[0];
    end=new Date(start);end.setDate(end.getDate()-1);
  }
  return added?{added,earliest}:null;
}
async function sleepRange(f,t){const r=await mcp.callTool("COROS","querySleepOverview",{startDate:f,endDate:t});return parseSleep(toText(r))}
/* resting heart rate: same approach as HRV — schema-driven arguments, tolerant parsing, raw sample kept if unrecognised */
function parseRhr(text){
  const out={};const re=/(20\d{2}-\d{2}-\d{2}|\b20\d{6}\b)/g;const hits=[];let m;
  while((m=re.exec(text)))hits.push({i:m.index,d:normDate(m[1])});
  hits.forEach((h,k)=>{const seg=text.slice(h.i,k+1<hits.length?hits[k+1].i:text.length);
    const v=/(?:resting\s*(?:heart\s*rate|hr)|rhr)[^0-9\n]{0,30}?(\d{2,3}(?:\.\d+)?)/i.exec(seg)||/(\d{2,3})\s*bpm/i.exec(seg);
    if(h.d&&v){const n=+v[1];if(n>=25&&n<=150&&out[h.d]==null)out[h.d]=Math.round(n)}});
  return Object.keys(out).sort().map(d=>({date:d,rhr:out[d]}));
}
async function rhrRange(from,to){const r=await mcp.callTool("COROS","queryRestingHeartRate",{days:Math.max(1,Math.round((Date.now()-new Date(from.slice(0,4)+"-"+from.slice(4,6)+"-"+from.slice(6,8)+"T12:00"))/864e5)+1)});const t=toText(r);return {text:t,rows:parseRhr(t)}}
async function syncRhr(){
  try{
    /* resting HR only takes "days": the first sync asks for 400 days of history, later syncs for the last 60 */
    let first=true;try{first=localStorage.getItem(LS+"-rhrbf2")!=="done"}catch(e){}
    const {rows}=await rhrRange(ymdOffset(first?-399:-59),ymdOffset(0));
    if(!rows.length){
      return T("；静息心率读到了数据但格式未识别。","; resting HR came back in an unrecognised format.");
    }
    let n=0;for(const x of rows){const m=state.metrics[x.date];if(!(m&&m.rhr===x.rhr)){await saveMetric(x.date,{rhr:x.rhr});n++}}
    try{localStorage.setItem(LS+"-rhrbf2","done")}catch(e){}
    const l=rows[rows.length-1];
    return T("；静息心率 "+rows.length+" 天（更新 "+n+" 天），最早 "+md(rows[0].date)+"，最近 "+md(l.date)+"："+l.rhr+" bpm","; resting HR "+rows.length+" days ("+n+" updated), earliest "+md(rows[0].date)+", latest "+md(l.date)+": "+l.rhr+" bpm");
  }catch(e){return T("；静息心率读取失败（"+((e&&e.code)||"未知原因")+"）","; resting HR read failed ("+((e&&e.code)||"unknown")+")")}
}
async function syncHrv(){
  try{
    const {rows}=await hrvRange(ymdOffset(-59),ymdOffset(0));
    if(!rows.length){
      return T("；HRV 读到了数据但格式未识别。","; HRV data came back in an unrecognised format.");
    }
    for(const x of rows){await saveMetric(x.date,{hrv:x.hrv})}
    const l=rows[rows.length-1];
    const bf=await backfill("-hrvbf",series("hrv")[0],async(f,t)=>(await hrvRange(f,t)).rows,x=>saveMetric(x.date,{hrv:x.hrv}),x=>state.metrics[x.date]&&state.metrics[x.date].hrv!=null,"HRV");
    const back=bf?T("，回填 "+bf.added+" 晚（最早 "+bf.earliest+"）",", backfilled "+bf.added+" nights (earliest "+bf.earliest+")"):"";
    return T("；HRV "+rows.length+" 晚，最近 "+md(l.date)+"："+l.hrv+" ms","; HRV "+rows.length+" nights, latest "+md(l.date)+": "+l.hrv+" ms")+back;
  }catch(e){return T("；HRV 读取失败（"+((e&&e.code)||"未知原因")+"）","; HRV read failed ("+((e&&e.code)||"unknown")+")")}
}
document.getElementById("syncBtn").addEventListener("click",async()=>{
  if(syncing)return;
  if(!mcp){promptCorosToken();return}
  syncing=true;syncUI();
  try{
    const r=await mcp.callTool("COROS","querySleepOverview",{startDate:ymdOffset(-59),endDate:ymdOffset(0)});
    const text=toText(r);
    const rows=parseSleep(text);
    let msg="";
    if(!rows.length){msg=T("COROS 返回了数据，但没有读到睡眠评分（开头：","COROS replied but no sleep scores were found (starts: ")+text.slice(0,120)+T("）。",").");}
    else{
      for(const x of rows){await saveMetric(x.date,{sleep:x.sleep,sleepH:x.sleepH})}
      const sbf=await backfill("-sleepbf",series("sleep")[0],sleepRange,x=>saveMetric(x.date,{sleep:x.sleep,sleepH:x.sleepH}),x=>state.metrics[x.date]&&state.metrics[x.date].sleep!=null,T("睡眠","sleep"));
      msg=T("已同步 "+rows.length+" 晚睡眠，最近一晚 "+md(rows[rows.length-1].date)+"："+rows[rows.length-1].sleep+" 分","Synced "+rows.length+" nights; latest "+md(rows[rows.length-1].date)+": "+rows[rows.length-1].sleep)
        +(sbf?T("，回填 "+sbf.added+" 晚（最早 "+sbf.earliest+"）",", backfilled "+sbf.added+" nights (earliest "+sbf.earliest+")"):"");
    }
    msg+=await syncHrv();
    msg+=await syncRhr();
    try{
      const dhealth = await mcp.callTool("COROS","queryDailyHealthData",{days:60});
      const dtext = toText(dhealth);
      const rows = parseDailyHealthText(dtext);
      let dc = 0;
      for(const [date, v] of Object.entries(rows)){ saveMetric(date, { active: v.active, steps: v.steps }); dc++; }
      if(dc>0){ renderDietAll(); msg += T("；已同步 "+dc+" 天饮食与活动热量", "; synced "+dc+" days of diet & calorie burn"); }
    }catch(de){}
    try{
      const u=await mcp.callTool("COROS","queryUserInfo",{});
      const ut=toText(u);
      const hm=/Height:\s*([\d.]+)\s*cm/i.exec(ut);
      if(hm){const hv=+hm[1];state.settings.hC=hv;if(state.settings.hSrc!=="manual")state.settings.h=hv;saveSettings()}
      /* birthday and sex only fill empty fields, so anything the user typed stays */
      const bm=/Birthday:\s*(\d{4}-\d{2}-\d{2})/i.exec(ut), gm=/Gender:\s*(male|female)/i.exec(ut);
      if(bm&&!state.settings.b)state.settings.b=bm[1].slice(0,7);
      if(gm&&!state.settings.sex)state.settings.sex=gm[1].toLowerCase()==="female"?"f":"m";
      if(bm||gm){saveSettings();renderDietAll()}
      const wm=/Weight:\s*([\d.]+)\s*kg/i.exec(ut);
      if(wm){
        const w=+(+wm[1]).toFixed(1), td=today();
        const prev=Object.values(state.metrics).filter(m=>m.weightC!=null&&m.date<td).sort((a,b)=>a.date<b.date?1:-1)[0];
        if(prev&&prev.weightC===w&&!(state.metrics[td]&&state.metrics[td].weightC!=null)){msg+=T("；COROS 体重仍是 "+w+" kg，和 "+md(prev.date)+" 相同，未重复记录","; COROS weight still "+w+" kg, same as "+md(prev.date)+", not logged again")}
        else{await saveMetric(td,{weightC:w});const hasM=state.metrics[td]&&state.metrics[td].weight!=null;msg+=T("；COROS 体重 "+w+" kg 记入 "+md(td)+(hasM?"（当天有手动体重，以手动为准）":""),"; COROS weight "+w+" kg logged for "+md(td)+(hasM?" (manual entry for that day takes priority)":""))}
      }else msg+=T("；没有读到 COROS 体重","; no COROS weight found");
    }catch(e2){msg+=T("；体重读取失败（"+((e2&&e2.code)||"未知原因")+"）","; weight read failed ("+((e2&&e2.code)||"unknown")+")")}
    lsSave();renderAll();syncMsg(msg);
    try{const d=new Date();localStorage.setItem(SYNC_K,today()+" "+pad(d.getHours())+":"+pad(d.getMinutes()))}catch(e){}
  }catch(e){
    const c=e&&e.code;
    if(c==="needs_reauth"){
      /* 令牌失效或还没连接：打开连接弹窗重新授权 */
      syncMsg(T("高驰授权已失效，请重新授权。","COROS authorization expired — please authorize again."));
      promptCorosToken();
    }
    else if(c==="mcp_error")syncMsg(T("COROS 返回错误：","COROS error: ")+(e.message||T("未知原因","unknown")));
    else syncMsg(T("同步失败（"+(c||"未知原因")+"），稍后再试。","Sync failed ("+(c||"unknown")+"), try again later."));
  }finally{syncing=false;syncUI()}
});
/* 有令牌就算已连接，不因断网或令牌到期打扰用户；剩余不足 15 天就提前续期，经常打开就一直不用重新授权 */
const COROS_RENEW_WITHIN = 15*864e2;
async function connectMcp(){
  const tk = readCorosToken();
  if(!tk || !tk.access_token){ mcp=null;mcpReady=false;syncUI();return; }
  mcpReady=true;
  mcp={ callTool: (srv, tool, args) => callCorosDirectBrowser(tool, args) };
  syncUI();
  const stEl = document.getElementById("dietSyncStatus");
  if(stEl) stEl.textContent = T("高驰已连接 · 点击右上角同步","COROS connected · tap Sync at top-right");
  if(!tk.expires_at_epoch || tk.expires_at_epoch - Date.now()/1000 < COROS_RENEW_WITHIN) await refreshCorosToken(tk);
}

/* ---------- COROS 连接：纯前端 PKCE 授权 ---------- */
function readCorosToken(){
  try{ return JSON.parse(localStorage.getItem("tracktor-coros-token") || "null"); }catch(e){ return null; }
}

/* --- 登出高驰：两步确认。可选清掉同步来的数据，手动记录（引体、手动体重、腰围、饮食）都保留 --- */
let coOutMode=null;
function coOutStep(n){
  const a=document.getElementById("coOut1"),b=document.getElementById("coOut2");if(!a)return;
  a.hidden=n!==1;b.hidden=n!==2;document.getElementById("coOutBtn").hidden=n!==0;
}
function corosLogout(wipe){
  try{ localStorage.removeItem("tracktor-coros-token"); sessionStorage.removeItem("tracktor-coros-pending"); }catch(e){}
  if(wipe){
    const SYNCED=["weightC","sleep","sleepH","hrv","rhr","active","steps"];
    for(const [d,m] of Object.entries(state.metrics)){
      SYNCED.forEach(k=>delete m[k]);
      if(Object.keys(m).every(k=>k==="date"||m[k]==null))delete state.metrics[d];
    }
    const st=state.settings; st.hC=null; if(st.hSrc!=="manual")st.h=null;
    /* next login backfills history again */
    ["-hrvbf","-sleepbf","-rhrbf2","-lastsync"].forEach(k=>{try{localStorage.removeItem(LS+k)}catch(e){}});
    lsSave(); renderAll(); renderDietAll();
  }
  mcp=null; mcpReady=false; syncUI();
  toast(wipe?T("已登出高驰，同步的数据已清除","Logged out of COROS; synced data deleted"):T("已登出高驰，数据都保留","Logged out of COROS; all data kept"));
}
document.getElementById("coOut").addEventListener("click",e=>{
  if(e.target.closest("#coOutBtn")){coOutStep(1);return}
  if(e.target.closest("#coOutYes")){corosLogout(coOutMode==="wipe");coOutStep(0);return}
  const c=e.target.closest("[data-co]");if(!c)return;
  if(c.dataset.co==="cancel"){coOutStep(0);return}
  coOutMode=c.dataset.co;
  document.getElementById("coOutMsg").textContent=coOutMode==="wipe"
    ?T("确定登出并清除高驰同步的体重、睡眠、HRV、静息心率和活动热量吗？清除后不能恢复，除非先保存进度文件。","Log out and delete synced weight, sleep, HRV, resting heart rate, and activity calories? This can't be undone unless you save a progress file first.")
    :T("确定登出高驰吗？数据都会留着，重新连接后接着同步。","Log out of COROS? All data stays, and syncing resumes when you reconnect.");
  coOutStep(2);
});

/* --- 纯前端 PKCE 授权流程 --- */
const COROS_REGIONS = { cn:"https://mcpcn.coros.com", eu:"https://mcpeu.coros.com", us:"https://mcpus.coros.com" };
const COROS_REGION_K = "tracktor-coros-region";
/* 优先用已选区域，其次已存令牌的区域，最后按时区猜一个默认值 */
function corosRegion(){
  let saved = null;
  try{ saved = localStorage.getItem(COROS_REGION_K); }catch(e){}
  if(COROS_REGIONS[saved]) return saved;
  const tk = readCorosToken();
  const fromToken = tk && Object.keys(COROS_REGIONS).find(k=>COROS_REGIONS[k]===tk.issuer);
  if(fromToken) return fromToken;
  let tz = "";
  try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){}
  if(tz==="Asia/Shanghai"||tz==="Asia/Urumqi") return "cn";
  if(tz.startsWith("Europe/")) return "eu";
  return "us";
}
function corosIssuer(){ return COROS_REGIONS[corosRegion()]; }
const COROS_REDIRECT = "https://vincent0923.github.io/Track-TOR/";
const COROS_SCOPE = "openid offline_access mcp.tools";

function _b64url(buf){ let s=""; for(let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function _randBytes(n){ const a=new Uint8Array(n); (crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach((_,i)=>a[i]=Math.floor(Math.random()*256))); return a; }
function _pkceVerifier(){ return _b64url(_randBytes(32)); }
async function _pkceChallenge(v){ const d=new TextEncoder().encode(v); const h=await crypto.subtle.digest("SHA-256", d); return _b64url(new Uint8Array(h)); }

async function _corosPost(url, body, headers){
  const h = Object.assign({"Content-Type":"application/json"}, headers||{});
  const r = await fetch(url, { method:"POST", headers:h, body: JSON.stringify(body||{}) });
  const txt = await r.text();
  let j = {}; try{ j = JSON.parse(txt); }catch(e){}
  if(!r.ok) throw new Error(j.error || j.message || ("HTTP "+r.status));
  return j;
}

/* 动态注册公开客户端（无 secret） */
async function corosRegisterClient(){
  const j = await _corosPost(corosIssuer() + "/connect/register", {
    client_name: "Track-TOR Web",
    redirect_uris: [COROS_REDIRECT],
    grant_types: ["authorization_code","refresh_token"],
    response_types: ["code"],
    scope: COROS_SCOPE,
    token_endpoint_auth_method: "none"
  });
  if(!j.client_id) throw new Error("register missing client_id");
  return j.client_id;
}

/* 创建 CLI 登录会话 */
async function corosCreateSession(clientId){
  return await _corosPost(corosIssuer() + "/api/v1/cli/login-sessions", { clientId });
}

/* 轮询 claim 会话状态，返回 {status, loginTicket?, ...} */
async function corosClaim(sessionId, pollToken){
  const r = await fetch(corosIssuer() + "/api/v1/cli/login-sessions/" + encodeURIComponent(sessionId) + "/claim", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-Poll-Token": pollToken }
  });
  const txt = await r.text();
  let j = {}; try{ j = JSON.parse(txt); }catch(e){}
  if(!r.ok) throw new Error(j.error || ("HTTP "+r.status));
  return j;
}

/* 用授权码换 token（PKCE） */
async function corosExchangeCode(issuer, clientId, code, verifier){
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: code,
    redirect_uri: COROS_REDIRECT,
    code_verifier: verifier
  });
  const r = await fetch(issuer + "/oauth2/token", {
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: body.toString()
  });
  const txt = await r.text();
  let j = {}; try{ j = JSON.parse(txt); }catch(e){}
  if(!r.ok) throw new Error(j.error_description || j.error || ("HTTP "+r.status));
  return j;
}

function promptCorosToken(){
  const mask = document.createElement("div");
  mask.className = "mask";
  mask.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${T("连接高驰","Connect COROS")}" style="max-width:480px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b style="font-size:16px">${T("连接高驰","Connect COROS")}</b>
      <button type="button" data-close class="iconbtn" aria-label="${T("关闭","Close")}">${CLOSE_ICON}</button>
    </div>
    <p class="sub" style="margin:0 0 12px">${T(
      "同步健康数据需要先连接你的高驰账号。",
      "Connect your COROS account to sync health data."
    )}</p>

    <div id="corosAuthBox">
      <div class="field" style="margin-bottom:10px"><label for="corosRegionSel">${T("高驰账号所在区域","COROS account region")}</label>
        <select id="corosRegionSel" style="width:100%;font:inherit;font-size:16px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--sunk);color:var(--ink)">
          <option value="cn">${T("中国大陆","Mainland China")}</option>
          <option value="eu">${T("欧洲","Europe")}</option>
          <option value="us">${T("美国及其他地区","US & other regions")}</option>
        </select>
      </div>
      <button id="corosAuthBtn" type="button" class="btn" style="width:100%;background:var(--push);font-size:15px;padding:12px">${T("授权登录高驰账号","Authorize COROS account")}</button>
      <p class="note" style="margin:10px 0 0">💡 ${T("授权失败的话，稍等一分钟再试，或换个区域。请不要连续点，太频繁会被高驰暂时拒绝。","If authorization fails, wait a minute and try again, or pick another region. Please don't tap repeatedly; COROS temporarily refuses rapid attempts.")}</p>
      <p class="note" id="corosAuthMsg" style="margin:6px 0 0;min-height:16px"></p>
    </div>

  </div>`;
  document.body.appendChild(mask);
  const regionSel = mask.querySelector("#corosRegionSel");
  regionSel.value = corosRegion();
  regionSel.addEventListener("change", ()=>{ try{ localStorage.setItem(COROS_REGION_K, regionSel.value); }catch(e){} });
  const regionIssuer = ()=>COROS_REGIONS[regionSel.value];
  const close = ()=>{ mask.remove(); };
  mask.querySelector("[data-close]").addEventListener("click", close);
  mask.addEventListener("click", e=>{ if(e.target===mask) close(); });

  /* 自动授权主流程 */
  mask.querySelector("#corosAuthBtn").addEventListener("click", async ()=>{
    const btn = mask.querySelector("#corosAuthBtn");
    const msgEl = mask.querySelector("#corosAuthMsg");
    btn.disabled = true;
    regionSel.disabled = true;
    btn.textContent = T("正在准备登录…","Preparing login…");
    msgEl.textContent = "";
    try{
      /* 整个授权过程固定用这个区域 */
      try{ localStorage.setItem(COROS_REGION_K, regionSel.value); }catch(e){}
      const issuer = regionIssuer();
      /* 1. 注册 client + 生成 PKCE */
      const verifier = _pkceVerifier();
      const clientId = await corosRegisterClient();
      const session = await corosCreateSession(clientId);
      const loginUrl = session.loginUrl || session.login_url;
      const sessionId = session.sessionId || session.session_id;
      const pollToken = session.pollToken || session.poll_token;
      if(!loginUrl || !sessionId || !pollToken) throw new Error("session missing fields");

      /* 保存授权上下文（供页面刷新后从 URL code 恢复） */
      try{
        sessionStorage.setItem("tracktor-coros-pending", JSON.stringify({ clientId, verifier, sessionId, pollToken, ts: Date.now() }));
      }catch(e){}

      /* 2. 打开登录链接 */
      btn.textContent = T("请在新窗口登录高驰…","Log in to COROS in the new window…");
      msgEl.textContent = T("新窗口已打开，请登录并授权。完成后会自动连接。","A new window opened — log in and authorize. It will auto-connect.");
      const loginWin = window.open(loginUrl, "_blank");

      /* 3. 轮询 claim，直到 authorized */
      let ticket = null;
      for(let i=0;i<100;i++){   /* 最多约 5 分钟 */
        await new Promise(r=>setTimeout(r, 3000));
        const res = await corosClaim(sessionId, pollToken);
        const st = String(res.status || "").toLowerCase();
        if(st === "authorized"){
          ticket = res.loginTicket || res.login_ticket;
          break;
        }
        if(st && st !== "pending") throw new Error("session status: " + st);
      }
      if(!ticket) throw new Error("authorization timeout");
      /* 高驰登录页不会自己跳回来；授权成功后替用户关掉它 */
      try{ if(loginWin && !loginWin.closed) loginWin.close(); }catch(e){}

      /* 4. 拿 loginTicket 访问 authorize_url 换 code：直接让用户跳转（会回到本页带 code） */
      const challenge = await _pkceChallenge(verifier);
      const state = _pkceVerifier();
      const authUrl = issuer + "/oauth2/authorize?" + new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: COROS_REDIRECT,
        scope: COROS_SCOPE,
        code_challenge: challenge,
        code_challenge_method: "S256",
        resource: issuer + "/mcp",
        state: state,
        login_ticket: ticket
      }).toString();
      sessionStorage.setItem("tracktor-coros-pending", JSON.stringify({ issuer, clientId, verifier, state, ts: Date.now() }));
      window.location.href = authUrl;

    }catch(e){
      btn.disabled = false;
      regionSel.disabled = false;
      btn.textContent = T("授权登录高驰账号","Authorize COROS account");
      msgEl.textContent = T("授权失败：","Authorization failed: ") + (e.message || e) + T("。稍等一分钟再试，或换个区域。",". Wait a minute and retry, or try another region.");
      syncMsg(T("授权失败。稍等一分钟再试，或换个区域。","Authorization failed. Wait a minute and retry, or try another region."));
    }
  });

}

/* 页面加载时：检测 URL 是否带回授权 code（从高驰跳转回来） */
async function handleCorosCallback(){
  try{
    const q = new URLSearchParams(window.location.search);
    const code = q.get("code");
    /* 高驰拒绝授权时带 error 回来，以前会被静默忽略 */
    const err = q.get("error");
    if(!code && err && sessionStorage.getItem("tracktor-coros-pending")){
      sessionStorage.removeItem("tracktor-coros-pending");
      if(window.history && window.history.replaceState) window.history.replaceState({}, "", window.location.pathname);
      syncMsg(T("高驰授权没有完成：","COROS authorization didn't finish: ") + (q.get("error_description") || err) + T("。稍等一分钟再试，或换个区域。",". Wait a minute and retry, or try another region."));
      return false;
    }
    if(!code) return false;
    const st = q.get("state");
    const pend = JSON.parse(sessionStorage.getItem("tracktor-coros-pending") || "null");
    if(!pend || !pend.verifier || !pend.clientId) return false;
    if(pend.state && st && st !== pend.state) return false;
    /* 换 token */
    syncMsg(T("授权成功，正在获取令牌…","Authorized — fetching token…"));
    const issuer = pend.issuer || corosIssuer();
    const tkResp = await corosExchangeCode(issuer, pend.clientId, code, pend.verifier);
    const tk = {
      access_token: tkResp.access_token,
      refresh_token: tkResp.refresh_token,
      token_type: tkResp.token_type || "Bearer",
      expires_in: tkResp.expires_in,
      obtained_at_epoch: Math.floor(Date.now()/1000),
      expires_at_epoch: Math.floor(Date.now()/1000) + (tkResp.expires_in||3600),
      client_id: pend.clientId,
      issuer
    };
    if(!tk.access_token || !tk.refresh_token) throw new Error("token response missing fields");
    localStorage.setItem("tracktor-coros-token", JSON.stringify(tk));
    sessionStorage.removeItem("tracktor-coros-pending");
    /* 清掉 URL 里的 code/state，避免刷新重复换码 */
    if(window.history && window.history.replaceState){
      window.history.replaceState({}, "", window.location.pathname);
    }
    await connectMcp();
    if(mcpReady){
      syncMsg(T("高驰已连接，正在同步…","COROS connected — syncing…"));
      document.getElementById("syncBtn").click();
    }
    return true;
  }catch(e){
    syncMsg(T("获取令牌失败：","Token fetch failed: ") + (e.message||e));
    return false;
  }
}
