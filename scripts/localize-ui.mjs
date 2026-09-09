import ts from 'typescript-ast';import fs from 'node:fs';import path from 'node:path';
const roots=['app/[locale]','components'];const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.tsx'))files.push(p);}};roots.forEach(walk);files.push('app/error.tsx','app/not-found.tsx');files.splice(files.indexOf('app/[locale]/layout.tsx'),1);
// Promote static metadata to request-aware metadata, without altering paths.
for(const file of files){if(!file.startsWith('app/'))continue;let text=fs.readFileSync(file,'utf8');const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const changes=[];for(const st of sf.statements){if(ts.isVariableStatement(st)&&st.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)){const d=st.declarationList.declarations.find(d=>d.name.getText(sf)==='metadata');if(d?.initializer){let init=d.initializer.getText(sf).replace(/\.\.\.meta\(/g,'...await meta(');changes.push([st.getStart(sf),st.end,`export async function generateMetadata(){return (${init});}`]);}}}for(const [start,end,newText]of changes.reverse())text=text.slice(0,start)+newText+text.slice(end);text=text.replace(/import\s*\{\s*metadata as meta\s*\}\s*from\s*["']@\/lib\/seo["'];?/g,'import {localizedMetadata as meta} from "@/i18n/metadata";');fs.writeFileSync(file,text);}
const cf=ts.readConfigFile('tsconfig.json',ts.sys.readFile);const parsed=ts.parseJsonConfigFileContent(cf.config,ts.sys,process.cwd());const program=ts.createProgram(files,{...parsed.options,skipLibCheck:true});const checker=program.getTypeChecker();
const unicode=/[\u0600-\u06ff]/;const stringType=node=>{try{const tp=checker.getTypeAtLocation(node);return (tp.isUnion()?tp.types: [tp]).every(t=>!!(t.flags&(ts.TypeFlags.StringLike|ts.TypeFlags.Undefined|ts.TypeFlags.Null)))}catch{return false}};
const sl=s=>{const n=ts.factory.createStringLiteral(s);ts.setEmitFlags(n,ts.EmitFlags.NoAsciiEscaping);return n};
const call=(name,args)=>ts.factory.createCallExpression(ts.factory.createIdentifier(name),undefined,args);
const isComponent=n=>ts.isFunctionDeclaration(n)&&n.body&&n.name&&(/^[A-Z]/.test(n.name.text)||n.name.text==='generateMetadata');
const cleanJsx=text=>{const lines=text.split(/\r\n|\n|\r/);let last=0;lines.forEach((line,i)=>{if(/[^ \t]/.test(line))last=i});let out='';for(let i=0;i<lines.length;i++){let line=lines[i].replace(/\t/g,' ');if(i!==0)line=line.replace(/^ +/,'');if(i!==lines.length-1)line=line.replace(/ +$/,'');if(line){out+=line;if(i!==last)out+=' ';}}return out;};
for(const file of files){const sf=program.getSourceFile(file);if(!sf)continue;let current=false;let needHook=false,needServer=false;const changes=[];
 const transform=context=>{const visit=node=>{
  if(isComponent(node)){const before=current;current=true;const async=node.modifiers?.some(m=>m.kind===ts.SyntaxKind.AsyncKeyword);if(async)needServer=true;else needHook=true;const body=ts.visitEachChild(node.body,visit,context);const parsed=ts.createSourceFile('temp.ts',`const {t:tr,locale,n:fmtNumber,path:localizedPath} = ${async?'await getI18n()':'useI18n()'};`,ts.ScriptTarget.Latest,true);const next=ts.factory.updateFunctionDeclaration(node,node.modifiers,node.asteriskToken,node.name,node.typeParameters,node.parameters,node.type,ts.factory.updateBlock(body,[parsed.statements[0],...body.statements]));current=before;return next;}
  if(!current)return ts.visitEachChild(node,visit,context);
  if(ts.isJsxText(node)&&unicode.test(node.text)){const text=cleanJsx(node.text);return text?ts.factory.createJsxExpression(undefined,call('tr',[sl(text)])):node;}
  if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)&&unicode.test(node.initializer.text)){
    if(['value','defaultValue','id','name','key'].includes(node.name.getText(sf)))return node;
    return ts.factory.updateJsxAttribute(node,node.name,ts.factory.createJsxExpression(undefined,call('tr',[node.initializer])));
  }
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
    if(unicode.test(node.text)){
      if((ts.isPropertyAssignment(node.parent)&&node.parent.name===node)||ts.isImportDeclaration(node.parent)||ts.isExportDeclaration(node.parent))return node;
      if(ts.isCallExpression(node.parent)&&ts.isPropertyAccessExpression(node.parent.expression)&&['split','replace','replaceAll','includes','startsWith','endsWith'].includes(node.parent.expression.name.text))return node;
      if(ts.isJsxAttribute(node.parent))return node;
      return call('tr',[sl(node.text)]);
    }return node;
  }
  if(ts.isTemplateExpression(node)){let key=node.head.text;node.templateSpans.forEach((s,i)=>key+='{v'+i+'}'+s.literal.text);if(unicode.test(key)){const vars=node.templateSpans.map((s,i)=>{let v=ts.visitNode(s.expression,visit);if(stringType(s.expression))v=call('tr',[v]);return ts.factory.createPropertyAssignment('v'+i,v)});return call('tr',[sl(key),ts.factory.createObjectLiteralExpression(vars,false)]);}}
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='faNumber')return call('fmtNumber',node.arguments.map(a=>ts.visitNode(a,visit)));
  if(ts.isJsxExpression(node)&&node.expression){const old=node.expression;let ex=ts.visitNode(old,visit);const attribute=ts.isJsxAttribute(node.parent)?node.parent.name.getText(sf):null;const allowed=!attribute||['label','title','alt','placeholder','description','help','eyebrow','actionLabel','linkLabel','aria-label','aria-description'].includes(attribute);const personal=/\bq\.(?:name|email|phone|notes)\b/.test(old.getText(sf));
    if(allowed&&!personal&&stringType(old)&&!ts.isStringLiteral(old)&&!ts.isTemplateExpression(old)&&!ts.isNoSubstitutionTemplateLiteral(old)&&!(ts.isCallExpression(ex)&&ts.isIdentifier(ex.expression)&&['tr','fmtNumber'].includes(ex.expression.text)))ex=call('tr',[ex]);
    return ts.factory.updateJsxExpression(node,ex);
  }
  return ts.visitEachChild(node,visit,context);
 };return root=>ts.visitNode(root,visit);};
 const result=ts.transform(sf,[transform]);let output=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(result.transformed[0]);result.dispose();
 if(needHook)output='import {useI18n} from "@/i18n/use-i18n";\n'+output;if(needServer)output='import {getI18n} from "@/i18n/server";\n'+output;
 if(output.includes('"use client";')){output=output.replace('"use client";','');output='"use client";\n'+output;}
 output=output.replace(/import Link from ["']next\/link["']/g,'import Link from "@/i18n/navigation"');
 // Only navigation hooks change. notFound and useSearchParams remain framework primitives.
 output=output.replace(/import\s*\{([^}]+)\}\s*from ["']next\/navigation["'];/g,(all,body)=>{const names=body.split(',').map(x=>x.trim()).filter(Boolean);const local=names.filter(n=>['useRouter','usePathname'].includes(n));const other=names.filter(n=>!local.includes(n));return (other.length?`import {${other.join(',')}} from "next/navigation";\n`:'')+(local.length?`import {${local.join(',')}} from "@/i18n/navigation";`:'');});
 output=output.replace(/\.toLocaleDateString\(["']fa-IR["']/g,'.toLocaleDateString(locale === "en" ? "en-GB" : "fa-IR"');
 // Native GET forms and non-framework links must preserve locale too; API/asset/hash paths are exempt.
 output=output.replace(/action="(\/[^"\n]*)"/g,'action={localizedPath("$1")}');
 output=output.replace(/فایل ناموجود یا تأییدنشده ارائه نمی‌شو��\./g,'فایل ناموجود یا تأییدنشده ارائه نمی‌شود.');
 fs.writeFileSync(file,output);changes.push(file);
}
console.log('Presentation components internationalized without modifying canonical data.');
