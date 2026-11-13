// Bangunan desa (48x44, pintu jelas terbaca)
const house=(rf,rd,aw)=>mk(48,44,r=>{
  r(4,18,40,26,'#f1dcb0');r(36,20,8,24,'#d8c090');r(0,8,48,12,rf);r(4,4,40,5,rf);r(10,0,28,5,rf);r(0,17,48,3,rd);
  r(20,28,9,16,'#7a4a2a');r(27,36,1,2,'#f4c84e');
  [8,33].forEach(x=>{r(x,26,8,8,'#9fd8ff');r(x+3,26,1,8,'#7a4a2a');r(x,29,8,1,'#7a4a2a')});
  if(aw)for(let i=0;i<5;i++)r(12+i*5,21,5,4,i&1?'#fff':aw)});
const BL=[house('#e5484d','#b8343c'),house('#3d82e0','#2c63b4','#f4c84e'),house('#4fa86a','#3a8750')];
