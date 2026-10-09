// Normalize visible artwork area rather than transparent image-box dimensions.
import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
const file='src/data/hangly/charm-artwork-current.json';
const entries=JSON.parse(readFileSync(file));
for(const entry of Object.values(entries)){
 const {data,info:{width,height,channels}}=await sharp(`public${entry.path}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let area=0;
 for(let i=3;i<data.length;i+=channels)area+=data[i]/255;
 const scale=Math.min(Math.sqrt(6400/area),124/width,164/height);
 entry.displayWidth=Number((width*scale).toFixed(2));
 entry.displayHeight=Number((height*scale).toFixed(2));
}
writeFileSync(file,JSON.stringify(entries,null,2)+'\n');
