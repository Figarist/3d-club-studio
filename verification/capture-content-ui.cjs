// Used only inside cua_repl with its documented tab/CDP APIs. No external runner.
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const numeric=key=>/(?:Scale|Bulk|VoxelSize|HeightStep|SlotWidth|ExtrudeHeight|SpringThickness|WingWeight|ArmLength)$/.test(key);
const ids={mcVoxelSize:'mc-voxel-size',mcHeightStep:'mc-height-step',mcSolidBase:'mc-solid-base',mcMountType:'mc-mount-type',mcSlotWidth:'mc-slot-width',mcCustomLabel:'mc-custom-label',ilWord1:'il-word1',ilWord2:'il-word2',ilVoxelSize:'il-voxel-size',ilSafeSupports:'il-safe-supports',ilLayoutMode:'il-layout-mode',ilColorPrimary:'il-color-primary',ilDesign:'il-design',phSubmode:'ph-submode',phExtrudeHeight:'ph-extrude-height',phSpringThickness:'ph-spring-thickness',phWingWeight:'ph-wing-weight',phArmLength:'ph-arm-length',phIncludeAmmo:'ph-include-ammo',phCustomText:'ph-custom-text',phDesign:'ph-design',mobArchetype:'mob-archetype',mobHeadScale:'mob-head-scale',mobBodyBulk:'mob-body-bulk',mobEyeType:'mob-eye-type',mobHeadgear:'mob-headgear',mobBackgear:'mob-backgear',mobWeapon:'mob-weapon',mobName:'mob-name',mobTinkercadBlank:'mob-tinkercad-blank',mobDesign:'mob-design'};
function ignoredControls(row){
  const c=row.config.controls;
  if(row.config.mcPreset==='slot_calibrator')return ['mcVoxelSize','mcHeightStep','mcSolidBase','mcMountType','mcCustomLabel'];
  if(row.family==='mob'&&c.mobDesign!=='classic')return ['mobArchetype','mobHeadgear','mobBackgear','mobWeapon','mobName'];
  if(row.family==='illusion'&&c.ilDesign!=='classic')return ['ilWord1','ilWord2','ilSafeSupports'];
  if(row.family==='physics'){
    if(['truss_bridge','arch_bridge'].includes(c.phDesign))return ['phExtrudeHeight','phSpringThickness','phWingWeight','phIncludeAmmo','phCustomText'];
    if(c.phSubmode==='balancer')return ['phSpringThickness','phCustomText'];
    if(c.phDesign==='classic')return ['phWingWeight'];
    return ['phSpringThickness','phWingWeight','phCustomText'];
  }
  return [];
}
async function evaluate(cap,expression){const r=await cap.send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error('Readback failed');return JSON.parse(r.result.value);}
async function state(cap){return evaluate(cap,`JSON.stringify({version:StudioApp.serializeState().version,tab:StudioApp.activeTab,missionKey:StudioApp.missions.getActiveMission().key,controls:StudioApp.serializeState().controls,minecraft:StudioApp.mcGen.getState(),bounds:StudioApp.sceneManager.dimensions,camera:StudioApp.sceneManager.spherical,projection:StudioApp.sceneManager.isOrthographic?'orthographic':'perspective',monochrome:StudioApp.sceneManager.isMonochrome,effects:StudioApp.sceneManager.effectsGroup.children.length})`);}
async function settle(cap,includeDemo=false){const r=await cap.send('Runtime.evaluate',{expression:`new Promise(resolve=>{const start=performance.now();function check(){const s=StudioApp.sceneManager,a=s.spherical,b=s.targetSpherical;if(!s.popAnimBlocks.length&&Math.abs(a.radius-b.radius)<.2&&Math.abs(a.theta-b.theta)<.003&&Math.abs(a.phi-b.phi)<.003${includeDemo?'&&!s.physicsUpdateFn':''})resolve(true);else if(performance.now()-start>${includeDemo?11000:4500})resolve(false);else requestAnimationFrame(check);}check();})`,awaitPromise:true,returnByValue:true},{timeoutMs:includeDemo?12000:5000});if(!r.result?.value)throw Error('INDETERMINATE: bounded scene/demo wait expired');}
async function control(tab,cap,key,value){const current=(await state(cap)).controls[key];if(numeric(key)?Number(current)===Number(value):current===value)return;
  const loc=tab.playwright.locator('#'+ids[key]);
  if(!await loc.isVisible())throw Error('Required control hidden: '+key);
  const type=await loc.getAttribute('type');
  if(type==='range'){
    const min=Number(await loc.getAttribute('min')),step=Number(await loc.getAttribute('step'));
    const count=Math.round((Number(value)-min)/step);if(count<0||count>150)throw Error('Unbounded range action');
    await loc.press('Home');for(let i=0;i<count;i++)await loc.press('ArrowRight');
  }else if(type==='checkbox')await loc.setChecked(value);
  else if(await loc.getAttribute('maxlength')!==null||type==='color')await loc.fill(String(value));
  else await loc.selectOption(String(value));
}
async function projection(tab,cap,ortho){if(((await state(cap)).projection==='orthographic')!==ortho)await tab.playwright.locator('#btn-toggle-ortho').click();}
async function mono(tab,cap,on){if((await state(cap)).monochrome!==on)await tab.playwright.locator('#btn-hud-mono').click();}
async function angle(tab,cap,key){await tab.playwright.locator(`.camera-bar [data-camera-view="${key}"]`).click();await tab.playwright.locator('#btn-fit-model').click();await settle(cap);}
async function select(tab,cap,row){
  const alias=row.aliases.find(a=>a.kind==='mission'||a.kind==='layout-variant')||row.aliases[0];
  if(alias.kind==='mission'||alias.kind==='layout-variant'){
    await tab.playwright.locator('#btn-open-missions').click();await tab.playwright.locator('[data-mission-filter="all"]').click();await tab.playwright.locator('#model-search').fill('');await tab.playwright.locator('#model-theme').selectOption('');
    await tab.playwright.locator(`[data-start-mission="${alias.id}"]`).click();
    if(alias.kind==='layout-variant'){await tab.playwright.locator('[data-view-mode="split"]').click();await control(tab,cap,'ilLayoutMode',row.config.controls.ilLayoutMode);}
  }else{
    await tab.playwright.locator(`[data-tab="${row.family}"]`).click();await tab.playwright.locator('[data-view-mode="split"]').click();
    if(alias.kind==='preset')await tab.playwright.locator(`[data-mc-preset="${alias.key}"]`).click();
    if(alias.kind==='optical-preset')await tab.playwright.locator('[data-il-preset="'+alias.key+'"]').click();
    // Reset custom design before setting legacy controls; this enables old panels.
    const design={mob:'mobDesign',illusion:'ilDesign',physics:'phDesign'}[row.family];if(design)await control(tab,cap,design,'classic');
    for(const [key,value]of Object.entries(row.config.controls))if(!ignoredControls(row).includes(key))await control(tab,cap,key,value);
  }
  await tab.playwright.locator('[data-view-mode="viewport"]').click();await projection(tab,cap,true);await angle(tab,cap,'iso');
  const actual=await state(cap);
  if(actual.version!=='1.9.0'||actual.tab!==row.family)throw Error('Wrong app/active family');
  for(const [key,value]of Object.entries(row.config.controls))if(!ignoredControls(row).includes(key)&&(numeric(key)?Number(actual.controls[key])!==Number(value):actual.controls[key]!==value))throw Error('Configuration mismatch '+row.modelKey+':'+key+' '+actual.controls[key]+' vs '+value);
  if(row.config.mcPreset&&actual.minecraft.currentPresetKey!==row.config.mcPreset)throw Error('Wrong grid preset');
  return actual;
}
async function captureRow(tab,cap,row,emitImage){
  const directory=path.join(root,'docs/evidence/fun-content',row.modelKey);await fs.mkdir(directory,{recursive:true});
  const before=await select(tab,cap,row);const record={sourceRevision:row.sourceRevision,sourceHashes:row.sourceHashes,modelKey:row.modelKey,config:row.config,exactObservedControls:Object.fromEntries(Object.keys(row.config.controls).map(key=>[key,before.controls[key]])),ignoredByGenerator:ignoredControls(row),viewport:{width:1366,height:768},bounds:before.bounds,selection:row.aliases,screenshots:[],interaction:{}};
  const save=async(view)=>{const observation=await state(cap),bytes=await tab.screenshot({fullPage:false}),relative='docs/evidence/fun-content/'+row.modelKey+'/'+view+'.jpg';await fs.writeFile(path.join(root,relative),bytes);record.screenshots.push({view,path:relative,monochrome:observation.monochrome,projection:observation.projection,camera:observation.camera,bounds:observation.bounds});if(emitImage)await emitImage(bytes);};
  await mono(tab,cap,false);await angle(tab,cap,'iso');await save('color');
  await mono(tab,cap,true);await angle(tab,cap,row.family==='illusion'?'front':'iso');await save('mono');
  if(row.family==='illusion'){
    await tab.playwright.locator('#illusion-camera-bar [data-camera-view="side90"]').click();await tab.playwright.locator('#btn-fit-model').click();await settle(cap);await save('reveal');
    record.interaction={action:'Actual visible reveal button 0° → 90°',result:'Complementary monochrome silhouette shown; main reviews recognizable pair.',layout:row.config.controls.ilLayoutMode};
  }else if(row.family==='physics'){
    await angle(tab,cap,'top');await save('top');await angle(tab,cap,'iso');await tab.playwright.locator('#btn-physics-demo').click();await settle(cap,true);record.interaction={action:'Actual demo button',result:await tab.playwright.locator('#physics-demo-result').innerText()};await save('action');await tab.playwright.locator('#btn-physics-reset').click();
    record.interaction.resetResult=await tab.playwright.locator('#physics-demo-result').innerText();if((await state(cap)).effects!==0)throw Error('Ghost demo effects after reset');
  }else{
    await tab.playwright.locator('[data-view-mode="split"]').click();const baseline=await state(cap);
    if(row.family==='mob'){
      const slider=tab.playwright.locator('#mob-head-scale');const direction=Number(baseline.controls.mobHeadScale)>=1.4?'ArrowLeft':'ArrowRight';await slider.press(direction);await slider.press(direction);
      record.interaction={action:'Actual head-scale slider keyboard input',before:baseline.controls.mobHeadScale,after:(await state(cap)).controls.mobHeadScale,result:'Head proportions changed in the actual rendered model.'};
    }else if(row.config.mcPreset==='slot_calibrator'){
      const next=Number(baseline.controls.mcSlotWidth)===2.5?'2.0':'2.5';await tab.playwright.locator('#mc-slot-width').selectOption(next);record.interaction={action:'Actual selected-slot control',before:baseline.controls.mcSlotWidth,after:next,result:'Raised comparison marker moved; all four nominal gaps retained.'};
    }else{
      let cell;for(let r=0;r<16&&!cell;r++)for(let c=0;c<16;c++)if(baseline.minecraft.grid[r][c]>0&&baseline.minecraft.grid[r][c]<4){cell={r,c,before:baseline.minecraft.grid[r][c]};break;}
      if(!cell)throw Error('No editable relief cell');await tab.playwright.locator('[data-mc-brush="4"]').click();await tab.playwright.locator(`.pixel-cell[data-r="${cell.r}"][data-c="${cell.c}"]`).click();
      const after=await state(cap);if(after.minecraft.grid[cell.r][cell.c]!==4)throw Error('Actual grid painting failed');record.interaction={action:'Actual brush and grid-cell click',cell,beforeHeight:cell.before,afterHeight:4,result:'Visible raised-cell edit in complementary top view.'};
    }
    await tab.playwright.locator('[data-view-mode="viewport"]').click();await angle(tab,cap,row.family==='mob'?'side90':'top');await save('action');await tab.playwright.locator('#btn-undo').click();await settle(cap);
    const restored=await state(cap);if(row.family==='mob'&&restored.controls.mobHeadScale!==baseline.controls.mobHeadScale)throw Error('Head undo failed');if(row.family==='minecraft'&&row.config.mcPreset!=='slot_calibrator'&&JSON.stringify(restored.minecraft.grid)!==JSON.stringify(baseline.minecraft.grid))throw Error('Grid undo failed');if(row.config.mcPreset==='slot_calibrator'&&Number(restored.controls.mcSlotWidth)!==Number(baseline.controls.mcSlotWidth))throw Error('Slot undo failed');record.interaction.retry='Actual Undo restored the original editable model state.';
  }
  await fs.writeFile(path.join(directory,'capture.json'),JSON.stringify(record,null,2)+'\n');return record;
}
module.exports={captureRow,state,settle,select};
