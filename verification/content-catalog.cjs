// Finite authored/default configurations, with exact aliases de-duplicated.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
function loadCatalog() {
  const window = {addEventListener() {}};
  const context = vm.createContext({window, console});
  const files = ['src/contentRegistry.js','src/missionManager.js','src/generators/minecraftForge.js',
    'src/generators/dualIllusion.js','src/generators/physicsMechanics.js','src/generators/mobMutator.js',
    'src/content/adventurePack.js','src/content/funReliefs.js','src/content/funDiscoveries.js','src/content/funEngineering.js'];
  files.filter(file => fs.existsSync(path.join(root,file))).forEach(file => vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const controlIds = {
    mcVoxelSize:'mc-voxel-size',mcHeightStep:'mc-height-step',mcSolidBase:'mc-solid-base',mcMountType:'mc-mount-type',mcSlotWidth:'mc-slot-width',mcCustomLabel:'mc-custom-label',
    ilWord1:'il-word1',ilWord2:'il-word2',ilVoxelSize:'il-voxel-size',ilSafeSupports:'il-safe-supports',ilLayoutMode:'il-layout-mode',ilColorPrimary:'il-color-primary',ilDesign:'il-design',
    phSubmode:'ph-submode',phExtrudeHeight:'ph-extrude-height',phSpringThickness:'ph-spring-thickness',phWingWeight:'ph-wing-weight',phArmLength:'ph-arm-length',phIncludeAmmo:'ph-include-ammo',phCustomText:'ph-custom-text',phDesign:'ph-design',
    mobArchetype:'mob-archetype',mobHeadScale:'mob-head-scale',mobBodyBulk:'mob-body-bulk',mobEyeType:'mob-eye-type',mobHeadgear:'mob-headgear',mobBackgear:'mob-backgear',mobWeapon:'mob-weapon',mobName:'mob-name',mobTinkercadBlank:'mob-tinkercad-blank',mobDesign:'mob-design'
  };
  const defaults = {};
  Object.entries(controlIds).forEach(([key,id]) => {
    const input = html.match(new RegExp('<input\\b[^>]*id="'+id+'"[^>]*>'));
    if (input) defaults[key] = /type="checkbox"/.test(input[0]) ? /\bchecked\b/.test(input[0]) : ((input[0].match(/\bvalue="([^"]*)"/)||[])[1]||'');
    else {
      const select = html.match(new RegExp('<select\\b[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</select>'));
      if (!select) throw Error('Missing control '+id);
      const options = Array.from(select[1].matchAll(/<option\b([^>]*)>/g));
      const selected = options.find(match=>/\bselected\b/.test(match[1])) || options[0];
      defaults[key] = selected[1].match(/\bvalue="([^"]*)"/)[1];
    }
  });
  const prefix = {minecraft:'mc',illusion:'il',physics:'ph',mob:'mob'};
  const controlsFor = (tab, extra={}) => Object.fromEntries(Object.keys(defaults).filter(key=>key.startsWith(prefix[tab])).map(key=>[key,extra[key]===undefined?defaults[key]:extra[key]]));
  const rows = [], identities = new Map();
  function add(row) {
    const normalizedControls = Object.fromEntries(Object.entries(row.config.controls).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[
      key, /(?:Scale|Bulk|VoxelSize|HeightStep|SlotWidth|ExtrudeHeight|SpringThickness|WingWeight|ArmLength)$/.test(key) ? Number(value) : value
    ]));
    const identity = JSON.stringify({tab:row.config.tab,preset:row.config.mcPreset||null,controls:normalizedControls});
    const existing = identities.get(identity);
    if(existing) {existing.aliases.push(...row.aliases); return;}
    row.configHash = crypto.createHash('sha256').update(identity).digest('hex');
    identities.set(identity,row); rows.push(row);
  }
  window.StudioContentRegistry.listMissions().forEach(m => {
    const cfg=m.config||{tab:m.targetTab};
    add({modelKey:m.modelKey||('mission_'+m.id),title:m.title,family:m.targetTab,newModel:!!m.modelKey,theme:m.theme||m.categoryLabel,
      missionKeys:[m.key],aliases:[{kind:'mission',key:m.key,id:m.id}],interaction:m.interaction||'edit',
      config:{tab:cfg.tab||m.targetTab,...(cfg.mcPreset?{mcPreset:cfg.mcPreset}:{}),controls:controlsFor(cfg.tab||m.targetTab,cfg.controls)}});
  });
  window.StudioContentRegistry.listModels().filter(m=>m.targetTab==='illusion').forEach(m=>{
    add({modelKey:m.modelKey+'_alternate',variantOf:m.modelKey,title:m.title+' — інше розташування',family:'illusion',newModel:false,theme:m.theme,
      missionKeys:[m.key],aliases:[{kind:'layout-variant',key:m.key,id:m.id}],interaction:'reveal',
      config:{tab:'illusion',controls:controlsFor('illusion',{...m.config.controls,ilLayoutMode:'line'})}});
  });
  Object.entries(window.MINECRAFT_PRESETS).forEach(([key,p])=>{
    const rp=p.recommendedParams||{};
    const c=controlsFor('minecraft');
    Object.entries({voxelSize:'mcVoxelSize',heightStep:'mcHeightStep',solidBase:'mcSolidBase',mountType:'mcMountType',slotWidth:'mcSlotWidth'}).forEach(([from,to])=>{if(rp[from]!==undefined)c[to]=rp[from];});
    // New and Adventure presets are selected by their registered mission configuration.
    if(rows.some(r=>r.config.mcPreset===key&&(r.newModel||r.aliases.some(a=>a.key.startsWith('studio-adventure-pack:')))))return;
    add({modelKey:'preset_'+key,title:p.name,family:'minecraft',newModel:false,theme:'Класичні рельєфи',missionKeys:[],aliases:[{kind:'preset',key}],interaction:'draw',config:{tab:'minecraft',mcPreset:key,controls:c}});
  });
  new window.DualIllusionGenerator().presets.forEach((p,index)=>add({modelKey:'optical_classic_'+index,title:p.name,family:'illusion',newModel:false,theme:'Класична оптика',missionKeys:[],aliases:[{kind:'optical-preset',key:['short','cipher','1','2','3','4'][index]}],interaction:'reveal',config:{tab:'illusion',controls:controlsFor('illusion',{ilWord1:p.w1,ilWord2:p.w2,ilVoxelSize:String(p.voxelSize)})}}));
  ['golem','creeper','knight','dragon','cyborg'].forEach(archetype=>add({modelKey:'character_classic_'+archetype,title:archetype,family:'mob',newModel:false,theme:'Класичні персонажі',missionKeys:[],aliases:[{kind:'archetype',key:archetype}],interaction:'sliders',config:{tab:'mob',controls:controlsFor('mob',{mobArchetype:archetype})}}));
  ['catapult','balancer'].forEach(submode=>add({modelKey:'engineering_classic_'+submode,title:submode,family:'physics',newModel:false,theme:'Класична механіка',missionKeys:[],aliases:[{kind:'physics',key:submode}],interaction:submode==='catapult'?'launch':'balance',config:{tab:'physics',controls:controlsFor('physics',{phSubmode:submode,phExtrudeHeight:submode==='balancer'?'6.0':defaults.phExtrudeHeight})}}));
  add({modelKey:'engineering_legacy_tank',title:'Класична катапульта — старий стартовий напис',family:'physics',newModel:false,theme:'Класична механіка',missionKeys:[],aliases:[{kind:'physics',key:'catapult'}],interaction:'launch',config:{tab:'physics',controls:controlsFor('physics',{phSubmode:'catapult',phCustomText:'ТАНК'})}});
  rows.forEach(row=>{row.missionKeys=Array.from(new Set(row.aliases.filter(a=>a.kind==='mission'||a.kind==='layout-variant').map(a=>a.key)));});
  return {window,context,rows,files:files.filter(file=>fs.existsSync(path.join(root,file))),defaults};
}
module.exports={loadCatalog,root};
if(require.main===module) {const {rows}=loadCatalog();console.log(JSON.stringify(rows,null,2));}
