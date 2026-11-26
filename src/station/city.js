// ===== DRIFTER — CITY SECTOR (sample sector south of WNCORE Station 01) =====
// Built lazily on first entry. Uses the 78 isolated sprites in the existing ruined-city POI pack.
// Sector coordinates are deliberately separate from the station and Silvan maps.
const OX=0,OZ=900,HX=112,HZ=92,PPU=8;
const ASSETS=[{"id":1,"file":"Individual_PNGs/SRC-001_MasterSheetA_Extract.png","category":"Residential building","w":203,"h":203},{"id":2,"file":"Individual_PNGs/SRC-002_MasterSheetA_Extract.png","category":"Residential building","w":194,"h":204},{"id":3,"file":"Individual_PNGs/SRC-003_MasterSheetA_Extract.png","category":"Residential building","w":154,"h":189},{"id":4,"file":"Individual_PNGs/SRC-004_MasterSheetA_Extract.png","category":"Residential building","w":200,"h":191},{"id":5,"file":"Individual_PNGs/SRC-005_MasterSheetA_Extract.png","category":"Residential building","w":191,"h":197},{"id":6,"file":"Individual_PNGs/SRC-006_MasterSheetA_Extract.png","category":"Residential building","w":174,"h":198},{"id":7,"file":"Individual_PNGs/SRC-007_MasterSheetA_Extract.png","category":"Residential building","w":146,"h":192},{"id":8,"file":"Individual_PNGs/SRC-008_MasterSheetA_Extract.png","category":"Residential building","w":164,"h":183},{"id":9,"file":"Individual_PNGs/SRC-009_MasterSheetA_Extract.png","category":"Commercial building","w":231,"h":192},{"id":10,"file":"Individual_PNGs/SRC-010_MasterSheetA_Extract.png","category":"Commercial building","w":268,"h":194},{"id":11,"file":"Individual_PNGs/SRC-011_MasterSheetA_Extract.png","category":"Commercial building","w":175,"h":172},{"id":12,"file":"Individual_PNGs/SRC-012_MasterSheetA_Extract.png","category":"Commercial building","w":126,"h":152},{"id":13,"file":"Individual_PNGs/SRC-013_MasterSheetA_Extract.png","category":"Commercial building","w":126,"h":159},{"id":14,"file":"Individual_PNGs/SRC-014_MasterSheetA_Extract.png","category":"Commercial building","w":141,"h":160},{"id":15,"file":"Individual_PNGs/SRC-015_MasterSheetA_Extract.png","category":"Commercial building","w":130,"h":148},{"id":16,"file":"Individual_PNGs/SRC-016_MasterSheetA_Extract.png","category":"Commercial building","w":156,"h":159},{"id":17,"file":"Individual_PNGs/SRC-017_MasterSheetA_Extract.png","category":"Commercial building","w":129,"h":144},{"id":18,"file":"Individual_PNGs/SRC-018_MasterSheetA_Extract.png","category":"Commercial building","w":210,"h":217},{"id":19,"file":"Individual_PNGs/SRC-019_MasterSheetA_Extract.png","category":"Industrial building or structure","w":251,"h":200},{"id":20,"file":"Individual_PNGs/SRC-020_MasterSheetA_Extract.png","category":"Industrial building or structure","w":196,"h":180},{"id":21,"file":"Individual_PNGs/SRC-021_MasterSheetA_Extract.png","category":"Industrial building or structure","w":226,"h":176},{"id":22,"file":"Individual_PNGs/SRC-022_MasterSheetA_Extract.png","category":"Industrial building or structure","w":240,"h":197},{"id":23,"file":"Individual_PNGs/SRC-023_MasterSheetA_Extract.png","category":"Industrial building or structure","w":160,"h":189},{"id":24,"file":"Individual_PNGs/SRC-024_MasterSheetA_Extract.png","category":"Industrial building or structure","w":193,"h":186},{"id":25,"file":"Individual_PNGs/SRC-025_MasterSheetA_Extract.png","category":"Modular wall or gate","w":146,"h":135},{"id":26,"file":"Individual_PNGs/SRC-026_MasterSheetA_Extract.png","category":"Modular wall or gate","w":171,"h":134},{"id":27,"file":"Individual_PNGs/SRC-027_MasterSheetA_Extract.png","category":"Modular wall or gate","w":130,"h":128},{"id":28,"file":"Individual_PNGs/SRC-028_MasterSheetA_Extract.png","category":"Modular wall or gate","w":104,"h":130},{"id":29,"file":"Individual_PNGs/SRC-029_MasterSheetA_Extract.png","category":"Modular wall or gate","w":108,"h":121},{"id":30,"file":"Individual_PNGs/SRC-030_MasterSheetA_Extract.png","category":"Modular wall or gate","w":89,"h":120},{"id":31,"file":"Individual_PNGs/SRC-031_MasterSheetA_Extract.png","category":"Modular wall or gate","w":105,"h":121},{"id":32,"file":"Individual_PNGs/SRC-032_MasterSheetA_Extract.png","category":"Modular wall or gate","w":135,"h":118},{"id":33,"file":"Individual_PNGs/SRC-033_MasterSheetA_Extract.png","category":"Modular wall or gate","w":112,"h":135},{"id":34,"file":"Individual_PNGs/SRC-034_MasterSheetA_Extract.png","category":"Modular wall or gate","w":97,"h":115},{"id":35,"file":"Individual_PNGs/SRC-035_MasterSheetA_Extract.png","category":"Modular wall or gate","w":111,"h":105},{"id":36,"file":"Individual_PNGs/SRC-036_MasterSheetA_Extract.png","category":"Modular wall or gate","w":101,"h":83},{"id":37,"file":"Individual_PNGs/SRC-037_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":117,"h":142},{"id":38,"file":"Individual_PNGs/SRC-038_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":110,"h":119},{"id":39,"file":"Individual_PNGs/SRC-039_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":147,"h":106},{"id":40,"file":"Individual_PNGs/SRC-040_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":146,"h":121},{"id":41,"file":"Individual_PNGs/SRC-041_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":150,"h":134},{"id":42,"file":"Individual_PNGs/SRC-042_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":165,"h":139},{"id":43,"file":"Individual_PNGs/SRC-043_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":170,"h":135},{"id":44,"file":"Individual_PNGs/SRC-044_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":168,"h":120},{"id":45,"file":"Individual_PNGs/SRC-045_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":170,"h":141},{"id":46,"file":"Individual_PNGs/SRC-046_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":133,"h":104},{"id":47,"file":"Individual_PNGs/SRC-047_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":167,"h":96},{"id":48,"file":"Individual_PNGs/SRC-048_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":115,"h":95},{"id":49,"file":"Individual_PNGs/SRC-049_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":91,"h":94},{"id":50,"file":"Individual_PNGs/SRC-050_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":131,"h":94},{"id":51,"file":"Individual_PNGs/SRC-051_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":115,"h":87},{"id":52,"file":"Individual_PNGs/SRC-052_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":80,"h":69},{"id":53,"file":"Individual_PNGs/SRC-053_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":101,"h":81},{"id":54,"file":"Individual_PNGs/SRC-054_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":116,"h":89},{"id":55,"file":"Individual_PNGs/SRC-055_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":126,"h":86},{"id":56,"file":"Individual_PNGs/SRC-056_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":127,"h":78},{"id":57,"file":"Individual_PNGs/SRC-057_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":111,"h":163},{"id":58,"file":"Individual_PNGs/SRC-058_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":116,"h":77},{"id":59,"file":"Individual_PNGs/SRC-059_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":69,"h":135},{"id":60,"file":"Individual_PNGs/SRC-060_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":131,"h":116},{"id":61,"file":"Individual_PNGs/SRC-061_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":58,"h":124},{"id":62,"file":"Individual_PNGs/SRC-062_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":53,"h":93},{"id":63,"file":"Individual_PNGs/SRC-063_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":98,"h":114},{"id":64,"file":"Individual_PNGs/SRC-064_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":99,"h":104},{"id":65,"file":"Individual_PNGs/SRC-065_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":46,"h":82},{"id":66,"file":"Individual_PNGs/SRC-066_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":100,"h":99},{"id":67,"file":"Individual_PNGs/SRC-067_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":68,"h":108},{"id":68,"file":"Individual_PNGs/SRC-068_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":56,"h":107},{"id":69,"file":"Individual_PNGs/SRC-069_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":88,"h":89},{"id":70,"file":"Individual_PNGs/SRC-070_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":42,"h":112},{"id":71,"file":"Individual_PNGs/SRC-071_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":89,"h":89},{"id":72,"file":"Individual_PNGs/SRC-072_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":51,"h":83},{"id":73,"file":"Individual_PNGs/SRC-073_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":147,"h":92},{"id":74,"file":"Individual_PNGs/SRC-074_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":54,"h":77},{"id":75,"file":"Individual_PNGs/SRC-075_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":70,"h":71},{"id":76,"file":"Individual_PNGs/SRC-076_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":88,"h":85},{"id":77,"file":"Individual_PNGs/SRC-077_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":57,"h":40},{"id":78,"file":"Individual_PNGs/SRC-078_MasterSheetA_Extract.png","category":"Street prop, clutter or vegetation","w":55,"h":41}];

