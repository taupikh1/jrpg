function drawFx(t){
  shadow(Math.round(fam.x),Math.round(fam.y)+8,4);
  L.drawImage(FM,Math.round(fam.x-8),Math.round(fam.y-20+Math.sin(t*4)*2));
  if(p.sl>0){
    const a0={right:0,down:1.57,left:3.14,up:4.71}[p.dir],pr=1-p.sl/.22;
    for(let i=0;i<8;i++){const a=a0-1.1+i*.3*(.4+pr);
      R(Math.round(p.x+Math.cos(a)*17),Math.round(p.y-14+Math.sin(a)*17),i>4?2:1,i>4?2:1,i>5?'#fff':'#ffe9a0')}
  }
  fx.forEach(o=>{const x=Math.round(o.x),y=Math.round(o.y);R(x-1,y,3,1,'#ffd45c');R(x,y-1,1,3,'#ffd45c');R(x,y,1,1,'#fff')});
}
