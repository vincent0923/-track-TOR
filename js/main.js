/* startup: runs after every other script has defined its functions */
lsLoad(); renderAll();
if(!lsOk)toast(T("这个浏览器不允许保存数据，请用 Chrome 打开，或常保存进度文件","This browser can't save data — open in Chrome, or save a progress file often"));
syncUI(); connectMcp(); handleCorosCallback();
/* first visit gets the welcome sheet; otherwise the 5-day backup reminder (not on the way back from COROS) */
if(FRESH && !/[?&]code=/.test(location.search)) showWelcome(); else maybeRemindBackup();
initDiet();
autoPullSheet();
/* reopen the tab the user was on (needs every pane's render functions, so it runs last) */
try{let t=localStorage.getItem(LS+"-tab");if(t==="diet")t="data";if(t){const b=document.querySelector('[data-tab="'+t+'"]');if(b)b.click()}}catch(e){}


let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("pwaInstallBtn");
  if(btn){
    btn.style.display = "inline-flex";
    btn.onclick = async () => {
      btn.style.display = "none";
      if(deferredPrompt){
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    };
  }
});
window.addEventListener("appinstalled", () => {
  const btn = document.getElementById("pwaInstallBtn");
  if(btn) btn.style.display = "none";
});

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
