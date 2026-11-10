'use strict';
window.onload=async()=>{
 const backend='https://ai-learning-studio-api.liesharn.workers.dev',box=document.getElementById('google-login'),status=document.getElementById('status');
 status.textContent='正在準備 Google 登入…';
 try{const r=await fetch(backend+'/public/challenge',{credentials:'omit',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('登入服務暫時無法使用，請重新整理。');const config=await r.json();if(!window.google)throw Error('Google 登入元件無法載入，請重新整理。');
 google.accounts.id.initialize({client_id:config.clientId,nonce:config.nonce,auto_select:false,callback:async result=>{
 status.textContent='正在確認登入…';try{const login=await fetch(backend+'/public/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',signal:AbortSignal.timeout(20000),body:JSON.stringify({credential:result.credential,challenge:config.challenge})});if(!login.ok)throw Error(login.status===429?'登入嘗試太頻繁，請稍候一分鐘再試。':'網站未能確認 Google 登入，請重新整理後再試。');const data=await login.json();if(!data.authenticated||typeof data.token!=='string')throw Error('登入服務回應不完整。');sessionStorage.setItem('ai-studio-session-v2',JSON.stringify({token:data.token,expires:Date.now()+data.expiresIn*1000}));status.textContent='登入成功，正在開啟學習首頁…';if(window.parent!==window)window.parent.postMessage({type:'ai-studio-login'},location.origin);else location.replace('./');}catch(error){status.textContent=error.message||'登入未完成，請重新整理後再試。';}
 }});google.accounts.id.renderButton(box,{theme:'outline',size:'large',text:'signin_with',locale:'zh_TW',width:Math.min(360,box.clientWidth)});status.textContent='僅讀取 Google 基本帳號資料，不存取信件或雲端硬碟。';
 }catch(error){status.textContent=error.message||'登入服務暫時無法使用，請重新整理。';}
};
