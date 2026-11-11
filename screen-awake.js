'use strict';
// A screen wake lock belongs to this visible page, never to an account or server.
(()=>{
 let lock=null,pending=false,enabled=true,active=true,lastAttempt=-Infinity;
 const button=()=>document.getElementById('screen-awake');
 const supported=()=>!!navigator.wakeLock?.request;
 function update(){const el=button();if(!el)return;el.disabled=!supported();el.setAttribute('aria-pressed',String(enabled));el.textContent=!supported()?'此瀏覽器不支援螢幕常亮':!enabled?'螢幕常亮：已關閉':lock&&!lock.released?'螢幕常亮：已啟用':'螢幕常亮：等待啟用';el.title='使用網站時保持螢幕開啟；切換到背景或離開網站會解除。系統省電設定可能限制此功能。'}
 async function release(){const old=lock;lock=null;update();if(old)try{await old.release()}catch{}}
 async function acquire(force=false){if(!supported()||!enabled||!active||document.visibilityState!=='visible'||pending||(lock&&!lock.released))return;if(!force&&Date.now()-lastAttempt<10000)return;pending=true;lastAttempt=Date.now();try{const next=await navigator.wakeLock.request('screen');if(!enabled||!active||document.visibilityState!=='visible'){await next.release();return}lock=next;next.addEventListener('release',()=>{if(lock===next){lock=null;update()}})}catch{/* A denied request must never interrupt lessons. Retry on later interaction. */}finally{pending=false;update()}}
 function start(){update();acquire(true);button()?.addEventListener('click',()=>{enabled=!enabled;if(enabled)acquire(true);else release();update()})}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')acquire(true);else release()});
 window.addEventListener('pagehide',()=>{active=false;release()});window.addEventListener('pageshow',()=>{active=true;acquire(true)});
 for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>acquire(),{passive:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
