import ts from 'typescript-ast';import fs from 'node:fs';import path from 'node:path';
const files=[];for(const dir of ['app','components','lib']){const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.tsx?$/.test(p))files.push(p);}};walk(dir);}
const phrases=new Map();const normal=s=>s.replace(/\s+/g,' ').trim();
for(const file of files){const text=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);const visit=n=>{
 if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isJsxText(n))&&/[\u0600-\u06ff]/.test(n.text)){const key=normal(n.text);if(!phrases.has(key))phrases.set(key,[]);phrases.get(key).push(file+':'+(sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1));}
 if(ts.isTemplateExpression(n)){let key=n.head.text;n.templateSpans.forEach((s,i)=>key+='{v'+i+'}'+s.literal.text);if(/[\u0600-\u06ff]/.test(key)){key=normal(key);if(!phrases.has(key))phrases.set(key,[]);phrases.get(key).push(file+':template');}}
 ts.forEachChild(n,visit);
 };visit(sf);}
const list=[...phrases].map(([source,locations],i)=>({id:i,source,locations}));fs.writeFileSync('docs/redesign/ui-phrases.json',JSON.stringify(list,null,2));console.log('Unique UI/API phrases:',list.length);for(const [i,v] of list.entries())console.log(i+'\t'+v.source);
