'use strict';
(()=>{
 let root=null,controller=null,sequence=0,version=null,view='sessions',offset=0,total=0,rows=[],fields=[];
 const limit=50;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const auth=()=>window.AIStudioAuth;
 const allowed=()=>auth()?.ready===true&&auth().canManageDatabase===true;
 const current=(turn,host)=>turn===sequence&&host===root&&host?.isConnected&&allowed()&&version===auth().sessionVersion&&location.hash==='#admin';
 const date=value=>value==null?'—':new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value*1000));
 const status=r=>({logout:'主動登出',expired:'已到期',revoked:'已撤銷'}[r.end_reason]||'有效中');
 function unmount(){sequence++;controller?.abort();controller=null;root=null;rows=[];fields=[];total=0;offset=0;view='sessions';version=null;}
 function render(){
  if(!allowed())return '<section class="panel database-admin-denied"><h1>後臺管理</h1><p role="alert">此帳號無管理權限。</p><a href="#home">返回學習首頁</a></section>';
  return '<section class="database-admin" id="database-admin"><div class="eyebrow">ACCOUNT & LOGIN RECORDS</div><h1>後臺管理</h1><p class="muted">查看使用者帳號與登入紀錄。時間以台灣時間（UTC+8）顯示。</p><div class="database-admin-summary" aria-label="紀錄總覽">'+[['users','使用者'],['sessions','登入紀錄'],['active','有效工作階段'],['recent','近 24 小時登入']].map(([k,t])=>'<div class="panel"><span>'+t+'</span><strong data-admin-count="'+k+'">—</strong></div>').join('')+'</div><section class="panel"><div class="database-admin-tabs"><button type="button" data-admin-tab="sessions" aria-pressed="true">登入與登出紀錄</button><button type="button" data-admin-tab="users" aria-pressed="false">使用者帳號</button></div><form id="database-admin-filter" class="database-admin-filters"><label>帳號 Email<input name="email" type="search" maxlength="120" placeholder="輸入完整或部分 Email"></label><label>開始日期<input name="from" type="date"></label><label>結束日期<input name="to" type="date"></label><label>狀態<select name="status"><option value="all">全部狀態</option><option value="active">有效中</option><option value="logout">主動登出</option><option value="expired">已到期</option><option value="revoked">已撤銷</option></select></label><button type="submit" class="primary">查詢</button><button type="button" data-admin-reset>清除篩選</button></form><p id="database-admin-status" role="status">正在載入…</p><div class="database-admin-actions"><button type="button" data-admin-refresh>重新整理紀錄</button><button type="button" data-admin-export disabled>匯出本頁 CSV</button></div><div class="database-admin-table" tabindex="0" role="region" aria-label="後臺查詢結果"><table><thead></thead><tbody></tbody></table></div><div class="database-admin-paging"><button type="button" data-admin-prev disabled>上一頁</button><span data-admin-page>每頁 50 筆</span><button type="button" data-admin-next disabled>下一頁</button></div><p class="muted" data-admin-help>登入紀錄以工作階段分列。「有效中」表示憑證尚未到期，不代表使用者此刻正在操作。關閉瀏覽器不會被當成主動登出；最後活動時間約每五分鐘更新一次。</p></section><a class="database-admin-home" href="#home">返回學習首頁</a></section>';
 }
 function setRows(result){
  rows=result.rows;total=result.total;
  fields=view==='users'?[['email','Email'],['display_name','名稱'],['first_login_at','首次登入'],['last_login_at','最近登入']]:[['email','Email'],['login_at','登入時間'],['logout_at','主動登出時間'],['last_seen_at','最後活動'],['expires_at','有效至'],['ended_at','結束時間'],['status','狀態']];
  root.querySelector('thead').innerHTML='<tr>'+fields.map(([,t])=>'<th scope="col">'+esc(t)+'</th>').join('')+'</tr>';
  root.querySelector('tbody').innerHTML=rows.length?rows.map(r=>'<tr>'+fields.map(([k])=>'<td>'+esc(k==='status'?status(r):k.endsWith('_at')?date(r[k]):r[k]||'—')+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+fields.length+'">沒有符合條件的紀錄。</td></tr>';
  root.querySelector('[data-admin-prev]').disabled=offset===0;
  root.querySelector('[data-admin-next]').disabled=offset+rows.length>=total;
  root.querySelector('[data-admin-page]').textContent=total?'第 '+(offset+1)+'～'+(offset+rows.length)+' 筆／共 '+total+' 筆':'共 0 筆';
  root.querySelector('[data-admin-export]').disabled=!rows.length;
  root.querySelector('#database-admin-status').textContent='查詢完成';
 }
 async function load(){
  if(!root||!allowed())return;
  controller?.abort();controller=new AbortController();const activeController=controller,turn=++sequence,host=root;
  const form=root.querySelector('form'),params=new URLSearchParams({limit:String(limit),offset:String(offset)});
  for(const name of ['email','from','to']){const value=form.elements.namedItem(name).value.trim();if(value)params.set(name,value);}
  if(view==='sessions')params.set('status',form.elements.namedItem('status').value);
  rows=[];fields=[];root.querySelector('tbody').textContent='';root.querySelector('thead').textContent='';
  for(const b of root.querySelectorAll('[data-admin-export],[data-admin-prev],[data-admin-next]'))b.disabled=true;
  root.querySelector('#database-admin-status').textContent='正在載入…';
  const timer=setTimeout(()=>activeController.abort(),15000);
  try{
   const responses=await Promise.all([auth().request('/admin/'+view+'?'+params,{signal:activeController.signal}),auth().request('/admin/summary',{signal:activeController.signal})]);
   if(!current(turn,host))return;
   if(responses.some(r=>!r.ok))throw Error(responses.some(r=>r.status===403)?'此帳號無管理權限。':'無法取得紀錄，請稍後重試。');
   const [result,summary]=await Promise.all(responses.map(r=>r.json()));
   if(!current(turn,host))return;
   if(!Array.isArray(result.rows)||!Number.isSafeInteger(result.total))throw Error('紀錄格式異常。');
   for(const key of ['users','sessions','active','recent'])root.querySelector('[data-admin-count="'+key+'"]').textContent=String(summary.summary?.[key]??'—');
   setRows(result);
  }catch(e){if(current(turn,host))root.querySelector('#database-admin-status').textContent=e.name==='AbortError'?'連線逾時，請重新查詢。':e.message||'查詢失敗。';}
  finally{clearTimeout(timer);}
 }
 function mount(){unmount();if(!allowed())return;root=document.getElementById('database-admin');if(!root)return;version=auth().sessionVersion;load();}
 function csvCell(value){let text=String(value??'');if(/^[\s\uFEFF]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
 function csv(columns,data){return '\uFEFF'+[columns.map(([,title])=>title),...data.map(r=>columns.map(([k])=>k==='status'?status(r):k.endsWith('_at')?date(r[k]):r[k]??''))].map(row=>row.map(csvCell).join(',')).join('\r\n');}
 document.addEventListener('submit',e=>{if(e.target.id!=='database-admin-filter')return;e.preventDefault();if(!allowed())return;offset=0;load();});
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||!root||!root.contains(b)||!allowed())return;
  if(b.dataset.adminTab){view=b.dataset.adminTab==='users'?'users':'sessions';offset=0;root.querySelector('select').disabled=view==='users';for(const t of root.querySelectorAll('[data-admin-tab]'))t.setAttribute('aria-pressed',String(t.dataset.adminTab===view));root.querySelector('[data-admin-help]').textContent=view==='users'?'日期篩選以最近登入時間為準。':'「有效中」表示憑證尚未到期，不代表正在操作；關閉瀏覽器不等於主動登出。最後活動約每五分鐘更新。';load();}
  else if(b.hasAttribute('data-admin-reset')){root.querySelector('form').reset();offset=0;load();}
  else if(b.hasAttribute('data-admin-prev')){offset=Math.max(0,offset-limit);load();}
  else if(b.hasAttribute('data-admin-next')){if(offset+rows.length<total){offset+=limit;load();}}
  else if(b.hasAttribute('data-admin-refresh'))load();
  else if(b.hasAttribute('data-admin-export')&&rows.length){
   const url=URL.createObjectURL(new Blob([csv(fields,rows)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='login-records-'+view+'-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 });
 window.AdminDatabase={render,mount,unmount,csv};
})();
