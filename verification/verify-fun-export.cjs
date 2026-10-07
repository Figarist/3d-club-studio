// Four representative deterministic exports. No slicer/manifold/download claim.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadCatalog,root}=require('./content-catalog.cjs');
const {window,context,rows}=loadCatalog();
const THREE=require(path.join(root,'lib/three.min.js'));
let captured;
context.THREE=THREE;
context.Blob=class {constructor(parts){captured=parts[0];}};
context.URL={createObjectURL:()=> 'blob:test',revokeObjectURL(){}};
context.setTimeout=()=>0;
context.alert=message=>{throw Error(message);};
context.document={getElementById:()=>null,createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}};
['src/voxelFont.js','src/sceneManager.js'].forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
const mapParams=(c,tab)=>{
  if(tab==='minecraft')return {voxelSize:c.mcVoxelSize,heightStep:c.mcHeightStep,solidBase:c.mcSolidBase,mountType:c.mcMountType,slotWidth:c.mcSlotWidth,customLabel:c.mcCustomLabel};
  if(tab==='illusion')return {design:c.ilDesign,word1:c.ilWord1,word2:c.ilWord2,voxelSize:c.ilVoxelSize,safeSupports:c.ilSafeSupports,layoutMode:c.ilLayoutMode};
  if(tab==='mob')return {design:c.mobDesign,archetype:c.mobArchetype,headScale:c.mobHeadScale,bodyBulk:c.mobBodyBulk,eyeType:c.mobEyeType,headgear:c.mobHeadgear,backGear:c.mobBackgear,weapon:c.mobWeapon,mobName:c.mobName,tinkercadBlank:c.mobTinkercadBlank};
  return {design:c.phDesign,submode:c.phSubmode,extrudeHeight:c.phExtrudeHeight,springThickness:c.phSpringThickness,wingWeight:c.phWingWeight,armLength:c.phArmLength,includeAmmo:c.phIncludeAmmo,customText:c.phCustomText};
};
for(const key of ['funrelief_compass_treasure_map','iron_mole','mountain_boat','ballista_bow']){
  const row=rows.find(r=>r.modelKey===key);assert.ok(row,'representative exists');
  const className={minecraft:'MinecraftForgeGenerator',illusion:'DualIllusionGenerator',mob:'MobMutatorGenerator',physics:'PhysicsMechanicsGenerator'}[row.family];
  const generator=new window[className]();
  if(row.config.mcPreset)generator.loadPreset(row.config.mcPreset,false,false);
  const group=generator.build3D(mapParams(row.config.controls,row.family));
  group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.x>0&&size.y>0&&size.z>0&&size.x<=200&&size.z<=200,'default table bounds');
  let expectedTriangles=0;
  group.traverse(mesh=>{if(mesh.isMesh&&mesh.userData.exportable!==false)expectedTriangles+=(mesh.geometry.index?mesh.geometry.index.count:mesh.geometry.attributes.position.count)/3;});
  const scene=Object.create(window.SceneManager.prototype);
  Object.assign(scene,{modelGroup:new THREE.Group(),effectsGroup:new THREE.Group(),popAnimBlocks:[],slicerActive:false,nozzleMesh:null,clipPlane:new THREE.Plane(new THREE.Vector3(0,-1,0),500)});
  scene.modelGroup.add(group);
  scene.effectsGroup.add(new THREE.Mesh(new THREE.BoxGeometry(400,400,400),new THREE.MeshBasicMaterial()));
  scene.exportBinarySTL('focused-'+key+'.stl');
  const view=new DataView(captured),triangles=view.getUint32(80,true);
  assert.equal(triangles,expectedTriangles,'screen-only effects and marked rest display excluded');
  assert.equal(captured.byteLength,84+triangles*50,'binary record length');
  let minZ=Infinity;
  for(let triangle=0;triangle<triangles;triangle++)for(let vertex=0;vertex<3;vertex++){
    const offset=84+triangle*50+12+vertex*12;
    const x=view.getFloat32(offset,true),y=view.getFloat32(offset+4,true),z=view.getFloat32(offset+8,true);
    assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z),'finite coordinates');minZ=Math.min(minZ,z);
  }
  assert.ok(Math.abs(minZ)<1e-5,'settled STL bottom');
  scene.clearModel();
  console.log('PASS '+key+' binary length/triangles/finite coordinates/Z=0/effects exclusion, bounds '+[size.x,size.z,size.y].map(n=>n.toFixed(1)).join('x'));
}
console.log('Verified 4 representative export cases. Actual file download and physical print remain separate gates.');
