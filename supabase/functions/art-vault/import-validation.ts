export function validateImportRows(value:unknown):Record<string,unknown>[] {
 if(!Array.isArray(value)||!value.length||value.length>1000)throw Error('Import between 1 and 1,000 artworks at a time.');
 const strings=['title','artist','legacyInventoryId','legacyWebNumber','webId','webCode','surface','medium','originalSize','status','location','notes','importKey','importSource','importSheet'];
 return value.map((item)=>{if(!item||typeof item!=='object'||Array.isArray(item))throw Error('Invalid artwork row.');const input=item as Record<string,unknown>,data:Record<string,unknown>={};
 for(const key of strings){const v=input[key];if(v!==undefined&&typeof v!=='string')throw Error('Invalid '+key);if(typeof v==='string'){if(v.length>(key==='notes'?5000:key==='importKey'?600:2000))throw Error(key+' is too long');data[key]=v;}}
 if(!String(data.title||'').trim()||!String(data.importKey||'').trim())throw Error('Title and import key are required.');
 if(!['','Available','Reserved','Sold'].includes(String(data.status||'')))throw Error('Invalid availability.');
 for(const key of ['width','height','price']){const v=input[key];if(v!==undefined){if(typeof v!=='number'||!Number.isFinite(v)||(key==='price'?v<0||v>1e15:v<=0||v>1e6))throw Error('Invalid '+key);data[key]=v;}}
 if(!Number.isInteger(input.importRow)||Number(input.importRow)<1)throw Error('Invalid source row.');data.importRow=input.importRow;
 return data;});
}
