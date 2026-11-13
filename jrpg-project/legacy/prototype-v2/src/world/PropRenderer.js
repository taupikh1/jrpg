const TC=[['#2f7a3c','#3f9a4a','#5cbb5e'],['#357f46','#47a057','#6cc36b'],['#2a6f45','#3a8f55','#58b36c']];
function drawTree(x,y,c){
  shadow(x,y,13);
  R(x-4,y-15,8,16,C.ol);R(x-3,y-14,6,14,'#7a5235');R(x+1,y-14,2,14,'#5f3f27');
  const lobes=[[x,y-28,13],[x-9,y-21,9],[x+9,y-21,9]],k=TC[c];
  lobes.forEach(l=>ell(l[0],l[1],l[2]+1,l[2]+1,C.ol));
  lobes.forEach(l=>ell(l[0],l[1],l[2],l[2],k[0]));
  ell(x-2,y-30,9,9,k[1]);ell(x-5,y-33,4,4,k[2]);
}
function drawProp(p){
  const{x,y,c}=p;
  if(p.kind==='tree')drawTree(x,y,c);
  else if(p.kind==='bush'){
    shadow(x,y,10);
    const k=TC[c];
    ell(x-5,y-5,7,7,C.ol);ell(x+4,y-6,8,8,C.ol);
    ell(x-5,y-5,6,6,k[1]);ell(x+4,y-6,7,7,k[1]);ell(x+2,y-9,3,3,k[2]);
  }else if(p.kind==='flower'){
    const col=['#ff8fb1','#ffd45c','#ffffff'][c];
    R(x,y-3,1,3,'#3f8a46');R(x-1,y-5,3,1,col);R(x-1,y-3,3,1,col);R(x-1,y-4,1,1,col);R(x+1,y-4,1,1,col);R(x,y-4,1,1,'#ffe36e');
  }else if(p.kind==='bld'){shadow(x,y,24);L.drawImage(BL[c],x-24,y-44)}
  else if(p.kind==='npc'){shadow(x,y,6);L.drawImage(NP[c][Math.floor(T*1.5)&1],x-12,y-29)}
  else if(p.kind==='mon'){
    const s=MS[p.t][Math.floor(T*(p.t==2?10:4)+x)&1],fl=p.t==2?-6-Math.sin(T*6)*2:0;
    shadow(x,y,p.t==2?6:8);L.drawImage(s,Math.round(x-12),Math.round(y-s.height+2+fl));
  }else if(p.kind==='barrel'){shadow(x,y,6);R(x-5,y-11,10,12,C.ol);R(x-4,y-10,8,10,'#b5773a');R(x-4,y-8,8,1,'#7a4a2a');R(x-4,y-4,8,1,'#7a4a2a');R(x-3,y-10,2,10,'#d49a52')}
  else if(p.kind==='lamp'){shadow(x,y,5);R(x-1,y-24,3,25,C.ol);R(x,y-23,1,23,'#5a4a5e');R(x-4,y-30,9,8,C.ol);R(x-3,y-29,7,6,'#ffe27a');R(x-3,y-29,2,2,'#fff6c0')}
  else if(p.kind==='sign'){R(x-1,y-12,3,13,C.ol);R(x,y-11,1,11,'#7a4a2a');R(x-8,y-18,17,9,C.ol);R(x-7,y-17,15,7,'#d9a85c');R(x-5,y-15,11,1,'#a06a28');R(x-5,y-12,7,1,'#a06a28')}
  else if(p.kind==='fence'){R(x-9,y-10,18,11,C.ol);[-8,-2,4].forEach(o=>R(x+o,y-9,4,9,'#c98a3a'));R(x-8,y-6,16,2,'#d9a85c')}
  else if(p.kind==='chest'){shadow(x,y,7);R(x-7,y-10,14,11,C.ol);R(x-6,y-9,12,9,'#b5773a');R(x-6,y-9,12,3,'#d49a52');R(x-1,y-6,2,3,'#f4c84e')}
  else if(p.kind==='fire'){const f=Math.floor(T*8)%3;R(x-6,y-3,12,4,C.ol);R(x-5,y-2,10,2,'#7a4a2a');R(x-3,y-8-f,7,6+f,C.ol);R(x-2,y-7-f,5,5+f,'#ff7a2e');R(x-1,y-5-f,3,3+f,'#ffd45c')}
  else if(p.kind==='well'){shadow(x,y,10);ell(x,y-6,9,7,C.ol);ell(x,y-6,8,6,'#9aa3a8');ell(x,y-8,5,3,'#3d82e0');R(x-8,y-20,3,13,C.ol);R(x+6,y-20,3,13,C.ol);R(x-7,y-19,1,12,'#7a4a2a');R(x+7,y-19,1,12,'#7a4a2a');R(x-10,y-23,21,4,C.ol);R(x-9,y-22,19,2,'#e5484d')}
  else{
    shadow(x,y,8);
    ell(x,y-4,7,5,C.ol);ell(x,y-4,6,4,['#9aa3a8','#b3b9bc','#8a9399'][c]);R(x-3,y-6,3,1,'#d6dbde');
  }
}
