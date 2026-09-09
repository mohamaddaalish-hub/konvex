import englishUI from "@/i18n/ui-en.json";
import contentSeed from "@/data/translations/en-content.json";
import { messageKey, type Dictionary } from "@/i18n/core";
import type { DictionaryScope } from "./dictionary-scope";

export interface TranslationField { source:string; text:string; }
export type TranslationFields = Record<string, TranslationField>;
type TranslationRecord = {type:string; id:string; fields:TranslationFields};

const records = contentSeed as unknown as TranslationRecord[];

export function getDictionary(scope: DictionaryScope = {}): Dictionary {
  const dictionary: Dictionary = {};
  for (const [source,text] of Object.entries(englishUI as Record<string,string>))
    dictionary[messageKey(source)] = text;

  const productIds = new Set([...(scope.products||[]), ...(scope.fullProducts||[])]);
  const articleIds = new Set([...(scope.articles||[]), ...(scope.fullArticles||[])]);
  for (const row of records) {
    if (row.type==="product" && productIds.size && !scope.allProducts && !productIds.has(row.id)) continue;
    if (row.type==="product" && !scope.allProducts && !productIds.size) continue;
    if (row.type==="article" && !articleIds.has(row.id)) continue;
    if (!["product","article"].includes(row.type)) continue;
    const fullProduct = scope.fullProducts?.includes(row.id);
    const fullArticle = scope.fullArticles?.includes(row.id);
    for (const [key,field] of Object.entries(row.fields)) {
      if (row.type==="product" && !fullProduct && !/^(name|brand|shortDescription|specifications\.|images\.)/.test(key)) continue;
      if (row.type==="article" && !fullArticle && !["title","excerpt","category","seoTitle","seoDescription"].includes(key)) continue;
      if (field.text) dictionary[messageKey(field.source)] = field.text;
    }
  }
  return dictionary;
}

export function contentFields(value: unknown, prefix=""): Record<string,string> {
  const result:Record<string,string>={};
  if (typeof value==="string") {
    if (/[\u0600-\u06ff]|\\u200c/.test(value)) result[prefix]=value;
  } else if (Array.isArray(value)) value.forEach((v,i)=>Object.assign(result,contentFields(v,prefix?`${prefix}.${i}`:String(i))));
  else if (value && typeof value==="object") for (const [key,v] of Object.entries(value)) {
    if (["id","slug","sku","model","categoryId","brandId","relatedProductIds","compatibleProductIds","accessoryIds","applications","createdAt","updatedAt","url","image","logo","phone","email","whatsapp","mapUrl","instagram","linkedin"].includes(key)) continue;
    Object.assign(result,contentFields(v,prefix?`${prefix}.${key}`:key));
  }
  return result;
}

export function readTranslation(type:string,id:string):TranslationFields {
  return records.find(r=>r.type===type&&r.id===id)?.fields || {};
}
export function saveTranslation(_type:string,_id:string,_fields:TranslationFields) { return; }
export function reindexTranslatedProduct(_id:string) { return; }

export function productDictionary(ids:string[],full=false):Dictionary {
  const base=getDictionary();
  const all=getDictionary({products:ids,...(full?{fullProducts:ids}:{})});
  return Object.fromEntries(Object.entries(all).filter(([key,value])=>base[key]!==value));
}
