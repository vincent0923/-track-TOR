const CLOSE_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const PENCIL_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 20h6"/></svg>';
const CALC_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/></svg>';
const SAVE_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>';
const EYE_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      EYE_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M2 2l20 20"/></svg>';
/* ---------- program ---------- */
const STRETCH = {id:"stretch",name:"拉伸",en:"Stretch",unit:"分钟",target:5,sets:1};
/* From push D5 / pull D5: no decline push-ups (no consistent bench height when travelling), diamonds 3 sets, wall sit 3 × 20 s on both days. */
const WALLSIT = {id:"wallsit",name:"靠墙静蹲",en:"Wall sit",unit:"秒",target:20,sets:3};
/* From push D4 / pull D3: every rep-based set is 5–12 reps, never above 12; volume grows by adding sets. */
function pushDay(d){
  const t = d<=5?0:d<=10?1:d<=15?2:3;
  if(d>=5) return [
    {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:[10,12,12,12][t],sets:[4,4,5,5][t],note:"稳、慢，姿势变形就停",noteEn:"Steady and slow; stop when form breaks"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,12][t],sets:3},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:12,sets:[4,5,5,6][t]},
    WALLSIT,
    STRETCH
  ];
  if(d>=4) return [
    {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:[10,12,12,12][t],sets:[4,4,5,5][t],note:"稳、慢，姿势变形就停",noteEn:"Steady and slow; stop when form breaks"},
    {id:"decline",name:"下斜俯卧撑",en:"Decline push-ups",unit:"个",target:[10,10,12,12][t],sets:[2,3,3,4][t],note:"髋下沉就停",noteEn:"Stop when hips sag"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,12][t],sets:[1,2,2,3][t]},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:12,sets:[4,5,5,6][t]},
    STRETCH
  ];
  const std = d<=3
    ? {id:"std",name:"标准俯卧撑",en:"Push-ups",unit:"个",target:20,sets:3,note:"第 2、3 组慢速",noteEn:"Sets 2–3 slow"}
    : {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:15,sets:3,note:"余 1–2 个或姿势变形就停",noteEn:"Stop 1–2 reps short or when form breaks"};
  return [
    std,
    {id:"decline",name:"下斜俯卧撑",en:"Decline push-ups",unit:"个",target:[12,15,15,18][t],sets:[2,2,3,3][t],note:"髋下沉就停",noteEn:"Stop when hips sag"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,15][t],sets:[1,2,2,2][t]},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:[15,20,20,25][t],sets:3},
    STRETCH
  ];
}
function pullDay(d){
  const t = d<=5?0:d<=10?1:d<=15?2:3;
  const list = [];
  if(d>=3) list.push({id:"pullup",name:"标准引体",en:"Strict pull-ups",unit:"个",target:[1,2,3,4][t],sets:[3,4,4,4][t],note:"第一个做；留 1 个余力，组间休息 2–3 分钟",noteEn:"Do first; leave 1 in reserve, rest 2–3 min between sets"});
  else if(t>=2) list.push({id:"pullup",name:"标准引体",en:"Strict pull-ups",unit:"个",target:[0,0,2,3][t],sets:3,note:"下巴过杠、手臂伸直才算",noteEn:"Chin over bar, arms straight"});
  list.push(
    {id:"row",name:"反向划船",en:"Inverted rows",unit:"个",target:d<=2?[10,12,12,15][t]:[10,12,12,12][t],sets:d<=2?3:[3,3,4,4][t],note:t>=2?"身体放更低":"第一组轻松就降 5cm",noteEn:t>=2?"Set your body lower":"Drop 5 cm if set 1 feels easy"},
    {id:"hang",name:"悬吊",en:"Dead hang",unit:"秒",target:[30,30,40,45][t],sets:[2,3,3,3][t]},
    {id:"ecc",name:"离心引体",en:"Negative pull-ups",unit:"个",target:[3,4,5,5][t],sets:3,note:"每个下放 "+[5,5,6,8][t]+" 秒",noteEn:"Lower over "+[5,5,6,8][t]+" s each"},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3}
  );
  if(d>=5) list.push(WALLSIT);
  list.push(STRETCH);
  return list;
}
const PROGRAM = [];
for(let d=1; d<=20; d++){
  PROGRAM.push({sid:"push-"+pad(d),kind:"push",day:d,label:"推练 D"+d,ex:pushDay(d)});
  PROGRAM.push({sid:"pull-"+pad(d),kind:"pull",day:d,label:"拉练 D"+d,ex:pullDay(d)});
}
const BYID = Object.fromEntries(PROGRAM.map(s=>[s.sid,s]));

