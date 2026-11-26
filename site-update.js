'use strict';
(() => {
  if (window.top !== window.self) return;
  const current = document.querySelector('meta[name="studio-release"]')?.content;
  const pattern = /^[0-9a-f]{40}-[0-9]+-[0-9]+$/;
  if (!current || !pattern.test(current)) return;
  const [, run, attempt] = current.split('-').map((v,i) => i ? Number(v) : v);
  const base = new URL('.', location.href);
  let checking = false, busy = false, latest = null, dismissed = '', notice = null;
  const fresh = name => {
    const u = new URL(name, base);
    u.searchParams.set('_check', String(Date.now()) + '-' + Math.random().toString(36).slice(2));
    return u;
  };
  async function request(name) {
    const res = await fetch(fresh(name), {cache:'no-store', credentials:'same-origin', redirect:'error', signal:AbortSignal.timeout(8000)});
    if (!res.ok) throw Error('Release unavailable');
    return res;
  }
  function valid(v) {
    return v && typeof v.version === 'string' && pattern.test(v.version) &&
      Number.isSafeInteger(v.run) && Number.isSafeInteger(v.attempt) &&
      v.version.endsWith('-'+v.run+'-'+v.attempt);
  }
  function newer(v) { return v.run > run || (v.run === run && v.attempt > attempt); }
  async function verify(v) {
    const page = await (await request('index.html')).text();
    const parsed = new DOMParser().parseFromString(page,'text/html');
    return parsed.querySelector('meta[name="studio-release"]')?.content === v.version;
  }
  function show() {
    if (!latest || latest.version === dismissed || notice || busy) return;
    if (window.AIStudioAuth && !window.AIStudioAuth.ready) return;
    notice = document.createElement('aside');
    notice.setAttribute('role','region'); notice.setAttribute('aria-label','網站版本更新');
    notice.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);width:min(92vw,620px);z-index:9999;padding:12px;box-sizing:border-box;background:#fff;color:#18213a;border:1px solid #687bc1;border-radius:12px;box-shadow:0 4px 20px #0003;font:14px/1.5 system-ui,sans-serif;display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
    const msg = document.createElement('span'); msg.setAttribute('role','status'); msg.style.flex='1 1 200px'; msg.textContent='網站有新版本，可儲存學習紀錄後更新。';
    const update = document.createElement('button'); update.type='button'; update.textContent='儲存並更新';
    const later = document.createElement('button'); later.type='button'; later.textContent='稍後';
    for (const b of [update,later]) b.style.cssText='padding:7px 10px;border:1px solid #687bc1;border-radius:6px;background:#f3f5ff;color:#18213a;cursor:pointer;';
    later.onclick = () => { dismissed=latest.version; notice.remove(); notice=null; };
    update.onclick = async () => {
      if (busy) return;
      if (!confirm('更新會重新載入頁面。已儲存的筆記、作答與學習位置會保留；尚未保存的互動實驗或 AI 對話可能重置，計時測驗仍會計時。確定更新？')) return;
      busy=true; update.disabled=later.disabled=true; msg.textContent='正在確認新版並保存紀錄…';
      try {
        const v=await (await request('version.json')).json();
        if (!valid(v) || !newer(v) || !(await verify(v))) throw Error('新版仍在部署，請稍後再試。');
        if (window.AIStudioAuth) {
          if (!window.AIStudioAuth.ready || !window.AccountLearning?.prepareReload || !(await window.AccountLearning.prepareReload())) throw Error('尚未確認學習紀錄安全保存，請稍後再試。');
        }
        const url = new URL(location.href);
        url.searchParams.set('_studio_release',v.version);
        location.replace(url.href);
      } catch (e) {
        msg.textContent=e.message || '更新暫時無法完成。原頁面已保留。';
        busy=false; update.disabled=later.disabled=false;
      }
    };
    notice.append(msg,update,later); document.body.append(notice);
  }
  async function check() {
    if (checking || busy || document.visibilityState === 'hidden') return;
    checking=true;
    try {
      const v=await (await request('version.json')).json();
      if (valid(v) && newer(v) && (!latest || v.run>latest.run || (v.run===latest.run && v.attempt>=latest.attempt)) && (latest?.version===v.version || await verify(v))) {
        if (latest?.version!==v.version && notice) {notice.remove(); notice=null;}
        latest=v; show();
      }
    } catch {} finally {checking=false;}
  }
  function start() {
    check();
    setInterval(check,30000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
    window.addEventListener('focus',check);
    window.addEventListener('online',check);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
