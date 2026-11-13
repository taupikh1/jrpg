// ===== Sprite MC digambar per piksel (24x32) =====
function makeFrame(dir,st,b,bl){
  const c=document.createElement('canvas');c.width=24;c.height=32;
  const g=c.getContext('2d');
  const r=(x,y,w,h,k)=>{g.fillStyle=k;g.fillRect(x,y,w,h)};
  const side=dir==='right',up=dir==='up',hy=5+b;
  // kaki
  if(side){
    const o=st*2;
    r(11+o,25,2,2,C.pantsD);r(11+o,27,4,2,C.bootD);
    r(11-o,25,2,2,C.pants);r(11-o,27,4,2,C.boot);
  }else{
    const lu=st<0?1:0,ru=st>0?1:0;
    r(9,25,2,2-lu,C.pants);r(8,27-lu,3,2,C.boot);
    r(13,25,2,2-ru,C.pants);r(13,27-ru,3,2,C.boot);
  }
  // badan
  const bx=side?9:8,bw=side?6:8;
  if(side)r(7,17+b,3,6,C.pack);
  r(bx,17+b,bw,8-b,C.tun);r(bx+bw-2,17+b,2,8-b,C.tunD);
  r(bx,22+b,bw,1,C.belt);
  // syal
  r(bx,16+b,bw,2,C.scarf);
  if(!side&&!up){r(14,18+b,2,4,C.scarf);r(14,21+b,2,1,C.scarfD)}
  if(up){r(10+st,18+b,2,4,C.scarf);r(10+st,21+b,2,1,C.scarfD)}
  if(side)r(6-(st?1:0),17+b,4,2,C.scarf);
  // ransel & tangan
  if(up){r(8,17+b,8,6,C.pack);r(8,22+b,8,1,C.packD)}
  if(!side){
    const sa=up?-st:st;
    r(6,18+b-sa,2,5,C.tun);r(6,23+b-sa,2,1,C.skin);
    r(16,18+b+sa,2,5,C.tunD);r(16,23+b+sa,2,1,C.skin);
  }else{
    r(11+st*2,18+b,2,5,C.tunD);r(11+st*2,23+b,2,1,C.skin);
  }
  // kepala
  const rows=[[8,8],[7,10],[6,12],[6,12],[6,12],[6,12],[6,12],[6,12],[6,12],[7,10],[8,8]];
  rows.forEach(([x,w],i)=>r(x,hy+i,w,1,C.skin));
  if(up){
    rows.slice(0,10).forEach(([x,w],i)=>r(x,hy+i,w,1,C.hair));
    r(8,hy+1,4,1,C.hairL);r(11,hy-1,2,1,C.hair);
  }else{
    rows.slice(0,4).forEach(([x,w],i)=>r(x,hy+i,w,1,C.hair));
    r(8,hy+1,3,1,C.hairL);r(11,hy-1,2,1,C.hair);
    if(!side){
      r(6,hy+4,4,1,C.hair);r(11,hy+4,1,1,C.hair);r(14,hy+4,4,1,C.hair);
      r(6,hy+5,1,3,C.hair);r(17,hy+5,1,3,C.hair);
      [8,14].forEach(x=>{
        if(bl)r(x,hy+7,2,1,C.ol);
        else{r(x,hy+5,2,3,C.eye);r(x,hy+5,1,1,C.hl)}
      });
      r(7,hy+8,2,1,C.blush);r(15,hy+8,2,1,C.blush);r(11,hy+9,2,1,C.mouth);
    }else{
      r(6,hy+4,6,6,C.hair);r(12,hy+4,6,1,C.hair);
      if(bl)r(14,hy+7,2,1,C.ol);
      else{r(14,hy+5,2,3,C.eye);r(14,hy+5,1,1,C.hl)}
      r(15,hy+8,2,1,C.blush);r(17,hy+9,1,1,C.mouth);
    }
  }
  // outline otomatis
  const d=g.getImageData(0,0,24,32).data;
  const op=(x,y)=>x>=0&&y>=0&&x<24&&y<32&&d[(y*24+x)*4+3]>0;
  g.fillStyle=C.ol;
  for(let y=0;y<32;y++)for(let x=0;x<24;x++)
    if(!op(x,y)&&(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1)))g.fillRect(x,y,1,1);
  return c;
}
function flip(c){
  const n=document.createElement('canvas');n.width=24;n.height=32;
  const g=n.getContext('2d');g.translate(24,0);g.scale(-1,1);g.drawImage(c,0,0);return n;
}
const F={};
['down','up','right'].forEach(dir=>{
  F[dir]={walk:[[0,0],[-1,-1],[0,0],[1,-1]].map(([s,b])=>makeFrame(dir,s,b,0)),
    idle:[0,1].map(b=>makeFrame(dir,0,b,0)),blink:makeFrame(dir,0,0,1)};
});
F.left={walk:F.right.walk.map(flip),idle:F.right.idle.map(flip),blink:flip(F.right.blink)};
