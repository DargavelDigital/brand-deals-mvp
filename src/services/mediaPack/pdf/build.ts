import { renderToBuffer } from "@react-pdf/renderer";
import { MediaPackPDF } from "./Document-simple";
import React from "react";

export async function renderBufferFromPayload(payload: any, theme: any, variant: string) {
  const doc = React.createElement(MediaPackPDF, { payload, theme, variant: variant as any });
  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
