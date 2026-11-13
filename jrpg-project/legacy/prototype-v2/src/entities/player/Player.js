// ===== Player =====
const p={x:0,y:136,dir:'down',moving:false,anim:0,hp:6,sl:0,inv:0};
const SPEED=70,dust=[];
let dustT=0;
function update(dt){
  updWorld(dt);
  let vx=0,vy=0;
  if(!dlgOn){if(held('up'))vy--;if(held('down'))vy++;if(held('left'))vx--;if(held('right'))vx++}
  p.moving=!!(vx||vy);
  if(p.moving){
    const n=Math.hypot(vx,vy);
    const ox=p.x,oy=p.y;p.x+=vx/n*SPEED*dt;p.y+=vy/n*SPEED*dt;p.anim+=dt;
    blds.forEach(b=>{if(Math.abs(p.x-b.x)<26&&p.y>b.y-14&&p.y<b.y+2){p.x=ox;p.y=oy}});
    p.dir=Math.abs(vy)>=Math.abs(vx)?(vy<0?'up':'down'):(vx<0?'left':'right');
    dustT+=dt;
    if(dustT>.16){dustT=0;dust.push({x:p.x+(Math.random()*6-3),y:p.y-1,t:0})}
    trees.forEach(t=>{
      const dx=p.x-t.x,dy=p.y-t.y,d=Math.hypot(dx,dy);
      if(d<9&&d>0){p.x=t.x+dx/d*9;p.y=t.y+dy/d*9}
    });
  }else p.anim=0;
  dust.forEach(d=>d.t+=dt);
  while(dust.length&&dust[0].t>.4)dust.shift();
}
function getFrame(t){
  const f=F[p.dir];
  if(p.moving)return f.walk[Math.floor(p.anim*9)%4];
  if(t%4<.15)return f.blink;
  return f.idle[Math.floor(t*1.6)%2];
}
function drawPlayer(t){
  const x=Math.round(p.x),y=Math.round(p.y);
  shadow(x,y,6);
  if(!(p.inv>0&&Math.floor(t*20)%2))L.drawImage(getFrame(t),x-12,y-29);
}
