import fs from 'node:fs';import path from 'node:path';
const dirs=['contenu/oeuvres','content/oeuvres'];const source=dirs.find(d=>fs.existsSync(d));
if(!source){console.error('Dossier œuvres introuvable');process.exit(1);}
const parse=s=>{const o={};for(const raw of s.split(/\r?\n/)){const line=raw.trim();if(!line||line==='---'||line.startsWith('#'))continue;const i=line.indexOf(':');if(i<1)continue;const k=line.slice(0,i).trim();let v=line.slice(i+1).trim().replace(/^["']|["']$/g,'');if(v==='true')v=true;if(v==='false')v=false;o[k]=v;}return o;};
const files=fs.readdirSync(source).filter(f=>/\.(md|ya?ml)$/i.test(f));const out=[];
for(const f of files){const d=parse(fs.readFileSync(path.join(source,f),'utf8'));if(!d.titre)continue;if(!d.photo_principale&&files.some(x=>x.endsWith('.md'))&&!f.endsWith('.md'))continue;out.push({titre:d.titre||'',technique:d.technique||'',dimensions:d.dimensions||'',annee:d.annee||'',prix:d.prix||'',vendu:d.vendu===true||d.vendu==='true',photo_principale:d.photo_principale||'',description:d.description||''});}
fs.mkdirSync('data',{recursive:true});fs.writeFileSync('data/oeuvres.json',JSON.stringify(out,null,2));console.log(`Galerie générée: ${out.length} œuvre(s)`);
