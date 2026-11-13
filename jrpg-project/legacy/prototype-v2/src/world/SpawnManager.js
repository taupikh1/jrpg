let seed=11;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const props=[];
for(let i=0;i<150;i++){
  const x=Math.round((rnd()-.5)*1800),y=Math.round((rnd()-.5)*1200+130);
  if(Math.abs(Math.floor(y/16)-pathTy(Math.floor(x/16)))<=3||(x>20&&x<270&&y>0&&y<150)||Math.hypot(x+192,y-232)<90)continue;
  props.push({kind:['tree','tree','bush','flower','flower','rock'][Math.floor(rnd()*6)],x,y,c:Math.floor(rnd()*3)});
}
[[70,92,0],[140,92,1],[210,92,2]].forEach(([x,y,c])=>props.push({kind:'bld',x,y,c}));
const blds=props.filter(o=>o.kind==='bld');
[[140,114,0,'Penjaga Toko','Selamat datang! Kalau ketemu slime, tebas saja. Kadang mereka menjatuhkan koin.'],
 [98,118,1,'Tetua Desa','Pohon tua di hutan itu sudah lama marah. Hati-hati kalau kamu mendekat.'],
 [190,122,2,'Penjaga Gerbang','Jangan lewat malam hari. Kelelawar gua suka berkeliaran.']]
 .forEach(([x,y,c,n,s])=>props.push({kind:'npc',x,y,c,n,s}));
[['lamp',112,106],['lamp',168,106],['barrel',126,112],['barrel',131,113],['chest',162,112],['sign',32,128],['well',245,122],
 ['fire',-40,176],['chest',-62,170],['fence',40,142],['fence',56,142],['fence',72,142]]
 .forEach(([kind,x,y])=>props.push({kind,x,y,c:0}));
[[0,-120,60],[0,-90,210],[1,-200,130],[1,-150,20],[2,-60,60],[2,300,200],[0,320,110],[1,260,230]]
 .forEach(([t,x,y])=>props.push({kind:'mon',t,x,y,hx:x,hy:y,hp:2,vx:0,vy:0,kx:0,ky:0,wt:0}));
props.sort((a,b)=>a.y-b.y);
const trees=props.filter(p=>p.kind==='tree');
