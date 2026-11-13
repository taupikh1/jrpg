function mk(w,h,fn){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  fn((x,y,ww,hh,k)=>{g.fillStyle=k;g.fillRect(x,y,ww,hh)});
  const d=g.getImageData(0,0,w,h).data,op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>0;
  g.fillStyle=C.ol;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!op(x,y)&&(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1)))g.fillRect(x,y,1,1);
  return c;
}
