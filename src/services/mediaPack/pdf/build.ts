import { renderToBuffer } from "@react-pdf/renderer";
import { MediaPackPDF } from "./Document";

export async function renderBufferFromPayload(payload: any, theme: any, variant: string) {
  const doc = <MediaPackPDF payload={payload} theme={theme} variant={variant as any} />;
  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
