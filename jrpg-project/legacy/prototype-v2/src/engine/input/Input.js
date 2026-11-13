// ===== Input =====
const keys={},btn={up:0,down:0,left:0,right:0};
const map={up:['w','arrowup'],down:['s','arrowdown'],left:['a','arrowleft'],right:['d','arrowright']};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
const held=n=>map[n].some(k=>keys[k])||btn[n];
document.querySelectorAll('#pad button').forEach(b=>{
  const k=b.dataset.k,on=e=>{e.preventDefault();btn[k]=1},off=e=>{e.preventDefault();btn[k]=0};
  b.addEventListener('pointerdown',on);
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,off));
});
