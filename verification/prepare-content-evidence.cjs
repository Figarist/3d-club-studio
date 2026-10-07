// Build an offline gallery; never infer a visual PASS from file existence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {loadCatalog,root} = require('./content-catalog.cjs');
const {rows,files} = loadCatalog();
const common = ['index.html','styles.css','src/app.js','src/sceneManager.js','src/projectState.js',...files];
const sourceHashes = Object.fromEntries(common.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
const evidenceRoot = path.join(root,'docs/evidence/fun-content');
fs.mkdirSync(evidenceRoot,{recursive:true});
rows.forEach(row=>{
  const recordPath=path.join(evidenceRoot,row.modelKey,'capture.json');
  const reviewPath=path.join(evidenceRoot,row.modelKey,'review.json');
  row.sourceRevision=process.argv[2]||'WORKTREE'; row.sourceHashes=sourceHashes;
  row.physicalEvidence='Not verified'; row.childEnjoyment='Not verified';
  row.screenshots=[]; row.verdict='BLOCKED'; row.reason='Actual UI capture and main visual review pending.';
  if(fs.existsSync(recordPath)) {
    const record=JSON.parse(fs.readFileSync(recordPath,'utf8'));
    row.capture=record; row.screenshots=record.screenshots||[];
  }
  if(fs.existsSync(reviewPath)) {
    const review=JSON.parse(fs.readFileSync(reviewPath,'utf8'));
    Object.assign(row,{verdict:review.verdict,reason:review.reason,reviewer:review.reviewer,reviewedViews:review.reviewedViews});
  }
});
const manifest={schemaVersion:1,date:'2026-10-07',priority:'single-color geometry first',sourceRevision:process.argv[2]||'WORKTREE',rows};
const manifestDir=path.join(root,'verification/content-evidence');fs.mkdirSync(manifestDir,{recursive:true});
fs.writeFileSync(path.join(manifestDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cards=rows.map(r=>`<article data-family="${r.family}" data-theme="${escape(r.theme)}" data-verdict="${r.verdict}"><h2>${escape(r.title)}</h2><p>${escape(r.modelKey)} · ${escape(r.theme)} · ${r.verdict}</p><p>${escape(r.reason)}</p><div class="views">${r.screenshots.map(s=>`<a href="../../../${escape(s.path)}"><img loading="lazy" src="../../../${escape(s.path)}" alt="${escape(s.view)}"><span>${escape(s.view)}</span></a>`).join('')}</div><details><summary>Configuration and evidence</summary><pre>${escape(JSON.stringify({config:r.config,sourceRevision:r.capture?.sourceRevision||r.sourceRevision,bounds:r.capture?.bounds,interaction:r.capture?.interaction,physicalEvidence:r.physicalEvidence},null,2))}</pre></details></article>`).join('\n');
fs.writeFileSync(path.join(evidenceRoot,'gallery.html'),`<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Одноколірні пригоди — оригінали доказів</title><style>body{margin:24px;background:#101923;color:#e5edf2;font:16px system-ui}h1{color:#86e1c0}article{border:1px solid #35515b;border-radius:12px;padding:16px;margin:20px 0}input,select{padding:10px;margin:4px;background:#20313d;color:white;border:1px solid #6c8e9e}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.views img{width:100%;height:auto}.views a{color:#a6ebd9}pre{white-space:pre-wrap;overflow-wrap:anywhere}a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #86e1c0}</style><h1>Одноколірні пригоди — візуальні докази</h1><p>Оригінали з реального локального застосунку. Колір — допоміжне прев’ю. Фізичний друк та відгуки дітей: Not verified.</p><p>Нових моделей: ${rows.filter(r=>r.newModel).length}. Унікальних скінченних конфігурацій: ${rows.length}. PASS: ${rows.filter(r=>r.verdict==='PASS').length}.</p><label>Пошук <input id="query" type="search"></label><label>Тип <select id="family"><option value="">Усі</option><option>minecraft</option><option>mob</option><option>illusion</option><option>physics</option></select></label><label>Оцінка <select id="verdict"><option value="">Усі</option><option>PASS</option><option>REWORK</option><option>BLOCKED</option></select></label>${cards}<script>const q=document.getElementById('query'),f=document.getElementById('family'),v=document.getElementById('verdict');function filter(){document.querySelectorAll('article').forEach(a=>a.hidden=!!((f.value&&a.dataset.family!==f.value)||(v.value&&a.dataset.verdict!==v.value)||!a.textContent.toLocaleLowerCase('uk').includes(q.value.toLocaleLowerCase('uk'))));}[q,f,v].forEach(el=>el.addEventListener('input',filter));</script></html>`);
console.log(JSON.stringify({newModels:rows.filter(r=>r.newModel).length,total:rows.length,pass:rows.filter(r=>r.verdict==='PASS').length}));
