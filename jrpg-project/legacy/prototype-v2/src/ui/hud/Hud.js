const hrt=(x,y,k,half)=>{
  const P=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>P.forEach((row,j)=>{for(let i=0;i<7;i++)if(row[i]==='X')R(x+i+a,y+j+b,1,1,C.ol)}));
  P.forEach((row,j)=>{for(let i=0;i<7;i++)if(row[i]==='X')R(x+i,y+j,1,1,k?(half&&i>3?'#7a6a80':'#e5484d'):'#7a6a80')});
  if(k)R(x+1,y+1,1,1,'#ffb3b8');
};
function drawHud(){for(let i=0;i<3;i++){const v=p.hp-2*i;hrt(LW-30+i*9,5,v>0,v==1)}}
