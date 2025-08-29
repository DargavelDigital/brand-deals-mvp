import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import type { PreviewRow } from './types';

// CSV stream -> rows
export async function* streamCsv(csv: Buffer | string | Readable): AsyncGenerator<Record<string,string>> {
  const parser = parse({ columns: true, skip_empty_lines: true, bom: true });
  if (typeof csv === 'string') parser.write(csv);
  else if (csv instanceof Buffer) parser.write(csv.toString('utf8'));
  else csv.pipe(parser);
  parser.end();
  for await (const rec of parser) yield rec;
}

// Google Sheets: stub reads via exported CSV url later
export async function fetchSheetAsCsv(sheetId: string, range?: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${range ? `&range=${encodeURIComponent(range)}`:''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`google sheet fetch failed ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function firstN<T>(it: AsyncGenerator<T>, n=100): Promise<T[]> {
  const out: T[] = [];
  for await (const v of it) { out.push(v); if (out.length >= n) break; }
  return out;
}
