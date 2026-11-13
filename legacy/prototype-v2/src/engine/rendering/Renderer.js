const cv=document.getElementById('g'),ctx=cv.getContext('2d');
const low=document.createElement('canvas'),L=low.getContext('2d');
let LW,LH,S,dpr;
function resize(){
  dpr=Math.round(window.devicePixelRatio)||1;
  const W=innerWidth,H=innerHeight;
  S=Math.max(2,Math.min(5,Math.floor(Math.min(W,H)/160)));
  LW=Math.ceil(W/S);LH=Math.ceil(H/S);
  low.width=LW;low.height=LH;
  cv.width=W*dpr;cv.height=H*dpr;
}
addEventListener('resize',resize);resize();
