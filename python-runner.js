'use strict';
function classifyPython(source, hint=''){
 const s=source.trim(),h=hint.toLowerCase();
 if(!s||/mermaid|language-(?:json|javascript|js|html|css|bash|sh|sql|text|output)/i.test(h)||/^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|gantt|erDiagram)\b/.test(s))return null;
 if(/^[{[]/.test(s)){try{JSON.parse(s);return null}catch{}}
 if(!/(?:^|[\s-])(?:python|py)(?:$|\s)|language-python|lang-python/.test(h)&&!/^\s*(?:from\s+[\w.]+\s+import|import\s+\w+|(?:async\s+)?def\s+\w+\s*\(|class\s+\w+[\s(:]|[A-Za-z_]\w*\s*=(?!=)|(?:print|input)\s*\(|if\s+.+:|for\s+.+\s+in\s+.+:|[!%](?:pip|conda|matplotlib|cd|run)\b)/m.test(s))return null;
 const modules=new Set();
 for(const m of s.matchAll(/^\s*(?:from\s+([\w.]+)\s+import\b|import\s+([^#;\n]+))/gm)){
  if(m[1])modules.add(m[1].split('.')[0]);else for(const part of m[2].split(',')){const name=part.trim().match(/^\w+/);if(name)modules.add(name[0])}
 }
 const models=['torch','torchvision','torchaudio','tensorflow','keras','transformers','diffusers','accelerate','bitsandbytes','peft','datasets','sentence_transformers','qwen_tts','kokoro','onnxruntime','ultralytics','vllm','llama_cpp','insightface','jax'];
 const external=['google','IPython','gradio','streamlit','cv2','soundfile','ffmpeg','subprocess','socket','requests','httpx','urllib','aiohttp','openai','anthropic','huggingface_hub','langchain','pymongo','psycopg2','micropip','js','pyodide'];
 const available=['numpy','scipy','pandas','sklearn','matplotlib','sympy','statsmodels','PIL','jsonschema','networkx','regex','yaml','seaborn','packaging','pytz'];
 const standard=['math','statistics','random','json','time','datetime','collections','itertools','functools','operator','decimal','fractions','re','string','typing','dataclasses','enum','heapq','bisect','copy','csv','io','base64','hashlib','hmac','secrets','uuid','struct','array','textwrap','unicodedata','math','sys','os','pathlib','warnings','contextlib','numbers','cmath','ast','keyword','pprint','traceback','asyncio','abc','types','builtins','zoneinfo','calendar','tempfile','gzip','zipfile','pickle'];
 const model= [...modules].filter(x=>models.includes(x));if(model.length||/\b(?:torch|tensorflow|diffusers|transformers|Qwen3TTSModel)\s*\.|(?:AutoModel\w*|AutoTokenizer|DiffusionPipeline|KPipeline)\.from_pretrained|\b(?:device_map\s*=|\.cuda\s*\(|cuda:\d)/i.test(s))return {kind:'external',reason:'需要模型、原生深度學習套件或權重；請使用 Colab／本機 Python，視模型需求配置 GPU。'};
 if(/^\s*[!%]\w+|\b(?:pip\s+install|conda\s+install|drive\.mount|files\.upload|os\.system|subprocess\.|https?:\/\/)/m.test(s))return {kind:'external',reason:'需要 Notebook 指令、外部連線或系統環境；請在 Colab／本機執行。'};
 const unsupported=[...modules].filter(x=>external.includes(x)||(!standard.includes(x)&&!available.includes(x)));
 if(unsupported.length)return {kind:'external',reason:'需要額外環境或未確認相容的套件：'+unsupported.join('、')+'。請使用 Colab／本機。'};
 if(/\b(?:model\.load_state_dict|optimizer\.|val_loss\s*<\s*best_loss|model\.parameters|torch\.)/.test(s))return {kind:'external',reason:'需先建立模型、最佳化器及訓練狀態；此為完整訓練程式的一部分。'};
 if(/\b(?:open\s*\(|(?:read_csv|read_excel|loadtxt|imread)\s*\(|Path\s*\([^)]*\)\.read)/.test(s))return {kind:'external',reason:'可能需要外部檔案或資料，請在具備資料的 Colab／本機環境執行。'};
 const packages=[...modules].filter(x=>available.includes(x));
 return packages.length?{kind:'package',reason:'瀏覽器可嘗試執行；首次自動下載相容套件：'+packages.join('、')+'。'}:{kind:'browser',reason:'瀏覽器直接執行；每次使用獨立 Python 環境。'};
}
async function pythonWorker(){
 const send=(type,text)=>self.postMessage({type,text:String(text??'').slice(0,60000)});
 self.onmessage=async event=>{
  const {code,input}=event.data;self.onmessage=null;
  let output=0;const emit=(type,s)=>{if(output>=60000)return;const text=String(s);output+=text.length;send(type,text.slice(0,Math.max(0,60000-output+text.length)))};
  try{
   const {loadPyodide}=await import('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs');
   const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
   py.setStdout({batched:s=>emit('stdout',s)});py.setStderr({batched:s=>emit('stderr',s)});
   const lines=input===''?[]:input.split(/\r?\n/);py.setStdin({stdin:()=>lines.length?lines.shift():null});
   send('phase','正在載入 Python 套件…');await py.loadPackagesFromImports(code);
   send('running','執行中…');const result=await py.runPythonAsync(code);
   if(result!==undefined&&result!==null){try{emit('stdout',String(result))}finally{result?.destroy?.()}}
   send('done','執行完成');
  }catch(error){send('error',error?.message||error)}
 };
}
function sandboxBridge(workerSource){
 let worker=null;
 const send=(type,text)=>parent.postMessage({studioPython:true,type,text},'*');
 addEventListener('message',event=>{
  if(event.source!==parent||!event.data||event.data.studioPython!==true)return;
  if(event.data.type==='stop'){worker?.terminate();worker=null;return}
  if(event.data.type!=='run'||worker)return;
  try{
   // Blob module workers fail to start in opaque-origin sandboxed frames.
   // A data URL preserves the opaque origin without granting page/storage access.
   const url='data:text/javascript;charset=utf-8,'+encodeURIComponent('('+workerSource+')()');
   worker=new Worker(url,{type:'module'});
   worker.onmessage=e=>{const d=e.data;if(d&&typeof d.text==='string'&&['stdout','stderr','phase','running','done','error'].includes(d.type))send(d.type,d.text)};
   worker.onerror=event=>send('error','Python 執行環境啟動失敗。請重新執行；若仍失敗，請確認網路及瀏覽器的 WebAssembly 支援。'+(event.message?'（'+event.message+'）':''));
   worker.postMessage({code:event.data.code,input:event.data.input});
  }catch(error){send('error',error.message)}
 });
 send('ready','');
}
function pythonSandboxDocument(){
 const csp="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' data: https://cdn.jsdelivr.net; worker-src data:; connect-src https://cdn.jsdelivr.net; object-src 'none'; base-uri 'none'; form-action 'none'";
 const js='('+sandboxBridge.toString()+')('+JSON.stringify(pythonWorker.toString())+')';
 return '<!doctype html><meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>'+js+'<\/script>';
}
function initPythonCards(){
 const selector='#app pre, #lesson-content pre, #keyword-content pre, #lab-content pre';
 let active=null,queued=false;
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const button=(label,fn)=>{const b=make('button','',label);b.type='button';b.addEventListener('click',fn);return b};
 function stop(message){const a=active;if(!a)return;active=null;clearTimeout(a.timer);a.frame.contentWindow?.postMessage({studioPython:true,type:'stop'},'*');a.frame.remove();a.run.disabled=false;a.halt.disabled=true;a.status.textContent=message}
 function limit(a,ms){clearTimeout(a.timer);a.timer=setTimeout(()=>{if(active===a)stop('已達執行時間上限，程式已停止。')},ms)}
 addEventListener('message',e=>{
  const a=active,d=e.data;if(!a||e.source!==a.frame.contentWindow||e.origin!=='null'||!d||d.studioPython!==true||typeof d.text!=='string')return;
  if(d.type==='ready'){if(a.started)return;a.started=true;a.frame.contentWindow.postMessage({studioPython:true,type:'run',code:a.code,input:a.input},'*');return}
  if(d.type==='phase'){a.status.textContent=d.text;return}
  if(d.type==='running'){a.status.textContent=d.text;limit(a,30000);return}
  if(['stdout','stderr','error'].includes(d.type)){const extra=(d.type==='stderr'?'[stderr] ':d.type==='error'?'[錯誤] ':'')+d.text+'\n';a.output.textContent=(a.output.textContent+extra).slice(0,60000);if(d.type==='error')stop('執行失敗；請核對程式及執行需求。');return}
  if(d.type==='done')stop('執行完成');
 });
 function launch(editor,input,output,status,run,halt){
  const code=editor.value,requirement=classifyPython(code,'language-python');
  if(!code.trim()){status.textContent='請先輸入 Python 程式。';return}
  if(requirement?.kind==='external'){status.textContent=requirement.reason;return}
  if(code.length>50000){status.textContent='程式碼超過 50,000 字元限制。';return}
  if(active)stop('已停止，因為開始了另一個實驗。');
  output.textContent='';status.textContent='首次載入 Python 執行環境，請保持網路連線…';run.disabled=true;halt.disabled=false;
  const frame=document.createElement('iframe');frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('title','獨立 Python 執行沙箱');frame.hidden=true;
  frame.srcdoc=pythonSandboxDocument();
  active={frame,run,halt,output,status,code,input:input.value.slice(0,10000),timer:null,started:false};limit(active,120000);document.body.append(frame);
 }
 function enhance(){
  if(active&&!active.run.isConnected)stop('教材已切換，執行停止。');
  document.querySelectorAll(selector).forEach(pre=>{
   if(pre.closest('.studio-code-card')||pre.closest('.diagram,.mermaid-source,.mermaid'))return;
   const code=pre.querySelector('code')||pre,s=code.textContent,h=(pre.className||'')+' '+(code.className||'');
   if(!s.trim())return;const requirement=classifyPython(s,h);
   const card=make('div','studio-code-card'),head=make('div','studio-code-head'),label=make('span','',requirement?'‹/› Python':'‹/› '+(h.match(/(?:language|lang)-([\w+#-]+)/i)?.[1]||'Code'));
   let editor=null;const copy=button('複製',async()=>{try{await navigator.clipboard.writeText(editor?editor.value:s);copy.textContent='已複製'}catch{copy.textContent='複製失敗'}setTimeout(()=>copy.textContent='複製',1800)});
   head.append(label,copy);pre.before(card);card.append(head);
   if(!requirement){card.append(pre);return}
   const note=make('p','studio-python-requirement',({'external':'需外部環境／大型模型','package':'需要相容套件','browser':'瀏覽器可執行'})[requirement.kind]+'｜'+requirement.reason);
   card.append(note);
   if(requirement.kind==='external'){
    const link=make('a','studio-python-colab','開啟 Google Colab（複製程式後貼上）');link.href='https://colab.research.google.com/';link.target='_blank';link.rel='noopener noreferrer';card.append(pre,link);return
   }
   editor=make('textarea','studio-python-editor');editor.value=s;editor.spellcheck=false;editor.setAttribute('aria-label','可編輯 Python 程式碼');editor.rows=Math.max(4,Math.min(18,s.split('\n').length+1));
   editor.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end')}});
   const input=make('textarea','studio-python-stdin');input.rows=2;input.placeholder='input() 每次讀取一行；不需要時留空';input.setAttribute('aria-label','Python 標準輸入');
   const details=make('details','studio-python-input');details.append(make('summary','','標準輸入（選用）'),input);
   const actions=make('div','studio-python-actions'),status=make('p','studio-python-status','尚未執行'),output=make('pre','studio-python-output');status.setAttribute('role','status');output.setAttribute('aria-label','Python 執行輸出');
   const run=button('▶ 執行',()=>launch(editor,input,output,status,run,halt)),halt=button('■ 停止',()=>{if(active?.run===run)stop('已停止')});halt.disabled=true;
   const reset=button('重設',()=>{if(active?.run===run)stop('已停止');editor.value=s;input.value='';output.textContent='';status.textContent='已還原教材程式'});
   actions.append(run,halt,reset);card.append(editor,details,actions,status,output);
   // The editable card replaces its source; otherwise the observer repeatedly enhances the same pre.
   pre.remove();
  });
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
 function init(){enhance();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})}
 addEventListener('pagehide',()=>stop('已停止'));document.addEventListener('close',e=>{if(active&&e.target.contains?.(active.run))stop('教材已關閉，執行停止。')},true);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}
if(typeof module!=='undefined'&&module.exports)module.exports={classifyPython,pythonSandboxDocument};else initPythonCards();
