/* ---------- ZzFX sounds ----------
   The player is ZzFX Micro by Frank Force (MIT, https://github.com/KilledByAPixel/ZzFX; licence in
   docs/ZZFX-LICENSE.txt), changed only to use the app's audio context and to cache each sound.
   The presets were made with the ZzFX designer's own preset rules (pickup, power-up, jump, shoot,
   blip, hit, explosion, note) from a fixed seed, plus the four samples in the ZzFX readme. */
const ZZ_SOUNDS=[
  ["zzpickup1","拾取 1","Pickup 1",[0.8,0,462,0.02,0.05,0.3,,2,2,105,396,0.09,0.06,,,,,0.55,0.02,,-892]],
  ["zzpickup2","拾取 2","Pickup 2",[0.8,0,685,0.02,0.09,0.25,5,1.45,-3,32,101,0.08,,,,0.1,,0.61,,,511]],
  ["zzpickup3","拾取 3","Pickup 3",[,0,418,0.01,0.08,0.23,1,3.2,,-1,,,,0.1,,,,0.75,0.02]],
  ["zzpickup4","拾取 4","Pickup 4",[,0,581,0.03,0.09,0.15,5,1.31,,177,427,0.1,0.05,,21,,,0.77,0.03]],
  ["zzpickup5","拾取 5","Pickup 5",[,0,686,,0.05,0.15,1,2.8,1,-1,,,,,,,,0.71,0.02]],
  ["zzpickup6","拾取 6","Pickup 6",[,0,212,0.02,0.03,0.29,5,1.1,7,,402,0.07,,0.4,,,,0.85,0.05]],
  ["zzpowerup1","强化 1","Powerup 1",[3.6,0,485,0.09,0.3,0.35,,0.6,,-45,-175,0.07,0.06,,1.1,,,0.6,0.15,0.19,683]],
  ["zzpowerup2","强化 2","Powerup 2",[0.5,0,668,0.09,0.13,0.09,5,0.91,,232,,,0.2,,,,,0.8,0.22,0.34,720]],
  ["zzpowerup3","强化 3","Powerup 3",[5,0,613,0.04,0.21,0.13,1,2.4,,,,,0.04,,,0.1,,0.7,0.25,0.26,-1105]],
  ["zzpowerup4","强化 4","Powerup 4",[1.2,0,292,0.05,0.1,0.16,1,0.3,,-12,,,0.16,,,,0.05,0.95,0.23]],
  ["zzpowerup5","强化 5","Powerup 5",[,0,522,0.04,0.19,0.22,1,3.7,,,214,0.09,0.02,,,,,0.73,0.25,,114]],
  ["zzpowerup6","强化 6","Powerup 6",[1.7,0,354,0.06,0.14,0.08,,3.9,,19,276,0.12,0.04,,,0.1,0.19,0.71,0.22,,359]],
  ["zzjump1","跳跃 1","Jump 1",[5,0,140,0.05,0.03,0.05,1,1.3,,56,,,,0.4,,,,0.65,0.02,,597]],
  ["zzjump2","跳跃 2","Jump 2",[0.6,0,150,0.05,0.02,0.07,5,0.75,,11,,,,0.8,,,,0.64,0.03,,886]],
  ["zzjump3","跳跃 3","Jump 3",[1.2,0,87,0.01,0.01,0.09,1,2.8,18,67,,,,,,0.1,,0.55,0.02]],
  ["zzjump4","跳跃 4","Jump 4",[1.2,0,95,,0.04,0.05,,0.2,,,,,,,,,,0.85]],
  ["zzjump5","跳跃 5","Jump 5",[0.5,0,329,0.03,0.03,0.07,5,1.54,17,13,,,,0.5,,,0.04,0.94,0.03,,365]],
  ["zzjump6","跳跃 6","Jump 6",[0.5,0,351,0.02,0.01,0.09,5,0.1,,160,,,,0.3,,,,0.58,0.02,,-1234]],
  ["zzshoot1","射击 1","Shoot 1",[1.3,0,138,0.02,0.09,0.09,5,1.3,-3,-47,,,0.14,0.5,49,0.2,0.22,0.82,0.06,,184]],
  ["zzshoot2","射击 2","Shoot 2",[2.1,0,146,,0.16,0.09,5,1.3,-10,-30,,,0.05,,,0.2,0.28,0.58,0.09,0.18]],
  ["zzshoot3","射击 3","Shoot 3",[,0,409,,0.09,0.08,,3.4,10,-47,,,,,5.6,,,0.65,0.05]],
  ["zzshoot4","射击 4","Shoot 4",[1.2,0,333,,0.04,0.09,1,1.1,-10,23,,,0.17,,,0.2,0.25,0.99,0.06,,-1424]],
  ["zzshoot5","射击 5","Shoot 5",[2,0,420,0.02,0.06,0.08,1,2.5,1,-1,,,,,,,0.22,0.64,0.07]],
  ["zzshoot6","射击 6","Shoot 6",[2,0,302,,0.01,0.09,1,2.2,-10,-15,,,0.19,,,0.1,0.23,0.94,0.07]],
  ["zzblip1","短哔 1","Blip 1",[2,0,329,,0.04,0.04,1,0.2,-37,3,,,,,,,,0.57,,,824]],
  ["zzblip2","短哔 2","Blip 2",[1.2,0,438,0.02,0.01,0.03,4,0.9,-65,1,-4,0.16,,,25,,,0.54,,0.12,-612]],
  ["zzblip3","短哔 3","Blip 3",[1.4,0,618,0.02,0.02,0.01,,1.8,-94,,,,,,,0.1,0.01,0.55,0.01,,508]],
  ["zzblip4","短哔 4","Blip 4",[1.3,0,47,,0.03,0.01,,0.1,,,,,,,325,,,0.91,,0.3]],
  ["zzblip5","短哔 5","Blip 5",[1.8,0,65,,,0.04,2,1.1,,,,,,0.1,,0.5,,0.66]],
  ["zzblip6","短哔 6","Blip 6",[1.5,0,478,0.03,0.03,0.01,1,1.9,-2,,,,,,,,0.03,0.7,0.02,,106]],
  ["zzhit1","击中 1","Hit 1",[2.3,0,359,0.01,0.09,0.18,2,1.5,-1,,,,0.1,1.8,3,0.3,0.13,0.47,0.05]],
  ["zzhit2","击中 2","Hit 2",[2.3,0,147,0.03,0.04,0.18,1,3.1,2,,,,,1.3,,0.4,0.08,0.7,0.1]],
  ["zzhit3","击中 3","Hit 3",[5,0,416,0.01,0.02,0.12,,1.7,,,,,,0.6,,0.4,0.11,,0.07,,-2463]],
  ["zzhit4","击中 4","Hit 4",[,0,147,0.02,,0.19,3,2.5,-1,,,,,0.7,,0.3,,0.87,0.07]],
  ["zzhit5","击中 5","Hit 5",[0.5,0,55,0.02,0.02,0.17,3,2.3,,,,,,0.6,,0.2,,0.86,0.01,,-2103]],
  ["zzhit6","击中 6","Hit 6",[1.7,0,44,0.02,0.02,0.18,,0.9,5,,,,0.01,1.6,,0.5,0.07,0.74,0.06,0.13]],
  ["zzexplosion1","爆炸 1","Explosion 1",[0.5,0,39,0.04,0.03,0.43,4,1.9,,,,,,0.3,,0.2,,0.39,0.09,,1353]],
  ["zzexplosion2","爆炸 2","Explosion 2",[0.6,0,62,0.02,0.01,0.21,5,0.28,,5,,,,0.1,43,0.4,,0.34,0.19,,155]],
  ["zzexplosion3","爆炸 3","Explosion 3",[2.5,0,62,0.09,0.1,0.43,2,1.7,7,5,,,0.07,0.5,,0.7,0.15,0.4,0.13,0.05]],
  ["zzexplosion4","爆炸 4","Explosion 4",[,0,91,0.05,0.18,0.4,4,3.8,,1,,,,0.7,,0.3,,0.45,0.11]],
  ["zzexplosion5","爆炸 5","Explosion 5",[,0,40,0.08,0.12,0.24,5,1.5,-7,,,,,1.1,,0.9,,0.45,0.14]],
  ["zzexplosion6","爆炸 6","Explosion 6",[0.9,0,43,0.07,0.1,0.46,4,0.8,,5,,,,,,0.9,,0.33,0.11,,-3025]],
  ["zzmusic1","音符 1","Music 1",[1.1,0,262,,0.48,0.37,1,2.6,,,,,0.12,0.2,,,,0.42,0.11,0.39,-1491]],
  ["zzmusic2","音符 2","Music 2",[1.3,0,131,0.17,0.49,0.3,2,0,,,,,,0.4,,0.1,0.01,0.39,0.04,,107]],
  ["zzmusic3","音符 3","Music 3",[2,0,65,0.12,0.25,0.4,,2.5,,,,,,,,,0.15,0.55,0.07,,-908]],
  ["zzmusic4","音符 4","Music 4",[0.7,0,65,0.02,0.33,0.14,2,2,,,,,0.13,0.1,,0.1,,0.96,0.19,0.27,211]],
  ["zzmusic5","音符 5","Music 5",[1.9,0,262,0.17,0.35,0.33,2,3.1,,,,,,0.3,,,0.13,0.33,0.07]],
  ["zzmusic6","音符 6","Music 6",[1.3,0,262,0.17,0.74,0.11,,2.2,,,,,0.31,0.2,,,,0.53,,0.2,-1190]],
  ["zzgameover","游戏结束","Game over",[,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17]],
  ["zzheart","爱心","Heart",[,,537,.02,.02,.22,1,1.59,-6.98,4.97]],
  ["zzpiano","钢琴","Piano",[1.5,.8,270,,.1,,1,1.5,,,,,,,,.1,.01]],
  ["zzdrum","鼓","Drum",[,,129,.01,,.15,,,,,,,,5]]
];
const zzCache={};
function zzBuild(volume=1,randomness=.05,frequency=220,attack=0,sustain=0,release=.1,shape=0,shapeCurve=1,slide=0,deltaSlide=0,pitchJump=0,pitchJumpTime=0,repeatTime=0,noise=0,modulation=0,bitCrush=0,delay=0,sustainVolume=1,decay=0,tremolo=0,filter=0){
  const sampleRate=44100;let PI2=Math.PI*2,abs=Math.abs,sign=v=>v<0?-1:1,startSlide=slide*=500*PI2/sampleRate/sampleRate,
    startFrequency=frequency*=(1+randomness*2*Math.random()-randomness)*PI2/sampleRate,modOffset=0,repeat=0,crush=0,jump=1,length,b=[],t=0,i=0,s=0,f,
    quality=2,w=PI2*abs(filter)*2/sampleRate,cos=Math.cos(w),alpha=Math.sin(w)/2/quality,a0=1+alpha,a1=-2*cos/a0,a2=(1-alpha)/a0,
    b0=(1+sign(filter)*cos)/2/a0,b1=-(sign(filter)+cos)/a0,b2=b0,x2=0,x1=0,y2=0,y1=0;
  attack=attack*sampleRate||9;decay*=sampleRate;sustain*=sampleRate;release*=sampleRate;delay*=sampleRate;
  deltaSlide*=500*PI2/sampleRate**3;modulation*=PI2/sampleRate;pitchJump*=PI2/sampleRate;pitchJumpTime*=sampleRate;repeatTime=repeatTime*sampleRate|0;volume*=.3;
  for(length=attack+decay+sustain+release+delay|0;i<length;b[i++]=s*volume){
    if(!(++crush%(bitCrush*100|0))){
      s=shape?shape>1?shape>2?shape>3?shape>4?(t/PI2%1<shapeCurve/2)*2-1:Math.sin(t**3):Math.max(Math.min(Math.tan(t),1),-1):1-(2*t/PI2%2+2)%2:1-4*abs(Math.round(t/PI2)-t/PI2):Math.sin(t);
      s=(repeatTime?1-tremolo+tremolo*Math.sin(PI2*i/repeatTime):1)*(shape>4?s:sign(s)*abs(s)**shapeCurve)*
        (i<attack?i/attack:i<attack+decay?1-((i-attack)/decay)*(1-sustainVolume):i<attack+decay+sustain?sustainVolume:i<length-delay?(length-i-delay)/release*sustainVolume:0);
      s=delay?s/2+(delay>i?0:(i<length-delay?1:(length-i)/delay)*b[i-delay|0]/2/volume):s;
      if(filter)s=y1=b2*x2+b1*(x2=x1)+b0*(x1=s)-a2*y2-a1*(y2=y1);
    }
    f=(frequency+=slide+=deltaSlide)*Math.cos(modulation*modOffset++);t+=f+f*noise*(i*i*PI2%2-1);
    if(jump&&++jump>pitchJumpTime){frequency+=pitchJump;startFrequency+=pitchJump;jump=0}
    if(repeatTime&&!(++repeat%repeatTime)){frequency=startFrequency;slide=startSlide;jump||=1}
  }
  return b;
}
function zzPlay(ctx,key,params){
  let buf=zzCache[key];
  if(!buf){const b=zzBuild(...params);buf=zzCache[key]=ctx.createBuffer(1,b.length||1,44100);buf.getChannelData(0).set(b)}
  const src=ctx.createBufferSource();src.buffer=buf;src.connect(ctx.destination);src.start();
}
