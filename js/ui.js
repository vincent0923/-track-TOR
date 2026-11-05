/* ---------- screen-level UI: tabs, theme, language, effects (flame, fireworks), sound, fullscreen ---------- */
/* ---------- tabs ----------
   Level 1: Train / Charts / Profile. Charts has three views: Diet, Health (sleep, HRV, resting HR)
   and Strength (pull-ups, weight, waist: the body numbers you log yourself). Older installs saved "charts" for the old single chart view. */
const SUBS=["diet","health","strength"];
let dataSub="diet";
try{let t=localStorage.getItem(LS+"-sub");if(t==="charts")t="health";if(SUBS.includes(t))dataSub=t}catch(e){}
function setDataSub(sub){
  dataSub=sub;
  document.querySelectorAll(".subtabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.sub===sub));
  SUBS.forEach(k=>{document.getElementById("pane-"+k).hidden=k!==sub});
  if(sub==="diet"){renderDietAll();dietTabPull()}else renderData();
  try{localStorage.setItem(LS+"-sub",sub)}catch(e){}
}
function setTab(tab){
  document.body.dataset.tab=tab;
  document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.tab===tab)));
  ["train","data","me"].forEach(k=>{document.getElementById("pane-"+k).hidden=k!==tab});
  if(tab==="data")setDataSub(dataSub);
  if(tab==="train")renderTrain();
  if(tab==="me")renderData();
  try{localStorage.setItem(LS+"-tab",tab)}catch(err){}
}
document.querySelector(".subtabs").addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b)setDataSub(b.dataset.sub)});
document.querySelector("nav.tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)setTab(b.dataset.tab)});

/* ---------- theme (manual, does not follow the phone) ---------- */
const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);const b=document.getElementById("themeBtn");b.innerHTML=t==="dark"?SUN:MOON;b.setAttribute("aria-label",t==="dark"?T("切换浅色主题","Light theme"):T("切换深色主题","Dark theme"));try{localStorage.setItem(LS+"-theme",t)}catch(e){}}
let theme="light";try{theme=localStorage.getItem(LS+"-theme")||"light"}catch(e){}
applyTheme(theme);
function applyLang(l){LANG=l;document.documentElement.setAttribute("data-lang",l);document.documentElement.lang=l==="en"?"en":"zh-CN";
  document.getElementById("langBtn").textContent=l==="en"?"EN":"CH";try{localStorage.setItem(LS+"-lang",l)}catch(e){}}