/* ---------- storage layout ----------
   Everything lives in localStorage under the "tracktor-" prefix:
     tracktor-data   {sessions, metrics, diet, settings}: all the user's records in one place
     tracktor-<name> small preferences and flags (lang, theme, tab, lastbackup, ...)
     tracktor-coros-token / tracktor-coros-region: the COROS connection
   metrics[date] holds every per-day number: pullups, weight (manual), weightC (COROS), waist,
   sleep, sleepH, hrv, rhr, active and steps (COROS activity). diet[date] holds what was eaten. */
const LS = "tracktor", DATA_K = LS + "-data";

/* old backups and the old storage layout kept diet days, COROS activity and some weights in a
   separate ledger; fold it into metrics/diet. Existing values in metrics win. */
function mergeLegacyDiet(metrics, diet, legacy){
  if(!legacy) return;
  const day = d => metrics[d] || (metrics[d] = {date:d});
  Object.entries(legacy.days||{}).forEach(([d,v])=>{ if(v) diet[d] = v; });
  Object.entries(legacy.coros||{}).forEach(([d,c])=>{
    if(!c) return; const m = day(d);
    if(c.active!=null && m.active==null) m.active = +c.active;
    if(c.steps!=null && m.steps==null) m.steps = +c.steps;
  });
  Object.entries(legacy.weights||{}).forEach(([d,w])=>{
    if(!w || w.kg==null || w.kg==="") return; const m = day(d);
    if(w.source==="manual"){ if(m.weight==null) m.weight = +w.kg; }
    else if(m.weight==null && m.weightC==null) m.weightC = +w.kg;
  });
}
/* one-time move from the layout used up to v1.12a ("pushpull-v1*" keys plus a separate diet ledger).
   Old keys are removed only after the new copy is written and reads back. */
(function migrateStorage(){
  try{
    if(localStorage.getItem(DATA_K)) return;
    const old = JSON.parse(localStorage.getItem("pushpull-v1") || "null");
    const ledger = JSON.parse(localStorage.getItem("tracktor-diet-v1") || localStorage.getItem("diet_ledger_state_v2") || "null");
    const prefs = Object.keys(localStorage).filter(k=>k.startsWith("pushpull-v1-"));
    if(!old && !ledger && !prefs.length) return;
    if(old || ledger){
      const d = Object.assign({sessions:{}, metrics:{}, settings:{}}, old||{});
      d.metrics = d.metrics || {}; d.diet = d.diet || {};
      mergeLegacyDiet(d.metrics, d.diet, ledger);
      const txt = JSON.stringify(d);
      localStorage.setItem(DATA_K, txt);
      if(localStorage.getItem(DATA_K) !== txt) return;
    }
    prefs.forEach(k=>localStorage.setItem(LS + k.slice("pushpull-v1".length), localStorage.getItem(k)));
    ["pushpull-v1","tracktor-diet-v1","diet_ledger_state_v2","tracktor-diet-pruned-20261024"].concat(prefs).forEach(k=>localStorage.removeItem(k));
  }catch(e){}
})();

