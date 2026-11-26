// ===== DRIFTER — OLD CITY / SECTOR 02 =====
// A long, connected urban district designed around kenopsia: broad empty avenues,
// quiet commercial blocks, distant apartment silhouettes and slowly reclaimed streets.
// Built from the 78 isolated POI sprites, production terrain tiles, foliage and rock libraries.
const OX=0,OZ=900,HX=160,HZ=220,PPU=8;
const ASSETS=[{"id":1,"w":203,"h":203,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[42,42,203,203]},{"id":2,"w":194,"h":204,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[335,42,194,204]},{"id":3,"w":154,"h":189,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[643,49,154,189]},{"id":4,"w":200,"h":191,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[908,48,200,191]},{"id":5,"w":191,"h":197,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[48,333,191,197]},{"id":6,"w":174,"h":198,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[345,333,174,198]},{"id":7,"w":146,"h":192,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[647,336,146,192]},{"id":8,"w":164,"h":183,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[926,340,164,183]},{"id":9,"w":231,"h":192,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[28,624,231,192]},{"id":10,"w":268,"h":194,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[300,624,264,191]},{"id":11,"w":175,"h":172,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[632,634,175,172]},{"id":12,"w":126,"h":152,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[945,644,126,152]},{"id":13,"w":126,"h":159,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[81,928,126,159]},{"id":14,"w":141,"h":160,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[361,928,141,160]},{"id":15,"w":130,"h":148,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[655,934,130,148]},{"id":16,"w":156,"h":159,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[930,928,156,159]},{"id":17,"w":129,"h":144,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[79,1224,129,144]},{"id":18,"w":210,"h":217,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[327,1187,210,217]},{"id":19,"w":251,"h":200,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[594,1196,251,200]},{"id":20,"w":196,"h":180,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[910,1206,196,180]},{"id":21,"w":226,"h":176,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[31,1496,226,176]},{"id":22,"w":240,"h":197,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[312,1485,240,197]},{"id":23,"w":160,"h":189,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[640,1489,160,189]},{"id":24,"w":193,"h":186,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[911,1491,193,186]},{"id":25,"w":146,"h":135,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[71,1804,146,135]},{"id":26,"w":171,"h":134,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[346,1805,171,134]},{"id":27,"w":130,"h":128,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[655,1808,130,128]},{"id":28,"w":104,"h":130,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[956,1807,104,130]},{"id":29,"w":108,"h":121,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[90,2099,108,121]},{"id":30,"w":89,"h":120,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[387,2100,89,120]},{"id":31,"w":105,"h":121,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[667,2099,105,121]},{"id":32,"w":135,"h":118,"atlasFile":"Combined_Atlases/POI_Source_Atlas_01.png","rect":[940,2101,135,118]},{"id":33,"w":112,"h":135,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[88,76,112,135]},{"id":34,"w":97,"h":115,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[383,86,97,115]},{"id":35,"w":111,"h":105,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[664,91,111,105]},{"id":36,"w":101,"h":83,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[957,102,101,83]},{"id":37,"w":117,"h":142,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[85,361,117,142]},{"id":38,"w":110,"h":119,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[377,372,110,119]},{"id":39,"w":147,"h":106,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[646,379,147,106]},{"id":40,"w":146,"h":121,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[935,371,146,121]},{"id":41,"w":150,"h":134,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[69,653,150,134]},{"id":42,"w":165,"h":139,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[349,650,165,139]},{"id":43,"w":170,"h":135,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[635,652,170,135]},{"id":44,"w":168,"h":120,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[924,660,168,120]},{"id":45,"w":170,"h":141,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[59,937,170,141]},{"id":46,"w":133,"h":104,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[365,956,133,104]},{"id":47,"w":167,"h":96,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[636,960,167,96]},{"id":48,"w":115,"h":95,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[950,960,115,95]},{"id":49,"w":91,"h":94,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[98,1249,91,94]},{"id":50,"w":131,"h":94,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[366,1249,131,94]},{"id":51,"w":115,"h":87,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[662,1252,115,87]},{"id":52,"w":80,"h":69,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[968,1261,80,69]},{"id":53,"w":101,"h":81,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[93,1543,101,81]},{"id":54,"w":116,"h":89,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[374,1539,116,89]},{"id":55,"w":126,"h":86,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[657,1541,126,86]},{"id":56,"w":127,"h":78,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[944,1545,127,78]},{"id":57,"w":111,"h":163,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[88,1790,111,163]},{"id":58,"w":116,"h":77,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[374,1833,116,77]},{"id":59,"w":69,"h":135,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[685,1804,69,135]},{"id":60,"w":131,"h":116,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[942,1814,131,116]},{"id":61,"w":58,"h":124,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[115,2098,58,124]},{"id":62,"w":53,"h":93,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[405,2113,53,93]},{"id":63,"w":98,"h":114,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[671,2103,98,114]},{"id":64,"w":99,"h":104,"atlasFile":"Combined_Atlases/POI_Source_Atlas_02.png","rect":[958,2108,99,104]},{"id":65,"w":46,"h":82,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[121,103,46,82]},{"id":66,"w":100,"h":99,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[382,94,100,99]},{"id":67,"w":68,"h":108,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[686,90,68,108]},{"id":68,"w":56,"h":107,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[980,90,56,107]},{"id":69,"w":88,"h":89,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[100,387,88,89]},{"id":70,"w":42,"h":112,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[411,376,42,112]},{"id":71,"w":89,"h":89,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[675,387,89,89]},{"id":72,"w":51,"h":83,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[982,390,51,83]},{"id":73,"w":147,"h":92,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[70,674,147,92]},{"id":74,"w":54,"h":77,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[405,681,54,77]},{"id":75,"w":70,"h":71,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[685,684,70,71]},{"id":76,"w":88,"h":85,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[964,677,88,85]},{"id":77,"w":57,"h":40,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[115,988,57,40]},{"id":78,"w":55,"h":41,"atlasFile":"Combined_Atlases/POI_Source_Atlas_03.png","rect":[404,987,55,41]}];

