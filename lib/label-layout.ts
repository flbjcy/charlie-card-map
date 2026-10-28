export type LabelInput={id:string;x:number;y:number;width:number;height:number};
type Box={left:number;top:number;width:number;height:number};
type Point={x:number;y:number};
type Segment={start:Point;end:Point};
type Positioned=LabelInput&Box&{endX:number;endY:number};

const overlap=(a:Box,b:Box)=>Math.max(0,Math.min(a.left+a.width+8,b.left+b.width+8)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.top+a.height+8,b.top+b.height+8)-Math.max(a.top,b.top));

function position(p:LabelInput,box:Box):Positioned{
 // End the pointer at the box edge, so it never runs across the white label.
 const cx=box.left+box.width/2,cy=box.top+box.height/2,dx=p.x-cx,dy=p.y-cy;
 const t=Math.min(dx?Math.abs((box.width/2)/dx):Infinity,dy?Math.abs((box.height/2)/dy):Infinity,1);
 return {...p,...box,endX:cx+dx*t,endY:cy+dy*t};
}

function crosses(a:Segment,b:Segment){
 const turn=(p:Point,q:Point,r:Point)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 return turn(a.start,a.end,b.start)*turn(a.start,a.end,b.end)<0&&turn(b.start,b.end,a.start)*turn(b.start,b.end,a.end)<0;
}

export function layoutLabels(inputs:LabelInput[],width:number,height:number){
 const placed:Positioned[]=[];
 for(const p of [...inputs].sort((a,b)=>a.y-b.y||a.id.localeCompare(b.id))){
  let best:Box={left:p.x-p.width/2,top:p.y-p.height-16,width:p.width,height:p.height},score=Infinity;
  // Search nearby positions, avoiding other labels, station dots and pointer crossings.
  for(let radius=0;radius<=480;radius+=24)for(let direction=0;direction<16;direction++){
   const angle=-Math.PI/2+direction*Math.PI/8;
   const cx=p.x+Math.cos(angle)*(radius+p.width/2+16),cy=p.y+Math.sin(angle)*(radius+p.height/2+16);
   const box={left:Math.max(8,Math.min(width-p.width-8,cx-p.width/2)),top:Math.max(8,Math.min(height-p.height-8,cy-p.height/2)),width:p.width,height:p.height};
   const area=placed.reduce((n,b)=>n+overlap(box,b),0);
   const covers=inputs.reduce((n,q)=>n+(q.x>box.left-6&&q.x<box.left+box.width+6&&q.y>box.top-6&&q.y<box.top+box.height+6?1:0),0);
   const candidate=position(p,box);
   const segment={start:{x:p.x,y:p.y},end:{x:candidate.endX,y:candidate.endY}};
   const crossings=placed.reduce((n,q)=>n+Number(crosses(segment,{start:{x:q.x,y:q.y},end:{x:q.endX,y:q.endY}})),0);
   // Give Aquarium the eastern slot and keep Tufts to its west when possible.
   const wrongSide=(p.id==='place-aqucl'&&box.left+p.width/2<p.x+60)||(p.id==='place-tumnl'&&box.left+p.width/2>p.x+80);
   const cost=area*100000+covers*10000+crossings*3000+Number(wrongSide)*2500+Math.hypot(box.left+p.width/2-p.x,box.top+p.height/2-p.y)+direction*.01;
   if(cost<score){score=cost;best=box}
  }
  placed.push(position(p,best));
 }
 // If the greedy search still reverses the pair, exchange their slots when safe.
 const aquarium=placed.find(p=>p.id==='place-aqucl'),tufts=placed.find(p=>p.id==='place-tumnl');
 if(aquarium&&tufts&&aquarium.left<=tufts.left){
  const a=position(aquarium,{left:tufts.left,top:tufts.top,width:aquarium.width,height:aquarium.height});
  const t=position(tufts,{left:aquarium.left,top:aquarium.top,width:tufts.width,height:tufts.height});
  const others=placed.filter(p=>p!==aquarium&&p!==tufts);
  if(!overlap(a,t)&&others.every(p=>!overlap(a,p)&&!overlap(t,p))){
   placed[placed.indexOf(aquarium)]=a;placed[placed.indexOf(tufts)]=t;
  }
 }
 return placed;
}
