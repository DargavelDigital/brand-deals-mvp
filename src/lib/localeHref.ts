export function localeHref(locale: string | undefined, path: string) {
  const l = (locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en").trim();
  return `/${l}${path.startsWith("/") ? path : `/${path}`}`;
}
