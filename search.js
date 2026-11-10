'use strict';
// Shared, local search. Names rank above descriptions; fuzzy matches rank last.
const aiSearch=(()=>{
 const cache=new Map();
 const variants={'学':'學','习':'習','网':'網','络':'絡','经':'經','层':'層','积':'積','数':'數','据':'據','归':'歸','类':'類','变':'變','换':'換','机':'機','预':'預','测':'測','训':'訓','练':'練','权':'權','忆':'憶','优':'優','参':'參','标':'標','识':'識','图':'圖','语':'語','义':'義','检':'檢','索':'索','扩':'擴','散':'散','损':'損','对':'對','齐':'齊','强':'強','负':'負','馈':'饋','传':'傳','递':'遞','减':'減','压':'壓','缩':'縮'};
 function normalize(value){return String(value??'').normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\u3400-\u9fff]/g,c=>variants[c]||c).replace(/[^a-z0-9\u3400-\u9fff]+/g,' ').trim()}
 function documentFor(fields){const text=(Array.isArray(fields)?fields:[fields]).filter(x=>x!=null).join('\n');if(cache.has(text))return cache.get(text);const lines=text.split('\n').map(normalize),words=lines.flatMap(s=>s.match(/[a-z0-9]+|[\u3400-\u9fff]+/g)||[]);const acronyms=text.split(/[\n,，;；()（）/]/).map(s=>(s.match(/[a-zA-Z]+/g)||[]).map(x=>x[0]).join('').toLowerCase()).filter(x=>x.length>=2&&x.length<=8);const doc={lines,compact:lines.map(s=>s.replaceAll(' ','')),words:[...new Set(words)],acronyms};if(cache.size>=4096)cache.clear();cache.set(text,doc);return doc}
 function distance(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let prev=Array.from({length:b.length+1},(_,i)=>i),before;for(let i=1;i<=a.length;i++){const row=[i];let min=i;for(let j=1;j<=b.length;j++){row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]!==b[j-1]));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])row[j]=Math.min(row[j],before[j-2]+1);min=Math.min(min,row[j])}if(min>max)return max+1;before=prev;prev=row}return prev[b.length]}
 function partScore(q,doc){
  const compact=q.replaceAll(' ','');
  for(let i=0;i<doc.lines.length;i++)if(doc.compact[i]===compact)return 120-Math.min(i,10);
  if(doc.words.includes(q)||doc.acronyms.includes(compact))return 105;
  if(/^[a-z0-9]{1,2}$/.test(q))return doc.words.some(w=>w.startsWith(q))?75:0;
  if(doc.compact.some(s=>s.includes(compact)))return 85;
  const han=/^[\u3400-\u9fff]+$/.test(compact);
  if(han&&compact.length>=2){for(const word of doc.words){if(!/^[\u3400-\u9fff]+$/.test(word))continue;let start=word.indexOf(compact[0]);while(start>=0){let pos=start;for(let i=1;i<compact.length&&pos>=0;i++)pos=word.indexOf(compact[i],pos+1);if(pos>=0&&pos-start+1-compact.length<=Math.max(1,Math.floor(compact.length/3)))return 55;start=word.indexOf(compact[0],start+1)}}}
  if(/^[a-z][a-z0-9]{3,}$/.test(q)){const max=q.length>=8?2:1;for(const word of doc.words){if(!/^[a-z0-9]+$/.test(word))continue;if(distance(q,word,max)<=max)return 45;if(word.length>q.length&&distance(q,word.slice(0,q.length),1)<=1)return 40}}
  if(han&&compact.length>=3&&doc.words.some(w=>/^[\u3400-\u9fff]+$/.test(w)&&distance(compact,w,1)<=1))return 35;
  return 0;
 }
 function score(query,fields){const q=normalize(query);if(!q)return 1;const doc=documentFor(fields),whole=partScore(q,doc);if(whole>=85)return whole;const parts=q.split(' ');if(parts.length===1)return whole;const values=parts.map(p=>partScore(p,doc));return values.every(Boolean)?Math.max(whole,values.reduce((a,b)=>a+b,0)/values.length-5):whole}
 function rank(items,query,fields){if(!normalize(query))return items.slice();return items.map((item,index)=>({item,index,score:score(query,fields(item))})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.item)}
 return {normalize,score,rank,matches:(query,fields)=>score(query,fields)>0};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=aiSearch;
