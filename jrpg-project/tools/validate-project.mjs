// Validator proyek. Pemeriksaan yang terimplementasi dicetak di akhir; yang belum ada ditandai PLANNED.
import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {join,extname,dirname,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
if(process.argv[2])process.chdir(process.argv[2]);
const skip=new Set(['node_modules','.git']);
const files=[];
(function walk(d){for(const n of readdirSync(d)){if(skip.has(n))continue;const p=join(d,n);statSync(p).isDirectory()?walk(p):files.push(p.split(sep).join('/'))}})('.');
let errors=0;const bad=m=>{errors++;console.error('GAGAL:',m)};
const read=f=>readFileSync(f,'utf8');
const isRel=s=>!/^(https?:|data:|mailto:|#)/.test(s);

// 1. JSON, sintaks JS, berkas kosong, markdown hampir kosong
for(const f of files){
  const e=extname(f);
  if(e==='.json'){try{JSON.parse(read(f))}catch{bad(f+' JSON tidak valid')}}
  if(e==='.js'||e==='.mjs'){const r=spawnSync(process.execPath,['--check',f]);if(r.status!==0)bad(f+' sintaks: '+r.stderr)}
  if(e==='.md'&&read(f).trim().length<20)bad(f+' hampir kosong');
  if(statSync(f).size===0&&!f.endsWith('.nojekyll'))bad(f+' berkas kosong');
}
// 2. Referensi HTML dan manifest (path hilang atau absolut yang merusak subpath GitHub Pages)
for(const f of files.filter(x=>x.endsWith('.html'))){
  for(const m of read(f).matchAll(/(?:src|href)="([^"#?]+)/g)){
    if(!isRel(m[1]))continue;
    if(m[1].startsWith('/'))bad(`${f}: path absolut merusak subpath: ${m[1]}`);
    else if(!existsSync(join(dirname(f),m[1])))bad(`${f}: berkas hilang: ${m[1]}`);
  }
}
if(existsSync('manifest.json')){
  const mf=JSON.parse(read('manifest.json'));
  for(const k of ['start_url','scope'])if(String(mf[k]??'').startsWith('/'))bad('manifest.'+k+' absolut');
  for(const i of mf.icons??[])if(isRel(i.src)&&(i.src.startsWith('/')||!existsSync(i.src)))bad('manifest ikon hilang/absolut: '+i.src);
}
// 3. Modul ES di luar legacy/: impor hilang, bare import, siklus, arah lapisan, API browser di luar platform
const LAYER={utils:0,data:1,core:2,engine:3,entities:4,systems:5,world:6,narrative:6,ui:7,scenes:8};
const SRC_DIRS=new Set([...Object.keys(LAYER),'platform']);
const BROWSER=/\b(window|document|indexedDB|localStorage|sessionStorage|navigator|requestAnimationFrame|performance\.now)\b/;
const esm=files.filter(f=>/\.m?js$/.test(f)&&!f.startsWith('legacy/'));
const SPEC=/(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
const layerOf=f=>{const p=f.split('/');if(p[0]!=='src')return null;if(p.length===2)return p[1]==='main.js'?'main':'?';return p[1]};
const graph=new Map();
for(const f of esm){
  const code=read(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  const la=layerOf(f),deps=[];
  if(la==='?')bad(f+': berkas langsung di src/ selain main.js');
  else if(la&&la!=='main'&&!SRC_DIRS.has(la))bad(f+': folder src/'+la+' tidak ada di arsitektur');
  if(la&&la!=='main'&&la!=='platform'&&BROWSER.test(code))bad(f+': memakai API browser; harus lewat port (hanya platform/ dan main.js boleh)');
  for(const m of code.matchAll(SPEC)){
    const s=m[1]||m[2]||m[3];
    if(!s.startsWith('.')){if(!s.startsWith('node:')||f.startsWith('src/'))bad(`${f}: impor bare tidak diizinkan: ${s}`);continue}
    const t=join(dirname(f),s).split(sep).join('/');
    if(!files.includes(t)){bad(`${f}: impor tidak ditemukan: ${s}`);continue}
    deps.push(t);
    const lb=layerOf(t);
    if(la&&lb&&la!=='main'){
      if(lb==='platform'&&la!=='platform')bad(`${f} -> ${t}: hanya src/main.js yang boleh mengimpor platform/`);
      else if(la==='platform'&&!['utils','data','platform'].includes(lb)&&!t.startsWith('src/core/ports/'))bad(`${f} -> ${t}: platform hanya boleh mengimpor utils, data, core/ports`);
      else if(la!=='platform'&&lb in LAYER&&la in LAYER&&LAYER[lb]>LAYER[la])bad(`${f} -> ${t}: lapisan bawah mengimpor lapisan atas`);
    }
  }
  graph.set(f,deps);
}
const color=new Map();
function dfs(n,stack){
  color.set(n,1);stack.push(n);
  for(const d of graph.get(n)??[]){
    if(color.get(d)===1){bad('siklus impor: '+[...stack.slice(stack.indexOf(d)),d].join(' -> '));continue}
    if(!color.has(d))dfs(d,stack);
  }
  stack.pop();color.set(n,2);
}
for(const n of graph.keys())if(!color.has(n))dfs(n,[]);
// 4. Roadmap (khusus proyek ini)
if(existsSync('docs/04-production/DEVELOPMENT_ROADMAP.md')){
  const rm=read('docs/04-production/DEVELOPMENT_ROADMAP.md');
  for(const b of ['| 0 |','| 19 |','| 20+ |','| Final |'])if(!rm.includes(b))bad('roadmap tanpa '+b);
}
console.log(errors?`${errors} masalah`:`OK: ${files.length} berkas diperiksa, ${esm.length} modul ES (di luar legacy) dianalisis`);
console.log('Terimplementasi: JSON, sintaks JS, berkas kosong, referensi HTML/manifest (hilang + absolut), impor hilang, impor bare, siklus impor, arah lapisan, larangan API browser di luar platform, struktur src/, tahap roadmap.');
console.log('PLANNED / NOT VERIFIED: validasi referensi konten terhadap JSON Schema (menunggu schema Batch 1-2), referensi aset dari metadata JSON, kelengkapan metadata aset, pemeriksaan tautan antar dokumen markdown.');
process.exit(errors?1:0);
