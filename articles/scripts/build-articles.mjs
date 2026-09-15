import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
const dir='content/articles';
const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>/\.ya?ml$/i.test(f)):[];
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const articles=files.map(file=>{
 const x=yaml.load(fs.readFileSync(path.join(dir,file),'utf8'))||{};
 return {...x, slug:slug(x.titre||file), source:file};
}).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/articles.json',JSON.stringify(articles,null,2));
console.log(`Articles générés : ${articles.length}`);
