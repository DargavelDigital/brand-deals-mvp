import sanitizeHtml from 'sanitize-html'

/**
 * Simple {var} or {var|fallback} rendering.
 * E.g. "Hi {first_name|there}".
 */
export function renderVars(tpl: string, vars: Record<string,string>): string {
  return tpl.replace(/\{([a-z0-9_]+)(\|[^}]+)?\}/gi, (_, k: string, fb?: string) => {
    const val = vars[k] ?? (fb ? fb.slice(1) : '')
    return val
  })
}

export function sanitizeEmailHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src','alt','width','height','style'],
      a: ['href','name','target','rel','style'],
      '*': ['style'],
    },
    transformTags: {
      'a': (tagName, attribs) => ({
        tagName, attribs: { ...attribs, rel: 'noopener noreferrer' }
      }),
    },
  })
}
