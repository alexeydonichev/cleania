// Local SQLite recovery drill only. Never connects to or replaces production.
// The source is read-only. Private recovery artifacts stay outside the repo.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const source=realpathSync(path.join(root,".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite"));
assert.ok(source.startsWith(realpathSync(path.join(root,".wrangler"))+path.sep));
const artifacts=mkdtempSync(path.join(tmpdir(),"bleskpro-recovery-"));
chmodSync(artifacts,0o700);
const snapshot=path.join(artifacts,"snapshot.sqlite"),restored=path.join(artifacts,"restored.sqlite");
const required=["activities","cms_documents","crews","crm_settings","crm_users","integration_events","leads","orders","pricing_rules","public_submissions","request_limits","uploaded_files"];
const identifier=name=>'"'+name.replaceAll('"','""')+'"';
function sqlite(file,query,input) {
  return execFileSync("sqlite3",["-bail",file,...(query?[query]:[])],{encoding:"utf8",maxBuffer:128*1024*1024,...(input!==undefined?{input}:{})}).trim();
}
function json(file,query){return JSON.parse(sqlite(file,null,".mode json\n"+query)||"[]");}
function fingerprint(file,table){
  const columns=json(file,`PRAGMA table_info(${identifier(table)});`).map(c=>c.name);
  const rows=sqlite(file,`SELECT json_array(${columns.map(c=>`quote(${identifier(c)})`).join(",")}) AS row FROM ${identifier(table)} ORDER BY row;`);
  return {count:Number(sqlite(file,`SELECT count(*) FROM ${identifier(table)};`)),hash:createHash("sha256").update(rows).digest("hex")};
}
const oldMask=process.umask(0o077);
try {
  // SQLite backup API produces a coherent snapshot, including committed WAL.
  const readonly=new URL("file://"+source);readonly.searchParams.set("mode","ro");
  sqlite(readonly.href,`.backup '${snapshot.replaceAll("'","''")}'`);
  assert.equal(sqlite(snapshot,"PRAGMA integrity_check;"),"ok");
  assert.equal(sqlite(snapshot,"PRAGMA foreign_key_check;"),"");
  const dump=sqlite(snapshot,".dump");
  sqlite(restored,null,dump);
  assert.equal(sqlite(restored,"PRAGMA integrity_check;"),"ok");
  assert.equal(sqlite(restored,"PRAGMA foreign_key_check;"),"");
  const schema="SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name;";
  assert.deepEqual(json(restored,schema),json(snapshot,schema),"restored schema must match");
  const tables=json(snapshot,"SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;").map(t=>t.name);
  for(const table of required)assert.ok(tables.includes(table),`missing ${table}`);
  for(const table of tables)assert.deepEqual(fingerprint(restored,table),fingerprint(snapshot,table),`restore mismatch: ${table}`);
  console.log(JSON.stringify({result:"PASS",scope:"local SQLite only; no production or R2 restoration",tablesVerified:tables.length,requiredTables:required.length,artifacts,sourceModified:false}));
} finally {process.umask(oldMask);}
