'use strict';
// Curated by title/topic and iPAS syllabus code. Not a full-video content verification.
const ipasVideoMap={
 "1/3": [
  "NOO_mpqSj9k",
  "Ft1I87D04e8",
  "PAS4GK6NDz0",
  "ys-F9eqhRuc"
 ],
 "1/4": [
  "5Pr2gSLA-pE",
  "NOO_mpqSj9k",
  "Ft1I87D04e8"
 ],
 "2/3": [
  "x1EpRD0fzzM",
  "XLN2x3bAMLQ",
  "Ifp0DdazygQ"
 ],
 "2/4": [
  "Finlckm3aM4",
  "2ddhypEmR0c"
 ],
 "2/5": [
  "zM8LH7dbJoc"
 ],
 "2/6": [
  "Iu3ARLUcvNk",
  "GA5z7zpCoB4"
 ],
 "2/7": [
  "WKZMJlAUj-Q",
  "Ifp0DdazygQ"
 ],
 "2/8": [
  "O79U9oPRF8M",
  "UkGfj5-qQRE",
  "2ddhypEmR0c"
 ],
 "2/9": [
  "rcP2zB8Fyxk",
  "x1EpRD0fzzM",
  "Finlckm3aM4"
 ],
 "3/3": [
  "xYkjgzto4uU"
 ],
 "3/4": [
  "8xJRg87XdN0",
  "jm_a4iI-a94",
  "_HBhLqp8QII",
  "Vyvf-kLOXYk",
  "N6jfSryowCI",
  "8QtX9u2H0MM",
  "AP1u7JEhYFU"
 ],
 "3/5": [
  "mCESuWBpg-Q",
  "qHdTl1EEZJk"
 ],
 "3/6": [
  "fDez8HTR11k"
 ],
 "3/7": [
  "xYkjgzto4uU",
  "zM8LH7dbJoc"
 ],
 "3/8": [
  "mkJNK14vOTc",
  "-C4iLBdYVHM"
 ],
 "3/9": [
  "qHdTl1EEZJk",
  "Y4L_JSF1CFE",
  "AP1u7JEhYFU"
 ],
 "3/11": [
  "yVCSuz8kW7k"
 ],
 "3/12": [
  "tmAnk1KNA_I"
 ],
 "4/3": [
  "_XEnvl9j2K0",
  "vgGt6iEvybc",
  "yon9hTuSku0"
 ],
 "4/5": [
  "DY4Tnj5Bg_E"
 ],
 "4/6": [
  "GA5z7zpCoB4",
  "-C4iLBdYVHM",
  "Iu3ARLUcvNk"
 ],
 "4/7": [
  "GA5z7zpCoB4"
 ],
 "5/3": [
  "5CgEhUuMDiY"
 ],
 "5/4": [
  "5CgEhUuMDiY",
  "fDez8HTR11k",
  "iqcwr3t7v2o"
 ],
 "5/5": [
  "5CgEhUuMDiY"
 ],
 "5/6": [
  "iqcwr3t7v2o",
  "lLN__QZwtpA"
 ],
 "5/7": [
  "mkJNK14vOTc",
  "zM8LH7dbJoc"
 ],
 "6/3": [
  "Ss5B5iuoskM",
  "axynN4ZrVP4",
  "krLPqWErpS8"
 ],
 "6/4": [
  "zM8LH7dbJoc"
 ],
 "6/5": [
  "zM8LH7dbJoc",
  "mkJNK14vOTc"
 ],
 "6/6": [
  "EjxsBuW-N3k"
 ],
 "6/7": [
  "EjxsBuW-N3k",
  "EbCB4B9pbHs",
  "HMF6DxXCRK0"
 ],
 "7/3": [
  "krLPqWErpS8",
  "axynN4ZrVP4"
 ],
 "7/4": [
  "2m99d0aw9EE",
  "7cXLt1XePvg"
 ],
 "7/5": [
  "8lF8VR7zrPA",
  "5Pr2gSLA-pE"
 ],
 "7/6": [
  "2meymqnflYo"
 ],
 "7/7": [
  "8lF8VR7zrPA",
  "TJ1F9ymcYcs"
 ],
 "8/13": [
  "Ifp0DdazygQ",
  "tmAnk1KNA_I",
  "aATkTPzyDFI",
  "YcMXT_U56OY",
  "5DxA_2FkaAI"
 ],
 "9/3": [
  "w4pfBktdq60",
  "ViZ88TXRIyA"
 ],
 "9/4": [
  "HZ5zV5Kimhk"
 ],
 "9/5": [
  "HZ5zV5Kimhk"
 ],
 "9/6": [
  "w4pfBktdq60",
  "ViZ88TXRIyA",
  "lhJflyBK0fM"
 ],
 "9/7": [
  "Finlckm3aM4",
  "8TwrEyAYnd8"
 ],
 "10/3": [
  "i-00To28dEM"
 ],
 "10/4": [
  "2m99d0aw9EE",
  "aATkTPzyDFI"
 ],
 "10/5": [
  "2m99d0aw9EE",
  "i-00To28dEM"
 ],
 "10/6": [
  "0g0rs_JSup4"
 ],
 "10/7": [
  "lhJflyBK0fM",
  "pomO9QOwlsg",
  "aATkTPzyDFI"
 ],
 "11/3": [
  "ICdUvnYdz2Y",
  "i-00To28dEM"
 ],
 "11/4": [
  "ICdUvnYdz2Y"
 ],
 "11/5": [
  "i-00To28dEM",
  "ICdUvnYdz2Y"
 ],
 "11/6": [
  "lhJflyBK0fM",
  "pomO9QOwlsg",
  "7cXLt1XePvg",
  "DC7Im-Mlsq8"
 ],
 "11/7": [
  "a5ix2NCIVJ4",
  "HMF6DxXCRK0"
 ],
 "12/3": [
  "a5ix2NCIVJ4",
  "JerIihj4q24"
 ],
 "12/4": [
  "ImNy4iLrrpo"
 ],
 "12/6": [
  "a5ix2NCIVJ4",
  "lLLXi7uBvAU",
  "_ei_TCT480g"
 ],
 "12/7": [
  "HMF6DxXCRK0",
  "a5ix2NCIVJ4"
 ],
 "13/3": [
  "PbJzM5Ll-sE",
  "2Quz1EMZuqY",
  "_ei_TCT480g"
 ],
 "13/4": [
  "PbJzM5Ll-sE",
  "2Quz1EMZuqY"
 ],
 "13/5": [
  "uOWtpfSk4Vc"
 ],
 "13/6": [
  "rcP2zB8Fyxk",
  "8TwrEyAYnd8"
 ],
 "13/7": [
  "HMF6DxXCRK0",
  "2Quz1EMZuqY"
 ],
 "14/3": [
  "8xeDD-V9GiE",
  "WwUJPUB8ATM",
  "-C4iLBdYVHM"
 ],
 "14/4": [
  "TJ1F9ymcYcs",
  "lhJflyBK0fM"
 ],
 "14/5": [
  "8xeDD-V9GiE",
  "ruoqlVy3_rk"
 ],
 "14/6": [
  "R_2pR8tdnBU",
  "WwUJPUB8ATM"
 ],
 "14/7": [
  "HMF6DxXCRK0",
  "-oVO6RJa2fM",
  "yVCSuz8kW7k",
  "xGTfqqmI9kM"
 ],
 "15/3": [
  "x1EpRD0fzzM",
  "8TwrEyAYnd8"
 ],
 "15/4": [
  "-_ugZZJ3mp0",
  "H1G51V5Y5LE"
 ],
 "15/5": [
  "GA5z7zpCoB4",
  "O79U9oPRF8M",
  "UkGfj5-qQRE"
 ],
 "15/6": [
  "rcP2zB8Fyxk",
  "Iu3ARLUcvNk"
 ],
 "15/7": [
  "8xeDD-V9GiE",
  "xGTfqqmI9kM"
 ],
 "16/13": [
  "HZ5zV5Kimhk",
  "_ei_TCT480g",
  "8TwrEyAYnd8",
  "uOWtpfSk4Vc",
  "xGTfqqmI9kM",
  "YcMXT_U56OY",
  "5DxA_2FkaAI"
 ]
};
function ipasVideoTargets(id){return Object.entries(ipasVideoMap).filter(([,ids])=>ids.includes(id)).map(([key])=>{const [week,page]=key.split('/').map(Number);return {week,page}})}
function ipasVideoId(v){try{const u=new URL(v.url);return u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||v.id}catch{return v.id}}
function ipasVideoTargetsHtml(v){const targets=ipasVideoTargets(ipasVideoId(v));if(!targets.length)return '';return '<div class="ipas-video-targets"><b>對應 iPAS 教材</b>'+targets.map(({week,page})=>{const w=window.IPASWeeks.find(x=>x.n===week),s=w?.slides.find(x=>x.n===page);return w&&s?'<button type="button" data-ipas-video-week="'+week+'" data-ipas-video-page="'+page+'">第 '+week+' 章 · '+escapeHtml(s.title)+' ↗</button>':''}).join('')+'</div>'}
function ipasVideoRows(week,page){const ids=page?ipasVideoMap[week+'/'+page]||[]:[...new Set(Object.entries(ipasVideoMap).filter(([k])=>k.startsWith(week+'/')).flatMap(([,ids])=>ids))];return ids.map(id=>importedVideoCatalog.find(v=>v.id===id)).filter(Boolean)}
function ipasVideoPanel(w,slide){const all=ipasVideoRows(w.n),local=ipasVideoRows(w.n,slide.n);const render=rows=>rows.map(v=>'<li><a href="'+escapeHtml(v.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(v.title)+' ↗</a>'+(/中級/.test(v.title)?'<small>中級延伸</small>':'')+'</li>').join('');return '<section class="ipas-video-panel"><h3>參考影片（Reference Videos）</h3><p class="muted">依片名、考綱與教材主題配對；尚未逐支核對完整內容及播放狀態。</p>'+(local.length?'<p><b>本頁相關影片</b></p><ul>'+render(local)+'</ul>':'<p class="muted">本頁暫無精確配對影片，可參閱本章影片。</p>')+'<details><summary>本章全部影片（'+all.length+' 支）</summary><ul>'+render(all)+'</ul></details><p><button type="button" data-ipas-video-library="'+w.n+'">在影片庫查看本章影片 ↗</button></p></section>'}
document.addEventListener('click',e=>{const jump=e.target.closest('[data-ipas-video-week]');if(jump){window.IPASCourse?.openVideoTarget(Number(jump.dataset.ipasVideoWeek),Number(jump.dataset.ipasVideoPage));return}const b=e.target.closest('[data-ipas-video-library]');if(b){videoLibraryQuery='';videoLibraryCategory='all';videoLibraryPage=0;videoLibraryIPASWeek=Number(b.dataset.ipasVideoLibrary);if(location.hash==='#videos')window.render();else location.hash='videos'}});
