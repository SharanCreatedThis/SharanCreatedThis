const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

// Measure visible artwork so its rope joins the image, not transparent padding.
async function connect(file) {
 const source = await fs.readFile(file, 'utf8');
 const match = source.match(/viewBox="([^"]+)"/);
 if (!match) throw new Error(`Missing viewBox: ${file}`);
 const [vx, vy, vw, vh] = match[1].split(/[ ,]+/).map(Number);
 const {data, info} = await sharp(file).resize({height:1000}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width, right=0, top=info.height, bottom=0;
 const rows=[];
 for(let y=0;y<info.height;y++){
  let count=0;
  for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);count++;}
  rows[y]=count;
 }
 if(right<left)throw new Error(`Empty artwork: ${file}`);
 const width=right-left+1;
 // Stop within the first substantial ornament, threading any beads above it.
 let join=rows.findIndex((count,y)=>y>=top&&count>width*.36);
 if(join<0)join=top;
 join=Math.min(bottom,join+(bottom-top)*.035);
 const sx=vw/info.width, sy=vh/info.height;
 const x=vx+left*sx, y=vy+top*sy, w=width*sx, h=(bottom-top+1)*sy;
 const line=`<path d="M ${x+w/2} ${y-1} V ${vy+join*sy}" stroke="#b99550" stroke-width="${w*.009}" stroke-linecap="round" fill="none"/>`;
 const updated=source.replace(/viewBox="[^"]+"/,`viewBox="${x} ${y} ${w} ${h}"`).replace(/(<svg\b[^>]*>)/,`$1${line}`);
 await fs.writeFile(path.join('public/charms/connected',path.basename(file)),updated);
 console.log(`${path.basename(file)}: trimmed padding; rope joins at ${Math.round((join-top)/(bottom-top)*100)}%`);
}
(async()=>{for(const file of await fs.readdir('public/charms'))if(file.endsWith('.svg'))await connect(path.join('public/charms',file));})().catch(e=>{console.error(e);process.exit(1)});
