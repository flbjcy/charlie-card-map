export type PhotoQuality = {ok:boolean; message:string};

// Deliberately conservative: reject only images that are clearly unusable.
// This runs on pixels in the visitor's browser; it does not identify people or content.
export function assessPhotoPixels(pixels:Uint8ClampedArray,width:number,height:number):PhotoQuality{
 if(width<480||height<480)return {ok:false,message:'Photo is too small. Please take a closer, higher-resolution photo of the machine.'};
 const sampleWidth=96,sampleHeight=96,gray=new Float32Array(sampleWidth*sampleHeight);
 let sum=0,sumSquares=0,dark=0,bright=0;
 for(let y=0;y<sampleHeight;y++)for(let x=0;x<sampleWidth;x++){
  const sx=Math.min(width-1,Math.floor((x+.5)*width/sampleWidth));
  const sy=Math.min(height-1,Math.floor((y+.5)*height/sampleHeight));
  const i=(sy*width+sx)*4;
  const light=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];
  gray[y*sampleWidth+x]=light;sum+=light;sumSquares+=light*light;
  if(light<18)dark++;if(light>245)bright++;
 }
 const count=gray.length,mean=sum/count,contrast=Math.sqrt(Math.max(0,sumSquares/count-mean*mean));
 if(mean<22||dark/count>.88)return {ok:false,message:'Photo is too dark to help identify the machine. Please retake it with more light.'};
 if(mean>240||bright/count>.88)return {ok:false,message:'Photo is too bright to make out the machine. Please retake it without glare.'};
 if(contrast<9)return {ok:false,message:'Photo has too little detail to identify the machine. Please take a clearer photo.'};
 let edgeSum=0,edgeSquares=0,edgeCount=0;
 for(let y=1;y<sampleHeight-1;y++)for(let x=1;x<sampleWidth-1;x++){
  const i=y*sampleWidth+x,v=4*gray[i]-gray[i-1]-gray[i+1]-gray[i-sampleWidth]-gray[i+sampleWidth];
  edgeSum+=v;edgeSquares+=v*v;edgeCount++;
 }
 const edgeVariance=edgeSquares/edgeCount-(edgeSum/edgeCount)**2;
 if(edgeVariance<5)return {ok:false,message:'Photo looks very blurry. Please hold the camera steady and try again.'};
 return {ok:true,message:'Photo looks clear enough to upload.'};
}
