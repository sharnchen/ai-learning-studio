'use strict';
// Treat AI output as untrusted text. Only our own markup and KaTeX MathML are inserted.
function tutorFormatEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tutorFormula(source,display=false){
 const latex=source.trim();
 try{if(!latex||latex.length>5000||typeof katex==='undefined')throw Error('Formula unavailable');
 const math=katex.renderToString(latex,{output:'mathml',displayMode:display,throwOnError:true,trust:false,strict:'ignore',maxExpand:500,maxSize:15});
 return '<span class="tutor-formula '+(display?'tutor-formula-block':'tutor-formula-inline')+'">'+math+'</span>';
 }catch{return '<span class="tutor-formula-fallback" role="note">公式暫時無法排版，請核對原式：<code>'+tutorFormatEscape(latex)+'</code></span>'}
}
function tutorFormattedText(value){
 let text=String(value).slice(0,16000).replace(/\0/g,'�');const pieces=[];
 const keep=html=>'\0'+(pieces.push(html)-1)+'\0';
 // Code is isolated before looking for math delimiters, so sample source stays source.
 text=text.replace(/```[^\n`]*\n?([\s\S]*?)```/g,(_,code)=>keep('<pre class="tutor-code"><code>'+tutorFormatEscape(code.trimEnd())+'</code></pre>'));
 text=text.replace(/`([^`\n]+)`/g,(_,code)=>keep('<code>'+tutorFormatEscape(code)+'</code>'));
 const formula=/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$|(?<![\\$])\$(?!\$)([^$\n]*?)(?<!\\)\$(?!\$)/g;
 text=text.replace(formula,(full,bracket,parenthesis,doubleDollar,dollar)=>{
  const source=bracket??parenthesis??doubleDollar??dollar;
  // Do not interpret prices like "$5 and $10" as formulas.
  if(dollar!==undefined&&!/[\\_^=+*/<>]|\b[a-zA-Z]\b|^[a-zA-Z]+$|^[\d.,\s]+$/.test(source))return full;
  return keep(tutorFormula(source,bracket!==undefined||doubleDollar!==undefined));
 });
 const inline=line=>tutorFormatEscape(line.replace(/\\\$/g,'$')).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_\n]+)__/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
 let html='',list='';
 const close=()=>{if(list){html+='</'+list+'>';list=''}};
 for(const line of text.split(/\r?\n/)){
  const numbered=line.match(/^\s*(\d+)[.)、]\s+(.+)$/),bullet=line.match(/^\s*[-*]\s+(.+)$/);
  if(numbered||bullet){const next=numbered?'ol':'ul';if(list!==next){close();list=next;html+='<'+next+(numbered?' start="'+Math.min(9999,Number(numbered[1]))+'"':'')+'>'}html+='<li>'+inline(numbered?numbered[2]:bullet[1])+'</li>';continue}
  close();const heading=line.match(/^#{1,4}\s+(.+)$/);html+=heading?'<h4>'+inline(heading[1])+'</h4>':line.trim()?'<div class="tutor-prose-line">'+inline(line)+'</div>':'<div class="tutor-prose-gap" aria-hidden="true"></div>';
 }
 close();return html.replace(/\0(\d+)\0/g,(_,index)=>pieces[Number(index)]||'');
}
function tutorFitFormulas(root){
 if(!root?.querySelectorAll)return;
 for(const span of root.querySelectorAll('.tutor-formula')){
  const math=span.querySelector('math'),message=span.closest('.tutor-message');if(!math||!message)continue;
  math.style.fontSize='';const available=Math.max(80,message.clientWidth-48),width=Math.max(math.scrollWidth,math.getBoundingClientRect().width);
  // Native MathML grows vertically. Fit only formulas wider than the message; never add inner scrollbars.
  if(width>available){const font=parseFloat(getComputedStyle(math).fontSize);math.style.fontSize=(font*available/width)+'px'}
 }
}
if(typeof window!=='undefined')window.addEventListener('resize',()=>tutorFitFormulas(document.getElementById('tutor-thread')));
if(typeof module!=='undefined'&&module.exports)module.exports={tutorFormula,tutorFormattedText,tutorFitFormulas};