/* ---------- helpers ---------- */
function pad(n){return String(n).padStart(2,"0")}
let LANG="zh";try{LANG=localStorage.getItem(LS+"-lang")||"zh"}catch(e){}
const T=(zh,en)=>LANG==="en"?en:zh;
const N=e=>T(e.name,e.en), NS=e=>T(e.name.replace(/（.*）/,""),e.en.replace(/\s*\(.*\)/,"")), NOTE=e=>T(e.note,e.noteEn);
const U=u=>T(u,{"个":"reps","秒":"s","分钟":"min"}[u]||u);
const LAB=p=>T((p.kind==="push"?"推练":"拉练")+" D"+p.day,(p.kind==="push"?"Push":"Pull")+" D"+p.day);
const SHORT=p=>T((p.kind==="push"?"推":"拉")+"D"+p.day,(p.kind==="push"?"Push":"Pull")+" D"+p.day);
function today(){const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
/* date fields use the browser's native <input type="date"> picker: light, localized, and reliable. */
/* flame: particle fire rising off the top edge of the 练 button. One fixed canvas follows the button
   (it is re-rendered often), skips drawing while the button is off screen or hidden. */
/* ---------- state & storage ---------- */
/* nothing personal by default: the welcome sheet or a COROS sync fills these in */
const GDEF={h:null,hC:null,hSrc:"coros",w:null,z:null,p:null,b:null,sex:null};
const H_FALLBACK=170;
const state = {sessions:{}, metrics:{}, diet:{}, settings:Object.assign({},GDEF)};
/* diet page view state only; the diet records themselves are state.diet */
const dietState = { range:14, gw:7, open:new Set() };
const openDays = new Set();
/* first visit on this browser: nothing saved yet (read before anything writes) */
const FRESH = (()=>{try{return !localStorage.getItem(DATA_K)&&!localStorage.getItem("tracktor-coros-token")}catch(e){return false}})();
let lsOk = true;
function lsLoad(){
  let j=null;
  try{j=JSON.parse(localStorage.getItem(DATA_K)||"null")}catch(e){lsOk=false}
  if(j){state.sessions=j.sessions||{};state.metrics=j.metrics||{};state.diet=j.diet||{};state.settings=Object.assign({},GDEF,j.settings||{});
    /* a 0 sleep score was saved before the night was scored; drop it so the real score can arrive */
    let z=0;for(const [d,m] of Object.entries(state.metrics)){if(m.sleep===0){delete m.sleep;delete m.sleepH;z++;if(Object.keys(m).every(k=>k==="date"||m[k]==null))delete state.metrics[d]}}
    if(z)lsSave();
    if(j.extras&&moveDatedExtras(j.extras))lsSave();}
}
function lsSave(){
  try{localStorage.setItem(DATA_K,JSON.stringify(state));lsOk=true}catch(e){if(lsOk){lsOk=false;toast(T("这个浏览器不允许保存，请先保存进度文件","This browser can't save data — save a progress file now"))}}
}

async function loadTrainData(){
  lsLoad();
  renderAll();
}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}

function sessionDoc(sid){
  let s = state.sessions[sid];
  if(!s){
    const p = BYID[sid];
    s = {sid, done:false, date:null, sets:{}, mig:1};
    p.ex.forEach(e=>{s.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    state.sessions[sid]=s;
  }else{
    BYID[sid].ex.forEach(e=>{
      const arr=s.sets[e.id];
      /* an unfinished, unstarted exercise still holding a set above 12 reps predates the 5–12 rule: rebuild it */
      const stale=!s.mig&&arr&&!s.done&&e.unit==="个"&&!arr.some(x=>x.d)&&arr.some(x=>+x.v>12);
      if(!arr||stale)s.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    s.mig=1;   /* the 5–12 cleanup runs once; after that a value above 12 is the user's own choice */
    /* an unfinished day keeps only the exercises in its current plan (e.g. decline push-ups removed from D5 on) */
    if(!s.done){const keep=new Set(BYID[sid].ex.map(e=>e.id));Object.keys(s.sets).forEach(k=>{if(!keep.has(k))delete s.sets[k]})}
  }
  return s;
}
