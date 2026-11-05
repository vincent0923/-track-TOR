/* ---------- backup: compact text, "PP2z:" + base64(deflate(json)) ---------- */
/* metric columns in a backup row, in this order; new columns are only ever appended */
const MK=["pullups","weight","waist","sleep","sleepH","weightC","hrv","rhr","active","steps","ex","exP","exL"];
function pristine(p,doc){if(doc.done||doc.note||doc.date||(doc.xs&&doc.xs.length))return false;return p.ex.every(e=>{const a=doc.sets&&doc.sets[e.id];return !a||(a.length===e.sets&&a.every(x=>!x.d&&+x.v===e.target))})}
function pack(){
  const S={};
  Object.entries(state.sessions).forEach(([sid,doc])=>{const p=BYID[sid];if(!p||!doc||pristine(p,doc))return;
    S[(p.kind==="push"?"u":"l")+p.day]=[doc.done?1:0,doc.date?doc.date.replace(/-/g,"").slice(2):"",doc.note||"",
      p.ex.map(e=>{const a=doc.sets&&doc.sets[e.id];return a?a.map(x=>x.d?(+x.v||0):-(+x.v||0)-1):0})].concat(doc.xs&&doc.xs.length?[doc.xs]:[])});
  const M=Object.values(state.metrics).filter(m=>m.date).sort((x,y)=>x.date<y.date?-1:1).map(m=>{
    const r=[m.date.replace(/-/g,"").slice(2)].concat(MK.map(k=>m[k]??null));while(r.length>1&&r[r.length-1]==null)r.pop();return r});
  /* 带上高驰授权：换手机恢复进度后不用重新授权 */
  let tk = null;
  try{ tk = JSON.parse(localStorage.getItem("tracktor-coros-token") || "null"); }catch(e){}
  /* extra practice on days without a session: {date: [items]} */
  /* {date: items} or, when the day has a note, {date: [items, note]} */
  const DX={};Object.entries(state.dayx||{}).forEach(([d,doc])=>{if(!doc)return;
    const xs=doc.xs&&doc.xs.some(it=>it.sets.some(x=>x.d))?doc.xs:null, n=(doc.note||"").trim()?doc.note:"";
    if(n)DX[d]=[xs||[],n];else if(xs)DX[d]=xs});
  return {v:4,s:S,m:M,g:state.settings,d:state.diet,tk,dx:DX};
}
function unpack(j){
  const sessions={},metrics={};const d6=t=>t?"20"+t.slice(0,2)+"-"+t.slice(2,4)+"-"+t.slice(4,6):null;
  Object.entries(j.s||{}).forEach(([k,v])=>{const sid=(k[0]==="u"?"push-":"pull-")+pad(+k.slice(1));const p=BYID[sid];if(!p)return;
    const doc={sid,done:!!v[0],date:d6(v[1]),note:v[2]||"",sets:{}};
    p.ex.forEach((e,i)=>{const a=v[3]&&v[3][i];doc.sets[e.id]=Array.isArray(a)?a.map(n=>n<0?{v:-n-1,d:false}:{v:n,d:true}):Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    if(!doc.note)delete doc.note;if(v[4])doc.xs=v[4];sessions[sid]=doc});
  (j.m||[]).forEach(r=>{const date=d6(r[0]);const m={date};MK.forEach((k,i)=>{if(r[i+1]!=null)m[k]=r[i+1]});metrics[date]=m});
  /* v4 keeps diet days directly; v3 had a separate ledger {days, coros, weights} */
  let diet=null;
  if((j.v||0)>=4)diet=j.d||{};else if(j.d){diet={};mergeLegacyDiet(metrics,diet,j.d)}
  const dayx=j.dx?Object.fromEntries(Object.entries(j.dx).map(([d,v])=>{
    const noted=Array.isArray(v)&&v.length===2&&typeof v[1]==="string"&&Array.isArray(v[0]);
    const doc={date:d,xs:noted?(v[0].length?v[0]:null):v};if(noted)doc.note=v[1];return [d,doc]})):null;
  return {sessions,metrics,diet,settings:j.g?Object.assign({},GDEF,j.g):null,extras:j.x||null,tk:j.tk||null,dayx};
}
const b64e=u=>{let s="";for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const b64d=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function encodeBackup(){
  const json=JSON.stringify(pack());
  if(window.CompressionStream){try{const st=new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));return "PP2z:"+b64e(new Uint8Array(await new Response(st).arrayBuffer()))}catch(e){}}
  return "PP2:"+json;
}
async function decodeBackup(text){
  text=text.trim().replace(/\s+/g,"");
  if(text.startsWith("PP2z:")){const st=new Blob([b64d(text.slice(5))]).stream().pipeThrough(new DecompressionStream("deflate-raw"));return unpack(JSON.parse(await new Response(st).text()))}
  if(text.startsWith("PP2:"))return unpack(JSON.parse(text.slice(4)));
  const j=JSON.parse(text); if(j&&j.app==="pushpull")return {sessions:j.sessions||{},metrics:j.metrics||{}};
  throw new Error("bad");
}
function backupFileName(){
  const d=new Date();
  const stamp=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"-"+pad(d.getHours())+pad(d.getMinutes());
  return T("推拉机进度","track-TOR-progress")+"-"+stamp+".txt";
}
/* iPhone 主屏应用不支持直接下载，走系统分享里的「存储到文件」；其他设备直接存到下载目录 */
document.getElementById("bkSave").addEventListener("click",async()=>{
  const name=backupFileName(), file=new File([await encodeBackup()],name,{type:"text/plain"});
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent);
  if(isIOS&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file]});markBackedUp();toast(T("进度文件已保存","Progress file saved"))}
    catch(e){if(!e||e.name!=="AbortError")toast(T("保存失败，请再试一次","Couldn't save — please try again"))}
    return;
  }
  const url=URL.createObjectURL(file), a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  markBackedUp();
  toast(T("已保存 "+name+"，在手机的「下载」文件夹","Saved "+name+" to your Downloads folder"));
});
let pendingImport=null;
async function stageImport(text){
  let j; try{j=await decodeBackup(text)}catch(e){toast(T("这不是有效的进度文件","Not a valid progress file"));return}
  pendingImport=j;
  const n=Object.values(j.sessions).filter(s=>s&&s.done).length, m=Object.keys(j.metrics).length;
  const dCount=j.diet?Object.keys(j.diet).length:0;
  const xCount=Object.values(j.sessions).filter(s=>s&&s.xs&&xSummary(s.xs)).length+(j.extras?Object.keys(j.extras).filter(d=>j.extras[d].some(it=>it.sets.some(x=>x.d))).length:0);
  const dTxt=(xCount?T("、"+xCount+" 次加练",", "+xCount+" extra practice logs"):"")+(dCount?T("、"+dCount+" 天饮食记录",", "+dCount+" days of diet logs"):"");
  document.getElementById("bkMsg").textContent=T("含 "+n+" 次完成训练、"+m+" 天身体数据"+dTxt+"，导入会覆盖当前进度。","Contains "+n+" finished sessions, "+m+" days of body data"+dTxt+". Importing overwrites current progress.");
  document.getElementById("bkConfirm").hidden=false;
}
document.getElementById("bkRead").addEventListener("click",()=>document.getElementById("bkFile").click());
document.getElementById("bkFile").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0];
  e.target.value="";
  if(!f)return;
  try{stageImport(await f.text())}catch(err){toast(T("读取文件失败","Couldn't read the file"))}
});
document.getElementById("bkPasteShow").addEventListener("click",()=>{const w=document.getElementById("bkPasteWrap");w.hidden=!w.hidden;if(!w.hidden)document.getElementById("bkPaste").focus()});
document.getElementById("bkPasteGo").addEventListener("click",()=>{const v=document.getElementById("bkPaste").value.trim();if(!v){toast(T("先粘贴进度文本","Paste the progress text first"));return}stageImport(v)});
document.getElementById("bkNo").addEventListener("click",()=>{pendingImport=null;document.getElementById("bkConfirm").hidden=true});
document.getElementById("bkYes").addEventListener("click",async()=>{
  if(!pendingImport)return;
  state.sessions=pendingImport.sessions;state.metrics=pendingImport.metrics;if(pendingImport.diet)state.diet=pendingImport.diet;  /* files without diet keep the current diet */
  if(pendingImport.settings)state.settings=pendingImport.settings;
  if(pendingImport.dayx)state.dayx=pendingImport.dayx;
  if(pendingImport.extras)moveDatedExtras(pendingImport.extras);
  initDiet();
  /* 这台设备已连接时保留现有授权，备份里的可能已经过期 */
  if(pendingImport.tk && !readCorosToken()){
    try{ localStorage.setItem("tracktor-coros-token", JSON.stringify(pendingImport.tk)); }catch(e){}
    connectMcp();
  }
  pendingImport=null;document.getElementById("bkConfirm").hidden=true;document.getElementById("bkPasteWrap").hidden=true;document.getElementById("bkPaste").value="";
  lsSave();
  openDays.clear();renderAll();toast(T("训练与饮食进度已导入","Progress imported"));
});

