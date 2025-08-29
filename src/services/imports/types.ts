export type ImportKind = 'BRAND' | 'CONTACT' | 'DEAL';
export type ImportSource = 'CSV' | 'GSHEETS';

export type Mapping = Record<string, string>; // csvHeader -> appField

export type PreviewRow = Record<string, string>;

export interface StartImportInput {
  kind: ImportKind;
  source: ImportSource;
  fileUrl?: string;
  sheetId?: string;
  sheetRange?: string; // e.g., 'Sheet1!A1:Z'
}
