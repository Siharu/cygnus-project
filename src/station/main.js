import { A } from './assets.js';
import { META } from './meta.js';
import { createInterior } from './interior.js';
import { LAYOUT } from './interior_layout.js';
import { createCheckpoint } from './checkpoint.js';
import { createStationFences } from './fences.js';
import { createGrass, MEADOW } from './grassland.js';
import { createBuildingInterior } from './interiors_hub.js';
import { HUB } from './interiors_hub_layout.js';
import { createCritters } from './critters.js';
import { createCompass } from './compass.js';
import { createWeather } from './weather.js';
import { createLighting } from './lighting.js';
import { createCompanion } from '../../assets/companion/companion.js';
// THREE comes from the <script> tag in index.html (global).
/* ===== DRIFTER — WNCORE STATION 01 (HD-2D field build) =====
   Sections: 0 config/layout · 1 core · 2 assets · 3 ground bake · 4 world · 5 player (+ Shu, the companion) · 6 fx · 7 ui · 8 loop
   Assets (sprites / terrain tiles / player atlas) live in the final <script> block, one per line. */
async function boot(A,META){
const T=THREE,$=i=>document.getElementById(i);
const DEBUG=/[?&]debug/.test(location.search);
const FXT={off:{kb:0,kg:0,kn:0,kt:0,ff:0,mist:0,shaft:0,rn:0,sp:0},low:{kb:1.1,kg:.5,kn:.03,kt:2.2,ff:36,mist:8,shaft:5,rn:700,sp:140},full:{kb:2.2,kg:1.5,kn:.055,kt:5,ff:120,mist:30,shaft:16,rn:2000,sp:380}};
const FXK=FXT[(location.search.match(/[?&]fx=(\w+)/)||[])[1]]||FXT.low;
// ---------- 0. CONFIG & LAYOUT (edit here) ----------
const GN=14,GC=7,GH=GN*GC/2;               // ground: 14x14 cells of 7 units -> +-49
const BOUND=36;                             // player walk limit
const AMB=[.56,.64,.82];                     // sprite night tint
const BLD={ // k=sprite, x/z=footprint centre, rx/rz=footprint half size, h=world height, L=[dx,dz,colour,intensity]
 station:{k:'relay_station',x:-14,z:-14,rx:3.2,rz:3.2,h:24.0,L:[[3.13,-0.97,0xffb868,2.4]]},
 shed:{k:'utility_shed',x:0,z:-16,rx:3,rz:3,h:7.4,L:[[3.6,3.6,0xffb060,1.5]]},
 depot:{k:'maintenance_depot',x:-33,z:-8,rx:6,rz:3.2,h:9.2,L:[[0,5,0xffb060,1.5]]},
 wtower:{k:'water_tower',x:9,z:-30,rx:2.4,rz:2.4,h:15.5},
 wtch:{k:'watchtower',x:-27,z:6,rx:2.2,rz:2.2,h:13.5,L:[[2,2,0xffc070,1.3]]},
 booth:{k:'checkpoint_booth',x:-11.5,z:9.9,rx:3,rz:3,h:8.2,L:[[3,3,0xffb868,1.6]]},
 cottage:{k:'residential_cottage',x:15,z:-3,rx:4,rz:3.6,h:9,L:[[0,5,0xffc070,1.6]]},
 ruin:{k:'ruined_building',x:31,z:-14,rx:5,rz:4.5,h:10.5}
};
// ground zones, painter order. m: s soil, a asphalt, p pavement
const ZONES=[
 {m:'s',r:[-49,11,49,22.2],soft:1.8,n:1.6},
 {m:'a',r:[-49,13.4,49,19.8],soft:.8,n:.5},
 {m:'s',r:[-14,-22,9,-8],soft:2.4,n:2},
 {m:'s',r:[-41,-15,-24,2],soft:2.4,n:2},
 {m:'s',c:[-27,6,5],soft:2,n:2},
 {m:'s',r:[8,-9,23,5],soft:2.5,n:2.4},
 {m:'p',r:[-22.5,-9.6,-1.5,5.4],soft:1,n:1.3},
 {m:'p',r:[24,-21,37,-8],soft:.8,n:3},
 {m:'s',r:[-22.6,22,-19.4,36.5],soft:1.6,n:1.4} // trail south to the forest
];
// ---------- helpers ----------
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RN=mulberry(0x5EED01),rr=(a,b)=>a+RN()*(b-a),pick=a=>a[RN()*a.length|0];
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
function hash2(x,y){let h=Math.imul(x,374761393)+Math.imul(y,668265263);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y)=>vnoise(x,y)*.6+vnoise(x*2.1+7,y*2.1+3)*.3+vnoise(x*4.3+1,y*4.3+9)*.1;
function zoneW(x,z,noise){ // -> [soil,asphalt,pave]
 const cur={g:1,s:0,a:0,p:0};
 for(const q of ZONES){let d;
  if(q.r){const dx=Math.max(q.r[0]-x,x-q.r[2]),dz=Math.max(q.r[1]-z,z-q.r[3]);d=(dx>0||dz>0)?Math.hypot(Math.max(dx,0),Math.max(dz,0)):Math.max(dx,dz)}
  else d=Math.hypot(x-q.c[0],z-q.c[1])-q.c[2];
  if(noise)d+=(fbm(x*.35,z*.35)-.5)*2*q.n;
  const w=1-sm(-q.soft,q.soft,d);
  cur.g*=1-w;cur.s*=1-w;cur.a*=1-w;cur.p*=1-w;cur[q.m]+=w}
 if(noise){const nz=sm(.6,.72,fbm(x*.07+40,z*.07+11))*sm(20,32,Math.hypot(x+10,z+8))*.0+sm(.64,.74,fbm(x*.09+3,z*.09+8))*.85*sm(0,2.5,Math.max(MEADOW.x0-x,x-MEADOW.x1,MEADOW.z0-z,z-MEADOW.z1));const t=cur.g*nz;cur.g-=t;cur.s+=t}
 return [cur.s,cur.a,cur.p]}
// ---------- 1. CORE ----------
const ren=new T.WebGLRenderer({antialias:false});
ren.setPixelRatio(Math.min(devicePixelRatio,1.5));document.body.prepend(ren.domElement);
const FOG=0x182836,sc=new T.Scene();sc.background=new T.Color(FOG);sc.fog=new T.FogExp2(FOG,.0165);
const cam=new T.OrthographicCamera(-1,1,1,-1,.1,400),OFF=new T.Vector3(22,22,22);
const rt=new T.WebGLMultisampleRenderTarget(4,4),pS=new T.Scene(),pC=new T.OrthographicCamera(-1,1,1,-1,0,1);
const pu={t:{value:rt.texture},px:{value:new T.Vector2(1,1)},time:{value:0},wrong:{value:0},kb:{value:FXK.kb},kg:{value:FXK.kg},kn:{value:FXK.kn},kt:{value:FXK.kt}};
pS.add(new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:pu,vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D t;uniform vec2 px;uniform float time,wrong,kb,kg,kn,kt;varying vec2 u;
float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=u;float ln=floor(u.y*70.);float tear=step(.975,h1(vec2(ln,floor(time*14.))))*wrong;uv.x+=tear*.03*(h1(vec2(ln,floor(time*14.)+3.))-.5);
float b=smoothstep(.16,.5,abs(u.y-.5))*kt;vec3 c=vec3(0.),l=vec3(0.);
for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){vec2 o=vec2(float(i),float(j));c+=texture2D(t,uv+o*px*b).rgb;l+=max(texture2D(t,uv+o*px*4.).rgb-.42,0.);}
c/=25.;l/=25.;c+=l*kb;
vec3 wg=vec3(0.);for(int k=0;k<8;k++){float a=float(k)*.7854;vec2 d=vec2(cos(a),sin(a));wg+=max(texture2D(t,uv+d*px*18.).rgb-.3,0.)+max(texture2D(t,uv+d*px*40.).rgb-.3,0.);}c+=wg/16.*kg*vec3(1.,.95,.9);
float ca=(.0002+wrong*.004)*(.4+length(u-.5)*2.);c.r=mix(c.r,texture2D(t,uv+vec2(ca,0.)).r,.8);c.b=mix(c.b,texture2D(t,uv-vec2(ca,0.)).b,.8);
c*=.4+.6*(1.-smoothstep(.35,.95,length(u-.5)*1.25));
float lu=dot(c,vec3(.3,.59,.11));c=mix(vec3(lu),c,.92-wrong*.4);c+=vec3(-.012,.014,.026)*(1.-lu)*2.;c+=vec3(.03,.012,-.01)*smoothstep(.45,1.,lu);c=c*.93+vec3(.028,.042,.052);
c+=(h1(u*vec2(1731.,911.)+time)-.5)*kn;c+=wrong*.04*h1(vec2(ln,time));gl_FragColor=vec4(c,1.);}`})));
let VH=15,ZM=1; // ZM: view zoom (tighter inside the tower). rs() also zooms in on phones (landscape and portrait)
function rs(){const w=innerWidth,h=innerHeight,v=VH=((h<560||(w<h&&ZM==1))?11:15)*ZM,a=w/h;cam.left=-v*a;cam.right=v*a;cam.top=v;cam.bottom=-v;cam.updateProjectionMatrix();ren.setSize(w,h);const q=ren.getPixelRatio();rt.setSize(w*q,h*q);pu.px.value.set(1/(w*q),1/(h*q))}
addEventListener('resize',rs);rs();
const hemi=new T.HemisphereLight(0x5a78a0,0x0c1014,.5);sc.add(hemi);
const dl=new T.DirectionalLight(0x7090c0,.4);dl.position.set(-14,24,10);sc.add(dl);
const WX=createWeather({T,sc,FXK}); // src/station/weather.js: state machine, rain, wind, lightning, sound
const PL=(x,y,z,c,i,d)=>{const l=new T.PointLight(c,i,d,1.5);l.position.set(x,y,z);sc.add(l);return l};
// ---------- 2. ASSETS ----------
const IM={};
await Promise.all(Object.keys(A).map(k=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>{IM[k]=i;res()};i.onerror=()=>rej(new Error('asset '+k));i.src=A[k]})));
const TEX={},FLIP={};
function stex(k){if(TEX[k])return TEX[k];const t=new T.Texture(IM[k]);t.magFilter=t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return TEX[k]=t}
function ftex(k){if(FLIP[k])return FLIP[k];const t=new T.Texture(IM[k]);t.magFilter=t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.wrapS=T.RepeatWrapping;t.repeat.x=-1;t.offset.x=1;t.needsUpdate=true;return FLIP[k]=t}
// ---------- 4a. world registries ----------
const SPR=[],sol=[],circ=[],SH=[],LT=[],OB=[],FP=[],PLACED=[];
const RV=new T.Vector3(1,0,-1).multiplyScalar(Math.SQRT1_2),UV=new T.Vector3(-1,2,-1).multiplyScalar(1/Math.sqrt(6)),FV=new T.Vector3(-1,-1,-1).multiplyScalar(1/Math.sqrt(3));
function viewPt(S,du,dv,eps){return new T.Vector3().copy(S).addScaledVector(RV,du).addScaledVector(UV,dv).addScaledVector(FV,-eps)}
function spr(key,x,z,h,o={}){
 const m=META[key],w=h*m.w/m.h,tree=/tree|sapling/.test(key),bld=key.startsWith('bld_');
 let ax=(tree||bld)?m.ax:.5;if(o.flip)ax=1-ax;
 const c=o.c!==undefined?o.c:.03;
 const mat=new T.SpriteMaterial({map:o.flip?ftex(key):stex(key),alphaTest:.4,transparent:false,fog:true});
 const s=new T.Sprite(mat);s.scale.set(w,h,1);s.center.set(ax,c);s.position.set(x,0,z);s.frustumCulled=false;
 s.userData={x,z,w,h,c,ax,mat,key};sc.add(s);SPR.push(s);return s}
function building(id){
 const b=BLD[id],key='bld_'+b.k,m=META[key],h=b.h,c=(b.rx+b.rz)*.4082/h+.02;
 const s=spr(key,b.x,b.z,h,{c});b.s=s;
 sol.push({x:b.x,z:b.z,rx:b.rx,rz:b.rz});FP.push({x0:b.x-b.rx,z0:b.z-b.rz,x1:b.x+b.rx,z1:b.z+b.rz});
 SH.push({x:b.x,z:b.z,rx:b.rx*1.1,rz:b.rz*1.1,a:.55,rect:1,ht:b.h});
 for(const L of b.L||[])LT.push({x:b.x+L[0],z:b.z+L[1],y:2.4,c:L[2],I:L[3]});
 return s}
// ---------- 3. GROUND BAKE ----------
const GPX=Math.max(14,Math.min(28,Math.floor(Math.min(ren.capabilities.maxTextureSize,4096)/(GN*GC)))),CP=GC*GPX,GS=GN*CP;
function bakeGround(){
 const TD={g:[],s:[],a:[],p:[]},nm={g:'grass',s:'soil',a:'asphalt',p:'pave'};
 for(const m in TD)for(let v=0;v<4;v++){const cv=document.createElement('canvas');cv.width=cv.height=CP;const g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(IM['tile_'+nm[m]+v],0,0,CP,CP);TD[m].push(g.getImageData(0,0,CP,CP).data)}
 const VG={},rv=mulberry(77);
 for(const m in TD){const a=new Uint8Array(GN*GN);for(let z=0;z<GN;z++)for(let x=0;x<GN;x++){let v,t=0;do{v=rv()*4|0;t++}while(t<20&&((x>0&&a[z*GN+x-1]==v)||(z>0&&a[(z-1)*GN+x]==v)));a[z*GN+x]=v}VG[m]=a}
 // weight field, 4 samples/unit
 const WR=GN*GC*4+2,WS=new Float32Array(WR*WR),WA=new Float32Array(WR*WR),WP=new Float32Array(WR*WR);
 for(let j=0;j<WR;j++)for(let i=0;i<WR;i++){const w=zoneW(i/4-GH,j/4-GH,1),k=j*WR+i;WS[k]=w[0];WA[k]=w[1];WP[k]=w[2]}
 const cv=document.createElement('canvas');cv.width=cv.height=GS;const g=cv.getContext('2d');
 const out=g.createImageData(GS,GS),od=out.data,F=Math.round(CP*.11);
 let _r=0,_g=0,_b=0;
 function samp(m,cx,cz,tx,tz,hn,ha){const vg=VG[m],td=TD[m],o=td[vg[cz*GN+cx]],i=(tz*CP+tx)*4;let r=o[i],gg=o[i+1],b=o[i+2];
  if(hn){const n=td[vg[cz*GN+cx+hn]];r+=(n[i]-r)*ha;gg+=(n[i+1]-gg)*ha;b+=(n[i+2]-b)*ha}_r=r;_g=gg;_b=b}
 const col=new Float32Array(GS*3);// per column: i0, frac
 const xi=new Int32Array(GS),xf=new Float32Array(GS);
 for(let X=0;X<GS;X++){const f=(X+.5)/GPX*4;xi[X]=Math.floor(f);xf[X]=f-xi[X]}
 for(let cz=0;cz<GN;cz++)for(let tz=0;tz<CP;tz++){
  const Y=cz*CP+tz,fy=(Y+.5)/GPX*4,yi=Math.floor(fy),yf=fy-yi;
  let vn=0,va=0;if(tz<F&&cz>0){vn=-1;va=.5*(1-sm(0,F,tz))}else if(tz>=CP-F&&cz<GN-1){vn=1;va=.5*(1-sm(0,F,CP-1-tz))}
  for(let cx=0;cx<GN;cx++)for(let tx=0;tx<CP;tx++){
   const X=cx*CP+tx;let hn=0,ha=0;if(tx<F&&cx>0){hn=-1;ha=.5*(1-sm(0,F,tx))}else if(tx>=CP-F&&cx<GN-1){hn=1;ha=.5*(1-sm(0,F,CP-1-tx))}
   const a0=xi[X],fx=xf[X],k0=yi*WR+a0,k1=k0+WR;
   const bl=(W)=>(W[k0]*(1-fx)+W[k0+1]*fx)*(1-yf)+(W[k1]*(1-fx)+W[k1+1]*fx)*yf;
   let ws=bl(WS),wa=bl(WA),wp=bl(WP);const sum=ws+wa+wp;if(sum>1){ws/=sum;wa/=sum;wp/=sum}
   const wg=Math.max(0,1-ws-wa-wp);let R=0,G=0,B=0;
   for(let q=0;q<4;q++){const wq=q==0?wg:q==1?ws:q==2?wa:wp;if(wq<.004)continue;const m='gsap'[q];
    samp(m,cx,cz,tx,tz,hn,ha);let r=_r,gg=_g,b=_b;
    if(vn){samp(m,cx,cz+vn,tx,tz,hn,ha);r+=(_r-r)*va;gg+=(_g-gg)*va;b+=(_b-b)*va}
    R+=r*wq;G+=gg*wq;B+=b*wq}
   const o=(Y*GS+X)*4;od[o]=R;od[o+1]=G;od[o+2]=B;od[o+3]=255}}
 g.putImageData(out,0,0);
 const px=v=>(v+GH)*GPX;
 // road centre dashes
 g.fillStyle='rgba(150,124,66,.5)';for(let x=-48;x<48;x+=5.6){if(x>-10&&x<-1)continue;g.fillRect(px(x),px(16.55)-GPX*.07,GPX*2.4,GPX*.14)}
 g.fillStyle='rgba(120,110,90,.3)';for(let x=-48;x<48;x+=2.6){g.fillRect(px(x),px(13.7),GPX*1.1,GPX*.07);g.fillRect(px(x+1),px(19.5),GPX*1.1,GPX*.07)}
 g._px=px;return {cv,g,px}}
function bakeShadows(G){const g=G.g,px=G.px;
 // cast shadows are drawn by src/station/lighting.js (own layer, follows the moon, fades with weather)
 if(DEBUG){g.lineWidth=3;g.strokeStyle='#f0f';for(const s of sol)g.strokeRect(px(s.x-s.rx),px(s.z-s.rz),s.rx*2*GPX,s.rz*2*GPX);g.strokeStyle='#0ff';for(const c of circ){g.beginPath();g.arc(px(c.x),px(c.z),c.r*GPX,0,7);g.stroke()}}}
// ---------- 4b. build the world ----------
for(const id in BLD){if(id!='booth')building(id)}
// checkpoint (booth + road apron + up/down barrier) is built from assets/HUB/03_Checkpoint_Gate; falls back to the old booth sprite if it can't load
let CHK=null;try{CHK=await createCheckpoint({T,IM,META,spr,viewPt,sol,circ,FP,LT,toast,x:BLD.booth.x,z:BLD.booth.z})}catch(e){console.warn('checkpoint fallback',e)}
if(!CHK)building('booth');
const bs=BLD.station;
const RE={x:-12,z:-12}; // soft spawn clear
function free(x,z,r,pad){
 for(const f of FP)if(x>f.x0-r-pad&&x<f.x1+r+pad&&z>f.z0-r-pad&&z<f.z1+r+pad)return false;
 for(const p of PLACED)if(Math.hypot(x-p.x,z-p.z)<(r+p.r)*.9)return false;return true}
function place(key,x,z,h,o={}){const s=spr(key,x,z,h,o);const w=s.userData.w;
 if(o.r)circ.push({x,z,r:o.r});PLACED.push({x,z,r:o.sp||w*.2});if(o.sh)SH.push({x,z,rx:w*o.sh,rz:w*o.sh*.8,a:o.sa||.45,ht:h});return s}
const TREES=[['banyan_tree',15.5,.22],['round_canopy_tree',13,.2],['slim_canopy_tree',14.5,.14],['wide_branching_tree',13,.2],['young_tree',8.5,.12],['sapling',5.4,.1]];
const BUSH=[['dense_bush',3.6],['low_wide_bush',3],['thorny_shrub',2.9],['flowering_bush',3.4],['tropical_banana_plant',3.6]];
const PLANT=[['fern_clump',2.4],['tall_wild_grass',3.4],['yellow_flower_patch',1.7],['broadleaf_plant',2.6],['white_wildflower_patch',1.8],['creeping_groundcover',2],['fallen_leafy_branch',1.5]];
const BL=Object.values(BLD);
const TH={x:-21,z:33.5}; // forest trailhead (south of the road)
PLACED.push({x:TH.x,z:TH.z,r:7});for(let z=23;z<=31;z+=2.7)PLACED.push({x:TH.x,z,r:2.6});
FP.push(MEADOW); // keep trees, bushes, reeds and rocks out of the grassland
function onHard(x,z){const w=zoneW(x,z,0);return w[1]>.04||w[2]>.04||w[0]>.55}
// trees: dense outside the clearing
let nT=0;for(let k=0;k<7000&&nT<70;k++){const x=rr(-47,47),z=rr(-47,47),d=Math.hypot(x+10,(z+8)*1.05);
 if(RN()>sm(32,46,d)*.98)continue;if(onHard(x,z)||!free(x,z,4.4,3)||(x>3&&x<29&&z>-13&&z<11))continue;
 const t=pick(TREES.concat(TREES.slice(0,4)));place('fol_'+t[0],x,z,t[1]*rr(.74,.98),{flip:RN()<.5,r:.55,sp:4,sh:t[2],sa:.5});nT++}
// bushes
let nB=0;for(let k=0;k<5000&&nB<130;k++){const x=rr(-47,47),z=rr(-47,47),d=Math.hypot(x+10,z+8);
 if(RN()>.2+.6*sm(14,34,d))continue;if(onHard(x,z)||!free(x,z,1.5,1.5))continue;
 const b=pick(BUSH);place('fol_'+b[0],x,z,b[1]*rr(.85,1.2),{flip:RN()<.5,r:.7,sp:1.6,sh:.22,sa:.35});nB++}
// ground cover in the clearing
let nP=0;for(let k=0;k<4000&&nP<150;k++){const x=rr(-44,44),z=rr(-44,44);
 const w=zoneW(x,z,0);if(w[0]+w[1]+w[2]>.12)continue;if(!free(x,z,1,.6))continue;
 const p=pick(PLANT);place('fol_'+p[0],x,z,p[1]*rr(.8,1.2),{flip:RN()<.5,sp:1.1});nP++}
// wet verge: reeds south of the road
for(let k=0,n=0;k<800&&n<30;k++){const x=rr(-46,46),z=rr(22.8,28);if(!free(x,z,1.5,1))continue;
 place('fol_'+pick(['marsh_reeds','cattails','cattails','tall_wild_grass']),x,z,rr(3.6,5),{flip:RN()<.5,sp:1.6});n++}
// rocks: boulders at the forest edge, stones near paths, road rubble
const ROCKB=['rok_01','rok_02','rok_03','rok_04','rok_05'],ROCKC=['rok_08','rok_09','rok_10','rok_12','rok_14','rok_16','rok_17','rok_18','rok_20','rok_22'],ROCKS=['rok_35','rok_37','rok_45','rok_47','rok_44','rok_43','rok_41','rok_40'];
function rock(k,x,z,s,o={}){const m=META[k],h=m.h*s;const sp=place(k,x,z,h,Object.assign({flip:RN()<.5,sh:.3,sa:.4,sp:m.w*s*.3},o));return sp}
for(const sx of[-34,34])for(let z=12.4;z<=20.8;z+=1.9){const b=pick(ROCKB);rock(b,sx+rr(-1.5,1.5),z+rr(-.4,.4),.026,{r:META[b].w*.026*.3});
 if(RN()<.7)rock(pick(['rok_41','rok_43','rok_42'].filter(k=>META[k])),sx+rr(-3,-1)*Math.sign(sx),z,.02)}
let nR=0;for(let k=0;k<3000&&nR<22;k++){const x=rr(-46,46),z=rr(-46,46),d=Math.hypot(x+10,z+8);if(d<27||onHard(x,z)||!free(x,z,2.5,1.5))continue;
 const b=pick(ROCKB.concat(ROCKC.slice(0,5)));rock(b,x,z,rr(.02,.028),{r:META[b].w*.02*.3});nR++}
let nS=0;for(let k=0;k<3000&&nS<46;k++){const x=rr(-44,44),z=rr(-44,44);const w=zoneW(x,z,0);if(w[1]>.04||w[2]>.5||!free(x,z,.8,.4))continue;
 rock(pick(ROCKS.concat(ROCKC.slice(5))),x,z,rr(.014,.022));nS++}
rock('rok_41',TH.x-.9,TH.z+.3,.022,{});rock('rok_43',TH.x+.7,TH.z-.2,.02,{});rock('rok_42',TH.x,TH.z-1,.02,{});
rock('rok_28',BLD.wtower.x-1,BLD.wtower.z+4.5,.02,{r:META.rok_28.w*.02*.3});rock('rok_23',-28,-22,.026,{r:.7});rock('rok_31',33,-4,.02,{r:META.rok_31.w*.02*.3});rock('rok_33',37,-7,.019,{r:META.rok_33.w*.019*.3});
// the unmarked road to the "???" city: cleared after planting, so the rest of the station stays exactly as it was
const CG={x:32,z:33.5};
{const lane=(x,z)=>x>28.6&&x<35.4&&z>21.4&&z<37.5;
 const tree=u=>/tree|sapling|banana/.test(u.key)&&u.x>24&&u.x<48&&u.z>23&&u.z<50; // canopies that would hang over the road and its sign
 for(let i=SPR.length-1;i>=0;i--){const u=SPR[i].userData;if(lane(u.x,u.z)||tree(u)){sc.remove(SPR[i]);SPR.splice(i,1);if(tree(u))for(const a of[circ,SH]){const j=a.findIndex(c=>c.x==u.x&&c.z==u.z);if(j>=0)a.splice(j,1)}}}
 for(const a of[circ,SH])for(let i=a.length-1;i>=0;i--)if(lane(a[i].x,a[i].z))a.splice(i,1);
 ZONES.push({m:'s',r:[30.4,22,33.6,36.5],soft:1.6,n:1.4})}
// fences round the base and along the checkpoint approach (src/station/fences.js)
try{await createStationFences({T,sc,SPR,circ,SH,FP})}catch(e){console.warn('station fences',e)}
// ---------- 5. PLAYER (drifter_player walk atlas: 8 directions N,NE,E,SE,S,SW,W,NW x 4 frames, 64x96) ----------
const P={x:-6.5,z:13.5,vx:0,vz:0,dr:1,resting:false,swingStart:-99,swingUntil:-99},K={};
const blank=document.createElement('canvas');blank.width=blank.height=1;const bt0=new T.CanvasTexture(blank);bt0.magFilter=bt0.minFilter=T.NearestFilter;
const pmat=new T.MeshLambertMaterial({map:bt0,color:0xffffff,emissive:0x1c1814,emissiveIntensity:.55,alphaTest:.5,transparent:false,depthWrite:true,side:T.DoubleSide,fog:false}); // fog:false + neutral fill: the scene's teal fog/blue lights were washing the character cyan
const PH=2.215,PW=PH*64/96;
const ps=new T.Mesh(new T.PlaneGeometry(PW,PH),pmat);ps.frustumCulled=false;ps.renderOrder=2;
const psc=document.createElement('canvas');psc.width=psc.height=64;{const g=psc.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(1,3,7,.52)');gr.addColorStop(.38,'rgba(1,3,7,.34)');gr.addColorStop(.72,'rgba(1,3,7,.12)');gr.addColorStop(1,'rgba(1,3,7,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}
const psh=new T.Mesh(new T.PlaneGeometry(1.9,1.08),new T.MeshBasicMaterial({map:new T.CanvasTexture(psc),transparent:true,opacity:.82,depthWrite:false,fog:true}));
psh.rotation.x=-Math.PI/2;psh.position.y=.035;psh.renderOrder=1;sc.add(psh,ps);
const pL=PL(0,2,0,0xffd6a0,.8,8);
const FW=64,FH=96,FR={};
// state -> atlas columns. walk 4f, run 8f, idle 6f (also used for rest), swing 6f
const FC={idle:[0,1,2,3,4,5],walking:[0,1,2,3],running:[0,1,2,3,4,5,6,7],swinging:[0,1,2,3,4,5],resting:[0,1,2,3,4,5]};
for(const s in FC){FR[s]=[];for(let d=0;d<8;d++)FR[s].push(FC[s].map(c=>{const cv=document.createElement('canvas');cv.width=FW;cv.height=FH;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(({running:IM.player_run,idle:IM.player_idle,resting:IM.player_idle,swinging:IM.player_swing})[s]||IM.player,c*FW,d*FH,FW,FH,0,0,FW,FH);const t=new T.CanvasTexture(cv);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;return t}))}
// ---------- 5b. COMPANION: Shu the cat (src/station/companion.js) ----------
// her frames load in the background (assets/companion/); she joins the game once they are ready
let SHU=null;const SHUC={};
createCompanion({T,sc,pmat}).then(c=>{SHU=c}).catch(e=>console.warn('companion',e));
const shuElev=(x,z)=>MAP==1&&FST?FST.elev(x,z):0;
function shuClamp(o){ // same walk limits as the player: current room, Silvan / city bounds, or the station
 if(IN>=0){o.x=Math.max(IX-IRX,Math.min(IX+IRX,o.x));o.z=Math.max(IZ-IRZ,Math.min(IZ+IRZ,o.z))}
 else if(MAP){const B=(MAP==1?FST:CITY).bounds;o.x=Math.max(B.x0,Math.min(B.x1,o.x));o.z=Math.max(B.z0,Math.min(B.z1,o.z))}
 else{o.x=Math.max(-BOUND,Math.min(BOUND,o.x));o.z=Math.max(-BOUND,Math.min(BOUND,o.z))}}
function col(o,r){for(const s of sol){const dx=o.x-s.x,dz=o.z-s.z,hx=s.rx+r,hz=s.rz+r;if(Math.abs(dx)<hx&&Math.abs(dz)<hz){const px=hx-Math.abs(dx),pz=hz-Math.abs(dz);if(px<pz)o.x+=dx<0?-px:px;else o.z+=dz<0?-pz:pz}}
 for(const c of circ){const dx=o.x-c.x,dz=o.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>0){o.x+=dx/d*(m-d);o.z+=dz/d*(m-d)}}
 if(MAP==1&&FST)FST.col(o,r)}
// colliders for trees etc. were pushed via circ in place(); building footprints in sol
// ---------- 4c. bake ground, lights, glows ----------
await new Promise(r=>requestAnimationFrame(r));
const GB=bakeGround();bakeShadows(GB);
let OUTER=null;
const gtex=new T.CanvasTexture(GB.cv);gtex.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy());gtex.minFilter=T.LinearMipmapLinearFilter;gtex.magFilter=T.LinearFilter;
const gGeo=new T.PlaneGeometry(GN*GC,GN*GC);gGeo.rotateX(-Math.PI/2);
const ground=new T.Mesh(gGeo,new T.MeshStandardMaterial({map:gtex,roughness:1,depthWrite:false,depthTest:false}));ground.renderOrder=-100;sc.add(ground);
{const t=new T.Texture(IM.tile_grass0);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(60,60);t.anisotropy=4;t.needsUpdate=true;
 const o=new T.Mesh(new T.PlaneGeometry(420,420).rotateX(-Math.PI/2),new T.MeshStandardMaterial({map:t,roughness:1,color:0x80888c,depthWrite:false,depthTest:false}));o.position.y=-.05;o.renderOrder=-101;sc.add(o);OUTER=o}
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
const GL=[];
function glow(pos,size,color,I,ph){const m=new T.SpriteMaterial({map:glowTex,color,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:I,fog:false});const s=new T.Sprite(m);s.position.copy(pos);s.scale.set(size,size,1);s.frustumCulled=false;sc.add(s);GL.push({s,I,ph:ph||0});return s}
for(const id in BLD){if(!BLD[id].s)continue;const b=BLD[id],m=META['bld_'+b.k],s=b.s,u=s.userData,S=new T.Vector3(b.x,0,b.z),kx=u.w/m.w;
 for(const q of m.glows||[]){if(q[6]<28)continue;const du=(q[0]-u.ax)*u.w,dv=(1-q[1]-u.c)*u.h;const sz=Math.max(1.3,q[2]*kx*5.2);glow(viewPt(S,du,dv,.6),sz,new T.Color(q[3],q[4]*.8,q[5]*.5),.5,Math.random()*9)}
 if(id=='station'){const du=(m.top[0]-u.ax)*u.w,dv=(1-m.top[1]-u.c)*u.h+.15;bs.beacon=glow(viewPt(S,du,dv,.8),2.6,0xff2a1a,1);bs.bpos=viewPt(S,du,dv,0)}}
if(CHK)CHK.lights(glow);
const beaconL=PL(bs.x,10,bs.z,0xff2a20,1.5,24);const beaconLT={x:bs.x,z:bs.z+1,c:0xff2a20,I:.8,dyn:1,R:20,cur:1};LT.push(beaconLT);
for(const l of LT){const c=new T.Color(l.c);l.cc=[c.r,c.g,c.b];l.R=l.R||13;l.i0=l.I||1;l.pl=PL(l.x,l.y||2.4,l.z,l.c,(l.I||1)*(l.dyn?0:1),l.R)}
{const px=TH.x+1.6,pz=TH.z+.4;const post=new T.Mesh(new T.BoxGeometry(.16,2.2,.16),new T.MeshLambertMaterial({color:0x4a3a2c}));post.position.set(px,1.1,pz);sc.add(post);
 const lamp=new T.Mesh(new T.BoxGeometry(.42,.4,.42),new T.MeshBasicMaterial({color:0xffd890}));lamp.position.set(px,2.4,pz);sc.add(lamp);
 glow(new T.Vector3(px,2.5,pz),2.8,0xffb868,.85,2.1);const c=new T.Color(0xffb868);LT.push({x:px,z:pz,y:2.5,c:0xffb868,I:1.1,R:11,cone:1,cc:[c.r,c.g,c.b]})}
{const img=new Image();img.onload=()=>{const t=new T.Texture(img);t.magFilter=t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true; // the name sign
  const mat=new T.SpriteMaterial({map:t,alphaTest:.4,transparent:false,fog:true}),s=new T.Sprite(mat),h=3.6,w=h*img.width/img.height,x=CG.x+2.4,z=CG.z-1;
  s.scale.set(w,h,1);s.center.set(.5,.08);s.position.set(x,0,z);s.frustumCulled=false;s.userData={x,z,w,h,c:.08,ax:.5,mat,key:'city_sign'};sc.add(s);SPR.push(s)};
 img.onerror=()=>console.warn('city sign missing');img.src=new URL('../../assets/city/sign_unknown.png',import.meta.url).href;
 circ.push({x:CG.x+2.4,z:CG.z-1,r:.8});
 const lx=CG.x-1.7,lz=CG.z-.4; // a lamp post like the trailhead's, but a colder bulb
 const post=new T.Mesh(new T.BoxGeometry(.16,2.2,.16),new T.MeshLambertMaterial({color:0x34303c}));post.position.set(lx,1.1,lz);sc.add(post);
 const bulb=new T.Mesh(new T.BoxGeometry(.42,.4,.42),new T.MeshBasicMaterial({color:0xd8ccff}));bulb.position.set(lx,2.4,lz);sc.add(bulb);circ.push({x:lx,z:lz,r:.3});
 glow(new T.Vector3(lx,2.5,lz),2.8,0xb8a0ff,.85,4.7);const c=new T.Color(0xc8b4ff);LT.push({x:lx,z:lz,y:2.5,c:0xc8b4ff,I:1.1,R:11,cone:1,cc:[c.r,c.g,c.b]})}
const LGT=createLighting({T,sc,SH,LT,glowTex,beaconPos:bs.bpos,dl}); // src/station/lighting.js: cast shadows, halos, wet reflections
// ---------- 6. FX ----------
const FFN=FXK.ff,ffG=new T.BufferGeometry(),ffP=new Float32Array(FFN*3),ffS=[...Array(FFN)].map(()=>[Math.random()*6.28,Math.random()*6.28,.4+Math.random()*.8,Math.random()*52,Math.random()*52]);
ffG.setAttribute('position',new T.BufferAttribute(ffP,3));
const ff=new T.Points(ffG,new T.PointsMaterial({color:0xd8ff90,size:3,sizeAttenuation:false,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));ff.frustumCulled=false;sc.add(ff);
const mistTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(170,190,205,.9)');gr.addColorStop(.5,'rgba(150,170,190,.35)');gr.addColorStop(1,'rgba(140,160,180,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new T.CanvasTexture(c)})();
const MIST=[...Array(FXK.mist)].map(()=>{const s=new T.Sprite(new T.SpriteMaterial({map:mistTex,transparent:true,opacity:.09+Math.random()*.09,depthWrite:false,fog:false}));const z=16+Math.random()*16;s.scale.set(z*1.7,z*.6,1);s.frustumCulled=false;sc.add(s);return {s,o:s.material.opacity,x:Math.random()*80-40,z:Math.random()*80-40,v:.15+Math.random()*.25,y:.8+Math.random()*5}});
const shaftTex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');const gh=g.createLinearGradient(0,0,64,0);gh.addColorStop(0,'rgba(255,255,255,0)');gh.addColorStop(.5,'rgba(255,255,255,1)');gh.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gh;g.fillRect(0,0,64,256);g.globalCompositeOperation='destination-in';const gv=g.createLinearGradient(0,0,0,256);gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(.25,'rgba(0,0,0,1)');gv.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gv;g.fillRect(0,0,64,256);return new T.CanvasTexture(c)})();
const SHAFT=[];{const r=mulberry(909);for(let i=0;i<FXK.shaft;i++){const a=r()*6.28,d=22+r()*22,m=new T.SpriteMaterial({map:shaftTex,color:0xaac8e0,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:.05,fog:false});m.rotation=-.5;const s=new T.Sprite(m);const w=2+r()*4;s.scale.set(w,22+r()*8,1);s.center.set(.5,.2);s.position.set(-10+Math.cos(a)*d,0,-8+Math.sin(a)*d);s.frustumCulled=false;sc.add(s);SHAFT.push({s,ph:r()*9,b:.045+r()*.05})}}
// grassland + loose animated tufts (src/station/grassland.js); built here because it bakes in the static lights
const GRASS=createGrass({T,sc,IM,LT,AMB,OFF,rnd:mulberry(0x6A55),noise:fbm,clear:(x,z)=>{const w=zoneW(x,z,0);return w[0]+w[1]+w[2]<=.12&&free(x,z,.4,.2)}});
// audio (procedural, starts on first click)
let AC=null,aud={},muted=false;
function audioStart(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();const mg=AC.createGain();mg.gain.value=.9;mg.connect(AC.destination);aud.mg=mg;WX.audio(AC,mg);
 const nb=AC.createBuffer(1,AC.sampleRate*4,AC.sampleRate),d=nb.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
 const mk=(f)=>{const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;const g=AC.createGain();g.gain.value=.0;s.connect(fl);fl.connect(g);g.connect(mg);s.start();return g};
 aud.wind=mk(380);aud.wind.gain.value=.12;aud.river=mk(1100);
 aud.hum=AC.createGain();aud.hum.gain.value=.0;aud.hum.connect(mg);[50,100,150].forEach((f,i)=>{const o=AC.createOscillator();o.type=i?'sine':'sawtooth';o.frequency.value=f;const g=AC.createGain();g.gain.value=[.05,.03,.015][i];o.connect(g);g.connect(aud.hum);o.start()});
 const ns=AC.createBufferSource();const wb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),wd=wb.getChannelData(0);for(let i=0;i<wd.length;i++)wd[i]=Math.random()*2-1;ns.buffer=wb;ns.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2400;bp.Q.value=.7;aud.stat=AC.createGain();aud.stat.gain.value=0;ns.connect(bp);bp.connect(aud.stat);aud.stat.connect(mg);ns.start();
 aud.cr=()=>{if(!AC||muted)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=4300+Math.random()*700;o.connect(g);g.connect(aud.mg);const n=2+(Math.random()*3|0);g.gain.setValueAtTime(0,t);for(let i=0;i<n;i++){g.gain.setValueAtTime(.012,t+i*.07);g.gain.setValueAtTime(0,t+i*.07+.035)}o.start(t);o.stop(t+n*.07+.05)}
 }catch(e){console.warn('audio',e)}}
// ---------- 6b. wildlife (src/station/critters.js) ----------
// soft procedural calls; routed through the master gain, so M mutes them too
const SFX={croak:[[0,.07,210,150],[.11,.09,230,140]],splash:[[0,.28,1300]],flutter:[[0,.05,2600],[.08,.05,2300],[.16,.05,2800],[.25,.05,2400]],rustle:[[0,.12,3400],[.1,.14,2900]]};
let sfxBuf=null;
function sfx(kind,v){if(!AC||muted||v<=.02||st!=1)return;try{
 if(!sfxBuf){sfxBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=sfxBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 for(const[at,len,f,f1]of SFX[kind]){const t=AC.currentTime+at,g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*(f1?.05:.07),t+.012);g.gain.exponentialRampToValueAtTime(.0005,t+len);
  const fl=AC.createBiquadFilter();let s;if(f1){s=AC.createOscillator();s.type='square';s.frequency.setValueAtTime(f,t);s.frequency.linearRampToValueAtTime(f1,t+len);fl.type='lowpass';fl.frequency.value=900}
  else{s=AC.createBufferSource();s.buffer=sfxBuf;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=.9}
  s.connect(fl);fl.connect(g);g.connect(aud.mg);s.start(t);s.stop(t+len+.02)}}catch(e){/* audio is optional */}}
const stationHabitat=(()=>{const r=mulberry(0xB19D),q=(a,b)=>a+r()*(b-a);
 const open=(x,z)=>!sol.some(s=>Math.abs(x-s.x)<s.rx+.5&&Math.abs(z-s.z)<s.rz+.5)&&!circ.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.5);
 const H={frogs:[],birds:[],squirrels:[],eyes:[],moths:LT.filter(l=>!l.dyn).map(l=>({x:l.x,y:l.y||2.4,z:l.z}))};
 for(let x=-30;x<34;x+=q(3.5,8)){const z=q(21.4,23.2);if(open(x,z))H.frogs.push({x,z})} // wet verge south of the road
 for(const[x,z]of[[-6,2],[7,8],[-19,-2],[16,16],[-27,17]])if(open(x,z))H.birds.push({x,z,n:3+(r()*2|0)});
 for(const[ax,az,bx,bz]of[[-37,2,-31,11],[22,7,28,2],[2,-24,-8,-25],[26,24,33,21]])H.squirrels.push({ax,az,bx,bz});
 for(let k=0;k<2000&&H.eyes.length<9;k++){const x=q(-38,38),z=q(-38,38);if(Math.hypot(x+10,z+8)>31&&!onHard(x,z)&&!H.eyes.some(e=>Math.hypot(e.x-x,e.z-z)<11))H.eyes.push({x,y:q(.8,1.8),z})}
 return H})();
const CRIT=[createCritters({T,sc,habitat:stationHabitat,sfx}),null,null]; // [station, forest, city]
// ---------- 7. UI ----------
let MAP=0,FST=null,FOB=[],CITY=null; // MAP: 0 station, 1 forest, 2 "???" city (1 and 2 are built on first visit)
const found=[],bcs=[];let st=0,open='',bt=0,near=null,tt,bIdx=0;
const BTXT=['...this is WNCORE.\nThe signal reaches those who are still listening.\nStay safe, Drifter.','WNCORE continuity. 88.7 FM.\nThis is a recorded transmission.\nIf you can hear it, someone kept the power on.','...station check. All relays answering.\nAll relays answering\nexcept one.'];
const o=(id,dx,dz,n,note,t)=>OB.push({x:BLD[id].x+dx,z:BLD[id].z+dz,n,note,t});
o('station',1.63,-1.47,'Enter the relay station','','d');
o('station',-3.6,0,'Relay mast','The beacon pulses red, slow and even. Someone keeps the power alive.');
if(CHK)OB.push(...CHK.objects);else o('booth',3.8,2.5,'Checkpoint booth','The barrier is raised. The log inside ends with today\'s date and no name.');
o('shed',3,4.2,'Utility shed','A generator hums behind the door. The handle is warm.');
o('depot',-1,5.2,'Maintenance depot','Two shutters. One is open a hand\'s width, and cold air breathes out.');
o('wtch',0,3.4,'Watchtower','The ladder is wet. Whoever watched from here faced the tree line, not the road.');
o('wtower',2,3.6,'Water tower','Dry. Something taps inside the tank at a slow, even interval.');
o('cottage',0,5.6,'Operator\'s cottage','Two cups on the table. Both full. Both still warm.');
o('ruin',-2,6.4,'Collapsed building','Fallen long before the outbreak. The vines grow toward the mast.');
OB.push({x:-32,z:16.4,n:'Road blockade',note:'Rubble packed across the road, stone by stone. Not a landslide. Someone sealed this end.'});
OB.push({x:34,z:16.4,n:'Road blockade',note:'The other end is sealed the same way. The only way out is through the signal.'});
OB.push({x:TH.x,z:TH.z,n:'Forest trail',t:'f',to:1});
OB.push({x:CG.x,z:CG.z,n:'Unmarked road',t:'f',to:2});
// building interiors (install_interiors.py): each building's examine point becomes a door into its interior
{const DR={'Utility shed':['shed','Enter the utility shed'],'Maintenance depot':['depot','Enter the maintenance depot'],'Watchtower':['wtch','Climb into the watchtower'],'Water tower':['wtower','Enter the pump room'],'Collapsed building':['ruin','Step into the collapsed building'],'Checkpoint booth':['booth','Enter the checkpoint booth']};
 for(const q of OB){const d=DR[q.n];if(d){q.src=q.n;q.t='b';q.b=d[0];q.n=d[1]}}}
// logbook entries are keyed, because room interaction objects are recreated on every visit
function record(k,n,note){if(!found.some(f=>f.k===k))found.push({k,n,note})}
function toast(t){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>m.style.opacity=0,4200)}
function closeP(){open='';$('pn').classList.add('hide');if(aud.stat)aud.stat.gain.value=0}
function bc(){open='b';bt=0;const msg=BTXT[bIdx%BTXT.length];bIdx++;const h='WNCORE — 88.7 FM: "'+msg.split('\n')[0].replace(/^\.\.\./,'')+'"';if(!bcs.includes(h))bcs.push(h);window.__bmsg=msg;const p=$('pn');p.classList.remove('hide','log');p.innerHTML='<div class="hd"><span>WNCORE BROADCAST</span><span>88.7 FM</span></div><canvas id="wv" width="300" height="44"></canvas><p id="tx"></p><div class="sg">SIGNAL STRENGTH <i></i><i></i><i></i><i></i><i class="off"></i><i class="off"></i></div>';if(aud.stat)aud.stat.gain.value=.05}
function lg(tab){open='l';const p=$('pn');p.classList.remove('hide');p.classList.add('log');const T2=['DISCOVERIES','BROADCASTS','NOTES'],L=[found.map(f=>f.n+' — '+f.note),bcs,['Station 01 still answers.','Both ends of the road are sealed.','Someone is keeping the lights on. Find out who.']][tab];
 p.innerHTML='<div class="hd"><span>LOGBOOK</span><span>STATION 01</span></div><div class="lg"><nav>'+T2.map((n,i)=>'<b class="'+(i==tab?'on':'')+'" onclick="__lg('+i+')">'+(i==tab?'▸ ':'')+n+'</b>').join('')+'</nav><div>'+(L.length?L.map(x=>'<p>'+x+'</p>').join(''):'<p>Nothing recorded yet.</p>')+'</div></div>'}
window.__lg=lg;
// ---- vitals: food & water drain slowly; supplies in the station restore them (one use each)
const VIT={food:.85,water:.8,warn:{}};
function eat(q){const p=q.p;if(q.take)q.take();else{INT.take(p.id);IOB.splice(IOB.indexOf(q),1)}near=null;
 VIT.food=Math.min(1,VIT.food+(p.food||0));VIT.water=Math.min(1,VIT.water+(p.water||0));VIT.warn={};
 toast((p.water&&!p.food?'You drink the ':'You eat the ')+p.n+'. '+p.msg)}
function vitTick(dt){VIT.food=Math.max(0,VIT.food-dt/420);VIT.water=Math.max(0,VIT.water-dt/300);
 for(const k of['food','water']){if(VIT[k]<.2&&!VIT.warn[k]){VIT.warn[k]=1;toast(k=='food'?'Your stomach is empty. There was food in the station.':'Your mouth is dry. There were drinks in the station.')}}}
const vbar=v=>'▮'.repeat(Math.ceil(v*5))+'▯'.repeat(5-Math.ceil(v*5));
function act(){if(st!=1||busy)return;if(open){closeP();return}if(!near)return;if(near.t=='s'){if(SHU&&SHU.pet(P))toast('Shu looks up at you and settles beside you.');return}if(near.t=='r'){bc();return}
 if(near.t=='x'){near.fn();return}if(near.t=='b'){record(near.b,near.src,near.note);BDOOR[near.b]={x:near.x+.8,z:near.z+.8};goB(near.b,near);return}if(near.t=='f'){travel(near.to);return}if(near.t=='d'){go(0);return}if(near.t=='g'){go(near.to);return}if(near.t=='n'){record(near.n+'|'+near.note,near.n,near.note);toast(near.note);return}if(near.t=='c'){eat(near);return}record(near,near.n,near.note);toast(near.note)}
addEventListener('keydown',e=>{K[e.code]=1;if(e.code=='KeyE')act();if(e.code=='KeyM'){muted=!muted;if(aud.mg)aud.mg.gain.value=muted?0:.9}
 if(e.code=='Space'){e.preventDefault();if(st==1&&!open&&!e.repeat){P.swingStart=clock;P.swingUntil=clock+.62;P.resting=false}}
 if(e.code=='KeyR'&&st==1&&!open&&!e.repeat){P.resting=!P.resting;P.vx=0;P.vz=0}
 if(e.code=='KeyN'&&st==1&&!e.repeat)NAV.toggle();
 if(e.code=='Tab'){e.preventDefault();if(st==1)open=='l'?closeP():lg(0)}if(e.code=='Escape')closeP()});
addEventListener('keyup',e=>K[e.code]=0);
addEventListener('blur',()=>{for(const k in K)K[k]=0});
function start(){if(st)return;st=1;$('ov').classList.add('hide');audioStart();const t=$('ttl');t.innerHTML='WNCORE STATION 01<small>88.7 FM · continuity</small>';t.style.opacity=1;setTimeout(()=>t.style.opacity=0,4200)}
$('ov').addEventListener('click',start);
// ---- invisible touch controls: left half = floating stick (drag far = run, double-tap = rest),
//      right half = tap examine/close, hold swing, top-right corner = logbook ----
{const key=(c,t='keydown')=>dispatchEvent(new KeyboardEvent(t,{code:c,bubbles:true}));
 let L=null,Rr=null,lastTap=0;const dirs=['KeyW','KeyA','KeyS','KeyD','ShiftLeft'];
 const clr=()=>dirs.forEach(c=>K[c]=0);
 addEventListener('pointerdown',e=>{if(e.pointerType!='touch'||st!=1)return;if(e.target.closest&&e.target.closest('#pn,#ov,#nav-hud'))return;
  if(e.clientX>innerWidth*.7&&e.clientY<innerHeight*.16){key('Tab');return}
  if(e.clientX<innerWidth/2){if(!L)L={id:e.pointerId,ox:e.clientX,oy:e.clientY,t:performance.now(),mv:0}}
  else if(!Rr){Rr={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),sw:false,tm:setTimeout(()=>{if(Rr&&!Rr.sw){Rr.sw=true;key('Space')}},380)}}},{passive:true});
 addEventListener('pointermove',e=>{if(e.pointerType!='touch')return;
  if(L&&e.pointerId==L.id){let dx=e.clientX-L.ox,dy=e.clientY-L.oy,m=Math.hypot(dx,dy);L.mv=Math.max(L.mv,m);
   if(m>110){L.ox+=dx/m*(m-110);L.oy+=dy/m*(m-110);dx=e.clientX-L.ox;dy=e.clientY-L.oy;m=110}
   clr();if(m>14){const nx=dx/m,ny=dy/m;K.KeyD=nx>.38;K.KeyA=nx<-.38;K.KeyS=ny>.38;K.KeyW=ny<-.38;K.ShiftLeft=m>80}}
  if(Rr&&e.pointerId==Rr.id&&Math.hypot(e.clientX-Rr.x,e.clientY-Rr.y)>24)Rr.mv=1},{passive:true});
 const up=e=>{if(e.pointerType!='touch')return;
  if(L&&e.pointerId==L.id){clr();const n=performance.now();if(L.mv<12&&n-L.t<250){if(n-lastTap<350){key('KeyR');lastTap=0}else lastTap=n}L=null}
  if(Rr&&e.pointerId==Rr.id){clearTimeout(Rr.tm);if(!Rr.sw&&!Rr.mv&&performance.now()-Rr.t<380){key('KeyE')}Rr=null}};
 addEventListener('pointerup',up);addEventListener('pointercancel',up);
 document.body.style.touchAction='none';document.addEventListener('touchmove',e=>{if(!(e.target.closest&&e.target.closest('.lg>div')))e.preventDefault()},{passive:false}); // the logbook list may scroll
 if('ontouchstart' in window){$('ovs').insertAdjacentHTML('beforebegin','<p><b>Touch</b> · drag left side to walk (far = run) · tap right = examine · hold right = swing · double-tap left = rest · top-right = logbook</p>')}}

$('ovs').innerHTML='<b>Click to begin</b>';
// ---------- 7b. INTERIOR: cutaway rooms inside the relay tower ----------
const IX=300,IZ=300,RW=22;
const ROOMS=[{n:'Control room'},{n:'Equipment room'},{n:'Briefing office'}];
const IO=LAYOUT.ROOMS.map(r=>r.io); // interaction points live in interior_layout.js next to the props they belong to
let IN=-1,busy=false,IOB=[],ICX=3.7,ICZ=3.7,IRX=6.9,IRZ=6.9,BQ=null;
const EX={x:bs.x+3.03,z:bs.z+-1.07};
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .35s;z-index:5';document.body.appendChild(fd);
const INT=createInterior(T,sc,IX,IZ,sol);
const BI=createBuildingInterior(T,sc,IX,IZ,sol); // src/station/interiors_hub.js // sprite-kit rooms (src/station/interior.js + interior_layout.js)
const iL=PL(IX,4,IZ,0x7fa8ff,0,22);
function go(to){if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{
 const from=IN,out=to<0;IN=to;ZM=out?1:.62;rs();pmat.emissive.setHex(out?0x1c1814:0x28221c);pmat.emissiveIntensity=out?.55:.6;pmat.color.setHex(0xffffff);
 if(out){INT.hide();iL.intensity=0;P.x=EX.x;P.z=EX.z;cp.x=P.x-BIAS;cp.z=P.z-BIAS;toast('Outside again. The beacon is still pulsing.')}
 else{const r=ROOMS[to];INT.show(to);iL.intensity=.35;
  IOB=IO[to].map(q=>Object.assign({x:IX+q.dx,z:IZ+q.dz},q)).concat(INT.left(to).map(p=>({x:IX+p.x,z:IZ+p.z,n:p.n,t:'c',p,room:to})));
  const up=from<0||from<to,ex=to==0&&from<0;P.x=IX+(ex?5.2:up?2.2:5.5);P.z=IZ+(ex?2.4:up?3.2:-1.6);cp.x=IX-3.7;cp.z=IZ-3.7;toast(r.n)}
 P.vx=P.vz=0;sc.background.set(out?FOG:0x05070a);sc.fog.color.set(out?FOG:0x05070a);
 ff.visible=out;for(const m of MIST)m.s.visible=out;for(const q of SHAFT)q.s.visible=out;
 fd.style.opacity=0;setTimeout(()=>busy=false,350)},380)}
window.__go=go;
// ---- building interiors (install_interiors.py): shed / depot / water tower / watchtower / booth / ruin
const BDOOR={},BSEEN={};
async function goB(id,q){if(busy)return;busy=true;fd.style.opacity=1;
 if(id)BI.preload(id);
 await sleep(380);
 if(id){const t0=performance.now();while(!BI.ready(id)&&performance.now()-t0<2500)await sleep(60)}
 const out=!id;
 if(out){const b0=BQ,bd=BDOOR[b0]||{x:BLD[b0].x,z:BLD[b0].z+BLD[b0].rz+1.6};
  BI.hide();BQ=null;IN=-1;ICX=ICZ=3.7;IRX=IRZ=6.9;ZM=1;rs();pmat.emissive.setHex(0x1c1814);pmat.emissiveIntensity=.55;pmat.color.setHex(0xffffff);iL.intensity=0;
  P.x=bd.x;P.z=bd.z;cp.x=P.x-BIAS;cp.z=P.z-BIAS;toast('Back outside.')}
 else{const L=BI.layout(id);INT.hide();BI.show(id);BQ=id;IN=9;ICX=L.icx;ICZ=L.icz;IRX=L.irx;IRZ=L.irz;ZM=L.zm;rs();
  pmat.emissive.setHex(0x28221c);pmat.emissiveIntensity=.6;pmat.color.setHex(0xffffff);iL.intensity=.35;
  IOB=L.io.map(e=>Object.assign({x:IX+e.dx,z:IZ+e.dz},e)).concat([{x:IX+L.exit[0],z:IZ+L.exit[1],n:L.exitLabel,t:'x',fn:()=>goB(null)}]);
  P.x=IX+L.spawn[0];P.z=IZ+L.spawn[1];cp.x=IX-ICX;cp.z=IZ-ICZ;
  const first=!BSEEN[id];BSEEN[id]=1;toast(first&&q&&q.note?q.note:L.name)}
 P.vx=P.vz=0;const inn=!out;sc.background.set(inn?0x05070a:FOG);sc.fog.color.set(inn?0x05070a:FOG);
 ff.visible=!inn;for(const m of MIST)m.s.visible=!inn;for(const s of SHAFT)s.s.visible=!inn;
 fd.style.opacity=0;setTimeout(()=>busy=false,350)}
window.__goB=goB;
// every note in the game, counted up front so the total never changes mid-run
const SILVAN_NOTES=8; // examinable landmarks built by forest.js (checked after it loads)
const CITY_NOTES=10; // examine points in city_layout.js (checked after it loads)
const isNote=q=>q.t=='n';
const TOTAL=OB.filter(q=>!q.t||q.t=='b').length+IO.flat().filter(isNote).length+Object.values(HUB.ROOMS).flatMap(r=>r.io).filter(isNote).length+SILVAN_NOTES+CITY_NOTES;
// ---------- 7b2. field compass + waypoint (src/station/compass.js) ----------
function destinations(){
 const out=[],G='WNCORE STATION 01';
 OB.forEach((q,i)=>{if(q.t=='x'||q.t=='f')return;const n=q.t=='d'?'Relay station':q.n=='Road blockade'?(q.x<0?'West':'East')+' road blockade':q.src||q.n;out.push({id:'s'+i,group:G,name:n,map:0,x:q.x,z:q.z})});
 // Silvan's landmarks are listed once the forest has been visited; before that only its trail marker
 out.push({id:'silvan',group:'SILVAN',name:'Silvan trail marker',map:1,x:FST&&FST.cairn.x,z:FST&&FST.cairn.z});
 FOB.forEach((q,i)=>{if(!q.t)out.push({id:'f'+i,group:'SILVAN',name:q.n,map:1,x:q.x,z:q.z})});
 out.push({id:'city',group:'???',name:'??? city limits',map:2,x:CITY&&CITY.sign.x,z:CITY&&CITY.sign.z});
 if(CITY)CITY.notes.forEach((q,i)=>{if(i)out.push({id:'c'+i,group:'???',name:q.n,map:2,x:q.x,z:q.z})});
 return out}
function route(id){
 const w=destinations().find(q=>q.id==id);if(!w)return null;
 const via=(x,z,label)=>({x,z,label,final:false});
 if(IN==9&&BQ){const e=BI.layout(BQ).exit;return via(IX+e[0],IZ+e[1],'ROOM EXIT')}
 if(IN>=0){const e=IO[IN].find(q=>q.t=='g'&&q.to<IN);return via(IX+e.dx,IZ+e.dz,IN?'STAIRS DOWN':'STATION EXIT')}
 if(w.map==MAP)return{x:w.x,z:w.z,label:w.name,final:true};
 if(MAP==0)return w.map==2?via(CG.x,CG.z,'UNMARKED ROAD'):via(TH.x,TH.z,'SILVAN ENTRANCE');
 const back=MAP==1?FST.cairn:CITY.exit;return via(back.x,back.z,'BACK TO STATION')}
const NAV=createCompass({T,cam,ctx:{list:destinations,route,toast,close:closeP,isOpen:()=>open=='w',
 panel:html=>{if(st!=1||busy)return false;closeP();open='w';const p=$('pn');p.classList.remove('hide','log');p.innerHTML=html;return true}}});
// ---------- 7c. SECTION TRAVEL: station <-> forest / city behind a loading screen ----------
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LD=(()=>{const d=document.createElement('div');d.id='ld';d.innerHTML='<small></small><h2></h2><div class="bar"><i></i></div><p></p>';document.body.appendChild(d);const q=s=>d.querySelector(s);
 return{show(t,s){q('h2').textContent=t;q('small').textContent=s;q('.bar i').style.width='0%';q('p').textContent='';d.classList.add('on')},
  set(p,m){q('.bar i').style.width=(p*100|0)+'%';if(m!=null)q('p').textContent=m},hide(){d.classList.remove('on')}}})();
const AMB0=AMB.slice(),FOGD0=sc.fog.density,wxc=new T.Color(),ONE=[1,1,1];
const SEC=[
 {name:'RELAY CLEARING',sub:'Section 01 · WNCORE Station',walk:'Back to the road…',card:'RELAY CLEARING<small>WNCORE Station 01</small>'},
 {name:'SILVAN',sub:'Section 02',walk:'Entering the trees…',card:'SILVAN<small>no signal · follow the river</small>'},
 {name:'???',sub:'Section 03',walk:'Following the unmarked road…',card:'???<small>no name on any map</small>'}];
async function travel(to){
 if(busy||st!=1)return;busy=true;closeP();const from=MAP,S=SEC[to];
 LD.show(S.name,S.sub);LD.set(.01,'Loading section…');
 await sleep(550);
 try{
  if(to==1&&!FST){const mod=await import('./forest.js');FST=await mod.buildForest({T,sc,IM,META,spr,glow,LT,circ,SHAFT,shaftTex,ren},(p,m)=>LD.set(p,m));FOB=FST.objects;CRIT[1]=createCritters({T,sc,habitat:FST.habitat,sfx});const n=FOB.filter(q=>!q.t).length;if(n!=SILVAN_NOTES)console.warn('SILVAN_NOTES is '+SILVAN_NOTES+', forest.js has '+n)}
  else if(to==2&&!CITY){const mod=await import('./city.js');CITY=await mod.buildCity({T,sc,IM,META,spr,SPR,sol,circ,LT,viewPt,glowTex,ren},(p,m)=>LD.set(p,m));CRIT[2]=createCritters({T,sc,habitat:CITY.habitat,sfx});const n=CITY.notes.length;if(n!=CITY_NOTES)console.warn('CITY_NOTES is '+CITY_NOTES+', city.js has '+n)}
  else{for(let i=1;i<=10;i++){LD.set(i/10,S.walk);await sleep(70)}}
  MAP=to;P.vx=P.vz=0;pmat.emissive.setHex(to==1?0x1c2018:0x1c1814);pmat.emissiveIntensity=.6;
  FST&&FST.setVisible(to==1);CITY&&CITY.setVisible(to==2);ff.visible=to!=2;
  const Z=to==1?FST:to==2?CITY:null;
  if(Z){P.x=Z.spawn.x;P.z=Z.spawn.z;if(Z.reset)Z.reset(P.x,P.z)}else{const g=from==2?CG:TH;P.x=g.x;P.z=g.z-3.8}
  for(let i=0;i<3;i++)AMB[i]=Z?Z.amb[i]:AMB0[i];sc.background.set(Z?Z.fog:FOG);sc.fog.color.set(Z?Z.fog:FOG);sc.fog.density=Z?Z.fogD:FOGD0;
  cp.x=P.x-BIAS;cp.z=P.z-BIAS;
  await sleep(450);LD.hide();await sleep(500);
  const t=$('ttl');t.innerHTML=S.card;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,4200);
 }catch(e){console.error(e);LD.set(0,'Failed to load: '+e.message);await sleep(2500);LD.hide()}
 busy=false}
window.__travel=travel;
// ---------- 8. LOOP ----------
let clock=0,cp={x:P.x,z:P.z},wrong=0,burstT=18,burstU=0,last=performance.now();
const BIAS=1.6/.816;
function upd(dt){clock+=dt;let ix=0,iz=0;
 if(!open&&!P.resting&&!busy){ix=(K.KeyD?1:0)+(K.KeyS?1:0)-(K.KeyW?1:0)-(K.KeyA?1:0);iz=(K.KeyS?1:0)+(K.KeyA?1:0)-(K.KeyW?1:0)-(K.KeyD?1:0)}
 const il=Math.hypot(ix,iz);if(il){ix/=il;iz/=il;const sx=ix-iz,sy=-(ix+iz)*.577;P.dr=(Math.round(Math.atan2(sx,sy)/(Math.PI/4))+8)%8;P.resting=false}
 const sp=(K.ShiftLeft||K.ShiftRight)?7.2:4.6,k=Math.min(1,dt*12);P.vx+=(ix*sp-P.vx)*k;P.vz+=(iz*sp-P.vz)*k;P.x+=P.vx*dt;P.z+=P.vz*dt;col(P,.4);
 if(IN>=0){P.x=Math.max(IX-IRX,Math.min(IX+IRX,P.x));P.z=Math.max(IZ-IRZ,Math.min(IZ+IRZ,P.z))}else if(MAP){const B=(MAP==1?FST:CITY).bounds;P.x=Math.max(B.x0,Math.min(B.x1,P.x));P.z=Math.max(B.z0,Math.min(B.z1,P.z))}else{P.x=Math.max(-BOUND,Math.min(BOUND,P.x));P.z=Math.max(-BOUND,Math.min(BOUND,P.z))}
 vitTick(dt);near=null;let bd=3;for(const q of (IN>=0?IOB:MAP==1?FOB:MAP==2?CITY.objects:OB)){const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;near=q}}
 if(SHU){const s=SHU.state,sd=Math.hypot(s.x-P.x,s.z-P.z);if(sd<1.9&&sd<bd){bd=sd;near={x:s.x,z:s.z,n:'Shu',t:'s'}}}
 $('pr').textContent=(near&&!open&&!busy)?'[E] '+(near.t=='s'?'Pet Shu':near.t=='r'?'Tune the radio':(near.t=='d'||near.t=='g'||near.t=='f'||near.t=='x'||near.t=='b')?near.n:near.t=='c'?(near.p.water&&!near.p.food?'Drink ':'Eat ')+near.n:'Examine '+near.n.toLowerCase()):'';
 if(open=='b'){bt+=dt*26;const m=window.__bmsg;$('tx').textContent=m.slice(0,bt|0);const c=$('wv'),g=c.getContext('2d');g.clearRect(0,0,300,44);g.strokeStyle='#6fae5a';g.beginPath();for(let x=0;x<300;x+=3){const a=Math.abs(Math.sin(x*.05+clock*6))*Math.min(1,bt/20)*18*Math.random();g.moveTo(x,22-a);g.lineTo(x,22+a)}g.stroke()}
 $('dc').innerHTML='DISCOVERIES '+found.length+'/'+TOTAL+'<br><span style="font-size:18px;color:'+(VIT.food<.2?'#d9695a':'#b7aa8d')+'">FOOD '+vbar(VIT.food)+'</span> <span style="font-size:18px;color:'+(VIT.water<.2?'#d9695a':'#b7aa8d')+'">WATER '+vbar(VIT.water)+'</span><br><span style="font-size:18px;color:#b7aa8d">SHIFT RUN · SPACE SWING · R REST · N COMPASS · M MUTE</span>';
 $('st').innerHTML=(MAP==1?'NO SIGNAL<br>— — —':MAP==2?'???<br>88.7 FM ?':'WNCORE-01<br>88.7 FM')+(IN<0?'<br><span style="font-size:18px;color:#8a8570">'+WX.label+'</span>':'')}
const dsq=Math.hypot;
function anim(dt,t){
 const outd=IN<0,asp0=innerWidth/innerHeight;
 // weather: state machine, rain, wind, lightning; then push the smoothed values into fog / lights
 WX.update(dt,t,{cx:cp.x,cz:cp.z,hw:VH*asp0,hh:VH,ppu:innerHeight*ren.getPixelRatio()/(2*VH),out:outd});
 if(outd){const Z=MAP==1?FST:MAP==2?CITY:null,base=Z?Z.fog:FOG,fd=Z?Z.fogD:FOGD0,w=WX.fogW;wxc.set(base);
  wxc.r+=(WX.fogT[0]-wxc.r)*w+WX.flash*.22;wxc.g+=(WX.fogT[1]-wxc.g)*w+WX.flash*.25;wxc.b+=(WX.fogT[2]-wxc.b)*w+WX.flash*.3;
  sc.fog.color.copy(wxc);sc.background.copy(wxc);sc.fog.density=fd*WX.fogM;
  hemi.intensity=.5*WX.hemi+WX.flash*1.1;dl.intensity=.4*WX.sun+WX.flash*.6}
 else{hemi.intensity=.5;dl.intensity=.4}
 const wild=[AMB[0]*WX.amb[0]+WX.flash*.3,AMB[1]*WX.amb[1]+WX.flash*.3,AMB[2]*WX.amb[2]+WX.flash*.3];
 CRIT.forEach((c,i)=>{if(!c)return;c.setVisible(outd&&MAP==i);if(outd&&MAP==i)c.update(t,dt,{P,rain:WX.rain,hush:i==0&&wrong>.35,tint:wild})});
 INT.update(t);BI.update(t);if(MAP==1&&FST)FST.update(t);if(MAP==2&&CITY)CITY.update(t,dt,P);GRASS.update(t,MAP==0&&IN<0,P,WX.windNow,WX.amb[0]*(1-.12*WX.wet),WX.amb[1]*(1-.12*WX.wet),WX.amb[2]*(1-.12*WX.wet));
 if(aud.river)aud.river.gain.value=(muted||MAP!=1)?0:.02+.12*sm(20,2,FST.riverDist(P.x,P.z));
 // signal bursts + proximity to the mast
 const dm=IN>=0?6:dsq(P.x-bs.x,P.z-bs.z);let base=MAP==2&&IN<0?CITY.wrong(P):.1*sm(16,5,dm);burstT-=dt;if(burstT<0){burstU=.5;burstT=22+Math.random()*30}burstU=Math.max(0,burstU-dt);
 wrong+=((base+(burstU>0?.8*Math.min(1,burstU*3):0))-wrong)*Math.min(1,dt*8);pu.wrong.value=wrong;pu.time.value=t;
 const on=burstU>0?Math.random()<.4:Math.sin(t*2.4)>-.1;
 const bl=on?1+.1*Math.sin(t*20):.12;beaconLT.cur=on?1:.05;beaconL.intensity=on?1.6:.1;bs.beacon.material.opacity=on?1:.08;bs.beacon.scale.setScalar(on?2.6+Math.sin(t*3)*.3:1.2);
 LGT.update(t,dt,{vis:outd&&MAP==0,WX,bOn:on,ground:MAP==1&&FST&&FST.ground?FST.ground:MAP==2&&CITY?CITY.ground:ground,outer:MAP==0?OUTER:null});psh.material.opacity=.82*LGT.shade;
 for(const g of GL){if(g.s===bs.beacon)continue;g.s.material.opacity=g.I*(.85+.15*Math.sin(t*3+g.ph)+(Math.random()<.01?-.3:0))}
 if(aud.hum){const hv=.1+.9*sm(30,6,dm);aud.hum.gain.value=muted?0:.05*hv;aud.wind.gain.value=(.1+.04*Math.sin(t*.3))*WX.wa;if(open!='b')aud.stat.gain.value=burstU>0?.06:0;if(Math.random()<dt*.9)aud.cr()}
 const mv=Math.hypot(P.vx,P.vz);let an='idle',fr=0,bob=0;const run=K.ShiftLeft||K.ShiftRight;
 if(P.swingUntil>clock){an='swinging';fr=Math.min(5,Math.floor((clock-P.swingStart)*9))}else if(P.resting&&mv<.25){an='resting';fr=Math.floor(t*3)%6}
 else if(mv>.5){an=run?'running':'walking';fr=Math.floor(t*(run?12:6))%(run?8:4);bob=run?0:Math.abs(Math.sin(t*10))*.045}else{fr=Math.floor(t*4)%6;bob=0}
 const fa=FR[an][P.dr];const dtex=fa[fr%fa.length];if(dtex&&pmat.map!==dtex)pmat.map=dtex;
 const IS=IN>=0?1.4:1;ps.scale.setScalar(IS);const EL=MAP==1&&FST?FST.elev(P.x,P.z):0;ps.position.set(P.x,PH*IS/2+bob+EL,P.z);psh.position.set(P.x,.035+EL,P.z);psh.scale.set((1+Math.min(.18,mv*.025))*IS,IS,1);pL.position.set(P.x,2,P.z);
 // camera: follow + headroom, frame the mast near the station
 const fz=sm(24,10,dm)*3.2/.816+BIAS;const tx=IN>=0?IX-ICX:P.x-fz,tz=IN>=0?IZ-ICZ:P.z-fz;cp.x+=(tx-cp.x)*Math.min(1,dt*4);cp.z+=(tz-cp.z)*Math.min(1,dt*4);
 cam.position.set(cp.x+OFF.x,OFF.y,cp.z+OFF.z);cam.lookAt(cp.x,0,cp.z);ps.quaternion.copy(cam.quaternion);
 if(SHU){SHUC.P=P;SHUC.mv=mv;SHUC.swing=P.swingUntil>clock;SHUC.resting=P.resting;SHUC.zone=IN>=0?'i'+IN+':'+BQ:'m'+MAP;SHUC.col=col;SHUC.clamp=shuClamp;SHUC.elev=shuElev;SHUC.scale=IS;SHUC.shade=LGT.shade;SHUC.quat=cam.quaternion;SHU.update(t,dt,SHUC)}
 NAV.update(P,{hud:st==1,mark:!busy&&!open});
 // cull + tint sprites
 const asp=innerWidth/innerHeight,hw=VH*asp,hh=VH,wam=outd?WX.amb:ONE,fl=outd?WX.flash*.3:0;
 const pSx=(P.x-cp.x-(P.z-cp.z))*.7071,pSy=-(P.x-cp.x+P.z-cp.z)*.4082+1.1,pD=P.x+P.z;
 for(const s of SPR){const u=s.userData,dx=u.x-cp.x,dz=u.z-cp.z,sx=(dx-dz)*.7071,sy=-(dx+dz)*.4082;
  const v=!u.hide&&Math.abs(sx)<hw+u.w*.6&&sy>-hh-4&&sy-u.c*u.h<hh+1;s.visible=v;if(!v)continue;
  const fu=u.mat.userData.fu;if(fu){const tg=(u.x+u.z>pD+.4&&Math.abs(sx+(.5-u.ax)*u.w-pSx)<u.w*.36&&pSy>sy+.1&&pSy<sy+u.h*.95)?.26:1;u.f+=(tg-u.f)*Math.min(1,dt*9);fu.value=s.userData.f;}
  let r=AMB[0]*wam[0]+fl,g=AMB[1]*wam[1]+fl,b=AMB[2]*wam[2]+fl;
  for(const L of (u.flat?[]:LT)){const d=Math.hypot(u.x-L.x,u.z-L.z),R=L.R;if(d<R){const f=1-d/R,k=f*f*L.I*(L.dyn?L.cur:(L.fm||1))*.6;r+=L.cc[0]*k;g+=L.cc[1]*k;b+=L.cc[2]*k}}
  const dep=sm(-30,24,-(dx+dz)*.5)*0+0;u.mat.color.setRGB(Math.min(1.5,r),Math.min(1.5,g),Math.min(1.5,b))}
 for(const q of SHAFT)q.s.material.opacity=q.b*(.65+.35*Math.sin(t*.5+q.ph))*WX.shaft;ff.material.opacity=1-Math.min(1,WX.rain*1.6);
 // fireflies, mist
 for(let i=0;i<FFN;i++){const s=ffS[i];ffP[i*3]=cp.x+((s[3]+t*.4*s[2])%52)-26+Math.sin(t*s[2]+s[0])*2;ffP[i*3+1]=.8+Math.abs(Math.sin(t*s[2]*1.3+s[1]))*1.8+(i%5)*.25;ffP[i*3+2]=cp.z+((s[4]-t*.3*s[2]+520)%52)-26+Math.cos(t*s[2]+s[1])*2}
 ffG.attributes.position.needsUpdate=true;
 for(const m of MIST){m.x+=m.v*dt;let rx=((m.x-cp.x)%80+120)%80-40,rz=((m.z-cp.z)%80+120)%80-40;m.s.position.set(cp.x+rx,m.y,cp.z+rz);m.s.material.opacity=m.o*WX.mist}}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(st==1)upd(dt);anim(dt,now/1000);ren.setRenderTarget(rt);ren.render(sc,cam);ren.setRenderTarget(null);ren.render(pS,pC)}
if(DEBUG){const h=location.hash.slice(1).split(',').map(Number);if(h.length==2&&!isNaN(h[0])){P.x=h[0];P.z=h[1];cp.x=P.x;cp.z=P.z}}
window.__W={get CITY(){return CITY},get SHU(){return SHU},NAV,CRIT,WX,LGT,P,start,travel,get FST(){return FST},get MAP(){return MAP},tp:(x,z)=>{P.x=x;P.z=z;cp.x=x-BIAS;cp.z=z-BIAS},BLD,SPR,get n(){return SPR.length},grass:GRASS.count,calls:()=>{ren.info.autoReset=false;ren.info.reset();ren.setRenderTarget(rt);ren.render(sc,cam);ren.setRenderTarget(null);const c=ren.info.render.calls;ren.info.autoReset=true;return c},ground:()=>GB.cv.toDataURL('image/png'),cull:()=>SPR.filter(s=>s.visible).length};
requestAnimationFrame(loop);
}

boot(A,META).catch(e=>{console.error(e);document.getElementById('ovs').textContent='Failed to load: '+e.message});
