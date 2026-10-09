/** Import the app's authoritative SVGs as tightly cropped website artwork.
 * Usage: node scripts/import-current-charm-artwork.mjs /path/to/Hangly-Mac
 */
import {readFileSync,writeFileSync,readdirSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const repo=process.argv[2];
if(!repo) throw Error('Pass the Hangly-Mac repository path');
const mapping={};
for(const file of readdirSync(join(repo,'Hangly/Models/Charms')).filter(f=>f.endsWith('.swift'))){
 const src=readFileSync(join(repo,'Hangly/Models/Charms',file),'utf8');
 for(const m of src.matchAll(/kind:\s*\.(\w+),\s*sourceFileName:\s*"([^"]+)"/g)) mapping[m[1]]=m[2];
}
const charms=JSON.parse(readFileSync('src/data/hangly/charm-library.shipped.json')).charms;
const manifest={};
mkdirSync('public/charms/current',{recursive:true});
for(const {id} of charms){
 if(!mapping[id]) throw Error(`No app SVG mapping for ${id}`);
 const input=readFileSync(join(repo,'Assets/Charms',mapping[id]));
 const output=`public/charms/current/${id}.webp`;
 await sharp(input,{density:144,limitInputPixels:false}).trim({threshold:4}).resize({width:480,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:90,alphaQuality:100}).toFile(output);
 manifest[id]={source:mapping[id],sha256:createHash('sha256').update(input).digest('hex'),path:`/charms/current/${id}.webp`};
}
writeFileSync('src/data/hangly/charm-artwork-current.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Imported ${charms.length} current app SVGs`);

await import("./measure-charm-attachments.mjs");

await import("./measure-charm-display.mjs");