export async function buildCity(ctx,progress=()=>{}){
 const {T,sc,SPR,sol,circ,IM,META,LT,ren}=ctx;
 const tick=()=>new Promise(r=>requestAnimationFrame(r));
 const report=async(p,m)=>{progress(Math.min(1,p),m);await tick()};
 let seed=0xC17A02;
 const rand=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let v=Math.imul(seed^seed>>>15,1|seed);v=v+Math.imul(v^v>>>7,61|v)^v;return((v^v>>>14)>>>0)/4294967296};
 const pick=a=>a[Math.floor(rand()*a.length)],range=(a,b)=>a+(b-a)*rand();
 await report(.02,'Opening the old city archive…');

 // ---------- 1. Compact the three source atlases into one low-overhead runtime sheet ----------
 const byId=new Map(ASSETS.map(a=>[a.id,a]));
 const textures=new Map(),flippedTextures=new Map(),loader=new T.TextureLoader();
 const atlasFiles=[...new Set(ASSETS.map(a=>a.atlasFile))];
 const PACK_W=1536,PAD=4;
 const packed=new Map();
 const sorted=[...ASSETS].sort((a,b)=>b.h-a.h||b.w-a.w);
 let px=PAD,py=PAD,rowH=0,PACK_H=0;
 for(const a of sorted){
  const w=a.w+PAD*2,h=a.h+PAD*2;
  if(px+w>PACK_W){px=PAD;py+=rowH;rowH=0;}
  packed.set(a.id,{x:px+PAD,y:py+PAD});
  px+=w;rowH=Math.max(rowH,h);PACK_H=Math.max(PACK_H,py+h);
 }
 const canvas=document.createElement('canvas');canvas.width=PACK_W;canvas.height=PACK_H;
 const ctx2d=canvas.getContext('2d',{alpha:true});
 ctx2d.clearRect(0,0,PACK_W,PACK_H);
 let loaded=0;
 // Decode one source sheet at a time, copy only the sprite rectangles, then release it.
 for(const file of atlasFiles){
  await new Promise((resolve,reject)=>{
   const url=new URL('../../assets/DRIFTER_POI_Asset_Library_v2/'+file,import.meta.url).href;
   loader.load(url,source=>{
    for(const a of ASSETS){
     if(a.atlasFile!==file)continue;
     const [sx,sy,sw,sh]=a.rect,p=packed.get(a.id);
     ctx2d.drawImage(source.image,sx,sy,sw,sh,p.x,p.y,sw,sh);
    }
    source.dispose();loaded++;
    progress(.03+.20*loaded/atlasFiles.length,'Packing city art '+loaded+'/'+atlasFiles.length+'…');
    resolve(true);
   },undefined,e=>{console.warn('City atlas failed:',file,e);reject(e);});
  });
  await tick();
 }
 const packedAtlas=new T.CanvasTexture(canvas);
 packedAtlas.magFilter=T.LinearFilter;packedAtlas.minFilter=T.LinearFilter;
 packedAtlas.generateMipmaps=false;packedAtlas.needsUpdate=true;
 for(const a of ASSETS){
  const p=packed.get(a.id),tex=packedAtlas.clone();
  tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;
  tex.repeat.set(a.w/PACK_W,a.h/PACK_H);
  tex.offset.set(p.x/PACK_W,1-(p.y+a.h)/PACK_H);tex.needsUpdate=true;
  textures.set(a.id,tex);
 }
 function poiMap(id,flip=false){
  const base=textures.get(id);if(!base)return null;if(!flip)return base;
  if(!flippedTextures.has(id)){
   const tex=base.clone(),w=base.repeat.x;tex.repeat.x=-w;tex.offset.x+=w;tex.needsUpdate=true;
   flippedTextures.set(id,tex);
  }
  return flippedTextures.get(id);
 }
 const group=new T.Group();group.visible=false;sc.add(group);
 const cityLights=[],gameTextures=new Map();
 function addPoi(id,x,z,h,opts={}){
  const a=byId.get(id),map=poiMap(id,!!opts.flip);if(!a||!map)return null;
  const w=h*a.w/a.h,ax=opts.ax??.5,c=opts.c??.025;
  const mat=new T.SpriteMaterial({map,alphaTest:.28,transparent:false,depthWrite:true,fog:true,color:0xffffff});
  const s=new T.Sprite(mat);s.scale.set(w,h,1);s.center.set(opts.flip?1-ax:ax,c);
  s.position.set(OX+x,opts.y||0,OZ+z);s.frustumCulled=false;
  s.userData={x:OX+x,z:OZ+z,w,h,c,ax,mat,flat:false,city:true,key:'poi_'+id};
  group.add(s);SPR.push(s);
  if(opts.solid){const [rx,rz]=opts.solid;sol.push({x:OX+x,z:OZ+z,rx,rz,city:true})}
  if(opts.circle)circ.push({x:OX+x,z:OZ+z,r:opts.circle});
  return s
 }
 function addGame(key,x,z,h,opts={}){
  const meta=META[key],img=IM[key];if(!meta||!img)return null;
  let tex=gameTextures.get(key);
  if(!tex){tex=new T.Texture(img);tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;tex.needsUpdate=true;gameTextures.set(key,tex)}
  const map=opts.flip?tex.clone():tex;
  if(opts.flip){map.wrapS=T.RepeatWrapping;map.repeat.x=-1;map.offset.x=1;map.needsUpdate=true}
  const w=h*meta.w/meta.h,ax=/tree|sapling/.test(key)?meta.ax:.5,c=.03;
  const mat=new T.SpriteMaterial({map,alphaTest:.4,transparent:false,depthWrite:true,fog:true,color:0xffffff});
  const s=new T.Sprite(mat);s.scale.set(w,h,1);s.center.set(opts.flip?1-ax:ax,c);
  s.position.set(OX+x,0,OZ+z);s.frustumCulled=false;
  s.userData={x:OX+x,z:OZ+z,w,h,c,ax,mat,flat:false,city:true,key};
  group.add(s);SPR.push(s);if(opts.circle)circ.push({x:OX+x,z:OZ+z,r:opts.circle});
  return s
 }

 // ---------- 2. Long-range ground and connected street grid ----------
 await report(.27,'Tracing the old boulevards…');
 const cv=document.createElement('canvas');cv.width=HX*2*PPU;cv.height=HZ*2*PPU;
 const g=cv.getContext('2d'),px=x=>(x+HX)*PPU,pz=z=>(z+HZ)*PPU;
 const rect=(x,z,w,h,color)=>{g.fillStyle=color;g.fillRect(px(x),pz(z),w*PPU,h*PPU)};
 function tiled(prefix,x0,z0,x1,z1,cell=112,offset=0){
  const L=Math.max(0,px(x0)),U=Math.max(0,pz(z0)),R=Math.min(cv.width,px(x1)),B=Math.min(cv.height,pz(z1));
  for(let y=U,row=0;y<B;y+=cell,row++)for(let x=L,col=0;x<R;x+=cell,col++){
   const im=IM[prefix+((row*7+col*11+offset)%4)];if(im)g.drawImage(im,x,y,Math.min(cell,R-x),Math.min(cell,B-y))
  }
 }
 // Base layers: worn soil outside the urban blocks.
 tiled('tile_soil',-HX,-HZ,HX,HZ,128,1);
 const xBlocks=[[-160,-120],[-104,-8],[8,104],[120,160]];
 const zBlocks=[[-220,-174],[-156,-119],[-101,-64],[-46,-9],[9,46],[64,101],[119,156],[174,220]];
 let block=0;
 for(const xb of xBlocks)for(const zb of zBlocks){
  const inset=1.2+(block%3)*.3;
  tiled('tile_pave',xb[0]+inset,zb[0]+inset,xb[1]-inset,zb[1]-inset,104,block);
  // Abandoned lot scars: cracked earth, dead planting beds and broken paving.
  const sx=xb[0]+3+(block%2)*2,sz=zb[0]+4+(block%3)*2;
  tiled('tile_soil',sx,sz,sx+Math.min(9,xb[1]-xb[0]-7),sz+Math.min(7,zb[1]-zb[0]-7),80,block+2);
  g.fillStyle='rgba(15,22,23,.12)';
  g.fillRect(px(xb[0]+1),pz(zb[0]+1),(xb[1]-xb[0]-2)*PPU,(zb[1]-zb[0]-2)*PPU);
  block++;
 }
 const verticalRoads=[-112,0,112],horizontalRoads=[-165,-110,-55,0,55,110,165];
 // The main avenue is wider than the cross streets and continues from the entry
 // all the way to the far edge. Sidewalks are real paved tiles, not painted soil.
 for(const x of verticalRoads){
  const half=x===0?10.5:8.2,walk=x===0?18.5:15.0;
  tiled('tile_pave',x-walk,-HZ,x+walk,HZ,104,x+300);
  tiled('tile_asphalt',x-half,-HZ,x+half,HZ,128,x+300);
  rect(x-walk-.25,-HZ,.5,HZ*2,'rgba(187,174,148,.38)');
  rect(x+walk-.25,-HZ,.5,HZ*2,'rgba(187,174,148,.30)');
 }
 for(const z of horizontalRoads){
  const half=z%110===0?7.3:6.3;
  tiled('tile_pave',-HX,z-13.5,HX,z+13.5,104,z+300);
  tiled('tile_asphalt',-HX,z-half,HX,z+half,128,z+300);
  rect(-HX,z-13.7,HX*2,.4,'rgba(187,174,148,.34)');
  rect(-HX,z+13.3,HX*2,.4,'rgba(187,174,148,.28)');
 }
 // Long broken lane dashes, stop lines and occasional pedestrian crossings.
 g.strokeStyle='rgba(195,181,149,.52)';g.lineWidth=PPU*.11;g.setLineDash([PPU*3.3,PPU*4.0]);
 for(const x of verticalRoads){g.beginPath();g.moveTo(px(x),pz(-HZ));g.lineTo(px(x),pz(HZ));g.stroke()}
 for(const z of horizontalRoads){g.beginPath();g.moveTo(px(-HX),pz(z));g.lineTo(px(HX),pz(z));g.stroke()}
 g.setLineDash([]);
 for(const x of verticalRoads)for(const z of horizontalRoads){
  for(let k=-4;k<=4;k++){
   rect(x+k*1.18-.26,z-8.2,.52,1.7,'rgba(192,184,161,.65)');
   rect(x+k*1.18-.26,z+6.5,.52,1.7,'rgba(192,184,161,.65)');
  }
  rect(x-8,z-13,16,.32,'rgba(194,183,155,.55)');
 }
 // A broad, mostly empty civic square: the city's silence gets room to breathe.
 tiled('tile_pave',-44,-42,44,42,116,9);
 rect(-42,-40,84,80,'rgba(23,31,31,.08)');
 g.strokeStyle='rgba(163,153,128,.42)';g.lineWidth=PPU*.14;
 g.strokeRect(px(-42),pz(-40),84*PPU,80*PPU);
 // A wide, abandoned bus plaza south of the commercial blocks.
 tiled('tile_pave',-78,64,78,100,112,17);
 g.strokeStyle='rgba(187,174,145,.46)';g.lineWidth=PPU*.12;
 for(let x=-63;x<=63;x+=21)g.strokeRect(px(x),pz(70),PPU*16,PPU*21);
 // Drainage covers and deep patches break the repeated road texture.
 for(const [x,z] of [[-103,-153],[103,-153],[-103,-98],[103,-98],[-103,-43],[103,-43],[-103,12],[103,12],[-103,67],[103,67],[-103,122],[103,122]]){
  g.fillStyle='rgba(12,18,19,.62)';g.fillRect(px(x),pz(z),PPU*1.2,PPU*.65);
  g.strokeStyle='rgba(156,151,135,.42)';g.lineWidth=1;
  for(let k=1;k<5;k++){g.beginPath();g.moveTo(px(x+k*.24),pz(z));g.lineTo(px(x+k*.24),pz(z+.65));g.stroke()}
 }
 g.strokeStyle='rgba(7,11,13,.34)';g.lineWidth=1.2;
 for(let i=0;i<420;i++){
  const x=-154+(i*37)%306,z=-214+(i*53)%428;
  g.beginPath();g.moveTo(px(x),pz(z));g.lineTo(px(x+((i%5)-2)*.7),pz(z+1.1+(i%4)*.3));g.stroke();
 }
 const groundTexture=new T.CanvasTexture(cv);groundTexture.magFilter=T.LinearFilter;
 groundTexture.minFilter=T.LinearMipmapLinearFilter;groundTexture.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy());
 const gg=new T.PlaneGeometry(HX*2,HZ*2);gg.rotateX(-Math.PI/2);
 const ground=new T.Mesh(gg,new T.MeshBasicMaterial({map:groundTexture,fog:true,depthWrite:false}));
 ground.position.set(OX,-.09,OZ);group.add(ground);

 // ---------- 3. Dense street-front skyline: 96 buildings ----------
 await report(.40,'Raising the residential and commercial rows…');
 const columns=[-145,-80,-65,-50,-36,-24,24,36,50,65,80,145];
 const rows=[190,137.5,82.5,27.5,-27.5,-82.5,-137.5,-190];
 const facadeIds=[1,9,2,10,3,11,4,12,5,13,6,14,7,15,8,16,19,20,17,18,21,22,23,24];
 const smallColumns=new Set([2,4,7,9]);
 const buildingSolids=[];let structureCount=0;
 for(let row=0;row<rows.length;row++){
  for(let col=0;col<columns.length;col++){
   const x=columns[col],z=rows[row],id=facadeIds[(row*7+col*5)%facadeIds.length],a=byId.get(id);
   if(!a||!textures.has(id))continue;
   const low=smallColumns.has(col),far=Math.max(.86,1-row*.018);
   const h=low?13.2+(id%4)*.85:((id<=8?24.5+(id%3)*1.6:id<=18?22.5+(id%4)*1.25:25+(id%3)*1.4)*far);
   const w=h*a.w/a.h,rx=low?4.0:Math.min(9.2,Math.max(6.1,w*.275)),rz=low?5.2:7.5*far;
   addPoi(id,x,z,h,{flip:(row+col)%4===0});
   sol.push({x:OX+x,z:OZ+z,rx,rz,city:true});
   buildingSolids.push({x,z,rx,rz});structureCount++;
  }
 }
 // Distant rooflines make the neighbourhood feel larger than the walkable sample.
 const skyline=[
  [1,-153,211,23],[5,-125,211,22],[9,-94,211,24],[13,-63,211,19],
  [3,63,211,25],[7,94,211,22],[11,125,211,24],[15,153,211,20],
  [2,-153,-211,21],[6,-125,-211,23],[10,-94,-211,22],[14,-63,-211,20],
  [4,63,-211,23],[8,94,-211,22],[12,125,-211,24],[16,153,-211,20]
 ];
 for(const [id,x,z,h] of skyline){
  const a=byId.get(id),w=h*a.w/a.h,rx=Math.min(8,w*.24);
  addPoi(id,x,z,h,{flip:x<0});sol.push({x:OX+x,z:OZ+z,rx,rz:6.5,city:true});structureCount++;
 }
 // ---------- 4. District identity: market, civic square and industrial yard ----------
 await report(.54,'Opening the abandoned market…');
 // Modular perimeter, half-shut loading gates and a fenced industrial court.
 const fences=[
  [28,122,-88,8.5],[30,136,-88,8.0],[28,150,-88,8.2],[27,122,-102,7.5],[27,150,-102,7.5],
  [29,122,-116,7.5],[31,136,-116,7.5],[34,150,-116,7.5],[33,-153,104,7.2],[35,-141,104,7.4],
  [32,-129,104,7.2],[28,-153,91,7.1],[30,-129,91,7.1]
 ];
 for(const [id,x,z,h] of fences)addPoi(id,x,z,h,{flip:id%2===0});
 // Industrial plant clutter — loading platforms, tank, pallet stacks, containers and generators.
 const industrial=[
  [37,145,-72,10],[40,128,-72,9.5],[41,144,-104,7.2],[42,132,-128,9],
  [45,118,-119,8.5],[46,105,-82,7.0],[47,151,-65,6.3],[48,119,-95,5.4],
  [50,-127,96,7.5],[51,-145,112,4.8],[52,-115,111,4.2],[53,-139,82,5.4],
  [56,-116,130,5.8],[62,152,-48,6.2],[66,147,-120,6.1],[72,114,-69,5.7],
  [37,141,-143,8.8],[42,122,-149,8.2],[50,151,-151,7.4],[53,132,-94,5.6]
 ];
 for(const [id,x,z,h] of industrial)addPoi(id,x,z,h,{flip:id%3===0,solid:[37,40,42,46,50,53].includes(id)?[1.8,1.8]:null});

 // The shopping arcade is not packed solid: empty forecourts and shuttered shopfronts.
 const market=[
  [43,-29,29,8.0],[44,29,29,7.8],[54,-29,37,6.4],[49,57,25,7.6],
  [68,12,25,8.0],[69,57,5,5.5],[51,38,12,4.8],[64,-58,18,5.9],
  [65,-65,9,5.0],[63,-58,-5,5.8],[71,60,-8,4.8],[73,-88,24,5.5],
  [74,-18,79,4.4],[75,18,79,5.8],[76,-18,64,5.4],[67,18,64,7.2],
  [70,-14,-68,7.2],[58,-58,-30,5.2],[58,58,-30,5.2],[58,-58,30,5.2],
  [58,58,30,5.2],[55,-92,15,5.8],[60,-96,40,5.8],[73,96,-21,5.5],
  [48,-64,45,5.2],[52,-55,50,4.4],[69,65,-42,5],[64,64,-32,5.8],
  [65,70,-28,5.1],[71,59,-27,4.8],[62,-67,-28,5.6],[46,-90,-77,6.6],
  [39,-118,-83,5.8],[45,-145,-82,7.5],[55,-147,-62,5.8],[60,146,20,5.6],
  [73,145,-45,5.4],[74,18,-81,4.4],[75,23,-81,5.4],[76,28,-81,5.4],
  [38,126,-48,6.5],[39,146,-48,5.8],[35,155,-31,5.0],[36,155,-15,5.4],
  [43,-31,-28,7.5],[44,31,-28,7.3],[54,-31,-20,6.1],[49,62,-27,7.4]
 ];
 for(const [id,x,z,h] of market)addPoi(id,x,z,h,{flip:(id+x+z)%2===0,solid:[38,39,43,44,45,46,49,50,53,54,63,66,67,68,70,72,75,76].includes(id)?[.68,.68]:null});

 // Street lamps and overhead utility poles run into the distance.
 await report(.67,'Lighting the silent boulevards…');
 const lampPositions=[];
 for(const z of [180,130,75,20,-35,-90,-145,-195])lampPositions.push([-13,z],[13,z]);
 for(const z of [110,0,-110])lampPositions.push([-126,z],[126,z]);
 for(let i=0;i<lampPositions.length;i++){
  const [x,z]=lampPositions[i];addPoi(59,x,z,8.6,{flip:i%2===0,circle:.42});
 }
 const polePositions=[[-151,175],[-151,105],[-151,35],[-151,-35],[-151,-105],[-151,-175],[151,175],[151,105],[151,35],[151,-35],[151,-105],[151,-175]];
 for(let i=0;i<polePositions.length;i++)addPoi(61,polePositions[i][0],polePositions[i][1],9.0,{flip:i%2===0,circle:.48});

 // ---------- 5. Kenopsia: open plazas, neglected green, quiet remnants ----------
 await report(.78,'Letting the empty city be reclaimed…');
 const trees=[
  [-151,185,'fol_slim_canopy_tree',11],[-150,145,'fol_round_canopy_tree',10],[-151,75,'fol_banyan_tree',12],
  [-151,10,'fol_wide_branching_tree',11],[-151,-60,'fol_round_canopy_tree',10],[-151,-125,'fol_young_tree',8],
  [151,185,'fol_slim_canopy_tree',11],[150,145,'fol_round_canopy_tree',10],[151,75,'fol_wide_branching_tree',11],
  [151,10,'fol_banyan_tree',12],[151,-60,'fol_round_canopy_tree',10],[151,-125,'fol_young_tree',8],
  [-20,115,'fol_young_tree',8.5],[20,115,'fol_sapling',7],[-20,58,'fol_slim_canopy_tree',9.2],
  [20,58,'fol_round_canopy_tree',9.7],[-20,-95,'fol_sapling',7.2],[20,-95,'fol_young_tree',8.2],
  [-95,-20,'fol_slim_canopy_tree',8.8],[95,-20,'fol_round_canopy_tree',9.5],[-95,80,'fol_young_tree',8],
  [95,80,'fol_sapling',7.2],[-38,-178,'fol_banyan_tree',11],[38,-178,'fol_round_canopy_tree',10],
  [-68,-178,'fol_slim_canopy_tree',9.5],[68,-178,'fol_young_tree',8]
 ];
 for(const [x,z,k,h] of trees)addGame(k,x,z,h,{flip:rand()<.5,circle:.48});
 const shrubs=[
  [-148,162,'fol_dense_bush',4],[-148,120,'fol_low_wide_bush',3.5],[-148,48,'fol_thorny_shrub',3.5],
  [-148,-4,'fol_flowering_bush',3.6],[-148,-82,'fol_fern_clump',3.1],[148,158,'fol_low_wide_bush',3.5],
  [148,114,'fol_thorny_shrub',3.6],[148,45,'fol_dense_bush',4],[148,-8,'fol_fern_clump',3.2],
  [148,-83,'fol_flowering_bush',3.6],[-20,177,'fol_creeping_groundcover',2.6],[20,177,'fol_tall_wild_grass',2.9],
  [-20,-10,'fol_fern_clump',2.8],[20,-10,'fol_low_wide_bush',2.9],[-20,-151,'fol_thorny_shrub',2.8],
  [20,-151,'fol_broadleaf_plant',2.8],[-80,-185,'fol_creeping_groundcover',2.5],[80,-185,'fol_tall_wild_grass',2.8]
 ];
 for(const [x,z,k,h] of shrubs)addGame(k,x,z,h,{flip:rand()<.5});
 const rubble=[[-150,32,'rok_40',.025],[-145,36,'rok_43',.022],[-138,40,'rok_41',.022],
  [-150,-65,'rok_44',.023],[-144,-60,'rok_42',.021],[-137,-57,'rok_47',.024],
  [148,-90,'rok_35',.022],[153,-86,'rok_43',.023],[142,-80,'rok_45',.025],
  [-145,-148,'rok_47',.023],[-139,-144,'rok_40',.026],[147,-148,'rok_42',.022],
  [140,-142,'rok_44',.023],[-86,-54,'rok_43',.019],[86,-54,'rok_41',.02],
  [-88,93,'rok_45',.021],[88,93,'rok_47',.02]];
 for(const [x,z,k,s] of rubble){const m=META[k];if(m)addGame(k,x,z,m.h*s,{flip:rand()<.5})}
 const weeds=['fol_fallen_leafy_branch','fol_fern_clump','fol_tall_wild_grass','fol_white_wildflower_patch','fol_yellow_flower_patch'];
 for(let i=0;i<54;i++){
  const side=i%2?-1:1,x=side*range(118,151),z=range(-205,205);
  addGame(pick(weeds),x,z,range(1.8,3.3),{flip:rand()<.5});
 }

 // ---------- 6. Practical light: distant lamps, a few failed circuits ----------
 await report(.93,'Marking the empty districts…');
 const lightData=lampPositions.map(([x,z],i)=>[x,z,0xffbd78,i%5===0?.62:.86,34]);
 lightData.push([0,0,0xffc27c,.36,25],[132,-100,0xffa95f,.62,30],[-134,88,0xffb36b,.42,24]);
 for(let i=0;i<lightData.length;i++){
  const [x,z,color,intensity,distance]=lightData[i],light=new T.PointLight(color,intensity,distance,2);
  light.position.set(OX+x,5,OZ+z);group.add(light);
  const c=new T.Color(color),tint={x:OX+x,z:OZ+z,c:color,I:intensity,R:distance,cc:[c.r,c.g,c.b],dyn:true,cur:1};
  LT.push(tint);cityLights.push({light,tint,phase:i*.83,base:intensity});
 }
 const objects=[
  {x:OX,z:OZ-HZ+10,n:'Road back to WNCORE Station 01',t:'f',to:0},
  {x:OX,z:OZ,n:'Old Town Civic Square',note:'The square is wide enough for a crowd. There are no footprints in the dust, only old rain marks and a timetable that still lists tomorrow.'},
  {x:OX-78,z:OZ+85,n:'Residential Avenue',note:'Apartment fronts continue beyond the next crossing. Curtains remain in a few windows, but the avenue is silent.'},
  {x:OX+78,z:OZ+30,n:'Old Market Arcade',note:'A line of shuttered shops and vending machines. One vending machine still glows, but the display is empty.'},
  {x:OX+140,z:OZ-80,n:'Industrial Quarter',note:'Warehouses, loading ramps and a service yard run along the eastern edge. No machinery is running.'},
  {x:OX-140,z:OZ-135,n:'Overgrown District',note:'Trees have split the paving and swallowed the street signs. The buildings continue behind the canopy.'},
  {x:OX+42,z:OZ-135,n:'Northern Blocks',note:'The avenue carries on between rows of apartment buildings. The far end is lost in the haze.'}
 ];
 const api={
  objects,
  // Entry is at the southern edge. The isometric camera looks toward decreasing z,
  // so the long boulevard and first building rows are now directly ahead of the player.
  spawn:{x:0,z:OZ+190},
  bounds:{x0:OX-HX+5,x1:OX+HX-5,z0:OZ-HZ+5,z1:OZ+HZ-5},
  amb:[.76,.76,.71],fog:0x30383a,fogD:.0022,
  setVisible(v){group.visible=v},reset(){},col(){},
  update(t){
   for(const q of cityLights){
    const pulse=.9+.1*Math.sin(t*1.6+q.phase),dead=Math.sin(t*9.1+q.phase)>.995?.08:1;
    q.light.intensity=q.base*pulse*dead;q.tint.cur=pulse*dead;
   }
  },
  stats:{buildings:structureCount,buildingRows:rows.length,poi:ASSETS.length,atlases:atlasFiles.length,marketProps:market.length,industrialProps:industrial.length,
   streetLights:lampPositions.length,utilityPoles:polePositions.length,trees:trees.length,shrubs:shrubs.length,rubble:rubble.length,streetProps:market.length+industrial.length+fences.length}
 };
 await report(1,'Old City sector ready.');
 console.info('Old City loaded:',api.stats);
 return api;
}