applyLang(LANG);
document.getElementById("langBtn").addEventListener("click",()=>{applyLang(LANG==="en"?"zh":"en");applyTheme(document.documentElement.getAttribute("data-theme")||"light");renderAll();renderDietAll();paintSheetLang();syncUI()});
document.getElementById("themeBtn").addEventListener("click",()=>applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"));

/* particle flames above an element: the 练 button burns at full size (orange); today's cell on the training
   calendar burns at half size in green. k scales size, height and density. */
function flameOn(sel,k,green){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const cv=document.createElement("canvas");cv.className="flame";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const c=cv.getContext("2d"), dpr=Math.min(2,window.devicePixelRatio||1), PADX=22*k, UP=78*k, DOWN=10;
  let parts=[], last=performance.now(), cw=0, ch=0;
  function size(w,h){if(w!==cw||h!==ch){cw=w;ch=h;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+"px";cv.style.height=h+"px"}}
  function spawn(bw,ember){
    const u=(Math.random()+Math.random())/2;            /* denser toward the middle */
    const x=PADX+6*k+u*(bw-12*k), base=UP+2;
    if(ember)return parts.push({x,y:base,vx:(Math.random()-.5)*.6*k,vy:-(0.5+Math.random()*0.425)*k,age:0,life:55+Math.random()*45,r:(.6+Math.random()*.5)*Math.max(k,.7),ember:1,seed:Math.random()*9});
    const mid=1-Math.abs(u-.5)*1.6;                       /* taller flames in the middle */
    parts.push({x,y:base+Math.random()*4*k,vx:(Math.random()-.5)*.5*k,vy:-(0.245+Math.random()*0.315)*(0.7+mid*0.6)*k,age:0,life:26+Math.random()*22*(0.6+mid),r:(1.225+Math.random()*1.4*(0.6+mid))*Math.max(k,.7),seed:Math.random()*9});
  }
  function col(t,a){ /* white-hot core -> flame colour -> deep edge */
    if(green){
      if(t<.12)return "rgba(225,255,215,"+a+")";
      if(t<.38)return "rgba(130,240,150,"+a+")";
      if(t<.7)return "rgba(60,200,110,"+a+")";
      return "rgba(20,120,70,"+a*.8+")";
    }
    if(t<.12)return "rgba(255,236,150,"+a+")";
    if(t<.38)return "rgba(255,178,40,"+a+")";
    if(t<.7)return "rgba(255,112,24,"+a+")";
    return "rgba(196,40,12,"+a*.8+")";
  }
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(2.5,(now-last)/16.7);last=now;
    const b=document.querySelector(sel);
    const r=b&&b.getBoundingClientRect();
    const nav=document.querySelector("nav.tabs"), nb=nav?nav.getBoundingClientRect().bottom:0;
    /* hidden, off screen, or slid under the sticky tab bar: no flames */
    if(!r||!r.width||document.hidden||r.top<nb-2||r.top>innerHeight){if(cw){c.clearRect(0,0,cv.width,cv.height)}parts=[];return}
    const w=Math.round(r.width+PADX*2), h=Math.round(UP+r.height+DOWN);
    size(w,h);cv.style.transform="translate("+Math.round(r.left-PADX)+"px,"+Math.round(r.top-UP)+"px)";
    let n=3.2*k*dt;while(n>0){if(Math.random()<n)spawn(r.width,false);n--}
    if(Math.random()<0.07*k*dt)spawn(r.width,true);
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.globalCompositeOperation="lighter";
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];
      p.age+=dt;const t=p.age/p.life;if(t>=1){parts.splice(i,1);continue}
      p.vx+=(Math.random()-.5)*.12*k*dt+Math.sin(now*.004+p.seed)*.02*k*dt;p.vx*=Math.pow(.95,dt);
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy*=Math.pow(p.ember?.995:.985,dt);
      if(p.ember){const a=(1-t)*.95;c.fillStyle=green?"rgba(170,"+Math.round(255-t*60)+",160,"+a+")":"rgba(255,"+Math.round(200-t*90)+",70,"+a+")";c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();continue}
      const rad=p.r*(1-t*.7), a=Math.pow(1-t,1.4)*.4;
      c.save();c.translate(p.x,p.y);c.scale(.75,1.6);
      const g=c.createRadialGradient(0,0,0,0,0,rad);g.addColorStop(0,col(t,a));g.addColorStop(1,col(t,0));
      c.fillStyle=g;c.beginPath();c.arc(0,0,rad,0,7);c.fill();c.restore();
    }
    c.globalCompositeOperation="source-over";
  }
  requestAnimationFrame(frame);
}
flameOn(".tbtn.next",1,false);
flameOn("#pane-train .cald.today",.5,true);
/* fireworks: one shared overlay canvas; fireworks(n, big) queues n normal rockets and then `big` large ones.
   Calls stack (ticking quickly just adds rockets to the same show). The canvas is removed when the sky is empty. */
