function act(){
  if(dlgOn){dlgOn=0;dlgEl.style.display='none';return}
  const n=props.find(o=>o.kind==='npc'&&Math.hypot(o.x-p.x,o.y-p.y)<28);
  if(n){dlgOn=1;$('nm').textContent=n.n;$('tx').textContent=n.s;dlgEl.style.display='block';return}
  if(p.sl>0)return;p.sl=.22;
  const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[p.dir];
  props.forEach(o=>{if(o.kind==='mon'&&Math.hypot(o.x-p.x-d[0]*14,o.y-p.y-d[1]*14)<22){o.hp--;o.kx=d[0]*110;o.ky=d[1]*110}});
  for(let i=props.length-1;i>=0;i--){const o=props[i];
    if(o.hp<=0){for(let k=0;k<6;k++)fx.push({x:o.x,y:o.y-10,vx:(Math.random()-.5)*60,vy:-Math.random()*40-10,t:0});
      props.splice(i,1);coins++;$('info').textContent='🪙 '+coins+' · WASD/panah · A / Spasi: tebas atau bicara'}}
}
