// src/lib/email/providers.ts
import { providers } from "@/lib/env";

export function hasEmailProvider() {
  return providers.email;
}
