import sharp from 'sharp';import fs from 'node:fs/promises';
await fs.mkdir('public/images/green',{recursive:true});
for(const base of ['hero','laser','caster','level','abrasives','measurement']){
 const {data,info}=await sharp('assets-source/'+base+'.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=info.channels){let r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0;let h=d?(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60:0;
  if(h>=4&&h<52&&s>.26&&max>.15){const edge=Math.min(1,(h-4)/5,(52-h)/8,(s-.26)/.12);const hue=(148+(h-25)*.16)/60;const sat=Math.min(.82,s*.9),v=max*.9;const c=v*sat,x=c*(1-Math.abs(hue%2-1)),m=v-c;const nr=m,ng=c+m,nb=x+m;data[i]=Math.round((r*(1-edge)+nr*edge)*255);data[i+1]=Math.round((g*(1-edge)+ng*edge)*255);data[i+2]=Math.round((b*(1-edge)+nb*edge)*255);}
 }
 const raw={raw:{width:info.width,height:info.height,channels:info.channels}};
 for(const [suffix,width]of [['',1600],['-medium',800],['-small',400],['-tiny',160]])await sharp(data,raw).resize({width,withoutEnlargement:true}).webp({quality:width===160?78:84}).toFile('public/images/green/'+base+suffix+'.webp');
 console.log('Separate green sample variation:',base);
}
