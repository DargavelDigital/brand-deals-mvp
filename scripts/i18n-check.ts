const fs = require('node:fs')

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {} as Record<string, any>);
}

const base = JSON.parse(fs.readFileSync('src/i18n/messages/en.json', 'utf8'))
const baseFlat = flattenObject(base)

for (const lang of ['es', 'fr']) {
  const m = JSON.parse(fs.readFileSync(`src/i18n/messages/${lang}.json`, 'utf8'))
  const mFlat = flattenObject(m)
  const missing = Object.keys(baseFlat).filter(k => !(k in mFlat))
  if (missing.length) { 
    console.warn(`[i18n] ${lang} missing:`, missing)
    process.exitCode = 1 
  }
}
