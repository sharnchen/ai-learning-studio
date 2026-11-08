/* Native DOCX export; TronClass Word markers follow the user's corrected template. */
'use strict';
function tronclassParagraphs(s){
 if(!s||!s.questionIds?.length)throw new Error('請先產生試卷。');
 const paragraphs=['@@Word 模板格式說明','1.標註規則：使用【】標註題型，如【單選題】；使用冒號標註答案、答案解釋、難易度。','2.難易度包括：難、中、易。難易度未填寫預設為中。','3.匯入說明不會被匯入到系統中，可保留以作參考（請勿刪除說明內容前後的標識符）@@',''];
 for(const id of s.questionIds){
  const q=assessmentQuestionMap.get(id),order=s.orders[id];
  if(!q||!order||order.length!==q.options.length||new Set(order).size!==order.length||order.some(o=>!q.options.some(x=>x.id===o))||!q.correct.length||q.correct.some(o=>!order.includes(o)))throw new Error('試卷選項資料不完整，請重新產生試卷。');
  const clean=t=>String(t??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\r?\n/g,'　');
  paragraphs.push(`【${q.kind==='multiple'?'多選題':'單選題'}】${clean(q.stem)}`);
  order.forEach((o,i)=>paragraphs.push(`${String.fromCharCode(65+i)}. ${clean(q.options.find(x=>x.id===o).text)}`));
  paragraphs.push('答案：'+order.map((o,i)=>q.correct.includes(o)?String.fromCharCode(65+i):'').join(''));
  const steps=(q.steps||[]).map(step=>typeof step==='string'?step:[step.formula,step.substitution].filter(Boolean).join('：')+' = '+step.result).filter(Boolean);
  paragraphs.push('答案解釋：'+clean([q.explanation,...steps].join('；')),'難易度：'+({入門:'易',基礎:'中',進階:'難'}[q.difficulty]||'中'),'');
 }
 return paragraphs;
}
function tronclassDocx(paragraphs){
 const enc=new TextEncoder(),xml=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const files={
 '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
 '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
 'word/document.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+paragraphs.map(t=>'<w:p><w:pPr><w:spacing w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="Noto Sans CJK TC"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">'+xml(t)+'</w:t></w:r></w:p>').join('')+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>'};
 // ZIP store entries: UTF-8 names, CRC32, central directory, no external dependency.
 const chunks=[],central=[];let offset=0;
 const crc=b=>{let c=0xffffffff;for(const n of b){c^=n;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
 const header=(size,fields)=>{const b=new Uint8Array(size),v=new DataView(b.buffer);for(const [at,n,width]of fields)width===4?v.setUint32(at,n,true):v.setUint16(at,n,true);return b;};
 for(const [name,source]of Object.entries(files)){const n=enc.encode(name),b=enc.encode(source),c=crc(b);const h=header(30,[[0,0x04034b50,4],[4,20,2],[6,2048,2],[14,c,4],[18,b.length,4],[22,b.length,4],[26,n.length,2]]);chunks.push(h,n,b);central.push(header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,2048,2],[16,c,4],[20,b.length,4],[24,b.length,4],[28,n.length,2],[42,offset,4]]),n);offset+=h.length+n.length+b.length;}
 const centralSize=central.reduce((a,b)=>a+b.length,0),end=header(22,[[0,0x06054b50,4],[8,central.length/2,2],[10,central.length/2,2],[12,centralSize,4],[16,offset,4]]);
 return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function exportTronclass(s){const blob=tronclassDocx(tronclassParagraphs(s)),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(s.title||'AI試卷').replace(/[\\/:*?"<>|]/g,'_')+'_TronClass.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已匯出 TronClass Word：含正確答案與解析。請在匯入預覽確認題數與答案。');}
