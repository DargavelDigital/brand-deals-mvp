import { prisma } from '@/src/lib/db'

export async function tryGetWorkspace(fields: any) {
  try { 
    return await prisma.workspace.findFirst({ select: fields }) 
  } catch { 
    return null 
  }
}

export async function tryGetContacts(where: any, options: any = {}) {
  try {
    return await prisma.contact.findMany({ where, ...options })
  } catch {
    return []
  }
}

export async function tryGetBrandRun(where: any) {
  try {
    return await prisma.brandRun.findFirst({ where })
  } catch {
    return null
  }
}
