/* ---------- jsfxr sounds ----------
   sfxr synth, ported from jsfxr (public domain, https://github.com/chr15m/jsfxr): renders one sound
   from its 23 parameters, in jsfxr's own order, to float samples at 44.1 kHz. */
const SFXR_ORDER=["wave_type","p_env_attack","p_env_sustain","p_env_punch","p_env_decay","p_base_freq","p_freq_limit","p_freq_ramp","p_freq_dramp","p_vib_strength","p_vib_speed","p_arp_mod","p_arp_speed","p_duty","p_duty_ramp","p_repeat_speed","p_pha_offset","p_pha_ramp","p_lpf_freq","p_lpf_ramp","p_lpf_resonance","p_hpf_freq","p_hpf_ramp"];
function sfxrRender(arr,rand){
  rand=rand||Math.random;
  const ps={};SFXR_ORDER.forEach((k,i)=>ps[k]=arr[i]||0);
  let period,periodMax,cutoff,periodMult,periodMultSlide,duty,dutySlide,arpMul,arpTime,sinceRepeat;
  const reset=()=>{sinceRepeat=0;period=100/(ps.p_base_freq*ps.p_base_freq+.001);periodMax=100/(ps.p_freq_limit*ps.p_freq_limit+.001);cutoff=ps.p_freq_limit>0;
    periodMult=1-Math.pow(ps.p_freq_ramp,3)*.01;periodMultSlide=-Math.pow(ps.p_freq_dramp,3)*1e-6;duty=.5-ps.p_duty*.5;dutySlide=-ps.p_duty_ramp*5e-5;
    arpMul=ps.p_arp_mod>=0?1-Math.pow(ps.p_arp_mod,2)*.9:1+Math.pow(ps.p_arp_mod,2)*10;arpTime=Math.floor(Math.pow(1-ps.p_arp_speed,2)*2e4+32);if(ps.p_arp_speed===1)arpTime=0};
  reset();
  const wave=ps.wave_type|0;
  let fltw=Math.pow(ps.p_lpf_freq,3)*.1;const lpOn=ps.p_lpf_freq!=1,fltw_d=1+ps.p_lpf_ramp*1e-4;
  let fltdmp=5/(1+Math.pow(ps.p_lpf_resonance,2)*20)*(.01+fltw);if(fltdmp>.8)fltdmp=.8;
  let flthp=Math.pow(ps.p_hpf_freq,2)*.1;const flthp_d=1+ps.p_hpf_ramp*3e-4;
  const vibSpeed=Math.pow(ps.p_vib_speed,2)*.01,vibAmp=ps.p_vib_strength*.5;
  const envLen=[Math.floor(ps.p_env_attack*ps.p_env_attack*1e5),Math.floor(ps.p_env_sustain*ps.p_env_sustain*1e5),Math.floor(ps.p_env_decay*ps.p_env_decay*1e5)],punch=ps.p_env_punch;
  let flOff=Math.pow(ps.p_pha_offset,2)*1020;if(ps.p_pha_offset<0)flOff=-flOff;
  let flSlide=Math.pow(ps.p_pha_ramp,2);if(ps.p_pha_ramp<0)flSlide=-flSlide;
  const repeatTime=ps.p_repeat_speed===0?0:Math.floor(Math.pow(1-ps.p_repeat_speed,2)*2e4+32);
  const gain=Math.exp(.5)-1,OS=8;
  const noise=new Array(32);for(let i=0;i<32;i++)noise[i]=rand()*2-1;
  const flBuf=new Float32Array(1024);
  let fltp=0,fltdp=0,fltphp=0,stage=0,elapsed=0,vibPhase=0,phase=0,ipp=0;const out=[];
  for(let t=0;;++t){
    if(repeatTime!=0&&++sinceRepeat>=repeatTime)reset();
    if(arpTime!=0&&t>=arpTime){arpTime=0;period*=arpMul}
    periodMult+=periodMultSlide;period*=periodMult;
    if(period>periodMax){period=periodMax;if(cutoff)break}
    let rf=period;if(vibAmp>0){vibPhase+=vibSpeed;rf=period*(1+Math.sin(vibPhase)*vibAmp)}
    let ip=Math.floor(rf);if(ip<OS)ip=OS;
    duty+=dutySlide;if(duty<0)duty=0;if(duty>.5)duty=.5;
    if(++elapsed>envLen[stage]){elapsed=0;if(++stage>2)break}
    const envf=envLen[stage]?elapsed/envLen[stage]:0;const env=stage===0?envf:stage===1?1+(1-envf)*2*punch:1-envf;
    flOff+=flSlide;let iph=Math.abs(Math.floor(flOff));if(iph>1023)iph=1023;
    if(flthp_d!=0){flthp*=flthp_d;if(flthp<1e-5)flthp=1e-5;if(flthp>.1)flthp=.1}
    let sample=0;
    for(let si=0;si<OS;++si){
      let s=0;phase++;
      if(phase>=ip){phase%=ip;if(wave===3)for(let i=0;i<32;i++)noise[i]=rand()*2-1}
      const fp=phase/ip;
      if(wave===0)s=fp<duty?.5:-.5;
      else if(wave===1)s=fp<duty?-1+2*fp/duty:1-2*(fp-duty)/(1-duty);
      else if(wave===2)s=Math.sin(fp*2*Math.PI);
      else s=noise[Math.floor(phase*32/ip)];
      const pp=fltp;fltw*=fltw_d;if(fltw<0)fltw=0;if(fltw>.1)fltw=.1;
      if(lpOn){fltdp+=(s-fltp)*fltw;fltdp-=fltdp*fltdmp}else{fltp=s;fltdp=0}
      fltp+=fltdp;fltphp+=fltp-pp;fltphp-=fltphp*flthp;s=fltphp;
      flBuf[ipp&1023]=s;s+=flBuf[(ipp-iph+1024)&1023];ipp=(ipp+1)&1023;
      sample+=s*env;
    }
    const v=sample/OS*gain;out.push(v>1?1:v<-1?-1:v||0);
  }
  return out;
}

