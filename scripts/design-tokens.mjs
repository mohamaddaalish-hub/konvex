import postcss from 'postcss';import fs from 'node:fs';
const files=[['app/globals.css','styles/base.css'],['components/admin/admin.css','components/admin/admin.css'],['app/[locale]/print/print.css','app/[locale]/print/print.css']];
const channel=h=>parseInt(h,16);function rgb(hex){let h=hex.slice(1);if(h.length<=4)h=[...h].map(c=>c+c).join('');return [channel(h.slice(0,2)),channel(h.slice(2,4)),channel(h.slice(4,6)),h.length===8?channel(h.slice(6,8))/255:1];}
for(const [input,output]of files){const root=postcss.parse(fs.readFileSync(input,'utf8'));root.walkRules(r=>{if(r.selector.trim()===':root')r.remove();});root.walkDecls(d=>{if(d.prop.startsWith('--'))return;const selector=d.parent.selector||'';const photo=/hero-art-(top|caption)|application-image-caption|article-image-index/.test(selector);const danger=/error|danger|invalid/.test(selector);const primary=/\.primary|quote-submit/.test(selector);const value=d.value;
 const replace=(r,g,b,a=1)=>{const max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max?(max-min)/max:0;const brand=r>g*1.18&&r>b*1.15&&sat>.32;const light=(r+g+b)/765;
  if(danger)return /background/.test(d.prop)?'var(--danger-soft)':'var(--danger)';
  if(/shadow/.test(d.prop))return 'var(--shadow-color)';
  if(/border|outline/.test(d.prop))return brand?'var(--accent-line)':'var(--line)';
  if(d.prop==='color'||d.prop==='fill'||d.prop==='stroke'){
   if(photo)return 'var(--on-image)';if(primary&&light>.8)return 'var(--on-accent)';if(brand)return 'var(--accent-text)';return light<.30?'var(--ink)':'var(--muted)';
  }
  if(/background/.test(d.prop)){
   if(photo)return 'var(--image-overlay)';if(brand)return light>.68||a<.5?'var(--accent-soft)':'var(--accent)';if(/backdrop|modal::backdrop/.test(selector))return 'var(--scrim)';if(light<.4)return 'var(--surface-tone)';return light>.96?'var(--surface)':'var(--surface-muted)';
  }
  return light<.4?'var(--ink)':light>.92?'var(--surface)':'var(--line)';
 };
 d.value=value.replace(/#[a-f\d]{3,8}\b/ig,h=>replace(...rgb(h))).replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/g,(_,r,g,b,a)=>replace(+r,+g,+b,a===undefined?1:+a));
 if(d.prop==='color'&&['white','#fff'].includes(value)&&!photo)d.value=primary?'var(--on-accent)':'var(--ink)';
 if(d.prop==='background'&&value==='white')d.value='var(--surface)';
 const logo=/brand-wordmark|brand-x/.test(selector);if(!logo){const props={'margin-left':'margin-inline-end','margin-right':'margin-inline-start','padding-left':'padding-inline-end','padding-right':'padding-inline-start','border-left':'border-inline-end','border-right':'border-inline-start','border-left-color':'border-inline-end-color','border-right-color':'border-inline-start-color'};if(props[d.prop])d.prop=props[d.prop];if(d.prop==='left'&&d.value!=='50%')d.prop='inset-inline-end';if(d.prop==='right'&&d.value!=='50%')d.prop='inset-inline-start';if(d.prop==='text-align'&&d.value==='right')d.value='start';else if(d.prop==='text-align'&&d.value==='left')d.value='end';}
 });fs.writeFileSync(output,root.toString());}
