'use strict';
// Store UI position only. Conversations and OAuth credentials are deliberately excluded.
(()=>{
 const pages=new Set(['home','courses','curriculum','lab','assessment','videos','explore','tutor','glossary','notes']);
 let timer=null,restoring=false,generation=0;
 const get=id=>document.getElementById(id);
 const term=id=>typeof keywordCatalog!=='undefined'&&keywordCatalog.some(t=>t.id===id);
 function scrollValue(value){return Number.isFinite(value)?Math.max(0,Math.min(10000000,value)):0}
 function capture(){if(restoring||!window.AIStudioAuth?.ready)return;const page=location.hash.slice(1)||'home',reader=get('reader'),keyword=get('keyword-reader'),lab=get('lab-reader');const p={page:pages.has(page)?page:'home',view:'page',scroll:{page:scrollValue(window.scrollY)}};
 if(reader?.open&&typeof current!=='undefined'){p.lessonId=current;p.view='lesson';p.scroll.reader=scrollValue(reader.scrollTop)}
 if(keyword?.open&&typeof activeKeyword!=='undefined'){p.keywordId=activeKeyword;p.keywordTab=keywordTab;p.view='keyword';p.scroll.keyword=scrollValue(keyword.scrollTop);if(typeof guidedPracticeSession!=='undefined'&&guidedPracticeSession?.id===activeKeyword)p.practice={stage:guidedPracticeSession.stage,values:{...guidedPracticeSession.values}}}
 if(lab?.open&&typeof activeLabTerm!=='undefined'){p.labTerm=activeLabTerm;p.view='lab';p.scroll.lab=scrollValue(lab.scrollTop);p.labValues={...activeLabValues}}
 const context=p.view==='lab'?'lab':p.view==='keyword'&&p.keywordTab==='practice'?'practice':null;
 if(context){p.visualContext=context;if(typeof visualSteps!=='undefined')p.visualStep=visualSteps.get(context)||0;if(typeof visualExpanded!=='undefined')p.visualExpanded=!!visualExpanded.get(context);if(typeof knnViews!=='undefined'){const k=knnViews.get(context);if(k)p.knn={step:k.step,selected:k.selected}}}
 const root=p.view==='lab'?lab:p.view==='keyword'?keyword:p.view==='lesson'?reader:null;
 if(root)p.details=Array.from(root.querySelectorAll('details')).map((d,i)=>d.open?i:-1).filter(i=>i>=0).slice(0,500);
 if(typeof termQuery!=='undefined')p.glossary={query:termQuery,domain:termDomain,status:termStatus,page:termPage};
 if(typeof labQuery!=='undefined')p.labCatalog={query:labQuery,domain:labDomain,type:labType,view:labView,page:labPage};
 if(typeof filter!=='undefined')p.courses={filter,query};
 if(typeof assessmentTab!=='undefined')p.assessmentView={tab:assessmentTab,page:assessmentPage,query:assessmentQuery,domain:assessmentDomain,difficulty:assessmentDifficulty,kind:assessmentKind,source:assessmentSource,wrongPage:assessmentWrongPage,historyId:assessmentHistoryId};
 if(typeof videoLibraryQuery!=='undefined')p.videos={query:videoLibraryQuery,category:videoLibraryCategory,page:videoLibraryPage};
 if(typeof explorerDomain!=='undefined')p.explorerDomain=explorerDomain;
 if(page==='tutor'&&typeof tutorTopic!=='undefined')p.tutorTopic=tutorTopic;
 window.AccountLearning?.position(p);
 }
 function schedule(){if(restoring||!window.AIStudioAuth?.ready)return;clearTimeout(timer);timer=setTimeout(capture,250)}
 function reset(){clearTimeout(timer);generation++;restoring=false;if(typeof visualContexts!=='undefined')visualContexts.clear();if(typeof visualSteps!=='undefined')visualSteps.clear();if(typeof visualExpanded!=='undefined')visualExpanded.clear();if(typeof knnViews!=='undefined')knnViews.clear();if(typeof guidedPracticeSession!=='undefined')guidedPracticeSession=null}
 function restore(raw){reset();restoring=true;const turn=generation,p=raw&&typeof raw==='object'?raw:{},s=p.scroll||{};
 try{
 for(const id of ['reader','keyword-reader','lab-reader']){const el=get(id);if(el?.open)el.close()}
 if(typeof tutorTopic!=='undefined')tutorTopic=term('d5t-ascent')?'d5t-ascent':keywordCatalog[0]?.id;
 const page=pages.has(p.page)?p.page:'home';
 if(typeof termQuery!=='undefined'){termQuery='';termDomain='all';termStatus='all';termPage=0}if(typeof labQuery!=='undefined'){labQuery='';labDomain='all';labType='all';labView='engines';labPage=0}if(typeof filter!=='undefined'){filter='全部';query=''}

 if(typeof assessmentTab!=='undefined'){const a=p.assessmentView||{};assessmentTab=['bank','build','test','review'].includes(a.tab)?a.tab:'bank';assessmentPage=Math.max(0,Math.min(100,Number(a.page)||0));assessmentQuery=String(a.query||'').slice(0,500);assessmentDomain=String(a.domain||'all');assessmentDifficulty=String(a.difficulty||'all');assessmentKind=String(a.kind||'all');assessmentSource=String(a.source||'all');assessmentWrongPage=Math.max(0,Math.min(100,Number(a.wrongPage)||0));assessmentHistoryId=typeof a.historyId==='string'?a.historyId.slice(0,80):null;assessmentDraftConfig=null}
 if(typeof videoLibraryQuery!=='undefined'){videoLibraryQuery=String(p.videos?.query||'').slice(0,500);videoLibraryCategory=String(p.videos?.category||'all');videoLibraryPage=Math.max(0,Math.min(100,Number(p.videos?.page)||0))}
 if(typeof explorerDomain!=='undefined')explorerDomain=Math.max(0,Math.min(18,Number(p.explorerDomain)||0));
 if(p.glossary&&typeof termQuery!=='undefined'){termQuery=String(p.glossary.query||'').slice(0,500);termDomain=String(p.glossary.domain||'all');termStatus=String(p.glossary.status||'all');termPage=Math.max(0,Math.min(100,Number(p.glossary.page)||0))}
 if(p.labCatalog&&typeof labQuery!=='undefined'){labQuery=String(p.labCatalog.query||'').slice(0,500);labDomain=String(p.labCatalog.domain||'all');labType=String(p.labCatalog.type||'all');labView=p.labCatalog.view==='keywords'?'keywords':'engines';labPage=Math.max(0,Math.min(100,Number(p.labCatalog.page)||0))}
 if(p.courses&&typeof filter!=='undefined'){filter=typeof groups!=='undefined'&&groups.includes(p.courses.filter)?p.courses.filter:'全部';query=String(p.courses.query||'').slice(0,500)}
 if(term(p.tutorTopic)&&typeof tutorTopic!=='undefined')tutorTopic=p.tutorTopic;
 history.replaceState(null,'',location.pathname+'#'+page);window.render();
 const validLesson=Number.isInteger(p.lessonId)&&p.lessonId>=0&&p.lessonId<lessons.length;
 if(validLesson&&(p.view!=='page'||!p.view))openLesson(p.lessonId);
 if(p.view==='keyword'&&term(p.keywordId)){openKeyword(p.keywordId,['example','interact','practice'].includes(p.keywordTab)?p.keywordTab:'example');if(p.keywordTab==='practice'&&p.practice&&typeof guidedPracticeSession!=='undefined'){const t=labCases.find(t=>t.id===p.keywordId);if(t){const e=labEngineFor(t);guidedPracticeSession={id:t.id,stage:Math.max(0,Math.min(2,Number(p.practice.stage)||0)),values:sanitizeLabValues(e,p.practice.values,labCaseDefaults(t,e)),baseline:e.compute(labCaseDefaults(t,e))};guidedPracticeRender()}}}
 if(p.view==='lab'&&typeof labCases!=='undefined'&&labCases.some(t=>t.id===p.labTerm)){openLab(p.labTerm);const t=labCases.find(t=>t.id===p.labTerm),e=labEngineFor(t);activeLabValues=sanitizeLabValues(e,p.labValues,labCaseDefaults(t,e));for(const c of e.controls){const el=get('lx-'+c.id),slider=document.querySelector('[data-lab-slider="'+c.id+'"]');if(!el)continue;if(c.type==='checkbox')el.checked=!!activeLabValues[c.id];else el.value=activeLabValues[c.id];if(slider)slider.value=activeLabValues[c.id]}runLab(false)}
 const context=p.view==='lab'?'lab':p.view==='keyword'&&p.keywordTab==='practice'?'practice':null;
 if(context){if(typeof visualExpanded!=='undefined')visualExpanded.set(context,!!p.visualExpanded);if(typeof updateVisualStep==='function')updateVisualStep(context,Math.max(0,Math.min(3,Number(p.visualStep)||0)));if(typeof knnViews!=='undefined'&&p.knn){const k=knnViews.get(context);if(k){k.step=Math.max(0,Math.min(5,Number(p.knn.step)||0));k.selected=['A₁','A₂','A₃','B₁','B₂','B₃'].includes(p.knn.selected)?p.knn.selected:'B₁';const el=get('visual-guide-'+context);if(el)el.outerHTML=renderKnnLearning(k.e,k.v,k.r,context)}}}
 const root=p.view==='lab'?get('lab-reader'):p.view==='keyword'?get('keyword-reader'):validLesson&&p.view!=='page'?get('reader'):null;
 if(root&&Array.isArray(p.details)){const opened=new Set(p.details.filter(Number.isInteger));root.querySelectorAll('details').forEach((d,i)=>{d.open=opened.has(i)})}
 const apply=()=>{if(turn!==generation)return;window.scrollTo(0,scrollValue(s.page));for(const [id,key]of [['reader','reader'],['keyword-reader','keyword'],['lab-reader','lab']]){const el=get(id);if(el?.open)el.scrollTop=scrollValue(s[key])}};
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(turn!==generation)return;apply();restoring=false}));
 }catch(error){restoring=false;console.warn('Learning location could not be fully restored');window.render()}
 }
 window.LearningLocation={capture,restore,reset};
 for(const type of ['click','input','change','toggle','close','scroll'])document.addEventListener(type,schedule,true);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('hashchange',schedule);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){capture();window.AccountLearning?.flush()}});
 window.addEventListener('pagehide',()=>{capture();window.AccountLearning?.flush()});
})();
