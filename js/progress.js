/* ---------- metrics ---------- */
function saveMetric(date,patch){
  const m=Object.assign({date},state.metrics[date]||{});
  Object.keys(patch).forEach(k=>{if(patch[k]!=null)m[k]=patch[k]});
  state.metrics[date]=m; lsSave();
}
/* pencil on a chart: enter one number for a chosen date; the disk saves and closes */
function openRecord(key){
  const def={pullups:{name:T("标准引体","Strict pull-ups"),unit:T("个","reps"),step:1,mode:"numeric"},
    weight:{name:T("体重","Weight"),unit:"kg",step:0.1,mode:"decimal"},
    waist:{name:T("腰围","Waist"),unit:"cm",step:0.1,mode:"decimal"}}[key];
  const m=document.createElement("div");
  m.className="mask";
  m.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="'+esc(def.name)+'" style="max-width:360px">'
    +'<h3><span>'+esc(def.name)+'</span><button class="iconbtn" type="button" data-close aria-label="'+T("取消","Cancel")+'">'+CLOSE_ICON+'</button></h3>'
    +'<div class="form-body"><label class="flabel">'+T("日期","Date")+'<input id="recDate" type="date" value="'+today()+'" max="'+today()+'"></label>'
    +'<label class="flabel">'+esc(def.name)+'（'+def.unit+'）<input id="recVal" type="number" inputmode="'+def.mode+'" min="0" step="'+def.step+'"></label></div>'
    +'<div class="row" style="justify-content:flex-end"><button class="btn recsave" type="button" data-recsave aria-label="'+T("保存并关闭","Save and close")+'" title="'+T("保存并关闭","Save and close")+'">'+SAVE_ICON+'</button></div></div>';
  document.body.appendChild(m);
  const dateEl=m.querySelector("#recDate"), valEl=m.querySelector("#recVal");
  const load=()=>{const r=state.metrics[dateEl.value];valEl.value=r&&r[key]!=null?r[key]:""};
  load();
  dateEl.addEventListener("change",load);
  m.querySelector("[data-close]").addEventListener("click",()=>m.remove());
  m.querySelector("[data-recsave]").addEventListener("click",()=>{
    const date=dateEl.value||today(), v=numOrNull(valEl.value), r=state.metrics[date];
    if(v!=null)saveMetric(date,{[key]:v});
    else if(r&&r[key]!=null){
      delete r[key];
      if(Object.keys(r).every(k=>k==="date"))delete state.metrics[date];
      lsSave();
    }
    m.remove();
    renderAll();
    toast(md(date)+T(" 的记录已保存"," saved"));
  });
  valEl.focus();
}
document.getElementById("pane-charts").addEventListener("click",e=>{const b=e.target.closest("[data-rec]");if(b)openRecord(b.dataset.rec)});
/* per-day numbers shown in the records table and charts; active/steps belong to the diet page */
const BODY_KEYS=["pullups","weight","weightC","waist","sleep","sleepH","hrv","rhr"];
let pendingDel=null;
document.getElementById("logBody").addEventListener("click",e=>{
  const b=e.target.closest("[data-del]"); if(!b) return;
  const d=b.dataset.del;
  if(pendingDel!==d){pendingDel=d;b.textContent=T("确认删除","Confirm");return}
  /* a record row is the body numbers of that day; COROS activity (used by the diet page) stays */
  const m=state.metrics[d];if(m){BODY_KEYS.forEach(k=>delete m[k]);if(Object.keys(m).every(k=>k==="date"||m[k]==null))delete state.metrics[d]}
  pendingDel=null; lsSave(); renderAll(); toast(md(d)+T(" 的记录已删除"," deleted"));
});

function series(key){return Object.values(state.metrics).filter(m=>m[key]!=null&&m.date).sort((a,b)=>a.date<b.date?-1:1).map(m=>({date:m.date,x:dnum(m.date),y:+m[key]}))}
/* weight: manual (weight) preferred, COROS snapshot (weightC) as fallback for the average */
function wtMerged(){return Object.values(state.metrics).filter(m=>m.date&&(m.weight!=null||m.weightC!=null)).sort((a,b)=>a.date<b.date?-1:1).map(m=>({date:m.date,x:dnum(m.date),y:+(m.weight??m.weightC)}))}
function wtDots(){const out=[];Object.values(state.metrics).filter(m=>m.date).forEach(m=>{
  if(m.weightC!=null&&m.weight==null)out.push({date:m.date,x:dnum(m.date),y:+m.weightC,c:"var(--muted)",tag:"COROS "});
  if(m.weight!=null)out.push({date:m.date,x:dnum(m.date),y:+m.weight,c:"var(--ok)",tag:T("手动 ","Manual ")});});
  return out.sort((a,b)=>a.x-b.x)}
