const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {}, console });
['src/contentRegistry.js', 'src/missionManager.js', 'src/generators/minecraftForge.js', 'src/content/adventurePack.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file}));
const rows = context.window.StudioContentRegistry.listMissions().map(m => ({key:m.key,title:m.title,config:m.config}));
console.log(JSON.stringify({presets:Object.keys(context.window.MINECRAFT_PRESETS),missions:rows},null,2));
