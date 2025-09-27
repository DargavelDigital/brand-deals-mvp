import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-options";

/**
 * Get session without throwing - returns null if unauthenticated
 */
export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