const FW=(function(){
  const COLS=["#FFD34E","#FF9A1F","#F2541B","#43C08A","#7393F2","#A58CF0","#FF6FA8","#2BB3E0"];
  let cv=null,c=null,W=0,H=0,dpr=1,rockets=[],sparks=[],running=false,nextAt=0;
  const pick=()=>COLS[Math.floor(Math.random()*COLS.length)];
  function ensure(){
    dpr=Math.min(2,window.devicePixelRatio||1);
    if(!cv){cv=document.createElement("canvas");cv.className="fw";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);c=cv.getContext("2d");W=0}
    if(W!==innerWidth||H!==innerHeight){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}
  }
  function add(n,big){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    ensure();
    const now=performance.now(), gap=n>=6?150:230;
    let t=Math.max(now,nextAt);
    for(let i=0;i<n;i++){rockets.push(mk(t+Math.random()*90,false));t+=gap}
    if(big){t+=n?380:0;for(let i=0;i<big;i++){rockets.push(mk(t,true));t+=700}}
    nextAt=t;
    if(!running){running=true;requestAnimationFrame(frame)}
  }
  function mk(at,big){return {at,big,x:W*(big?0.3+Math.random()*0.4:0.12+Math.random()*0.76),y:H,ty:H*(big?0.14+Math.random()*0.1:0.18+Math.random()*0.3),vy:0,fired:false,done:false,col:pick()}}
  function burst(r){
    const n=r.big?230:60+Math.floor(Math.random()*30), col2=pick(), col3=pick();
    for(let k=0;k<n;k++){
      const a=Math.PI*2*k/n+Math.random()*0.2;
      const s=r.big?(k%2?2.6+Math.random()*2.2:4.6+Math.random()*2.6):2+Math.random()*3.2;
      sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:r.big?0.007+Math.random()*0.006:0.012+Math.random()*0.012,
        sz:r.big?2.2:1.6,col:r.big?(k%3===0?col2:k%3===1?col3:r.col):(k%3?r.col:col2),tw:r.big&&Math.random()<.35})
    }
    document.dispatchEvent(new CustomEvent("fwburst",{detail:{big:r.big}}));
  }
  function frame(now){
    c.globalCompositeOperation="destination-out";c.fillStyle="rgba(0,0,0,.22)";c.fillRect(0,0,W,H);
    c.globalCompositeOperation="source-over";
    rockets.forEach(r=>{
      if(r.done||now<r.at)return;
      if(!r.fired){r.fired=true;r.vy=-Math.sqrt(2*0.16*(H-r.ty))}
      r.y+=r.vy;r.vy+=0.16;
      c.fillStyle=r.col;c.beginPath();c.arc(r.x,r.y,r.big?3.4:2.2,0,7);c.fill();
      if(r.vy>=0){r.done=true;burst(r)}
    });
    rockets=rockets.filter(r=>!r.done);
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];
      p.x+=p.vx;p.y+=p.vy;p.vx*=0.985;p.vy=p.vy*0.985+0.05;p.life-=p.decay;
      if(p.life<=0){sparks.splice(i,1);continue}
      const a=p.tw?p.life*(0.5+0.5*Math.sin(now*0.03+i)):p.life;
      c.globalAlpha=Math.max(0,a);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.sz+p.life*1.6,0,7);c.fill();c.globalAlpha=1}
    if(rockets.length||sparks.length)requestAnimationFrame(frame);
    else{running=false;nextAt=0;cv.remove();cv=null}
  }
  return {add};
})();
function fireworks(n,big){FW.add(n||0,big||0)}
/* set / exercise / day outcomes used for the fireworks */
function exDone(s,e){const a=s.sets[e.id]||[];return a.length>0&&a.every(x=>x.d)}
function exOver(s,e){const a=s.sets[e.id]||[];return a.length>e.sets||a.some(x=>x.d&&+x.v>e.target)}
document.getElementById("toTop").addEventListener("click",()=>{
  const smooth=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({top:0,behavior:smooth?"smooth":"auto"});
  const se=document.scrollingElement;if(se&&se!==document.documentElement)se.scrollTo({top:0,behavior:smooth?"smooth":"auto"});
});
function md(s){if(!s)return "";const p=s.split("-");return (+p[1])+"."+(+p[2])}
function dnum(s){const p=s.split("-");return Date.UTC(+p[0],+p[1]-1,+p[2])/864e5}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function numOrNull(v){if(v===""||v==null)return null;const n=Number(v);return isFinite(n)?n:null}
let toastT;
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}

