const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadCatalog,root}=require('./content-catalog.cjs');
const {window,context,rows,defaults}=loadCatalog();
const offset=Number(process.argv[2]||0),limit=Number(process.argv[3]||20);
assert.ok(Number.isInteger(offset)&&offset>=0&&Number.isInteger(limit)&&limit>0&&limit<=20,'bounded explicit batch');
vm.runInContext(fs.readFileSync(path.join(root,'src/projectState.js'),'utf8'),context);
const selected=rows.filter(r=>r.newModel).slice(offset,offset+limit);
assert.ok(selected.length,'nonempty batch');
selected.forEach(row=>{
  const mission=window.StudioContentRegistry.resolveModel(row.modelKey);
  const presetKey=row.config.mcPreset||'sword';
  const preset=window.MINECRAFT_PRESETS[presetKey];
  context.candidateJSON=JSON.stringify({app:'3d-club-studio',schemaVersion:1,activeTab:row.config.tab,
    activeMissionKey:mission.key,minecraft:{currentPresetKey:presetKey,colors:preset.colors,
    grid:preset.grid.map(line=>Array.from(line,ch=>ch==='.'?0:Number(ch)))},controls:{...defaults,...row.config.controls}});
  vm.runInContext('window.__candidate=JSON.parse(candidateJSON); window.__normalized=window.ProjectState.normalize(window.__candidate,{missions:window.StudioContentRegistry.listMissions(),presets:window.MINECRAFT_PRESETS}); window.__again=window.ProjectState.normalize(window.__normalized,{missions:window.StudioContentRegistry.listMissions(),presets:window.MINECRAFT_PRESETS});',context);
  assert.equal(JSON.stringify(window.__normalized),JSON.stringify(window.__again),'normalization roundtrip '+row.modelKey);
  assert.equal(window.__normalized.activeMissionKey,mission.key);
  const designKey={illusion:'ilDesign',mob:'mobDesign',physics:'phDesign'}[row.config.tab];
  if(designKey)assert.equal(window.__normalized.controls[designKey],row.config.controls[designKey]);
  console.log('PASS state identity/configuration roundtrip '+row.modelKey);
});
console.log('Verified '+selected.length+' bounded cases; no application or browser evidence implied.');
