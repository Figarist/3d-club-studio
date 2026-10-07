// Lightweight manifest integrity, not a substitute for visual review.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {loadCatalog,root}=require('./content-catalog.cjs');
const expected=loadCatalog().rows;
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'content-evidence/manifest.json'),'utf8'));
assert.equal(manifest.rows.length,expected.length,'finite catalog coverage');
assert.equal(new Set(manifest.rows.map(r=>r.modelKey)).size,expected.length,'no duplicate model rows');
assert.equal(new Set(manifest.rows.map(r=>r.configHash)).size,expected.length,'no exact configuration inflation');
assert.equal(manifest.rows.filter(r=>r.newModel).length,48,'48 new distinct catalog entries');
const hashes=new Map();
for(const row of manifest.rows) {
  assert.ok(expected.some(r=>r.modelKey===row.modelKey&&r.configHash===row.configHash),'no orphan/stale configuration '+row.modelKey);
  assert.equal(row.verdict,'PASS','unaccepted '+row.modelKey);
  assert.ok(row.reviewedViews>=3,'main review of three originals '+row.modelKey);
  assert.ok(row.capture&&row.screenshots.length>=3,'missing captures '+row.modelKey);
  assert.equal(row.capture.sourceRevision,row.sourceRevision,'capture revision '+row.modelKey);
  for(const [file,hash] of Object.entries(row.sourceHashes)) {
    if(!hashes.has(file))hashes.set(file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'));
    assert.equal(hash,hashes.get(file),'stale source '+file);
    assert.equal(row.capture.sourceHashes[file],hash,'capture source hash '+file);
  }
  for(const screenshot of row.screenshots) {
    const file=path.resolve(root,screenshot.path);
    assert.ok(file.startsWith(path.join(root,'docs/evidence/fun-content')+path.sep),'safe evidence path');
    assert.ok(fs.existsSync(file)&&fs.statSync(file).size>1000,'missing original '+screenshot.path);
  }
  assert.ok(row.screenshots.some(s=>s.monochrome),'mono original '+row.modelKey);
  assert.ok(row.screenshots.some(s=>!s.monochrome),'color original '+row.modelKey);
  if(['launch','balance','reveal','layout'].includes(row.interaction))assert.ok(row.capture.interaction&&row.capture.interaction.result,'interaction result '+row.modelKey);
}
console.log('PASS finite catalog, 48-entry count, exact identities, original paths, source hashes and explicit main verdicts; physical evidence remains Not verified.');