/* ---------- sound: synthesised with Web Audio, no files ---------- */
(function(){
  let ctx=null, on=true;
  try{on=localStorage.getItem(LS+"-sound")!=="off"}catch(e){}
  const btn=document.getElementById("sndBtn");
  const ICON_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>';
  function paint(){btn.innerHTML=on?ICON_ON:ICON_OFF;btn.setAttribute("aria-label",on?T("关闭声音","Sound off"):T("打开声音","Sound on"));btn.setAttribute("aria-pressed",on)}
  paint();
  function ac(){
    if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C()}
    if(ctx.state==="suspended")ctx.resume();
    return ctx;
  }
  /* one short note: frequency, start offset (s), length (s), wave, peak volume, optional end frequency */
  function tone(f,at,len,type,vol,f2){
    const c=ac();if(!c)return;
    const t0=c.currentTime+(at||0), o=c.createOscillator(), g=c.createGain();
    o.type=type||"sine";o.frequency.setValueAtTime(f,t0);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+len);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol||0.2,t0+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+len);
    o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+len+0.02);
  }
  /* filtered noise burst, shaped like a page being turned */
  let noiseBuf=null;
  function noiseHit(len,f1,f2,vol,q,type,peak,at){
    const c=ac();if(!c)return;
    if(!noiseBuf){noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const t0=c.currentTime+(at||0), src=c.createBufferSource(), bp=c.createBiquadFilter(), g=c.createGain();
    src.buffer=noiseBuf;bp.type=type;bp.Q.value=q;
    bp.frequency.setValueAtTime(f1,t0);bp.frequency.exponentialRampToValueAtTime(f2,t0+len);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+len*peak);g.gain.exponentialRampToValueAtTime(0.0001,t0+len);
    src.connect(bp).connect(g).connect(c.destination);src.start(t0,Math.random()*0.5,len+0.02);
  }
  const S={
    tap:()=>noiseHit(0.09,2500,4500,0.3,0.7,"highpass",0.2),
    key:()=>tone(1500,0,0.025,"square",0.035),
    inc:()=>tone(880,0,0.06,"triangle",0.15,1180),
    dec:()=>tone(660,0,0.06,"triangle",0.15,470),
    tick:()=>{tone(784,0,0.09,"triangle",0.2);tone(1175,0.06,0.16,"triangle",0.2);tone(2350,0.06,0.12,"sine",0.05)},
    untick:()=>tone(440,0,0.09,"sine",0.12,330),
    exDone:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,i*0.07,0.22,"triangle",0.17))},
    finish:()=>{[523,659,784].forEach((f,i)=>tone(f,i*0.1,0.18,"triangle",0.2));
      [1047,1319,1568].forEach(f=>tone(f,0.32,0.7,"triangle",0.12));tone(262,0.32,0.7,"sine",0.18)},
    boom:()=>{tone(110,0,0.35,"sine",0.22,40);tone(1600,0.03,0.4,"triangle",0.03,700)},
    bigboom:()=>{tone(70,0,0.8,"sine",0.32,28);tone(140,0,0.5,"triangle",0.12,50);[0.18,0.3,0.45,0.6].forEach((t,i)=>tone(2200-i*250,t,0.25,"triangle",0.025,900))},
    swoosh:()=>noiseHit(0.22,600,3200,0.22,1.2,"bandpass",0.5),
    pop:()=>tone(420,0,0.07,"sine",0.25,900),
    click:()=>{tone(2200,0,0.012,"square",0.06);tone(900,0.012,0.02,"triangle",0.08)},
    chime:()=>{tone(988,0,0.25,"sine",0.14);tone(1319,0.09,0.35,"sine",0.12)},
    buzz:()=>{tone(180,0,0.12,"square",0.06);tone(150,0.13,0.16,"square",0.06)},
    trash:()=>{[0,.06,.13,.19].forEach(t=>noiseHit(0.07,1800,900,0.22,1.5,"bandpass",0.3,t));tone(150,0.24,0.12,"sine",0.2,70)},
    poof:()=>{noiseHit(0.28,3000,300,0.28,0.8,"lowpass",0.15);tone(300,0,0.18,"sine",0.12,90)},
    sword:()=>{noiseHit(0.16,1200,7000,0.35,2.5,"bandpass",0.6);tone(2637,0.13,0.5,"sine",0.06);tone(3951,0.13,0.4,"sine",0.035);tone(5274,0.14,0.25,"sine",0.02)},
    unsheathe:()=>{noiseHit(0.35,2000,9000,0.18,6,"bandpass",0.85);tone(3136,0.33,0.6,"triangle",0.05)},
    punch:()=>{tone(160,0,0.18,"sine",0.4,45);noiseHit(0.06,900,300,0.3,0.8,"lowpass",0.1)},
    charge:()=>{tone(220,0,0.45,"sawtooth",0.05,1760);tone(440,0,0.45,"sine",0.08,3520)},
    coin:()=>{tone(988,0,0.07,"square",0.07);tone(1319,0.07,0.32,"square",0.07)},
    levelup:()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,i*0.05,0.16,"square",0.05))},
    fanfare:()=>{[[392,0,.1],[392,.12,.1],[392,.24,.1],[523,.36,.5]].forEach(([f,t,l])=>{tone(f,t,l,"sawtooth",0.06);tone(f*2,t,l,"triangle",0.05)})},
    musicbox:()=>{[1047,1175,1319,1568,1760].forEach((f,i)=>tone(f,i*0.11,0.5,"sine",0.1))},
    sparkle:()=>{[2093,2637,3136,2349,2794,3520].forEach((f,i)=>tone(f,i*0.045,0.2,"sine",0.05))},
    sad:()=>{[392,370,349].forEach((f,i)=>tone(f,i*0.22,0.22,"triangle",0.12));tone(330,0.66,0.5,"triangle",0.12,300)},
    none:()=>{}
  };
  /* sound names, in the order the picker lists them */
  const SN={tap:["翻页声","Page flip"],key:["键盘滴","Key tick"],inc:["上扬","Rise"],dec:["下沉","Drop"],tick:["叮咚","Ding-dong"],untick:["泄气","Deflate"],
    exDone:["四连音","Four notes"],finish:["通关","Level clear"],boom:["烟花","Firework"],bigboom:["大烟花","Big firework"],swoosh:["嗖","Swoosh"],pop:["啵","Pop"],
    click:["咔哒","Click"],chime:["完成铃","Chime"],buzz:["嗡","Buzz"],
    trash:["揉纸丢掉","Crumple"],poof:["噗","Poof"],sword:["剑气","Sword slash"],unsheathe:["拔剑","Unsheathe"],punch:["重拳","Punch"],charge:["蓄力","Power up"],coin:["金币","Coin"],levelup:["升级","Level up"],fanfare:["号角","Fanfare"],musicbox:["八音盒","Music box"],sparkle:["星光","Sparkle"],sad:["失落","Wah-wah"],none:["无声","Silent"]};
  /* every kind of tap that makes a sound, its default sound, grouped as the settings panel shows them */
  const SFX=[
    [["训练","Training"],[["set","打勾完成一组","Tick a set","tick"],["exdone","一个动作的组全部完成","Last set of an exercise","exDone"],["untick","取消打勾","Untick a set","untick"],
      ["inc","次数 +","Reps +","inc"],["dec","次数 −","Reps −","dec"],["xtick","加练打勾","Tick an extra set","tick"],["xuntick","加练取消打勾","Untick an extra set","untick"],
      ["finish","完成今天的训练","Finish the day","finish"],["fw","烟花","Firework","boom"],["bigfw","大烟花","Big firework","bigboom"]]],
    [["切换和展开","Switch and fold"],[["tab1","切换一级标签","Main tabs","tap"],["tab2","切换图表里的页","Chart views","tap"],["fold","展开或折起面板","Fold or unfold","tap"],
      ["range","切换时间范围","Time range","tap"],["gap","点缺口卡片换天数","Gap tile period","tap"]]],
    [["记录","Logging"],[["open","打开记录窗口","Open a log window","tap"],["type","打字或输入数字","Typing","key"],["save","保存","Save","tap"],["close","取消或关闭窗口","Close","tap"],["del","删除","Delete","tap"]]],
    [["同步","Sync"],[["sync","开始同步或拉取","Start sync or pull","tap"],["syncok","同步完成","Sync done","none"],["syncfail","同步失败","Sync failed","none"]]],
    [["其他","Other"],[["sndon","打开声音","Sound on","tick"],["header","顶部小按钮","Top buttons","tap"],["other","其他按钮","Other buttons","tap"]]]
  ];
  /* ZzFX sounds join the list (js/zzfx.js); sparse arrays keep their holes as defaults */
  const ZZK=[];
  ZZ_SOUNDS.forEach(([k,zh,en,p])=>{ZZK.push(k);SN[k]=[zh,en];S[k]=()=>{const c=ac();if(c)zzPlay(c,k,p)}});
  /* and jsfxr sounds (js/sfxr.js) */
  const JFK=[];
  JF_SOUNDS.forEach(([k,zh,en,p])=>{JFK.push(k);SN[k]=[zh,en];S[k]=()=>{const c=ac();if(c)jfPlay(c,k,p)}});
  const SDEF={};SFX.forEach(g=>g[1].forEach(r=>{SDEF[r[0]]=r[3]}));
  const pickOf=id=>{const m=state.settings&&state.settings.sfx;const k=m&&m[id];return S[k]?k:SDEF[id]};
  function playRaw(k){if(on&&S[k])try{S[k]()}catch(e){}}
  function play(id){playRaw(pickOf(id))}
  window.sfx=play;
  document.addEventListener("fwburst",e=>play(e.detail&&e.detail.big?"bigfw":"fw"));
  btn.addEventListener("click",()=>{on=!on;try{localStorage.setItem(LS+"-sound",on?"on":"off")}catch(e){}paint();if(on)play("sndon")});
  /* which kind of tap an element is */
  function kindOf(el){
    if(el.closest("nav.tabs"))return "tab1";
    if(el.closest(".subtabs"))return "tab2";
    if(el.matches("summary"))return "fold";
    if(el.id==="dietGapTile")return "gap";
    if(el.matches("#syncBtn,#dsrcPull,#dietSyncBtn,[data-csync]"))return "sync";
    if(el.matches("[data-recsave],[data-dsave]"))return "save";
    if(el.matches("[data-close]"))return "close";
    if(el.matches("[data-del],[data-ddel],#ddelDayBtn,[data-act=rm],[data-xa=rmset]"))return "del";
    if(el.matches(".chedit,#dietAddBtn,[data-dedit],[data-rec]"))return "open";
    if(el.closest(".seg,.maseg,.rgseg"))return "range";
    if(el.closest(".hbtns"))return "header";
    return "other";
  }
  document.addEventListener("click",e=>{
    if(!on)return;
    const el=e.target.closest("button,summary,[data-act],[data-toggle]");
    if(!el||el===btn||el.closest("#sfxPanel"))return;
    const act=el.dataset&&el.dataset.act;
    const xa=el.dataset&&el.dataset.xa;
    if(xa==="tick")return play(el.closest(".set").classList.contains("ticked")?"xuntick":"xtick");
    if(xa==="inc"||xa==="dec")return play(xa);
    if(act==="tick"){
      const row=el.closest(".set"),box=row&&row.closest(".ex");
      setTimeout(()=>{
        if(!row.classList.contains("ticked")){play("untick");return}
        const all=box?[...box.querySelectorAll(".set")]:[];
        play(all.length&&all.every(r=>r.classList.contains("ticked"))?"exdone":"set");
      },0);
      return;
    }
    if(act==="inc")return play("inc");
    if(act==="dec")return play("dec");
    if(act==="finish")return play("finish");
    if(el.matches("input,textarea,select"))return;
    play(kindOf(el));
  });
  /* Profile › Sound effects: pick a sound for each kind of tap; Reset goes back to the defaults */
  const PLAY_I='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  function renderSfx(){
    const box=document.getElementById("sfxPanel");if(!box)return;
    const opt=k=>'<option value="'+k+'">'+T(SN[k][0],SN[k][1])+'</option>';
    const opts='<optgroup label="'+T("推拉机","track-TOR")+'">'+Object.keys(S).filter(k=>!ZZK.includes(k)&&!JFK.includes(k)).map(opt).join("")+'</optgroup>'
      +'<optgroup label="ZzFX">'+ZZK.map(opt).join("")+'</optgroup><optgroup label="jsfxr">'+JFK.map(opt).join("")+'</optgroup>';
    box.innerHTML=SFX.map(([g,rows])=>'<div class="sfxg"><h4>'+T(g[0],g[1])+'</h4>'+rows.map(([id,zh,en])=>
      '<div class="sfxr'+(pickOf(id)!==SDEF[id]?' changed':'')+'" data-sfx="'+id+'"><span>'+T(zh,en)+'</span><select aria-label="'+T(zh,en)+'">'+opts+'</select>'
      +'<button type="button" class="sfxp" aria-label="'+T("试听","Play")+'">'+PLAY_I+'</button></div>').join("")+'</div>').join("");
    box.querySelectorAll("[data-sfx]").forEach(r=>{r.querySelector("select").value=pickOf(r.dataset.sfx)});
  }
  window.renderSfx=renderSfx;
  document.addEventListener("change",e=>{
    const r=e.target.closest("#sfxPanel [data-sfx]");if(!r)return;
    const id=r.dataset.sfx,k=e.target.value,m=Object.assign({},state.settings.sfx||{});
    if(k===SDEF[id])delete m[id];else m[id]=k;
    state.settings.sfx=m;saveSettings();r.classList.toggle("changed",k!==SDEF[id]);
    const was=on;on=true;playRaw(k);on=was;
  });
  document.addEventListener("click",e=>{
    const p=e.target.closest("#sfxPanel .sfxp");
    if(p){const was=on;on=true;playRaw(p.parentNode.querySelector("select").value);on=was;return}
    if(e.target.closest("#sfxReset")){delete state.settings.sfx;saveSettings();renderSfx();toast(T("音效已恢复默认","Sounds back to default"))}
  });
  const fold=document.getElementById("foldSound");if(fold)fold.addEventListener("toggle",()=>{if(fold.open)renderSfx()});
  let last=0;
  document.addEventListener("input",e=>{
    if(!on||!e.target.matches("input:not([type=date]):not([type=checkbox]),textarea"))return;
    const n=performance.now();if(n-last<35)return;last=n;play("type");
  });
})();

