// ===== Dunia =====
const hash=(x,y)=>{let h=Math.imul(x,374761393)+Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const pathTy=tx=>Math.round(8+Math.sin(tx/5)*3);
const R=(x,y,w,h,k)=>{L.fillStyle=k;L.fillRect(x,y,w,h)};
function ell(cx,cy,rx,ry,k){
  L.fillStyle=k;
  for(let y=-ry;y<=ry;y++){const w=Math.floor(rx*Math.sqrt(1-(y*y)/(ry*ry+.01))+.5);L.fillRect(cx-w,cy+y,w*2+1,1)}
}
function shadow(x,y,w){
  L.fillStyle='rgba(20,60,30,.28)';
  L.fillRect(x-w,y-1,w*2,3);L.fillRect(x-w+2,y-2,w*2-4,1);L.fillRect(x-w+2,y+2,w*2-4,1);
}
function drawGround(cx,cy){
  const tx0=Math.floor(cx/16),ty0=Math.floor(cy/16);
  for(let ty=ty0;ty<=ty0+Math.ceil(LH/16)+1;ty++)for(let tx=tx0;tx<=tx0+Math.ceil(LW/16)+1;tx++){
    const sx=tx*16,sy=ty*16,h=hash(tx,ty),dirt=Math.abs(ty-pathTy(tx))<=1,pd=(tx+12)**2+(ty-14)**2;
    if(pd<=9){
      R(sx,sy,16,16,(tx+ty)&1?'#4fa3e8':'#5bb0f0');R(sx+(Math.floor(T*3)+tx*5)%12,sy+(ty*7+4)%12,3,1,'#bfe6ff');
    }else if(pd<=14){R(sx,sy,16,16,'#f0dca0');if(h>.6)R(sx+Math.floor(h*50)%12,sy+Math.floor(h*70)%12,2,1,'#d8c080')}
    else if(tx>=2&&tx<=14&&ty>=4&&ty<=7){
      R(sx,sy,16,16,'#bcb6c2');R(sx,sy+7,16,1,'#9a95a3');R(sx+(ty&1?4:10),sy,1,8,'#9a95a3');R(sx+(ty&1?10:4),sy+8,1,8,'#9a95a3');R(sx,sy,16,1,'#d6d1db');
    }else if(dirt){
      R(sx,sy,16,16,(tx+ty)&1?'#d9b87c':'#d2b074');
      if(h>.7)R(sx+Math.floor(h*40)%12,sy+Math.floor(h*90)%12,2,1,'#b8975c');
      if(h<.15)R(sx+Math.floor(h*100)%12,sy+Math.floor(h*55)%12,1,1,'#efd6a0');
    }else{
      R(sx,sy,16,16,(tx+ty)&1?'#6dbd58':'#65b350');
      for(let k=0;k<2;k++){
        const hh=hash(tx*3+k,ty*7);
        if(hh>.45){
          const px=sx+Math.floor(hh*997)%13,py=sy+Math.floor(hh*541)%12;
          R(px,py,1,2,'#4f9a42');R(px+2,py+1,1,1,'#4f9a42');R(px+1,py,1,1,'#8fd678');
        }
      }
    }
  }
}
