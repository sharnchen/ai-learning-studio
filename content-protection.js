/* Deters ordinary selection/copying; client-side content is still inspectable. */
'use strict';
(()=>{
 const editable=event=>{
  const path=typeof event.composedPath==='function'?event.composedPath():[event.target];
  return path.some(node=>node instanceof Element&&!!node.closest('textarea:not([readonly]):not([disabled]), input:not([readonly]):not([disabled]), [contenteditable="true"]'));
 };
 for(const type of ['selectstart','copy','cut','dragstart'])document.addEventListener(type,event=>{
  if(editable(event))return;
  event.preventDefault();
  if(type==='copy'||type==='cut')event.clipboardData?.clearData();
 },true);
 document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&!event.altKey&&['a','c','x'].includes(event.key.toLowerCase())&&!editable(event))event.preventDefault();
 },true);
})();
