import crypto from "node:crypto";
export function stableHash(obj: unknown) {
  const json = JSON.stringify(obj, Object.keys(obj as any).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}
export function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
