export type LabelInput={id:string;x:number;y:number;width:number;height:number};
type Box={left:number;top:number;width:number;height:number};
export function layoutLabels(inputs:LabelInput[],width:number,height:number){
 const placed:Box[]=[];
 const overlap=(a:Box,b:Box)=>Math.max(0,Math.min(a.left+a.width+8,b.left+b.width+8)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.top+a.height+8,b.top+b.height+8)-Math.max(a.top,b.top));
 return [...inputs].sort((a,b)=>a.y-b.y||a.id.localeCompare(b.id)).map(p=>{
  let best:Box={left:p.x-p.width/2,top:p.y-p.height-16,width:p.width,height:p.height},score=Infinity;
  // Search nearby positions first, extending outward only when the map is crowded.
  for(let radius=0;radius<=480;radius+=24)for(let direction=0;direction<16;direction++){
   const angle=-Math.PI/2+direction*Math.PI/8;
   const cx=p.x+Math.cos(angle)*(radius+p.width/2+16),cy=p.y+Math.sin(angle)*(radius+p.height/2+16);
   const box={left:Math.max(8,Math.min(width-p.width-8,cx-p.width/2)),top:Math.max(8,Math.min(height-p.height-8,cy-p.height/2)),width:p.width,height:p.height};
   const area=placed.reduce((n,b)=>n+overlap(box,b),0);
   const covers=inputs.reduce((n,q)=>n+(q.x>box.left-6&&q.x<box.left+box.width+6&&q.y>box.top-6&&q.y<box.top+box.height+6?1:0),0);
   const cost=area*100000+covers*10000+Math.hypot(box.left+p.width/2-p.x,box.top+p.height/2-p.y)+direction*.01;
   if(cost<score){score=cost;best=box}
  }
  placed.push(best);
  // Clip the connector to the rectangle boundary along the ray from its center.
  const cx=best.left+p.width/2,cy=best.top+p.height/2,dx=p.x-cx,dy=p.y-cy;
  const t=Math.min(Math.abs((p.width/2)/dx),Math.abs((p.height/2)/dy),1);
  return {...p,...best,endX:cx+dx*t,endY:cy+dy*t};
 });
}
