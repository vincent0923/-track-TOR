/* ---------- screen-level UI: tabs, theme, language, effects (flame, fireworks), sound, fullscreen ---------- */
/* ---------- tabs ---------- */
/* the data tab holds two views; older installs that saved the diet tab open on the diet view */
let dataSub="diet";
try{const t=localStorage.getItem(LS+"-sub");if(t==="diet"||t==="charts")dataSub=t}catch(e){}
function setDataSub(sub){
  dataSub=sub;
  document.querySelectorAll(".subtabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.sub===sub));
  document.getElementById("pane-diet").hidden=sub!=="diet";
  document.getElementById("pane-charts").hidden=sub!=="charts";
  if(sub==="diet")renderDietAll();
  if(sub==="charts")renderData();
  try{localStorage.setItem(LS+"-sub",sub)}catch(e){}
}
document.querySelector(".subtabs").addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b)setDataSub(b.dataset.sub)});
document.querySelector("nav.tabs").addEventListener("click",e=>{
  const b=e.target.closest("[data-tab]"); if(!b) return;
  document.body.dataset.tab=b.dataset.tab;
  document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));
  ["train","data"].forEach(k=>{document.getElementById("pane-"+k).hidden=k!==b.dataset.tab});
  if(b.dataset.tab==="data")setDataSub(dataSub);
  if(b.dataset.tab==="train") renderTrain();
  try{localStorage.setItem(LS+"-tab",b.dataset.tab)}catch(err){}
});

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

(function(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const cv=document.createElement("canvas");cv.className="flame";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const c=cv.getContext("2d"), dpr=Math.min(2,window.devicePixelRatio||1), PADX=22, UP=78, DOWN=10;
  let parts=[], last=performance.now(), cw=0, ch=0;
  function size(w,h){if(w!==cw||h!==ch){cw=w;ch=h;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+"px";cv.style.height=h+"px"}}
  function spawn(bw,ember){
    const u=(Math.random()+Math.random())/2;            /* denser toward the middle */
    const x=PADX+6+u*(bw-12), base=UP+2;
    if(ember)return parts.push({x,y:base,vx:(Math.random()-.5)*.6,vy:-(0.5+Math.random()*0.425),age:0,life:55+Math.random()*45,r:.6+Math.random()*.5,ember:1,seed:Math.random()*9});
    const mid=1-Math.abs(u-.5)*1.6;                       /* taller flames in the middle */
    parts.push({x,y:base+Math.random()*4,vx:(Math.random()-.5)*.5,vy:-(0.245+Math.random()*0.315)*(0.7+mid*0.6),age:0,life:26+Math.random()*22*(0.6+mid),r:1.225+Math.random()*1.4*(0.6+mid),seed:Math.random()*9});
  }
  function col(t,a){ /* white-yellow core -> orange -> red -> faint smoke */
    if(t<.12)return "rgba(255,236,150,"+a+")";
    if(t<.38)return "rgba(255,178,40,"+a+")";
    if(t<.7)return "rgba(255,112,24,"+a+")";
    return "rgba(196,40,12,"+a*.8+")";
  }
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(2.5,(now-last)/16.7);last=now;
    const b=document.querySelector(".tbtn.next");
    const r=b&&b.getBoundingClientRect();
    const nav=document.querySelector("nav.tabs"), nb=nav?nav.getBoundingClientRect().bottom:0;
    /* hidden, off screen, or slid under the sticky tab bar: no flames */
    if(!r||!r.width||document.hidden||r.top<nb-2||r.top>innerHeight){if(cw){c.clearRect(0,0,cv.width,cv.height)}parts=[];return}
    const w=Math.round(r.width+PADX*2), h=UP+r.height+DOWN;
    size(w,h);cv.style.transform="translate("+Math.round(r.left-PADX)+"px,"+Math.round(r.top-UP)+"px)";
    let n=3.2*dt;while(n>0){if(Math.random()<n)spawn(r.width,false);n--}
    if(Math.random()<0.07*dt)spawn(r.width,true);
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.globalCompositeOperation="lighter";
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];
      p.age+=dt;const t=p.age/p.life;if(t>=1){parts.splice(i,1);continue}
      p.vx+=(Math.random()-.5)*.12*dt+Math.sin(now*.004+p.seed)*.02*dt;p.vx*=Math.pow(.95,dt);
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy*=Math.pow(p.ember?.995:.985,dt);
      if(p.ember){const a=(1-t)*.95;c.fillStyle="rgba(255,"+Math.round(200-t*90)+",70,"+a+")";c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();continue}
      const rad=p.r*(1-t*.7), a=Math.pow(1-t,1.4)*.4;
      c.save();c.translate(p.x,p.y);c.scale(.75,1.6);
      const g=c.createRadialGradient(0,0,0,0,0,rad);g.addColorStop(0,col(t,a));g.addColorStop(1,col(t,0));
      c.fillStyle=g;c.beginPath();c.arc(0,0,rad,0,7);c.fill();c.restore();
    }
    c.globalCompositeOperation="source-over";
  }
  requestAnimationFrame(frame);
})();
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
  function noiseHit(len,f1,f2,vol,q,type,peak){
    const c=ac();if(!c)return;
    if(!noiseBuf){noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const t0=c.currentTime, src=c.createBufferSource(), bp=c.createBiquadFilter(), g=c.createGain();
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
      [1047,1319,1568].forEach(f=>tone(f,0.32,0.7,"triangle",0.12));tone(262,0.32,0.7,"sine",0.18)}
  };
  S.boom=()=>{tone(110,0,0.35,"sine",0.22,40);tone(1600,0.03,0.4,"triangle",0.03,700)};
  S.bigboom=()=>{tone(70,0,0.8,"sine",0.32,28);tone(140,0,0.5,"triangle",0.12,50);[0.18,0.3,0.45,0.6].forEach((t,i)=>tone(2200-i*250,t,0.25,"triangle",0.025,900))};
  function play(k){if(on&&S[k])try{S[k]()}catch(e){}}
  document.addEventListener("fwburst",e=>play(e.detail&&e.detail.big?"bigboom":"boom"));
  btn.addEventListener("click",()=>{on=!on;try{localStorage.setItem(LS+"-sound",on?"on":"off")}catch(e){}paint();if(on)play("tick")});
  document.addEventListener("click",e=>{
    if(!on)return;
    const el=e.target.closest("button,summary,[data-act],[data-toggle]");
    if(!el||el===btn)return;
    const act=el.dataset&&el.dataset.act;
    const xa=el.dataset&&el.dataset.xa;
    if(xa==="tick")return play(el.closest(".set").classList.contains("ticked")?"untick":"tick");
    if(xa==="inc"||xa==="dec")return play(xa);
    if(act==="tick"){
      const row=el.closest(".set"),box=row&&row.closest(".ex");
      setTimeout(()=>{
        if(!row.classList.contains("ticked")){play("untick");return}
        const all=box?[...box.querySelectorAll(".set")]:[];
        play(all.length&&all.every(r=>r.classList.contains("ticked"))?"exDone":"tick");
      },0);
      return;
    }
    if(act==="inc")return play("inc");
    if(act==="dec")return play("dec");
    if(act==="finish")return play("finish");
    if(el.matches("input,textarea,select"))return;
    play("tap");
  });
  let last=0;
  document.addEventListener("input",e=>{
    if(!on||!e.target.matches("input:not([type=date]):not([type=checkbox]),textarea"))return;
    const n=performance.now();if(n-last<35)return;last=n;play("key");
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
