'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{AIStudioAuth:{ready:true,canManageDatabase:false,sessionVersion:1}},document:{addEventListener(){}},location:{hash:'#admin'},Intl,Date,URLSearchParams,setTimeout,clearTimeout,AbortController};
vm.createContext(context);vm.runInContext(fs.readFileSync('database-admin.js','utf8'),context);
const ui=context.window.AdminDatabase;
assert.match(ui.render(),/此帳號無管理權限/);assert.ok(!ui.render().includes('database-admin-filter'));
context.window.AIStudioAuth.canManageDatabase=true;assert.match(ui.render(),/database-admin-filter/);
const csv=ui.csv([['email','Email'],['login_at','登入時間']],[{email:'=HYPERLINK("x")',login_at:0},{email:' +1',login_at:0}]);
assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/'=HYPERLINK/);assert.match(csv,/' \+1/);assert.match(csv,/1970/);
// A response started under admin A must not write into the page after account B replaces A.
let pending=[],updates=0;const nodes={form:{elements:{namedItem(){return {value:''}}}},tbody:{textContent:''},thead:{textContent:''},'#database-admin-status':{textContent:''}};
const root={isConnected:true,querySelector(s){return nodes[s]||{set textContent(v){updates++}}},querySelectorAll(){return []}};
context.document.getElementById=()=>root;
context.window.AIStudioAuth.request=()=>new Promise(r=>pending.push(r));
ui.mount();context.window.AIStudioAuth.sessionVersion=2;context.window.AIStudioAuth.canManageDatabase=false;ui.unmount();for(const resolve of pending)resolve({ok:true,json:async()=>({rows:[{email:'private@example.invalid'}],total:1,summary:{}})});
setImmediate(()=>{assert.equal(updates,0);assert.ok(!JSON.stringify(nodes).includes('private@example.invalid'));console.log('PASS: unauthorized UI hidden, CSV formula protection and stale admin data discarded on account switch');});
