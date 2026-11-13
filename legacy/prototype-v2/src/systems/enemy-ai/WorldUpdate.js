function updWorld(dt){
  if(p.sl>0)p.sl-=dt;if(p.inv>0)p.inv-=dt;
  props.forEach(o=>{if(o.kind!=='mon')return;
    const sp=[14,18,28][o.t],dp=Math.hypot(p.x-o.x,p.y-o.y)||1;o.wt-=dt;
    if(dp<80&&!dlgOn){o.vx=(p.x-o.x)/dp*sp;o.vy=(p.y-o.y)/dp*sp}
    else if(o.wt<=0){o.wt=1+Math.random()*2;const a=Math.random()*6.28,s=Math.random()<.4?0:sp*.6;o.vx=Math.cos(a)*s;o.vy=Math.sin(a)*s;
      if(Math.hypot(o.x-o.hx,o.y-o.hy)>70){const q=Math.atan2(o.hy-o.y,o.hx-o.x);o.vx=Math.cos(q)*sp*.6;o.vy=Math.sin(q)*sp*.6}}
    o.kx*=.85;o.ky*=.85;o.x+=(o.vx+o.kx)*dt;o.y+=(o.vy+o.ky)*dt;
    if(dp<10&&!(p.inv>0)){p.inv=1;p.hp--;if(p.hp<=0){p.hp=6;p.x=0;p.y=136}}
  });
  const tx=p.x+(p.dir==='right'?-14:p.dir==='left'?14:12),ty=p.y-6,k=Math.min(1,dt*4);
  fam.x+=(tx-fam.x)*k;fam.y+=(ty-fam.y)*k;
  fx.forEach(o=>{o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=90*dt});
  while(fx.length&&fx[0].t>.5)fx.shift();
}
