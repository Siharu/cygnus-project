// ===== DRIFTER — OLD CITY / SECTOR 02 =====
// Dense mixed-use sample district. Uses the ruined-city POI pack, game foliage,
// rock library, and the production asphalt / paving / soil tiles.
const OX=0,OZ=900,HX=112,HZ=92,PPU=8;
const ASSETS=[{"id":1,"file":"Individual_PNGs/SRC-001_MasterSheetA_Extract.png","w":203,"h":203},{"id":2,"file":"Individual_PNGs/SRC-002_MasterSheetA_Extract.png","w":194,"h":204},{"id":3,"file":"Individual_PNGs/SRC-003_MasterSheetA_Extract.png","w":154,"h":189},{"id":4,"file":"Individual_PNGs/SRC-004_MasterSheetA_Extract.png","w":200,"h":191},{"id":5,"file":"Individual_PNGs/SRC-005_MasterSheetA_Extract.png","w":191,"h":197},{"id":6,"file":"Individual_PNGs/SRC-006_MasterSheetA_Extract.png","w":174,"h":198},{"id":7,"file":"Individual_PNGs/SRC-007_MasterSheetA_Extract.png","w":146,"h":192},{"id":8,"file":"Individual_PNGs/SRC-008_MasterSheetA_Extract.png","w":164,"h":183},{"id":9,"file":"Individual_PNGs/SRC-009_MasterSheetA_Extract.png","w":231,"h":192},{"id":10,"file":"Individual_PNGs/SRC-010_MasterSheetA_Extract.png","w":268,"h":194},{"id":11,"file":"Individual_PNGs/SRC-011_MasterSheetA_Extract.png","w":175,"h":172},{"id":12,"file":"Individual_PNGs/SRC-012_MasterSheetA_Extract.png","w":126,"h":152},{"id":13,"file":"Individual_PNGs/SRC-013_MasterSheetA_Extract.png","w":126,"h":159},{"id":14,"file":"Individual_PNGs/SRC-014_MasterSheetA_Extract.png","w":141,"h":160},{"id":15,"file":"Individual_PNGs/SRC-015_MasterSheetA_Extract.png","w":130,"h":148},{"id":16,"file":"Individual_PNGs/SRC-016_MasterSheetA_Extract.png","w":156,"h":159},{"id":17,"file":"Individual_PNGs/SRC-017_MasterSheetA_Extract.png","w":129,"h":144},{"id":18,"file":"Individual_PNGs/SRC-018_MasterSheetA_Extract.png","w":210,"h":217},{"id":19,"file":"Individual_PNGs/SRC-019_MasterSheetA_Extract.png","w":251,"h":200},{"id":20,"file":"Individual_PNGs/SRC-020_MasterSheetA_Extract.png","w":196,"h":180},{"id":21,"file":"Individual_PNGs/SRC-021_MasterSheetA_Extract.png","w":226,"h":176},{"id":22,"file":"Individual_PNGs/SRC-022_MasterSheetA_Extract.png","w":240,"h":197},{"id":23,"file":"Individual_PNGs/SRC-023_MasterSheetA_Extract.png","w":160,"h":189},{"id":24,"file":"Individual_PNGs/SRC-024_MasterSheetA_Extract.png","w":193,"h":186},{"id":25,"file":"Individual_PNGs/SRC-025_MasterSheetA_Extract.png","w":146,"h":135},{"id":26,"file":"Individual_PNGs/SRC-026_MasterSheetA_Extract.png","w":171,"h":134},{"id":27,"file":"Individual_PNGs/SRC-027_MasterSheetA_Extract.png","w":130,"h":128},{"id":28,"file":"Individual_PNGs/SRC-028_MasterSheetA_Extract.png","w":104,"h":130},{"id":29,"file":"Individual_PNGs/SRC-029_MasterSheetA_Extract.png","w":108,"h":121},{"id":30,"file":"Individual_PNGs/SRC-030_MasterSheetA_Extract.png","w":89,"h":120},{"id":31,"file":"Individual_PNGs/SRC-031_MasterSheetA_Extract.png","w":105,"h":121},{"id":32,"file":"Individual_PNGs/SRC-032_MasterSheetA_Extract.png","w":135,"h":118},{"id":33,"file":"Individual_PNGs/SRC-033_MasterSheetA_Extract.png","w":112,"h":135},{"id":34,"file":"Individual_PNGs/SRC-034_MasterSheetA_Extract.png","w":97,"h":115},{"id":35,"file":"Individual_PNGs/SRC-035_MasterSheetA_Extract.png","w":111,"h":105},{"id":36,"file":"Individual_PNGs/SRC-036_MasterSheetA_Extract.png","w":101,"h":83},{"id":37,"file":"Individual_PNGs/SRC-037_MasterSheetA_Extract.png","w":117,"h":142},{"id":38,"file":"Individual_PNGs/SRC-038_MasterSheetA_Extract.png","w":110,"h":119},{"id":39,"file":"Individual_PNGs/SRC-039_MasterSheetA_Extract.png","w":147,"h":106},{"id":40,"file":"Individual_PNGs/SRC-040_MasterSheetA_Extract.png","w":146,"h":121},{"id":41,"file":"Individual_PNGs/SRC-041_MasterSheetA_Extract.png","w":150,"h":134},{"id":42,"file":"Individual_PNGs/SRC-042_MasterSheetA_Extract.png","w":165,"h":139},{"id":43,"file":"Individual_PNGs/SRC-043_MasterSheetA_Extract.png","w":170,"h":135},{"id":44,"file":"Individual_PNGs/SRC-044_MasterSheetA_Extract.png","w":168,"h":120},{"id":45,"file":"Individual_PNGs/SRC-045_MasterSheetA_Extract.png","w":170,"h":141},{"id":46,"file":"Individual_PNGs/SRC-046_MasterSheetA_Extract.png","w":133,"h":104},{"id":47,"file":"Individual_PNGs/SRC-047_MasterSheetA_Extract.png","w":167,"h":96},{"id":48,"file":"Individual_PNGs/SRC-048_MasterSheetA_Extract.png","w":115,"h":95},{"id":49,"file":"Individual_PNGs/SRC-049_MasterSheetA_Extract.png","w":91,"h":94},{"id":50,"file":"Individual_PNGs/SRC-050_MasterSheetA_Extract.png","w":131,"h":94},{"id":51,"file":"Individual_PNGs/SRC-051_MasterSheetA_Extract.png","w":115,"h":87},{"id":52,"file":"Individual_PNGs/SRC-052_MasterSheetA_Extract.png","w":80,"h":69},{"id":53,"file":"Individual_PNGs/SRC-053_MasterSheetA_Extract.png","w":101,"h":81},{"id":54,"file":"Individual_PNGs/SRC-054_MasterSheetA_Extract.png","w":116,"h":89},{"id":55,"file":"Individual_PNGs/SRC-055_MasterSheetA_Extract.png","w":126,"h":86},{"id":56,"file":"Individual_PNGs/SRC-056_MasterSheetA_Extract.png","w":127,"h":78},{"id":57,"file":"Individual_PNGs/SRC-057_MasterSheetA_Extract.png","w":111,"h":163},{"id":58,"file":"Individual_PNGs/SRC-058_MasterSheetA_Extract.png","w":116,"h":77},{"id":59,"file":"Individual_PNGs/SRC-059_MasterSheetA_Extract.png","w":69,"h":135},{"id":60,"file":"Individual_PNGs/SRC-060_MasterSheetA_Extract.png","w":131,"h":116},{"id":61,"file":"Individual_PNGs/SRC-061_MasterSheetA_Extract.png","w":58,"h":124},{"id":62,"file":"Individual_PNGs/SRC-062_MasterSheetA_Extract.png","w":53,"h":93},{"id":63,"file":"Individual_PNGs/SRC-063_MasterSheetA_Extract.png","w":98,"h":114},{"id":64,"file":"Individual_PNGs/SRC-064_MasterSheetA_Extract.png","w":99,"h":104},{"id":65,"file":"Individual_PNGs/SRC-065_MasterSheetA_Extract.png","w":46,"h":82},{"id":66,"file":"Individual_PNGs/SRC-066_MasterSheetA_Extract.png","w":100,"h":99},{"id":67,"file":"Individual_PNGs/SRC-067_MasterSheetA_Extract.png","w":68,"h":108},{"id":68,"file":"Individual_PNGs/SRC-068_MasterSheetA_Extract.png","w":56,"h":107},{"id":69,"file":"Individual_PNGs/SRC-069_MasterSheetA_Extract.png","w":88,"h":89},{"id":70,"file":"Individual_PNGs/SRC-070_MasterSheetA_Extract.png","w":42,"h":112},{"id":71,"file":"Individual_PNGs/SRC-071_MasterSheetA_Extract.png","w":89,"h":89},{"id":72,"file":"Individual_PNGs/SRC-072_MasterSheetA_Extract.png","w":51,"h":83},{"id":73,"file":"Individual_PNGs/SRC-073_MasterSheetA_Extract.png","w":147,"h":92},{"id":74,"file":"Individual_PNGs/SRC-074_MasterSheetA_Extract.png","w":54,"h":77},{"id":75,"file":"Individual_PNGs/SRC-075_MasterSheetA_Extract.png","w":70,"h":71},{"id":76,"file":"Individual_PNGs/SRC-076_MasterSheetA_Extract.png","w":88,"h":85},{"id":77,"file":"Individual_PNGs/SRC-077_MasterSheetA_Extract.png","w":57,"h":40},{"id":78,"file":"Individual_PNGs/SRC-078_MasterSheetA_Extract.png","w":55,"h":41}];
export async function buildCity(ctx,progress=()=>{}){
 const {T,sc,SPR,sol,circ,IM,META,LT,ren}=ctx;
 const tick=()=>new Promise(r=>requestAnimationFrame(r));
 const report=async(p,m)=>{progress(Math.min(1,p),m);await tick()};
 let seed=0xC17A02;
 const rand=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let v=Math.imul(seed^seed>>>15,1|seed);v=v+Math.imul(v^v>>>7,61|v)^v;return((v^v>>>14)>>>0)/4294967296};
 const pick=a=>a[Math.floor(rand()*a.length)],range=(a,b)=>a+(b-a)*rand();
 await report(.02,'Opening the old city archive…');
 const byId=new Map(ASSETS.map(a=>[a.id,a])),textures=new Map(),loader=new T.TextureLoader();
 let loaded=0;
 await Promise.all(ASSETS.map(a=>new Promise(resolve=>{
  loader.load(new URL('../../assets/DRIFTER_POI_Asset_Library_v2/'+a.file,import.meta.url).href,t=>{
   t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;
   textures.set(a.id,t);loaded++;progress(.03+.24*loaded/ASSETS.length,'Loading city art '+loaded+'/'+ASSETS.length+'…');resolve(true)
  },undefined,e=>{console.warn('City asset failed:',a.file,e);loaded++;progress(.03+.24*loaded/ASSETS.length,'Loading city art '+loaded+'/'+ASSETS.length+'…');resolve(false)})
 })));
 const group=new T.Group();group.visible=false;sc.add(group);
 const cityLights=[],gameTextures=new Map();
 function addPoi(id,x,z,h,opts={}){
  const a=byId.get(id),base=textures.get(id);if(!a||!base)return null;
  let map=base;if(opts.flip){map=base.clone();map.wrapS=T.RepeatWrapping;map.repeat.x=-1;map.offset.x=1;map.needsUpdate=true}
  const w=h*a.w/a.h,ax=opts.ax??.5,c=opts.c??.025;
  const mat=new T.SpriteMaterial({map,alphaTest:.28,transparent:false,depthWrite:true,fog:true,color:0xffffff});
  const s=new T.Sprite(mat);s.scale.set(w,h,1);s.center.set(opts.flip?1-ax:ax,c);s.position.set(OX+x,opts.y||0,OZ+z);s.frustumCulled=false;
  s.userData={x:OX+x,z:OZ+z,w,h,c,ax,mat,flat:false,city:true,key:'poi_'+id};
  group.add(s);SPR.push(s);
  if(opts.solid){const [rx,rz]=opts.solid;sol.push({x:OX+x,z:OZ+z,rx,rz,city:true})}
  if(opts.circle)circ.push({x:OX+x,z:OZ+z,r:opts.circle});
  return s
 }
 function addGame(key,x,z,h,opts={}){
  const meta=META[key],img=IM[key];if(!meta||!img)return null;
  let tex=gameTextures.get(key);if(!tex){tex=new T.Texture(img);tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;tex.needsUpdate=true;gameTextures.set(key,tex)}
  const map=opts.flip?tex.clone():tex;if(opts.flip){map.wrapS=T.RepeatWrapping;map.repeat.x=-1;map.offset.x=1;map.needsUpdate=true}
  const w=h*meta.w/meta.h,ax=/tree|sapling/.test(key)?meta.ax:.5,c=.03;
  const mat=new T.SpriteMaterial({map,alphaTest:.4,transparent:false,depthWrite:true,fog:true,color:0xffffff});
  const s=new T.Sprite(mat);s.scale.set(w,h,1);s.center.set(opts.flip?1-ax:ax,c);s.position.set(OX+x,0,OZ+z);s.frustumCulled=false;
  s.userData={x:OX+x,z:OZ+z,w,h,c,ax,mat,flat:false,city:true,key};
  group.add(s);SPR.push(s);if(opts.circle)circ.push({x:OX+x,z:OZ+z,r:opts.circle});return s
 }

 // ---------- 1. Real tiled ground: asphalt roads, paved blocks, exposed soil ----------
 await report(.30,'Rebuilding the street grid…');
 const cv=document.createElement('canvas');cv.width=HX*2*PPU;cv.height=HZ*2*PPU;
 const g=cv.getContext('2d'),px=x=>(x+HX)*PPU,pz=z=>(z+HZ)*PPU;
 const rect=(x,z,w,h,color)=>{g.fillStyle=color;g.fillRect(px(x),pz(z),w*PPU,h*PPU)};
 function tiled(prefix,x0,z0,x1,z1,cell=96,offset=0){
  const L=px(x0),U=pz(z0),R=px(x1),B=pz(z1);
  for(let y=U,row=0;y<B;y+=cell,row++)for(let x=L,col=0;x<R;x+=cell,col++){
   const im=IM[prefix+((row*7+col*11+offset)%4)];if(im)g.drawImage(im,x,y,Math.min(cell,R-x),Math.min(cell,B-y))
  }
 }
 tiled('tile_soil',-HX,-HZ,HX,HZ,112,1);
 const xBlocks=[[-112,-76],[-64,-8],[8,64],[76,112]],zBlocks=[[-92,-61],[-49,-6],[6,49],[61,92]];
 let bi=0;
 for(const xb of xBlocks)for(const zb of zBlocks){
  const inset=1.1+(bi%3)*.35;tiled('tile_pave',xb[0]+inset,zb[0]+inset,xb[1]-inset,zb[1]-inset,88,bi);
  const sx=xb[0]+4+(bi%2)*3,sz=zb[0]+4+(bi%3)*2;
  tiled('tile_soil',sx,sz,sx+7.5,sz+5.5,72,bi+2);
  g.fillStyle='rgba(32,40,35,.10)';g.fillRect(px(xb[0]+2),pz(zb[0]+2),(xb[1]-xb[0]-4)*PPU,(zb[1]-zb[0]-4)*PPU);bi++;
 }
 const vRoads=[-70,0,70],hRoads=[-55,0,55];
 for(const x of vRoads){
  tiled('tile_pave',x-7.4,-HZ,x+7.4,HZ,84,x+100);
  tiled('tile_asphalt',x-4.9,-HZ,x+4.9,HZ,112,x+100);
  rect(x-7.6,-HZ,.35,HZ*2,'rgba(179,169,145,.42)');rect(x+7.25,-HZ,.35,HZ*2,'rgba(179,169,145,.35)')
 }
 for(const z of hRoads){
  tiled('tile_pave',-HX,z-7.4,HX,z+7.4,84,z+100);
  tiled('tile_asphalt',-HX,z-4.9,HX,z+4.9,112,z+100);
  rect(-HX,z-7.6,HX*2,.35,'rgba(179,169,145,.42)');rect(-HX,z+7.25,HX*2,.35,'rgba(179,169,145,.35)')
 }
 g.strokeStyle='rgba(190,177,146,.56)';g.lineWidth=PPU*.13;g.setLineDash([PPU*2.3,PPU*2.2]);
 for(const x of vRoads){g.beginPath();g.moveTo(px(x),pz(-HZ));g.lineTo(px(x),pz(HZ));g.stroke()}
 for(const z of hRoads){g.beginPath();g.moveTo(px(-HX),pz(z));g.lineTo(px(HX),pz(z));g.stroke()}
 g.setLineDash([]);
 for(const x of vRoads)for(const z of hRoads){
  for(let k=-4;k<=4;k++){rect(x+k*1.05-.28,z-5.4,.56,1.55,'rgba(196,188,165,.76)');rect(x+k*1.05-.28,z+3.85,.56,1.55,'rgba(196,188,165,.76)')}
  rect(x-5.4,z-7.2,10.8,.32,'rgba(202,191,160,.58)');rect(x-5.4,z+6.9,10.8,.32,'rgba(202,191,160,.45)')
 }
 for(const z of [-27,27])for(const x of [-48,48]){
  g.strokeStyle='rgba(195,184,155,.48)';g.lineWidth=PPU*.12;
  for(let k=0;k<5;k++)g.strokeRect(px(x-7+k*2.8),pz(z-5.2),PPU*2.2,PPU*4.4)
 }
 g.beginPath();g.arc(px(0),pz(0),PPU*7.4,0,Math.PI*2);g.fillStyle='#66655c';g.fill();g.lineWidth=PPU*.22;g.strokeStyle='rgba(204,187,145,.75)';g.stroke();
 g.beginPath();g.arc(px(0),pz(0),PPU*3.2,0,Math.PI*2);g.fillStyle='#454d48';g.fill();
 tiled('tile_pave',72,35,109,89,72,3);
 for(const [x,z] of [[-63,-50],[63,-50],[-63,50],[63,50],[-7,-50],[7,50],[-7,50],[7,-50]]){
  g.fillStyle='rgba(16,20,21,.58)';g.fillRect(px(x),pz(z),PPU*1.1,PPU*.6);g.strokeStyle='rgba(164,160,144,.42)';g.lineWidth=1;
  for(let k=1;k<5;k++){g.beginPath();g.moveTo(px(x+k*.22),pz(z));g.lineTo(px(x+k*.22),pz(z+.6));g.stroke()}
 }
 g.strokeStyle='rgba(9,13,15,.32)';g.lineWidth=1.2;
 for(let i=0;i<180;i++){const x=-108+(i*37)%214,z=-88+(i*53)%174;g.beginPath();g.moveTo(px(x),pz(z));g.lineTo(px(x+((i%5)-2)*.8),pz(z+1.2+(i%4)*.3));g.stroke()}
 const groundTexture=new T.CanvasTexture(cv);groundTexture.magFilter=T.LinearFilter;groundTexture.minFilter=T.LinearMipmapLinearFilter;groundTexture.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy());
 const gg=new T.PlaneGeometry(HX*2,HZ*2);gg.rotateX(-Math.PI/2);
 const ground=new T.Mesh(gg,new T.MeshBasicMaterial({map:groundTexture,fog:true,depthWrite:false}));ground.position.set(OX,-.09,OZ);group.add(ground);

 // ---------- 2. Dense mixed-use buildings: 24 structures / six fronts ----------
 await report(.43,'Populating the residential and market blocks…');
 const columns=[-91,-48,-24,24,48,91],rows=[-75,-27,27,75],buildingSolids=[];
 for(let row=0;row<4;row++)for(let col=0;col<6;col++){
  const id=row*6+col+1,x=columns[col],z=rows[row],a=byId.get(id);if(!a||!textures.has(id))continue;
  let h=id<=8?17.2+(id%3)*.85:id<=18?15.8+(id%4)*.72:17.4+(id%3)*.9;
  if(id===10||id===18)h-=1.6;
  const w=h*a.w/a.h,rx=Math.min(9.2,Math.max(5.7,w*.34)),rz=id>=19?6.3:5.8;
  addPoi(id,x,z,h,{flip:id%5===0});sol.push({x:OX+x,z:OZ+z,rx,rz,city:true});buildingSolids.push({x,z,rx,rz})
 }

 // ---------- 3. Modular walls, industrial yard and secondary structures ----------
 await report(.52,'Building courtyards and industrial frontage…');
 const fences=[
  [30,76,39,5.4],[28,84,39,5.2],[30,92,39,5.4],[28,100,39,5.2],
  [28,76,57,5.2],[30,100,57,5.4],[34,88,39,5.8],[27,76,49,6.4],
  [27,100,49,6.4],[35,88,61,4.8],[33,-104,-42,7.5],[36,-91,-42,5.8],[35,-104,-32,5.0]
 ];
 for(const [id,x,z,h] of fences)addPoi(id,x,z,h,{flip:id%2===0});
 const industrial=[
  [37,-103,70,9.2],[40,89,49,9.4],[41,73,69,6.2],[42,104,71,8.2],
  [45,62,61,8.6],[46,83,31,7.2],[47,102,49,6.2],[48,69,79,5.6],
  [50,-79,42,7.4],[51,65,84,4.6],[52,57,78,4.0],[53,77,63,5.4],
  [56,94,84,5.5],[62,106,27,6.1],[66,99,80,6.0],[72,70,47,5.8]
 ];
 for(const [id,x,z,h] of industrial)addPoi(id,x,z,h,{flip:id%4===0,solid:[37,40,42,46,50,53].includes(id)?[1.7,1.7]:null});

 // ---------- 4. Market streets, service alleys and curbside clutter ----------
 await report(.61,'Filling the market streets…');
 const details=[
  [43,-36,-27,7.5],[44,36,-27,7.3],[54,-36,-20,6.3],[49,60,-24,7.6],
  [68,13,-21,8.0],[69,52,-39,5.2],[51,39,-9,4.6],[64,-59,-14,5.8],
  [65,-63,-21,5.0],[63,-57,-36,5.8],[71,59,-11,4.6],[73,-83,-43,5.5],
  [74,-12,-80,4.2],[75,12,-80,5.4],[76,-13,-67,5.4],[67,14,-66,7.2],
  [70,-12,-44,7.0],[58,-57,-39,4.8],[58,57,-39,4.8],[58,-57,35,4.8],
  [58,57,35,4.8],[55,-82,15,5.6],[60,-98,18,5.8],[73,101,-17,5.6],
  [48,-60,16,5.2],[52,-54,20,4.2],[69,62,20,5.0],[64,61,28,5.8],
  [65,66,32,5.1],[71,57,33,4.8],[62,-61,31,5.6],[46,-82,80,6.6],
  [39,-79,84,5.8],[45,-99,84,7.5],[55,-99,65,5.8],[60,103,15,5.6],
  [73,101,64,5.4],[74,16,65,4.2],[75,20,65,5.4],[76,24,65,5.4],
  [38,77,31,6.5],[39,97,31,5.8],[35,109,43,5.0],[36,109,55,5.4]
 ];
 for(const [id,x,z,h] of details)addPoi(id,x,z,h,{flip:(id+x+z)%2===0,solid:[38,39,43,44,45,46,49,50,53,54,63,66,67,68,70,72,75,76].includes(id)?[.65,.65]:null});
 // Streetlamps and utility poles frame the avenues without blocking the centre lane.
 const lamps=[-74,-30,20,68],lampPositions=[];
 for(const z of lamps)lampPositions.push([-9,z],[9,z]);
 for(const z of [-27,27])lampPositions.push([-77,z],[77,z]);
 for(let i=0;i<lampPositions.length;i++){const [x,z]=lampPositions[i];addPoi(59,x,z,8.4,{flip:i%2===0,circle:.42})}
 const poles=[[-74,-77],[-74,-25],[-74,30],[-74,76],[74,-77],[74,-25],[74,30],[74,76]];
 for(let i=0;i<poles.length;i++)addPoi(61,poles[i][0],poles[i][1],8.8,{flip:i%2===0,circle:.48});

 // ---------- 5. Reclaiming nature: mature trees, planters, weeds and broken stone ----------
 await report(.74,'Letting the city grow over…');
 const trees=[
  [-105,-83,'fol_slim_canopy_tree',10.8],[-106,-55,'fol_round_canopy_tree',10],[-105,-18,'fol_banyan_tree',12],
  [-106,22,'fol_wide_branching_tree',11],[-104,60,'fol_round_canopy_tree',10.6],[-104,85,'fol_young_tree',8],
  [105,-83,'fol_slim_canopy_tree',10.5],[106,-50,'fol_round_canopy_tree',9.8],[105,-12,'fol_wide_branching_tree',11.2],
  [105,27,'fol_banyan_tree',12],[104,61,'fol_round_canopy_tree',10.5],[104,85,'fol_young_tree',8],
  [-14,-46,'fol_young_tree',8.5],[14,-46,'fol_sapling',7],[-14,10,'fol_slim_canopy_tree',9.2],
  [14,10,'fol_round_canopy_tree',9.7],[-14,55,'fol_sapling',7.2],[14,55,'fol_young_tree',8.2],
  [-62,-2,'fol_slim_canopy_tree',8.8],[62,-2,'fol_round_canopy_tree',9.5],[-62,54,'fol_young_tree',8],
  [62,54,'fol_sapling',7.2],[-35,88,'fol_banyan_tree',11],[35,88,'fol_round_canopy_tree',10]
 ];
 for(const [x,z,k,h] of trees)addGame(k,x,z,h,{flip:rand()<.5,circle:.48});
 const shrubs=[
  [-100,-70,'fol_dense_bush',4],[-100,-35,'fol_low_wide_bush',3.5],[-100,4,'fol_thorny_shrub',3.5],
  [-100,42,'fol_flowering_bush',3.6],[-100,77,'fol_fern_clump',3.1],[100,-68,'fol_low_wide_bush',3.5],
  [100,-32,'fol_thorny_shrub',3.6],[100,2,'fol_dense_bush',4],[100,42,'fol_fern_clump',3.2],
  [100,76,'fol_flowering_bush',3.6],[-17,-84,'fol_creeping_groundcover',2.6],[17,-84,'fol_tall_wild_grass',2.9],
  [-16,-13,'fol_fern_clump',2.8],[16,-13,'fol_low_wide_bush',2.9],[-16,43,'fol_thorny_shrub',2.8],
  [16,43,'fol_broadleaf_plant',2.8],[-40,86,'fol_creeping_groundcover',2.5],[40,86,'fol_tall_wild_grass',2.8]
 ];
 for(const [x,z,k,h] of shrubs)addGame(k,x,z,h,{flip:rand()<.5});
 const rubble=[[-103,-47,'rok_40',.024],[-97,-45,'rok_43',.021],[-91,-42,'rok_41',.021],[-104,10,'rok_44',.022],
  [-98,14,'rok_42',.02],[-91,17,'rok_47',.023],[101,-40,'rok_35',.021],[105,-36,'rok_43',.022],
  [97,-31,'rok_45',.024],[-102,70,'rok_47',.022],[-98,74,'rok_40',.025],[101,71,'rok_42',.021],
  [95,75,'rok_44',.022],[-58,42,'rok_43',.018],[58,42,'rok_41',.019],[-60,-45,'rok_45',.02],[60,-45,'rok_47',.019]];
 for(const [x,z,k,s] of rubble){const m=META[k];if(m)addGame(k,x,z,m.h*s,{flip:rand()<.5})}
 const weeds=['fol_fallen_leafy_branch','fol_fern_clump','fol_tall_wild_grass','fol_white_wildflower_patch','fol_yellow_flower_patch'];
 for(let i=0;i<30;i++){const side=i%2?-1:1,x=side*range(82,108),z=range(-84,88);addGame(pick(weeds),x,z,range(1.7,3.1),{flip:rand()<.5})}

 // ---------- 6. Warm practical lighting, landmarks and return route ----------
 await report(.92,'Powering the street lights…');
 const lightsAt=lampPositions.map(([x,z])=>[x,z,0xffbd78,1.15,29]);
 lightsAt.push([88,48,0xffa95f,1,34],[-90,73,0xffb36b,.65,26],[0,0,0xffc27c,.55,24]);
 for(let i=0;i<lightsAt.length;i++){
  const [x,z,color,intensity,distance]=lightsAt[i],light=new T.PointLight(color,intensity,distance,2);
  light.position.set(OX+x,5,OZ+z);group.add(light);const c=new T.Color(color);
  const tint={x:OX+x,z:OZ+z,c:color,I:intensity,R:distance,cc:[c.r,c.g,c.b],dyn:true,cur:1};
  LT.push(tint);cityLights.push({light,tint,phase:i*.73,base:intensity});
 }
 const objects=[
  {x:OX,z:OZ-HZ+8,n:'Road back to WNCORE Station 01',t:'f',to:0},
  {x:OX,z:OZ+1,n:'Old Town Junction',note:'Four roads meet here. Lane markings are still visible under the dust, but the traffic lights have been dark for a long time.'},
  {x:OX-46,z:OZ-27,n:'Residential block',note:'A row of apartments and small homes. Curtains still hang in a few windows, though every doorway is open.'},
  {x:OX+46,z:OZ-27,n:'Market street',note:'The shopfronts face the main road. A few signs remain, but the shelves and counters are long since empty.'},
  {x:OX+91,z:OZ+48,n:'Industrial yard',note:'A fenced service yard sits behind the larger industrial buildings. The gate has been left partly open.'},
  {x:OX-91,z:OZ+75,n:'Overgrown avenue',note:'Trees and street clutter have begun to reclaim the edge of the road. The city is quieter here.'},
  {x:OX+46,z:OZ+75,n:'South blocks',note:'The road continues past the last row of buildings. This sample sector ends beyond the outer blocks.'}
 ];
 const api={
  objects,spawn:{x:OX,z:OZ-HZ+15},bounds:{x0:OX-HX+5,x1:OX+HX-5,z0:OZ-HZ+5,z1:OZ+HZ-5},
  amb:[.82,.78,.69],fog:0x30383a,fogD:.0038,
  setVisible(v){group.visible=v},reset(){},col(){},
  update(t){for(const q of cityLights){const pulse=.94+.06*Math.sin(t*2.1+q.phase),flicker=Math.sin(t*13+q.phase)>.997?.72:1;q.light.intensity=q.base*pulse*flicker;q.tint.cur=pulse*flicker}},
  stats:{buildings:24,poi:ASSETS.length,marketCanopies:5,streetLights:lampPositions.length,trees:trees.length,shrubs:shrubs.length,rubble:rubble.length,streetProps:details.length+industrial.length+fences.length}
 };
 await report(1,'Old City sector ready.');
 console.info('Old City loaded:',api.stats);
 return api;
}
