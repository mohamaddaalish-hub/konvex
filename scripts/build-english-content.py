from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'docs/redesign/source-content.json').read_text());phrases=json.loads((root/'docs/redesign/content-phrases.json').read_text());indexed=json.loads((root/'docs/redesign/content-en-by-id.json').read_text());mapping={phrases[int(i)]:text for i,text in indexed.items()};ui=json.loads((root/'i18n/ui-en.json').read_text())
for p in source['products']:
 name=mapping[p['name']]
 mapping[p['seoTitle']]=f"{name} {p['model']} | KONVEX"
 mapping[p['seoDescription']]=f"Technical specifications, applications and comparison of {name}, model {p['model']}. Request a price and check compatibility at Konvex. Sample catalog."
missing=[s for s in phrases if s not in mapping and s not in ui]
if missing:raise RuntimeError('Untranslated content: '+str(missing))
skip={'id','slug','sku','model','categoryId','brandId','relatedProductIds','compatibleProductIds','accessoryIds','applications','createdAt','updatedAt','url','image','logo','phone','email','whatsapp','mapUrl','instagram','linkedin'}
def fields(o,path=''):
 result={}
 if isinstance(o,str):
  if re.search('[\u0600-\u06ff]',o):result[path]={'source':o,'text':mapping.get(o,ui.get(o,''))}
 elif isinstance(o,list):
  for i,v in enumerate(o):result.update(fields(v,f'{path}.{i}' if path else str(i)))
 elif isinstance(o,dict):
  for k,v in o.items():
   if k not in skip:result.update(fields(v,f'{path}.{k}' if path else k))
 return result
records=[{'type':'product','id':p['id'],'fields':fields(p)} for p in source['products']]+[{'type':e['type'],'id':e['data']['id'],'fields':fields(e['data'])} for e in source['entities']]
assert all(v['text'] for r in records for v in r['fields'].values())
(root/'data/translations/en-content.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Complete English content:',len(records),'records;',sum(len(r['fields']) for r in records),'translated fields. Canonical data untouched.')
