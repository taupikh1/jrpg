// NPC (24x32, proporsi chibi sama seperti MC)
const npc=(b,bd,hair,hat,beard,f)=>mk(24,32,r=>{
  r(9,25,2,3,C.boot);r(13,25,2,3,C.boot);r(7,17+f,10,9-f,b);r(14,17+f,3,9-f,bd);r(6,18+f,2,6,b);r(16,18+f,2,6,bd);
  [[8,8],[7,10],[6,12],[6,12],[6,12],[6,12],[6,12],[6,12],[7,10],[8,8]].forEach(([x,w],i)=>r(x,5+f+i,w,1,C.skin));
  r(6,5+f,12,4,hair);r(8,11+f,2,3,C.eye);r(14,11+f,2,3,C.eye);r(8,11+f,1,1,C.hl);r(14,11+f,1,1,C.hl);
  r(7,14+f,2,1,C.blush);r(15,14+f,2,1,C.blush);r(11,15+f,2,1,C.mouth);
  if(beard)r(8,15+f,8,5,beard);if(hat){r(5,3+f,14,3,hat);r(8,f,8,4,hat)}});
const NP=[[C.pack,C.packD,'#5a3a22','#3f9a4a',0],['#8b5fc0','#6b43a0','#eee','#8b5fc0','#fff'],['#c4ccd4','#8a95a0','#8a4b2c','#e5484d',0]]
  .map(a=>[0,1].map(f=>npc(...a,f)));
