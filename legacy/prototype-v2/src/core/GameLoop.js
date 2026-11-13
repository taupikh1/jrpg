// ===== Loop =====
let last=performance.now();
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  update(dt);
  const t=now/1000;T=t;
  const cx=Math.round(p.x-LW/2),cy=Math.round(p.y-LH/2);
  L.setTransform(1,0,0,1,0,0);
  R(0,0,LW,LH,'#65b350');
  L.setTransform(1,0,0,1,-cx,-cy);
  drawGround(cx,cy);
  dust.forEach(d=>{
    const a=1-d.t/.4,s=d.t<.2?2:1;
    L.fillStyle='rgba(255,255,255,'+(a*.7).toFixed(2)+')';
    L.fillRect(Math.round(d.x),Math.round(d.y-d.t*8),s,s);
  });
  props.sort((a,b)=>a.y-b.y);
  let done=false;
  for(const pr of props){
    if(pr.x<cx-30||pr.x>cx+LW+30||pr.y<cy||pr.y>cy+LH+50)continue;
    if(!done&&pr.y>p.y){drawPlayer(t);done=true}
    drawProp(pr);
  }
  if(!done)drawPlayer(t);
  drawFx(t);
  L.setTransform(1,0,0,1,0,0);drawHud();
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(low,0,0,LW*S*dpr,LH*S*dpr);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
