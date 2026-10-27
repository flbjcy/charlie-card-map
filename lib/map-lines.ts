export function decodePolyline(encoded:string):[number,number][]{
 const points:[number,number][]=[];let i=0,lat=0,lng=0;
 function read(){let result=0,shift=0,b;do{if(i>=encoded.length)throw Error('Invalid polyline');b=encoded.charCodeAt(i++)-63;result|=(b&31)<<shift;shift+=5}while(b>=32);return result&1?~(result>>1):result>>1}
 while(i<encoded.length){lat+=read();lng+=read();points.push([lat/1e5,lng/1e5])}return points;
}
