// Partial artifact integrity report. This never substitutes for the strict gate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'content-evidence/manifest.json'),'utf8'));
const hashes=new Map();let originals=0;
for(const row of manifest.rows.filter(row=>row.capture)){
  if(row.capture.sourceRevision!==row.sourceRevision)throw Error('Revision mismatch '+row.modelKey);
  for(const [file,hash]of Object.entries(row.sourceHashes)){
    if(!hashes.has(file))hashes.set(file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'));
    if(hash!==hashes.get(file)||row.capture.sourceHashes[file]!==hash)throw Error('Stale capture '+file);
  }
  for(const screenshot of row.screenshots){if(!fs.existsSync(path.join(root,screenshot.path)))throw Error('Missing original '+screenshot.path);originals++;}
  if(row.verdict==='PASS'&&row.reviewedViews<3)throw Error('Incomplete main review');
}
const result={acceptance:manifest.acceptanceStatus,newModels:manifest.rows.filter(row=>row.newModel).length,finiteConfigurations:manifest.rows.length,finalPass:manifest.rows.filter(row=>row.verdict==='PASS').length,pending:manifest.rows.filter(row=>row.verdict!=='PASS').length,reviewedOriginals:originals,capturedSourceHashes:'CURRENT',physicalEvidence:'Not verified'};
fs.writeFileSync(path.join(__dirname,'content-evidence/coverage.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
