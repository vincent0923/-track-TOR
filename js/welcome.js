/* ---------- 第一次打开：填几项个人资料和目标，都能留空，之后在「目标」里改 ---------- */
function showWelcome(){
  const ic = p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
  const fld = (id,zh,en,attrs)=>`<div class="field"><label for="${id}">${T(zh,en)}</label><input id="${id}" ${attrs}></div>`;
  const mask = document.createElement("div");
  mask.className = "mask";
  mask.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${T("欢迎","Welcome")}" style="max-width:480px;grid-template-rows:auto minmax(0,1fr) auto">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <b style="font-size:17px">👋 ${T("欢迎来到推拉机","Welcome to track-TOR")}</b>
      <button type="button" data-close class="iconbtn" aria-label="${T("关闭","Close")}">${CLOSE_ICON}</button>
    </div>
    <div style="overflow:auto;display:grid;gap:12px">
      <p class="sub" style="margin:0">${T("填几项，热量和目标进度才算得准。可以留空，以后在「数据 › 个人资料」和「目标」里改。","Fill in a few things so calories and goal progress are accurate. Anything can stay blank; change it later under Data › Profile and Goals.")}</p>
      <div class="mode-tabs" id="wSex" role="group" aria-label="${T("性别","Sex")}"><button type="button" data-v="m" style="font-size:22px;padding:4px" aria-label="${T("男","Male")}">♂</button><button type="button" data-v="f" style="font-size:22px;padding:4px" aria-label="${T("女","Female")}">♀</button></div>
      <div class="fgrid">
        ${fld("wB","出生年月","Birth month",'type="month"')}
        ${fld("wH","身高（cm）","Height (cm)",'type="number" inputmode="decimal" step="0.5"')}
        ${fld("wW0","现在体重（kg）","Weight now (kg)",'type="number" inputmode="decimal" step="0.1"')}
        ${fld("wP","目标引体（个）","Pull-up goal (reps)",'type="number" inputmode="numeric" step="1" min="1"')}
        ${fld("wW","目标体重（kg）","Target weight (kg)",'type="number" inputmode="decimal" step="0.5"')}
        ${fld("wZ","目标腰围（cm）","Target waist (cm)",'type="number" inputmode="decimal" step="0.5"')}
      </div>
    </div>
    <div style="display:grid;gap:8px">
      <button id="wGo" type="button" class="btn ibtn" style="width:100%;background:var(--cta);font-size:15px;padding:12px">${ic('<path d="M5 12l5 5L20 7"/>')}${T("开始","Start")}</button>
      <button id="wCoros" type="button" class="btn ghost ibtn" style="width:100%">${ic('<rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6V3h6v3M9 18v3h6v-3M12 10v2l1.5 1"/>')}${T("有高驰手表？连接后自动读取","Have a COROS watch? Connect to fill these in")}</button>
    </div>
  </div>`;
  document.body.appendChild(mask);
  const q = id=>mask.querySelector("#"+id);
  let sex = null;
  q("wSex").addEventListener("click", e=>{
    const b = e.target.closest("button[data-v]"); if(!b) return;
    sex = sex===b.dataset.v ? null : b.dataset.v;
    q("wSex").querySelectorAll("button").forEach(x=>x.classList.toggle("active", x.dataset.v===sex));
  });
  const save = ()=>{
    const st = state.settings, num = id=>{ const v = numOrNull(q(id).value); return v!=null && v>0 ? v : null; };
    if(sex) st.sex = sex;
    if(/^\d{4}-\d{2}$/.test(q("wB").value)) st.b = q("wB").value;
    const h = num("wH"); if(h!=null && h>=100 && h<=230){ st.h = h; st.hSrc = "manual"; }
    const p = num("wP"), w = num("wW"), z = num("wZ");
    if(p!=null) st.p = Math.round(p); if(w!=null) st.w = w; if(z!=null) st.z = z;
    const w0 = num("wW0"); if(w0!=null) saveMetric(today(), {weight: +w0.toFixed(1)});
    lsSave(); renderAll(); renderDietAll();
  };
  const close = ()=>mask.remove();
  q("wGo").addEventListener("click", ()=>{ save(); close(); });
  q("wCoros").addEventListener("click", ()=>{ save(); close(); promptCorosToken(); });
  /* closing without "Start" still counts as visited, so the sheet never comes back */
  mask.querySelector("[data-close]").addEventListener("click", ()=>{ lsSave(); close(); });
}