/* ---------- fullscreen: its own button, left of the language button; nothing else triggers it ---------- */
(function(){
  const de=document.documentElement, btn=document.getElementById("fsBtn");
  const req=de.requestFullscreen||de.webkitRequestFullscreen, exit=document.exitFullscreen||document.webkitExitFullscreen;
  if(!req||!(document.fullscreenEnabled||document.webkitFullscreenEnabled)){btn.hidden=true;return}
  const ENTER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  const EXIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  function paint(){const f=isFs();btn.innerHTML=f?EXIT:ENTER;btn.setAttribute("aria-label",f?T("退出全屏","Exit full screen"):T("全屏","Full screen"));btn.setAttribute("aria-pressed",f)}
  paint();
  btn.addEventListener("click",()=>{
    try{
      if(isFs()){const r=exit&&exit.call(document);if(r&&r.catch)r.catch(()=>{})}
      else{const r=req.call(de,{navigationUI:"hide"});if(r&&r.catch)r.catch(()=>toast(T("这里不允许全屏","Full screen isn't allowed here")))}
    }catch(e){toast(T("这里不允许全屏","Full screen isn't allowed here"))}
  });
  document.addEventListener("fullscreenchange",paint);document.addEventListener("webkitfullscreenchange",paint);
  document.getElementById("langBtn").addEventListener("click",()=>setTimeout(paint,0));
})();

/* i pills (i | +): open and close the panel they name; + means it can open, − that it can close */
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-itoggle]"); if(!b) return;
  const p = document.getElementById(b.dataset.itoggle); if(!p) return;
  p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden));
  const r = b.querySelector(".dsrc-i-r"); if(r) r.textContent = p.hidden ? "+" : "−";
});

/* A progress fill on a button while its work runs. It is a feeling of progress, not a measurement:
   it starts slowly and speeds up (so it never seems to rush ahead and then stall), stops short of
   the end, and fills completely when the work ends, well or badly. */
async function withProgress(btn, work){
  const t0 = performance.now(), T = 6000;
  btn.dataset.prog = "1"; btn.style.setProperty("--p", "0%");
  const tick = setInterval(()=>{ const x = Math.min(1, (performance.now() - t0) / T); btn.style.setProperty("--p", (88 * x * x).toFixed(1) + "%"); }, 120);
  try{ return await work(); }
  finally{
    clearInterval(tick); btn.style.setProperty("--p", "100%");
    setTimeout(()=>{ delete btn.dataset.prog; btn.style.removeProperty("--p"); }, 650);
  }
}