export async function buildCity(ctx,progress=()=>{}){
 const {T,sc,SPR,sol,circ,IM,ren}=ctx;
 const tick=()=>new Promise(r=>requestAnimationFrame(r));
 const report=async(p,m)=>{progress(Math.min(1,p),m);await tick()};
 await report(.03,'Opening the old city archive…');

 const byId=new Map(ASSETS.map(a=>[a.id,a])),textures=new Map(),loader=new T.TextureLoader();
 let loaded=0;
 await Promise.all(ASSETS.map(a=>new Promise(resolve=>{
  const url=new URL('../../assets/DRIFTER_POI_Asset_Library_v2/'+a.file,import.meta.url).href;
  loader.load(url,t=>{
   t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;
   textures.set(a.id,t);loaded++;progress(.06+.34*loaded/ASSETS.length,'Loading city assets '+loaded+'/'+ASSETS.length+'…');resolve(true);
  },undefined,e=>{
   console.warn('City asset failed:',a.file,e);loaded++;progress(.06+.34*loaded/ASSETS.length,'Loading city assets '+loaded+'/'+ASSETS.length+'…');resolve(false);
  });
 })));

 const group=new T.Group();group.visible=false;sc.add(group);
 const cityLights=[];
 function addSprite(id,x,z,height,opts={}){
  const a=byId.get(id),base=textures.get(id);if(!a||!base)return null;
  const map=opts.flip?base.clone():base;
  if(opts.flip){map.wrapS=T.RepeatWrapping;map.repeat.x=-1;map.offset.x=1;map.needsUpdate=true}
  const width=height*a.w/a.h;
  const mat=new T.SpriteMaterial({map,alphaTest:.3,transparent:false,depthWrite:true,fog:true,color:0xffffff});
  const s=new T.Sprite(mat);s.scale.set(width,height,1);s.center.set(.5,.025);s.position.set(OX+x,0,OZ+z);s.frustumCulled=false;
  s.userData={x:OX+x,z:OZ+z,w:width,h:height,c:.025,ax:.5,mat,flat:false};
  group.add(s);SPR.push(s);return s;
 }

 // ---------- 1. Baked street plan ----------
 await report(.43,'Laying out the city streets…');
 const cv=document.createElement('canvas');cv.width=HX*2*PPU;cv.height=HZ*2*PPU;
 const g=cv.getContext('2d'),px=x=>(x+HX)*PPU,pz=z=>(z+HZ)*PPU;
 const rect=(x,z,w,h,color)=>{g.fillStyle=color;g.fillRect(px(x),pz(z),w*PPU,h*PPU)};
 const soil=['tile_soil0','tile_soil1','tile_soil2','tile_soil3'];
 for(let y=0,row=0;y<cv.height;y+=72,row++)for(let x=0,col=0;x<cv.width;x+=72,col++){
  const im=IM[soil[(row*3+col*5)%4]];
  if(im)g.drawImage(im,x,y,72,72);else{g.fillStyle='#454741';g.fillRect(x,y,72,72)}
 }
 for(const x of [-91,-46,46,91])for(const z of [-75,-27,27,75]){
  rect(x-17,z-17,34,34,'#55534d');g.strokeStyle='rgba(26,30,31,.55)';g.lineWidth=1.2;
  g.strokeRect(px(x-17),pz(z-17),34*PPU,34*PPU);
  g.fillStyle='rgba(202,185,150,.055)';
  for(let k=0;k<14;k++)g.fillRect(px(x-15+((k*17)%29)),pz(z-15+((k*11)%28)),PPU*.22,PPU*.22);
 }
 const vRoads=[-70,-23,23,70],hRoads=[-55,0,55];
 for(const x of vRoads){
  rect(x-6.4,-HZ,12.8,HZ*2,'#77736a');rect(x-4.25,-HZ,8.5,HZ*2,'#303539');
  g.strokeStyle='rgba(184,171,139,.55)';g.lineWidth=PPU*.12;g.setLineDash([PPU*2.4,PPU*2.6]);
  g.beginPath();g.moveTo(px(x),pz(-HZ));g.lineTo(px(x),pz(HZ));g.stroke();g.setLineDash([]);
  g.strokeStyle='rgba(190,180,153,.42)';g.lineWidth=PPU*.07;g.beginPath();
  g.moveTo(px(x-3.9),pz(-HZ));g.lineTo(px(x-3.9),pz(HZ));g.moveTo(px(x+3.9),pz(-HZ));g.lineTo(px(x+3.9),pz(HZ));g.stroke();
 }
 for(const z of hRoads){
  rect(-HX,z-6.4,HX*2,12.8,'#77736a');rect(-HX,z-4.25,HX*2,8.5,'#303539');
  g.strokeStyle='rgba(184,171,139,.55)';g.lineWidth=PPU*.12;g.setLineDash([PPU*2.4,PPU*2.6]);
  g.beginPath();g.moveTo(px(-HX),pz(z));g.lineTo(px(HX),pz(z));g.stroke();g.setLineDash([]);
  g.strokeStyle='rgba(190,180,153,.42)';g.lineWidth=PPU*.07;g.beginPath();
  g.moveTo(px(-HX),pz(z-3.9));g.lineTo(px(HX),pz(z-3.9));g.moveTo(px(-HX),pz(z+3.9));g.lineTo(px(HX),pz(z+3.9));g.stroke();
 }
 // Faded zebra crossings.
 for(const x of vRoads)for(const z of hRoads)for(let k=-3;k<=3;k++){
  rect(x+k*.92-.22,z-4,.44,1.25,'rgba(197,197,183,.74)');
  rect(x+k*.92-.22,z+2.75,.44,1.25,'rgba(197,197,183,.74)');
 }
 // Central traffic island, parking bays, and factory loading apron.
 g.beginPath();g.arc(px(0),pz(0),PPU*7.2,0,Math.PI*2);g.fillStyle='#555951';g.fill();
 g.lineWidth=PPU*.25;g.strokeStyle='#9b927e';g.stroke();
 g.beginPath();g.arc(px(0),pz(0),PPU*3.1,0,Math.PI*2);g.fillStyle='#30393a';g.fill();
 g.strokeStyle='rgba(205,188,147,.48)';g.lineWidth=PPU*.12;
 for(const z of [-27,27])for(const x of [35,42,49,56])g.strokeRect(px(x),pz(z-5.2),PPU*5.2,PPU*2.6);
 rect(70,38,36,45,'#484b47');g.strokeStyle='rgba(185,173,145,.55)';g.lineWidth=PPU*.18;g.strokeRect(px(70),pz(38),36*PPU,45*PPU);
 g.strokeStyle='rgba(9,13,15,.38)';g.lineWidth=1.1;
 for(let i=0;i<95;i++){const x=-108+(i*37)%214,z=-88+(i*53)%174;g.beginPath();g.moveTo(px(x),pz(z));g.lineTo(px(x+((i%5)-2)*.7),pz(z+1.2+(i%4)*.3));g.stroke()}
 const groundTexture=new T.CanvasTexture(cv);groundTexture.magFilter=T.LinearFilter;groundTexture.minFilter=T.LinearMipmapLinearFilter;
 groundTexture.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy());
 const geo=new T.PlaneGeometry(HX*2,HZ*2);geo.rotateX(-Math.PI/2);
 const ground=new T.Mesh(geo,new T.MeshStandardMaterial({map:groundTexture,roughness:1,metalness:0,depthWrite:true}));
 ground.position.set(OX,-.09,OZ);group.add(ground);

 // ---------- 2. Twenty-four distinct ruined-city buildings ----------
 await report(.48,'Raising the residential, market, and industrial blocks…');
 const buildingLayout=[
  [1,-91,-75,13.2,5.8,5.4],[2,-46,-75,14.1,5.7,5.4],[9,46,-75,14.6,6.5,5.8],[10,91,-75,14.2,6.6,5.7],
  [3,-91,-27,12.6,5.3,5.2],[4,-46,-27,13.4,5.6,5.3],[11,46,-27,12.8,5.4,5.1],[12,91,-27,13.2,5.6,5.2],
  [5,-91,27,12.7,5.3,5.2],[6,-46,27,13.7,5.8,5.3],[13,46,27,13.1,5.4,5.2],[14,91,27,13.8,5.9,5.4],
  [7,-91,75,12.1,5.1,5.0],[8,-46,75,12.7,5.2,5.1],[15,46,75,12.3,5.2,5.0],[16,91,75,14.8,6.2,5.6],
  [17,-46,-45,9.6,4,4],[18,46,-45,10.2,4.3,4],[19,-46,45,10.8,4.6,4.2],[20,46,45,10.6,4.4,4.2],
  [21,-92,-48,9.6,4,4],[22,92,-48,9.8,4,4],[23,-92,48,9.6,4,4],[24,92,48,10,4,4.1]
 ];
 const solids=[];
 for(const [id,x,z,h,rx,rz] of buildingLayout){
  if(!addSprite(id,x,z,h,{flip:id%3===0}))continue;
  sol.push({x:OX+x,z:OZ+z,rx,rz,city:true});solids.push({x,z,rx,rz});
 }

 // ---------- 3. Modular walls and street clutter ----------
 await report(.58,'Fencing the industrial lots…');
 const fenceLayout=[
  [25,73,39],[26,81,39],[27,89,39],[28,97,39],
  [29,73,84],[30,81,84],[31,89,84],[32,97,84],
  [33,73,48],[34,97,48],[35,73,75],[36,97,75]
 ];
 for(const [id,x,z] of fenceLayout)addSprite(id,x,z,4.2+(id%3)*.35,{flip:id%2===0});

 const anchors=[];
 for(const z of [-82,-48,-7,7,48,82])for(const x of [-76,-64,-29,-17,17,29,64,76])anchors.push([x,z]);
 for(const x of [-101,-45,45,101])for(const z of [-61,-49,-6,6,49,61])anchors.push([x,z]);
 const clear=(x,z)=>solids.every(b=>Math.abs(x-b.x)>b.rx+3.2||Math.abs(z-b.z)>b.rz+3.2);
 const props=ASSETS.filter(a=>a.id>=37&&a.id<=78);
 let placedProps=0,anchorIndex=0;
 for(const a of props){
  let p=null;
  while(anchorIndex<anchors.length&&!p){const c=anchors[anchorIndex++];if(clear(c[0],c[1]))p=c}
  if(!p)break;
  const [x,z]=p;
  const h=a.id===57?7.2:a.id===61?8:a.id===70?4.5:a.id===37?5.4:Math.max(2.4,Math.min(5.2,a.h/38));
  addSprite(a.id,x,z,h,{flip:a.id%2===0});
  if(a.id===57||a.id===61||a.id===37)circ.push({x:OX+x,z:OZ+z,r:a.id===57?.65:.42});
  placedProps++;
 }

 // ---------- 4. Warm street lighting ----------
 await report(.76,'Powering the street lights…');
 const lightsAt=[[-70,-42],[-70,18],[-23,-42],[-23,18],[23,-42],[23,18],[70,-42],[70,18],[-48,-55],[48,-55],[-48,55],[48,55]];
 for(let i=0;i<lightsAt.length;i++){
  const [x,z]=lightsAt[i],light=new T.PointLight(0xffb66f,.52,24,2);
  light.position.set(OX+x,4.2,OZ+z);group.add(light);cityLights.push({light,phase:i*.73,base:.52});
 }
 for(const [x,z,color,intensity,distance] of [[88,58,0xffa95f,.85,34],[88,76,0xffa95f,.7,28],[0,0,0xffc27c,.42,20]]){
  const light=new T.PointLight(color,intensity,distance,2);light.position.set(OX+x,5,OZ+z);group.add(light);
  cityLights.push({light,phase:cityLights.length*1.3,base:intensity});
 }

 // ---------- 5. Discoveries and return route ----------
 const objects=[
  {x:OX,z:OZ-HZ+8,n:'Road back to WNCORE Station 01',t:'f',to:0},
  {x:OX,z:OZ+1,n:'Old Town Junction',note:'Four roads meet here. Lane markings are still visible under the dust, but the traffic lights have been dark for a long time.'},
  {x:OX-46,z:OZ-27,n:'Residential block',note:'A row of apartments and small homes. Curtains still hang in a few windows, though every doorway is open.'},
  {x:OX+46,z:OZ-27,n:'Market street',note:'The shopfronts face the main road. A few signs remain, but the shelves and counters are long since empty.'},
  {x:OX+91,z:OZ+48,n:'Industrial yard',note:'A fenced service yard sits behind the larger industrial buildings. The gate has been left partly open.'},
  {x:OX-91,z:OZ+75,n:'Overgrown avenue',note:'Trees and street clutter have begun to reclaim the edge of the road. The city is quieter here.'},
  {x:OX+46,z:OZ+75,n:'South blocks',note:'The road continues past the last row of buildings. This sample sector ends beyond the outer blocks.'}
 ];
 await report(.94,'Marking the city landmarks…');
 const api={
  objects,
  spawn:{x:OX,z:OZ-HZ+15},
  bounds:{x0:OX-HX+5,x1:OX+HX-5,z0:OZ-HZ+5,z1:OZ+HZ-5},
  amb:[.67,.69,.76],fog:0x17212a,fogD:.0085,
  setVisible(v){group.visible=v},reset(){},col(){},
  update(t){for(const q of cityLights){const pulse=.94+.06*Math.sin(t*2.1+q.phase),flicker=Math.sin(t*13+q.phase)>.997?.72:1;q.light.intensity=q.base*pulse*flicker}},
  stats:{buildings:buildingLayout.length,streetProps:placedProps,fences:fenceLayout.length,lights:cityLights.length,sourceAssets:loaded}
 };
 await report(1,'City sector ready.');
 return api;
}