/* ---------- 每 5 天自动提醒备份进度（防浏览器清缓存丢数据） ---------- */
const BK_REMIND_K = LS + "-lastbackup";
function lastBackupTs(){ try{ return parseInt(localStorage.getItem(BK_REMIND_K)||"0",10)||0; }catch(e){ return 0; } }
function markBackedUp(){ try{ localStorage.setItem(BK_REMIND_K, String(Date.now())); }catch(e){} }
function backupRemindDue(){
  const t = lastBackupTs();
  if(!t){ markBackedUp(); return false; }   /* 第一次打开：从现在起算 5 天，不一上来就提醒 */
  const days = (Date.now() - t) / 864e5;
  return days >= 5;
}
function maybeRemindBackup(){
  try{
    if(!backupRemindDue()) return;
    /* 延迟到页面渲染稳定后弹提醒 */
    setTimeout(()=>{
      const mask = document.createElement("div");
      mask.className = "mask";
      mask.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${T("备份提醒","Backup reminder")}" style="max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <b style="font-size:16px">${T("该备份进度了","Time to back up")}</b>
          <button type="button" data-close class="iconbtn" aria-label="${T("关闭","Close")}">${CLOSE_ICON}</button>
        </div>
        <p class="sub" style="margin:0 0 12px">${T(
          "浏览器偶尔会清空本地数据。建议每 5 天备份一次：在「资料」里打开「备份进度」，保存进度文件，需要时选这个文件恢复。",
          "Browsers occasionally clear local data. Every 5 days or so, open Back up progress under Profile and save a progress file. Pick that file to restore."
        )}</p>
        <button id="bkRemindOk" type="button" class="btn" style="width:100%;background:var(--cta);font-size:15px;padding:12px">${T("确定","OK")}</button>
      </div>`;
      document.body.appendChild(mask);
      const close = ()=>{ mask.remove(); };
      mask.querySelector("[data-close]").addEventListener("click", close);
      mask.addEventListener("click", e=>{ if(e.target===mask) close(); });
      mask.querySelector("#bkRemindOk").addEventListener("click", close);
    }, 1200);
  }catch(e){}
}
/* 用户真正保存进度文件后，才记录已备份时间（见 bkSave 的监听） */