/* presets made with jsfxr's own preset rules (coin, laser, explosion, power-up, hurt, jump, select,
   synth, click) from a fixed seed, six of each; parameters left out are 0 */
const JF_SOUNDS=[
  ["jfpickupcoin1","金币 1","Coin 1",[1,,0.0174,0.3081,0.1588,0.7308,,,,,,,,,,,,,1]],
  ["jfpickupcoin2","金币 2","Coin 2",[1,,0.002,0.3645,0.3542,0.756,,,,,,0.4177,0.5938,,,,,,1]],
  ["jfpickupcoin3","金币 3","Coin 3",[1,,0.0717,0.4197,0.2919,0.8561,,,,,,0.235,0.652,,,,,,1]],
  ["jfpickupcoin4","金币 4","Coin 4",[1,,0.0826,0.5623,0.4161,0.8054,,,,,,0.588,0.5553,,,,,,1]],
  ["jfpickupcoin5","金币 5","Coin 5",[1,,0.0113,0.5791,0.2678,0.6553,,,,,,0.4315,0.5693,,,,,,1]],
  ["jfpickupcoin6","金币 6","Coin 6",[1,,0.0876,0.3026,0.1298,0.8797,,,,,,0.5457,0.6471,,,,,,1]],
  ["jflasershoot1","激光 1","Laser 1",[,,0.2973,0.0058,0.012,0.7548,0.2,-0.1699,,,,,,0.794,-0.4291,,,,1,,,0.276]],
  ["jflasershoot2","激光 2","Laser 2",[,,0.1995,,0.3523,0.5053,0.2,-0.1949,,,,,,0.726,-0.0382,,,,1,,,0.138]],
  ["jflasershoot3","激光 3","Laser 3",[,,0.2532,,0.2611,0.5363,0.2368,-0.3396,,,,,,0.1839,0.108,,,,1,,,0.0533]],
  ["jflasershoot4","激光 4","Laser 4",[2,,0.1358,,0.3027,0.5947,0.27,-0.2501,,,,,,0.1285,0.157,,,,1,,,0.1476]],
  ["jflasershoot5","激光 5","Laser 5",[1,,0.2813,0.0824,0.2664,0.5122,0.0085,-0.4026,,,,,,0.1705,0.064,,0.1562,-0.1011,1,,,0.1623]],
  ["jflasershoot6","激光 6","Laser 6",[,,0.2727,0.212,0.0898,0.9462,0.2007,-0.3136,,,,,,0.5474,-0.4463,,0.0419,-0.1084,1,,,0.0867]],
  ["jfexplosion1","爆破 1","Blast 1",[3,,0.3127,0.7831,0.2716,0.0449,,-0.3269,,0.3741,0.2648,,,,,,,,1]],
  ["jfexplosion2","爆破 2","Blast 2",[3,,0.3468,0.3268,0.328,0.4569,,-0.2457,,,,0.7117,0.8133,,,,-0.1357,-0.075,1]],
  ["jfexplosion3","爆破 3","Blast 3",[3,,0.1789,0.4107,0.1788,0.1457,,0.2529,,0.2803,0.4152,,,,,,,,1]],
  ["jfexplosion4","爆破 4","Blast 4",[3,,0.1715,0.4473,0.3852,0.1228,,-0.0148,,0.1809,0.0856,,,,,0.3704,,,1]],
  ["jfexplosion5","爆破 5","Blast 5",[3,,0.3262,0.7665,0.4204,0.3397,,,,0.4139,0.501,,,,,,,,1]],
  ["jfexplosion6","爆破 6","Blast 6",[3,,0.3474,0.5425,0.1758,0.1306,,-0.2761,,0.5621,0.4702,,,,,,0.0961,-0.1081,1]],
  ["jfpowerup1","升级 1","Power-up 1",[,,0.1533,,0.2253,0.2783,,0.1667,,,,,,0.1467,,,,,1]],
  ["jfpowerup2","升级 2","Power-up 2",[,,0.1413,,0.2549,0.2602,,0.278,,,,,,0.4461,,0.4079,,,1]],
  ["jfpowerup3","升级 3","Power-up 3",[,,0.3417,,0.4741,0.4832,,0.1488,,,,,,0.092,,,,,1]],
  ["jfpowerup4","升级 4","Power-up 4",[,,0.0809,,0.1119,0.2703,,0.4789,,,,,,0.4453,,0.7614,,,1]],
  ["jfpowerup5","升级 5","Power-up 5",[,,0.1942,,0.3846,0.3341,,0.1101,,,,,,0.1273,,,,,1]],
  ["jfpowerup6","升级 6","Power-up 6",[1,,0.3947,,0.3907,0.421,,0.196,,0.1467,0.1621,,,1,,,,,1]],
  ["jfhithurt1","受击 1","Hurt 1",[,,0.0649,,0.1487,0.4001,,-0.3424,,,,,,0.3153,,,,,1]],
  ["jfhithurt2","受击 2","Hurt 2",[,,0.0553,,0.2002,0.3991,,-0.3064,,,,,,0.0012,,,,,1,,,0.2497]],
  ["jfhithurt3","受击 3","Hurt 3",[1,,0.0518,,0.1739,0.7685,,-0.6868,,,,,,1,,,,,1,,,0.1669]],
  ["jfhithurt4","受击 4","Hurt 4",[1,,0.0547,,0.2019,0.2412,,-0.5179,,,,,,1,,,,,1,,,0.0251]],
  ["jfhithurt5","受击 5","Hurt 5",[3,,0.0902,,0.1418,0.578,,-0.3777,,,,,,,,,,,1]],
  ["jfhithurt6","受击 6","Hurt 6",[1,,0.0544,,0.1784,0.5419,,-0.5634,,,,,,1,,,,,1,,,0.2796]],
  ["jfjump1","弹跳 1","Bounce 1",[,,0.1549,,0.1109,0.4485,,0.2871,,,,,,0.0285,,,,,0.9177]],
  ["jfjump2","弹跳 2","Bounce 2",[,,0.3096,,0.1957,0.5993,,0.1176,,,,,,0.5862,,,,,0.8521,,,0.0104]],
  ["jfjump3","弹跳 3","Bounce 3",[,,0.2088,,0.1695,0.4109,,0.1172,,,,,,0.062,,,,,0.7984,,,0.2127]],
  ["jfjump4","弹跳 4","Bounce 4",[,,0.3243,,0.2147,0.3593,,0.2122,,,,,,0.4287,,,,,1,,,0.1653]],
  ["jfjump5","弹跳 5","Bounce 5",[,,0.2018,,0.2545,0.5488,,0.1957,,,,,,0.2308,,,,,0.8123,,,0.1196]],
  ["jfjump6","弹跳 6","Bounce 6",[,,0.3411,,0.1334,0.4536,,0.2306,,,,,,0.5874,,,,,1]],
  ["jfblipselect1","选择 1","Select 1",[,,0.1277,,0.1528,0.3565,,,,,,,,0.0068,,,,,1,,,0.1]],
  ["jfblipselect2","选择 2","Select 2",[,,0.1341,,0.0507,0.4433,,,,,,,,0.4893,,,,,1,,,0.1]],
  ["jfblipselect3","选择 3","Select 3",[,,0.1331,,0.1683,0.3673,,,,,,,,0.422,,,,,1,,,0.1]],
  ["jfblipselect4","选择 4","Select 4",[,,0.143,,0.0928,0.578,,,,,,,,0.4538,,,,,1,,,0.1]],
  ["jfblipselect5","选择 5","Select 5",[1,,0.1847,,0.012,0.2006,,,,,,,,1,,,,,1,,,0.1]],
  ["jfblipselect6","选择 6","Select 6",[,,0.1145,,0.1197,0.2779,,,,,,,,0.0051,,,,,1,,,0.1]],
  ["jfsynth1","合成音 1","Synth 1",[1,,0.3487,0.183,0.432,0.1362,,,,,,,0.6697,0.5588,0.4235,,,,0.1737,-0.2807,0.7511]],
  ["jfsynth2","合成音 2","Synth 2",[1,,0.2542,0.4893,0.2276,0.1926,,,,,,,0.56,0.8906,,,,,1,0.0551,0.1079,0.5729]],
  ["jfsynth3","合成音 3","Synth 3",[,,0.0668,0.445,0.6857,0.1926,,,,,,,0.7884,0.2813,,,,,0.1034,-0.6346,0.9983]],
  ["jfsynth4","合成音 4","Synth 4",[,0.0352,0.3627,0.6212,0.3715,0.1362,,,,,,,0.4915,0.5918,,,,,0.6022,-0.6094,0.2951]],
  ["jfsynth5","合成音 5","Synth 5",[,,0.3855,0.8891,0.1156,0.2723,,,,,,0.7454,0.8214,0.4736,,,,,0.117,0.3482,0.7439,0.5298]],
  ["jfsynth6","合成音 6","Synth 6",[,0.0337,0.0787,0.3078,0.5505,0.1362,,,,,,,0.6991,0.5363,,,,,0.3114,0.59,0.5671]],
  ["jfclick1","点击 1","Click 1",[1,,0.0172,,0.2951,0.9531,,-0.6836,,,,,,1,,,,,1,,,0.9291]],
  ["jfclick2","点击 2","Click 2",[3,0.1478,0.0386,,0.1544,0.9719,,-0.3815,,,,,,,,,,,1,,,0.9084]],
  ["jfclick3","点击 3","Click 3",[3,0.2804,0.0108,,0.0605,0.8614,,-0.345,,,,,,,,,,,1,,,0.9129]],
  ["jfclick4","点击 4","Click 4",[3,,0.1093,0.46,0.087,0.9271,,0.0887,,,,0.7822,0.6592,,,0.3192,-0.296,-0.0213,1,,,0.9172]],
  ["jfclick5","点击 5","Click 5",[,,0.0081,,0.1251,0.9078,,-0.3641,,,,,,0.1511,,,,,1,,,0.9098]],
  ["jfclick6","点击 6","Click 6",[3,,0.1832,0.7749,0.2733,0.8638,,0.3372,,,,-0.6075,0.8373,,,,0.46,-0.0723,1,,,0.9915]]
];
const jfCache={};
/* at: start delay in seconds; dest: where to play (default the speakers) */
function jfPlay(ctx,key,params,at,dest){
  let buf=jfCache[key];
  if(!buf){const b=sfxrRender(params);buf=jfCache[key]=ctx.createBuffer(1,b.length||1,44100);const d=buf.getChannelData(0);for(let i=0;i<b.length;i++)d[i]=b[i]*.35}
  const src=ctx.createBufferSource();src.buffer=buf;src.connect(dest||ctx.destination);src.start(ctx.currentTime+(at||0));
}