/* latest single weight reading; a manual entry beats COROS on the same day */
function lastWeight(){const ms=Object.values(state.metrics).filter(m=>m.date&&(m.weight!=null||m.weightC!=null)).sort((a,b)=>a.date<b.date?1:-1);
  const m=ms[0];return m?{date:m.date,y:+(m.weight??m.weightC),src:m.weight!=null?"m":"c"}:null}
function avg7(pts,n=7){return pts.map(p=>{const w=pts.filter(q=>q.x<=p.x&&q.x>p.x-n);return {x:p.x,y:w.reduce((a,q)=>a+q.y,0)/w.length,date:p.date}})}
function niceTicks(lo,hi,n){const span=hi-lo||1;const raw=span/n;const mag=Math.pow(10,Math.floor(Math.log10(raw)));const st=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw);const a=Math.floor(lo/st)*st,b=Math.ceil(hi/st)*st;const out=[];for(let v=a;v<=b+1e-9;v+=st)out.push(+v.toFixed(4));return out}

const RANGE_DAYS=60;
function chart(el,pts,o){
  const xEnd=dnum(today());
  let xStart=xEnd-((o.range||RANGE_DAYS)-1);
  if(o.range===0){const all=pts.concat(o.line||[]).map(p=>p.x);xStart=all.length?Math.min(...all,xEnd-6):xEnd-6}
  pts=pts.filter(p=>p.x>=xStart&&p.x<=xEnd);
  if(o.line) o=Object.assign({},o,{line:o.line.filter(p=>p.x>=xStart&&p.x<=xEnd)});
  if(!pts.length){el.innerHTML='<div class="empty">'+T('还没有数据，完成训练、同步高驰或点右上角手写图标记录后会出现','No data yet — finish a session, sync COROS, or tap the pencil icon')+'</div>';return}
  const W=340,H=170,L=34,R=14,TP=12,B=24;
  let ys=pts.map(p=>p.y); if(o.line) ys=ys.concat(o.line.map(p=>p.y));
  let lo=Math.min(...ys),hi=Math.max(...ys);
  if(o.fixed){lo=Math.min(o.fixed[0],lo);hi=Math.max(o.fixed[1],hi)}
  else if(o.zero){lo=0;hi=Math.max(hi+1,4)} else {const pd=Math.max((hi-lo)*0.25,o.minPad);lo-=pd;hi+=pd}
  const ticks=o.fixed?o.ticks:o.zero?Array.from({length:hi+1},(_,i)=>i).filter(v=>hi<=6||v%2===0):niceTicks(lo,hi,3);
  lo=Math.min(lo,ticks[0]);hi=Math.max(hi,ticks[ticks.length-1]);
  const x0=xStart,x1=xEnd;
  const sx=x=>L+(x-x0)/(x1-x0)*(W-L-R), sy=y=>TP+(hi-y)/(hi-lo)*(H-TP-B);
  let g="";
  ticks.forEach(v=>{g+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+sy(v)+'" y2="'+sy(v)+'"/><text x="'+(L-6)+'" y="'+(sy(v)+4)+'" text-anchor="end">'+(o.dec?v.toFixed(o.dec):v)+'</text>'});
  const xmd=x=>{const d=new Date(x*864e5);return (d.getUTCMonth()+1)+"."+d.getUTCDate()};
  [0,1,2,3].map(k=>Math.round(xStart+(xEnd-xStart)*k/3)).forEach((x,i,a)=>{g+='<text x="'+sx(x)+'" y="'+(H-6)+'" text-anchor="'+(i===0?"start":i===a.length-1?"end":"middle")+'">'+xmd(x)+'</text>'});
  if(o.ref){const y=sy(o.ref);g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 4"/>'}
  const col=o.color;
  const main=o.line||pts;
  const path=main.map((p,i)=>(i?"L":"M")+sx(p.x).toFixed(1)+" "+sy(p.y).toFixed(1)).join(" ");
  if(!o.line){const area=path+" L"+sx(main[main.length-1].x).toFixed(1)+" "+(H-B)+" L"+sx(main[0].x).toFixed(1)+" "+(H-B)+" Z";g+='<path d="'+area+'" fill="'+col+'" fill-opacity=".10"/>'}
  g+='<path d="'+path+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
  pts.forEach((p,i)=>{const last=i===pts.length-1;g+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="'+(last?4.5:3)+'" fill="'+(p.c||(o.line?"var(--muted)":col))+'" fill-opacity="'+(p.c?.8:o.line?.55:1)+'"><title>'+(p.tag||"")+md(p.date)+'：'+p.y+o.unit+'</title></circle>'});
  const lp=main[main.length-1];
  g+='<circle cx="'+sx(lp.x)+'" cy="'+sy(lp.y)+'" r="5" fill="var(--surface)" stroke="'+col+'" stroke-width="2.4"/>';
  g+='<g class="xh" visibility="hidden"><line class="xh-l" y1="'+TP+'" y2="'+(H-B)+'"/><g class="xh-d"></g></g>';
  el.innerHTML='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+o.label+'">'+g+'</svg><div class="xtip" hidden></div>';
  scrub(el,{W,sx,sy,pts,line:o.line,col,o});
}
/* press and slide on a chart: a vertical line snaps to the nearest day with data and shows that day's values */
function scrub(el,c){
  const svg=el.querySelector("svg"), xh=svg.querySelector(".xh"), ln=svg.querySelector(".xh-l"), dots=svg.querySelector(".xh-d"), tip=el.querySelector(".xtip");
  const days=new Map();
  const slot=p=>{if(!days.has(p.x))days.set(p.x,{x:p.x,date:p.date,pts:[],avg:null});return days.get(p.x)};
  c.pts.forEach(p=>slot(p).pts.push(p));
  if(c.line)c.line.forEach(p=>{slot(p).avg=p.y});
  const list=[...days.values()].sort((a,b)=>a.x-b.x);
  if(!list.length)return;
  const raw=v=>String(+v), avgF=v=>(+v).toFixed(c.o.lineDec!=null?c.o.lineDec:(c.o.dec!=null?c.o.dec:1));
  let cur=null, hideT=null;
  function show(d){
    clearTimeout(hideT);
    if(cur!==d){cur=d;try{navigator.vibrate&&navigator.vibrate(4)}catch(e){}}
    const X=c.sx(d.x);ln.setAttribute("x1",X);ln.setAttribute("x2",X);
    let h="";
    if(d.avg!=null)h+='<circle cx="'+X+'" cy="'+c.sy(d.avg)+'" r="5.5" fill="var(--surface)" stroke="'+c.col+'" stroke-width="2.6"/>';
    d.pts.forEach(p=>{h+='<circle cx="'+X+'" cy="'+c.sy(p.y)+'" r="5" fill="'+(p.c||c.col)+'" stroke="var(--surface)" stroke-width="1.6"/>'});
    dots.innerHTML=h;xh.setAttribute("visibility","visible");
    const parts=[];
    if(c.line){
      /* each number takes the colour of what it belongs to: the average in the line colour, each reading in its dot colour */
      if(d.avg!=null)parts.push('<b style="color:'+c.col+'">'+avgF(d.avg)+c.o.unit+'</b>');
      d.pts.forEach(p=>parts.push('<b style="color:'+(p.c||'var(--muted)')+'">'+raw(p.y)+c.o.unit+'</b>'));
    }else d.pts.forEach(p=>parts.push('<b style="color:'+(p.c||c.col)+'">'+raw(p.y)+c.o.unit+'</b>'));
    tip.innerHTML='<span class="xtip-d">'+md(d.date)+'</span>'+parts.join('<span class="xtip-s">·</span>');
    tip.hidden=false;tip.classList.remove("fade");
    const r=svg.getBoundingClientRect(), px=X/c.W*r.width, w=tip.offsetWidth;
    tip.style.left=Math.max(0,Math.min(r.width-w,px-w/2))+"px";
  }
  function at(ev){
    const r=svg.getBoundingClientRect(), vx=(ev.clientX-r.left)/r.width*c.W;
    let best=list[0],bd=Infinity;list.forEach(d=>{const dd=Math.abs(c.sx(d.x)-vx);if(dd<bd){bd=dd;best=d}});
    show(best);
  }
  function hide(delay){clearTimeout(hideT);hideT=setTimeout(()=>{tip.classList.add("fade");
    hideT=setTimeout(()=>{xh.setAttribute("visibility","hidden");tip.hidden=true;cur=null},220)},delay)}
  let down=false;
  svg.addEventListener("pointerdown",e=>{down=true;try{svg.setPointerCapture(e.pointerId)}catch(err){}at(e)});
  svg.addEventListener("pointermove",e=>{if(down||e.pointerType==="mouse")at(e)});
  svg.addEventListener("pointerup",e=>{down=false;hide(e.pointerType==="mouse"?1500:1200)});
  svg.addEventListener("pointercancel",()=>{down=false;hide(0)});
  svg.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"&&!down)hide(300)});
  svg.addEventListener("contextmenu",e=>e.preventDefault());
}

/* every chart has its own range (7/30/90/all days) and moving average (3/7/14/30); Reset puts all back to 30 days + MA7 */
const CH_DEF={rg:30,ma:7}, CH_KEYS=["pull","wt","waist","sleep","hrv","rhr"];
let CH={};CH_KEYS.forEach(k=>CH[k]=Object.assign({},CH_DEF));
try{const j=JSON.parse(localStorage.getItem(LS+"-charts")||"null");if(j)CH_KEYS.forEach(k=>{if(j[k]){
  if([0,7,30,60,90].includes(+j[k].rg))CH[k].rg=+j[k].rg;if([7,14,30].includes(+j[k].ma))CH[k].ma=+j[k].ma}})}catch(e){}
function saveCH(){try{localStorage.setItem(LS+"-charts",JSON.stringify(CH))}catch(e){}}
document.addEventListener("click",e=>{
  const b=e.target.closest(".maline [data-rg],.maline [data-ma]");if(!b)return;
  const ch=b.closest(".maline").dataset.ch;if(!CH[ch])return;
  if(b.dataset.rg!=null)CH[ch].rg=+b.dataset.rg;else CH[ch].ma=+b.dataset.ma;
  saveCH();renderData();
});
document.getElementById("chReset").addEventListener("click",()=>{CH_KEYS.forEach(k=>CH[k]=Object.assign({},CH_DEF));saveCH();renderData();toast(T("图表已重置为 30 天 + MA7","Charts reset to 30 days + MA7"))});
function renderData(){
  const L=k=>T(CH[k].ma+"日均",CH[k].ma+"-day avg"), tag=k=>T("（MA"+CH[k].ma+"）"," (MA"+CH[k].ma+")");
  const pu=pullSeries();
  chart(document.getElementById("chPull"),pu,{color:"var(--pull)",range:CH.pull.rg,zero:true,dec:0,unit:T(" 个"," reps"),label:T("标准引体趋势","Pull-up trend")});
  document.getElementById("cvPull").textContent=pu.length?pu[pu.length-1].y+T(" 个"," reps"):"—";
  const wt=wtDots(), wa=avg7(wtMerged(),CH.wt.ma);
  chart(document.getElementById("chWt"),wt,{color:"var(--push)",line:wa,range:CH.wt.rg,lineLabel:L("wt"),minPad:0.4,dec:1,unit:" kg",label:T("体重与移动平均","Weight and moving average")});
  document.getElementById("cvWt").textContent=wa.length?wa[wa.length-1].y.toFixed(1)+" kg"+tag("wt"):"—";
  const wz=series("waist"), zma=avg7(wz,CH.waist.ma);
  chart(document.getElementById("chWaist"),wz,{color:"var(--ok)",line:zma,range:CH.waist.rg,lineLabel:L("waist"),minPad:0.5,dec:1,unit:" cm",label:T("腰围趋势","Waist trend")});
  document.getElementById("cvWaist").textContent=wz.length?wz[wz.length-1].y+" cm":"—";
  const sl=series("sleep"), sa=avg7(sl,CH.sleep.ma);
  chart(document.getElementById("chSleep"),sl,{color:"var(--sleep)",line:sa,range:CH.sleep.rg,lineLabel:L("sleep"),lineDec:0,fixed:[40,100],ticks:[40,55,70,85,100],ref:70,unit:T(" 分",""),label:T("睡眠评分与移动平均","Sleep score and moving average")});
  if(sl.length){const lt=sl[sl.length-1];document.getElementById("cvSleep").textContent=Math.round(sa[sa.length-1].y)+T("（MA"+CH.sleep.ma+"，"," (MA"+CH.sleep.ma+"; ")+(lt.date===today()?T("昨夜","last night"):md(lt.date))+" "+lt.y+T("）",")")}
  else document.getElementById("cvSleep").textContent="—";
  const hv=series("hrv"), hma=avg7(hv,CH.hrv.ma);
  chart(document.getElementById("chHrv"),hv,{color:"var(--pull)",line:hma,range:CH.hrv.rg,lineLabel:L("hrv"),minPad:3,lineDec:0,unit:" ms",label:T("HRV 与移动平均","HRV and moving average")});
  document.getElementById("cvHrv").textContent=hv.length?Math.round(hma[hma.length-1].y)+" ms"+tag("hrv"):"—";
  const rh=series("rhr"), rma=avg7(rh,CH.rhr.ma);
  chart(document.getElementById("chRhr"),rh,{color:"var(--push)",line:rma,range:CH.rhr.rg,lineLabel:L("rhr"),minPad:2,lineDec:0,unit:" bpm",label:T("静息心率与移动平均","Resting heart rate and moving average")});
  document.getElementById("cvRhr").textContent=rh.length?Math.round(rma[rma.length-1].y)+" bpm"+tag("rhr"):"—";
  document.querySelectorAll(".maline[data-ch]").forEach(row=>{const c=CH[row.dataset.ch];
    row.querySelectorAll("[data-rg]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.rg===c.rg));
    row.querySelectorAll("[data-ma]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.ma===c.ma))});
  const rows=Object.values(state.metrics).filter(m=>m.date&&BODY_KEYS.some(k=>m[k]!=null)).sort((a,b)=>a.date<b.date?1:-1);
  document.getElementById("logCount").textContent=rows.length?"("+rows.length+")":"";
  document.getElementById("logBody").innerHTML=rows.length?rows.map(m=>'<tr><td>'+md(m.date)+'</td><td>'+(m.pullups??"—")+'</td><td>'+(m.weight!=null?m.weight:m.weightC!=null?'<span style="color:var(--muted)">'+m.weightC+' C</span>':"—")+'</td><td>'+(m.waist??"—")+'</td><td>'+(m.sleep??"—")+'</td><td><button class="x" style="font-size:13px" data-del="'+m.date+'">'+T('删除','Delete')+'</button></td></tr>').join(""):'<tr><td colspan="6" class="empty">'+T('暂无记录','No records')+'</td></tr>';
}

function renderStats(){
  const cur=currentSid();
  document.getElementById("stNext").textContent=cur?SHORT(BYID[cur]):T("全部完成","All done");
  renderGoals();
}
/* ---------- goals ---------- */
const hM=()=>(+state.settings.h||H_FALLBACK)/100;
const bmi=w=>w/hM()/hM();
const IC={
  pullups:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18"/><path d="M8 4v4l2.5 3M16 4v4l-2.5 3"/><circle cx="12" cy="9.5" r="1.8"/><path d="M12 11.5v5M12 16.5l-2 4M12 16.5l2 4"/></svg>',
  waist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2.5c.9 2.6 1.3 5 1.4 7.5M17.5 2.5c-.9 2.6-1.3 5-1.4 7.5M7.9 15c0 2.3-.4 4.3-1.4 6.5M16.1 15c0 2.3.4 4.3 1.4 6.5"/><path d="M3 10.6l18-.6v4.6l-18 .6z"/><path d="M6 10.5v2M9 10.4v2.4M12 10.3v2M15 10.2v2.4M18 10.1v2" stroke-width="1.3"/></svg>',
  fat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.8 2.3-5 .2 1.6.9 2.6 2 3-.4-3 .3-5.6.7-8z"/></svg>',
  weight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a5 5 0 0 1 8 0"/><path d="M12 9.5l1.5-2"/></svg>'
};
function curWeight(){const a=avg7(wtMerged());return a.length?+a[a.length-1].y.toFixed(1):null}
function curWaist(){const z=series("waist");return z.length?z[z.length-1].y:null}
/* every new 2% step on any goal bar → big fireworks (3x a finished day). The highest step reached is
   remembered in this browser, so noise (weight going up and down) never celebrates the same step twice,
   and the first time a bar is seen it is recorded silently. */
const MS_KEY=LS+"-milestones";
let MS={};try{MS=JSON.parse(localStorage.getItem(MS_KEY)||"{}")||{}}catch(e){MS={}}
const GP={};
let msQueue=0;const msArmAt=performance.now()+4000;
function milestone(k,pct,name){
  const step=Math.floor(pct/2)*2;
  /* first time, or still loading (synced data can arrive a moment after the cached copy): record silently */
  if(MS[k]==null||performance.now()<msArmAt){if(MS[k]==null||step>MS[k]){MS[k]=step;try{localStorage.setItem(MS_KEY,JSON.stringify(MS))}catch(e){}}return}
  if(step<=MS[k])return;
  MS[k]=step;try{localStorage.setItem(MS_KEY,JSON.stringify(MS))}catch(e){}
  const delay=msQueue*1400;msQueue++;
  setTimeout(()=>{msQueue=Math.max(0,msQueue-1);fireworks(30,0);toast(name+T(" 进度达到 "," progress reached ")+step+"%")},600+delay);
}
const GOAL_KEYS=["pullups","waist","weight","fat"], GOAL_FIELD={pullups:"gP",waist:"gZ",weight:"gW",fat:"gF"};
function goalShowList(){const s=state.settings.goalShow;return Array.isArray(s)?GOAL_KEYS.filter(k=>s.includes(k)):GOAL_KEYS.slice()}
/* a goal's icon (or its "Set goal" link) takes you to that goal's box in the Goals panel */
function openGoalField(k){
  document.querySelector('[data-tab="data"]').click();setDataSub("charts");
  const f=document.getElementById("foldGoal");f.open=true;
  const inp=document.getElementById(GOAL_FIELD[k]);
  setTimeout(()=>{(inp||f).scrollIntoView({behavior:"smooth",block:"center"});if(inp)setTimeout(()=>{try{inp.focus({preventScroll:true})}catch(e){}},350)},60);
}
let PRIV=false;try{PRIV=localStorage.getItem(LS+"-priv")==="1"}catch(e){}
document.getElementById("goals").addEventListener("click",e=>{
  const sg=e.target.closest("[data-setgoal]");
  if(sg){openGoalField(sg.dataset.setgoal);return}
  if(!e.target.closest("[data-priv]"))return;
  PRIV=!PRIV;try{localStorage.setItem(LS+"-priv",PRIV?"1":"0")}catch(err){}
  renderGoals();
});
function renderGoals(){
  const st=state.settings, HT=+st.h||H_FALLBACK, wr=v=>(v/HT).toFixed(3), WL=T("腰高比","WHtR"), par=t=>T("（"+t+"）"," ("+t+")");
  const GOALS=[
    {k:"pullups",name:T("引体","Pull-ups"),target:+st.p>0?+st.p:null,unit:T("个","reps"),color:"var(--pull)",start:0},
    {k:"waist",name:T("腰围","Waist"),target:+st.z>0?+st.z:null,unit:"cm",color:"var(--ok)"},
    {k:"weight",name:T("体重","Weight"),target:+st.w>0?+st.w:null,unit:"kg",color:"var(--sleep)"},
    {k:"fat",name:T("减脂","Fat loss"),target:+st.fat>0?+st.fat:null,unit:"kg",color:"var(--cta)",start:0}
  ];
  /* the goals the user chose to show at the top (all by default); none = the whole card is hidden */
  const show=goalShowList();
  let h="";
  GOALS.filter(g=>show.includes(g.k)).forEach(g=>{
    let start=null,cur=null,curTxt="—";
    if(g.k==="fat"){
      /* fat burned so far: the calorie gap of every finished, fully logged day since the first log, at 7700 kcal per kg */
      const m=gapAllTime(); start=0;
      if(m){cur=+(m.s/7700).toFixed(2);curTxt=cur.toFixed(2)+" kg"}
    }else if(g.k==="weight"){
      const all=wtMerged(); if(all.length){start=all[0].y;const a=avg7(all);cur=+a[a.length-1].y.toFixed(1);
        curTxt=PRIV?"<small>BMI</small> "+bmi(cur).toFixed(1):cur.toFixed(1)+" kg <small>"+par("BMI "+bmi(cur).toFixed(1))+"</small>"}
    }else{
      const sr=g.k==="pullups"?pullSeries():series(g.k); if(g.start!=null)start=g.start; if(sr.length){if(g.start==null)start=sr[0].y;cur=sr[sr.length-1].y;curTxt=cur+" "+g.unit;
        if(g.k==="waist")curTxt=PRIV?"<small>"+WL+"</small> "+wr(cur):curTxt+" <small>"+par(WL+" "+wr(cur))+"</small>"}
    }
    let pct=0;
    const noT=g.target==null;
    if(!noT&&start!=null&&start!==g.target) pct=Math.max(0,Math.min(100,Math.round((cur-start)/(g.target-start)*100)));
    GP[g.k]={name:g.name,pct,ok:!noT&&start!=null&&cur!=null};
    if(!noT&&start!=null&&cur!=null)milestone(g.k,pct,g.name);
    const startTxt=start==null?"—":(g.k==="weight"?start.toFixed(1):start);
    const pv=g.k!=="pullups";
    const icon='<button type="button" class="gi" data-setgoal="'+g.k+'" aria-label="'+T('设定目标：','Set goal: ')+g.name+'">'+IC[g.k]+'</button>';
    const setBtn='<button type="button" class="gset" data-setgoal="'+g.k+'">'+T('设目标','Set goal')+'</button>';
    const range=noT
      ?(PRIV&&pv?'':T('起点 ','Start ')+startTxt+' → ')+setBtn
      :PRIV&&pv
      ?(g.k==="weight"?(start==null?"—":"BMI "+bmi(start).toFixed(1))+' → BMI '+bmi(g.target).toFixed(1):(start==null?"—":WL+" "+wr(start))+' → '+WL+' '+wr(g.target))
      :T('起点 ','Start ')+startTxt+T(' → 目标 ',' → Goal ')+g.target+' '+g.unit+(g.k==="weight"?par('BMI '+bmi(g.target).toFixed(1)):g.k==="waist"?par(WL+' '+wr(g.target)):'');
    h+='<div class="goal" style="--g:'+g.color+'">'+icon+'<div class="gb">'
      +'<div class="gh"><b>'+g.name+'</b><span class="gv">'+curTxt+'</span><span class="gp">'+(start==null||noT?"—":pct+"%")+'</span></div>'
      +'<div class="bar" role="progressbar" aria-label="'+g.name+T('进度',' progress')+'" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div>'
      +'<div class="gr">'+range+'</div></div></div>';
  });
  const box=document.getElementById("goals");
  box.hidden=!show.length;
  if(show.some(k=>k==="waist"||k==="weight"))h+='<button type="button" class="privbtn'+(PRIV?' on':'')+'" data-priv="1" aria-pressed="'+PRIV+'" aria-label="'+T('隐私模式','Privacy view')+'">'+(PRIV?EYE_OFF:EYE_ON)+'</button>';
  box.innerHTML=h;
  renderGoalPanel();
}
/* ---------- goal panel ---------- */
function scaleSvg(min,max,bands,cur,tgt,dec){
  const W=320,L=10,R=10,Y=24,BH=12,sx=v=>L+(Math.max(min,Math.min(max,v))-min)/(max-min)*(W-L-R);
  let g="",from=min;
  bands.forEach(b=>{g+='<rect x="'+sx(from)+'" y="'+Y+'" width="'+(sx(b.to)-sx(from))+'" height="'+BH+'" fill="'+b.c+'" fill-opacity=".55"/>';from=b.to});
  bands.slice(0,-1).forEach(b=>{g+='<text x="'+sx(b.to)+'" y="72" text-anchor="middle">'+b.to+'</text><line x1="'+sx(b.to)+'" x2="'+sx(b.to)+'" y1="'+(Y+BH)+'" y2="'+(Y+BH+4)+'" stroke="var(--muted)"/>'});
  const lx=x=>Math.max(30,Math.min(W-30,x));
  if(cur!=null){const x=sx(cur);g+='<path d="M'+(x-6)+' '+(Y-10)+'L'+(x+6)+' '+(Y-10)+'L'+x+' '+(Y-1)+'Z" fill="var(--ink)"/><text class="lab" x="'+lx(x)+'" y="'+(Y-13)+'" text-anchor="middle" style="fill:var(--ink)">'+T('当前 ','Now ')+cur.toFixed(dec)+'</text>'}
  if(tgt!=null){const x=sx(tgt);g+='<path d="M'+(x-6)+' '+(Y+BH+11)+'L'+(x+6)+' '+(Y+BH+11)+'L'+x+' '+(Y+BH+1)+'Z" fill="var(--ok)"/><text class="lab" x="'+lx(x)+'" y="'+(Y+BH+24)+'" text-anchor="middle" style="fill:var(--ok)">'+T('目标 ','Goal ')+tgt.toFixed(dec)+'</text>'}
  return '<svg viewBox="0 0 '+W+' 76" role="img">'+g+'</svg>';
}
function paintGoalShow(){
  const show=goalShowList();
  document.querySelectorAll("#goalShow [data-gshow]").forEach(b=>{const on=show.includes(b.dataset.gshow);b.setAttribute("aria-pressed",String(on));b.classList.toggle("on",on)});
}
function renderGoalPanel(){
  paintGoalShow();
  const st=state.settings, H=+st.h||H_FALLBACK;
  const lw=lastWeight();
  [["gS",st.sex],["gB",(st.b||"").slice(0,7)],["gH",st.h],["gCW",lw&&lw.y],["gP",st.p],["gF",st.fat],["gW",st.w],["gZ",st.z]].forEach(([id,v])=>{const el=document.getElementById(id);if(el&&document.activeElement!==el)el.value=v??""});
  document.getElementById("gCWsrc").textContent=lw?md(lw.date)+(lw.src==="c"?T(' · 高驰',' · COROS'):''):'';
  document.getElementById("gHsrc").innerHTML=st.hSrc==="manual"?T('手动填写','Entered manually')+(st.hC?' · <button type="button" id="gHreset">'+T('改用高驰 ','Use COROS ')+st.hC+'</button>':''):(st.hC&&st.h?T('来自高驰','From COROS'):'');
  const cw=curWeight(), cz=curWaist();
  const bT=+st.w>0?bmi(+st.w):null, bC=cw!=null?bmi(cw):null;
  document.getElementById("gWc").innerHTML='<b>BMI '+(bT!=null?bT.toFixed(1):'—')+'</b>'+T('当前 ','Now ')+(bC!=null?bC.toFixed(1)+T('（',' (')+cw.toFixed(1)+T(' kg 7 日均）',' kg 7-day avg)'):'—');
  document.getElementById("scBmi").innerHTML=scaleSvg(16,31,[{to:18.5,c:"var(--pull)"},{to:24,c:"var(--ok)"},{to:28,c:"var(--cta)"},{to:31,c:"var(--push)"}],bC,bT,1);
  const rT=+st.z>0?+st.z/H:null, rC=cz!=null?cz/H:null;
  document.getElementById("gZc").innerHTML='<b>'+T('腰高比 ','WHtR ')+(rT!=null?rT.toFixed(3):'—')+'</b>'+T('当前 ','Now ')+(rC!=null?rC.toFixed(3)+T('（',' (')+cz+T(' cm）',' cm)'):'—');
  document.getElementById("scWhtr").innerHTML=scaleSvg(0.4,0.66,[{to:0.5,c:"var(--ok)"},{to:0.6,c:"var(--cta)"},{to:0.66,c:"var(--push)"}],rC,rT,2);
}
/* closing a save panel saves it. Goals: blurring a focused field fires its change event, which stores the value.
   Records: deletions are already stored; a pending "confirm delete" is cancelled. */
function commitFold(d,quiet){
  const a=document.activeElement;
  if(a&&d.contains(a)&&a.blur)a.blur();
  if(d.id==="foldGoal"){saveSettings();if(!quiet)toast(T("目标已保存","Goals saved"))}
  else if(d.id==="foldMe"){saveSettings();meEye(false);if(!quiet)toast(T("资料已保存","Profile saved"))}
  else if(d.id==="foldLog"){
    if(pendingDel){pendingDel=null;renderAll()}
    if(!quiet)toast(T("记录已保存","Records saved"));
  }
}
function saveSettings(){lsSave()}
/* profile and goal fields: each input carries data-g with the settings key it edits */
function onSettingChange(e){
  const k=e.target.dataset.g;if(!k)return;const st=state.settings;
  if(k==="b"||k==="sex"){st[k]=e.target.value||null;saveSettings();renderAll();renderDietAll();return}
  const v=numOrNull(e.target.value);
  if(k==="cw"){if(v!=null&&v>=20&&v<=300){saveMetric(today(),{weight:+v.toFixed(1)});renderAll();renderDietAll()}else renderGoalPanel();return}
  if(k==="h"){if(v==null||v<100||v>230){st.h=st.hC||null;st.hSrc="coros"}else{st.h=v;st.hSrc="manual"}}
  else if(v==null)st[k]=null;            /* an emptied goal is unset */
  else if(v<=0){renderGoalPanel();return}
  else st[k]=v;
  saveSettings();renderGoals();renderDietAll();
}
document.getElementById("foldGoal").addEventListener("change",onSettingChange);
/* which goals the top card shows: tap a chip to show or hide that goal */
document.getElementById("goalShow").addEventListener("click",e=>{
  const b=e.target.closest("[data-gshow]");if(!b)return;
  const cur=goalShowList(),k=b.dataset.gshow;
  state.settings.goalShow=cur.includes(k)?cur.filter(x=>x!==k):GOAL_KEYS.filter(x=>x===k||cur.includes(x));
  saveSettings();renderGoals();
});
document.getElementById("foldMe").addEventListener("change",onSettingChange);
/* profile values stay blurred until the eye is opened or a field is touched; closing the panel blurs them again */
function meEye(on){
  const b=document.getElementById("meEye");
  document.getElementById("meFields").classList.toggle("hid",!on);
  b.innerHTML=on?EYE_ON:EYE_OFF;b.setAttribute("aria-pressed",on);b.setAttribute("aria-label",on?T("隐藏资料","Hide profile"):T("显示资料","Show profile"));
}
meEye(false);
document.getElementById("meEye").addEventListener("click",()=>meEye(document.getElementById("meFields").classList.contains("hid")));
document.getElementById("meFields").addEventListener("focusin",()=>meEye(true));
document.getElementById("foldMe").addEventListener("click",e=>{
  if(e.target.id!=="gHreset")return;state.settings.h=state.settings.hC;state.settings.hSrc="coros";saveSettings();renderGoals();
});
function renderAll(){renderStats();renderTrain();renderData()}
