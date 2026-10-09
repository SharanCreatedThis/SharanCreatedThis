// Find where the central hanging cord meets the visible body, beyond detached beads.
import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
const file='src/data/hangly/charm-artwork-current.json';
const data=JSON.parse(readFileSync(file));
for(const entry of Object.values(data)){
 const {data:p,info:{width:w,height:h,channels:c}}=await sharp(`public${entry.path}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const alpha=(x,y)=>p[(y*w+x)*c+3];
 let body=0;
 for(let y=0;y<h;y++){
  let count=0;for(let x=0;x<w;x++) if(alpha(x,y)>100)count++;
  if(count>=w*.3){body=y;break;}
 }
 // Detached bead stacks have entirely transparent rows before the pendant.
 for(let y=body;y<Math.floor(h*.6);y++){
  let count=0;for(let x=0;x<w;x++)if(alpha(x,y)>100)count++;
  if(count===0)body=y+1;
 }
 let end=body;
 for(let y=body;y<h;y++)if(alpha(Math.floor(w/2),y)>160){end=y+2;break;}
 entry.connectionPercent=Number((Math.min(end,h)/h*100).toFixed(3));
}
writeFileSync(file,JSON.stringify(data,null,2)+'\n');
