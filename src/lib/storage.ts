import { env } from './env'

export interface StorageResult {
  url: string
  key: string
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  // For now, we'll use a simple file system approach
  // In production, you'd integrate with S3, Netlify Blob, or similar
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs')
  try {
    await fs.mkdir(uploadsDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
  
  // Generate unique filename
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const finalFilename = `${timestamp}_${sanitizedFilename}`
  const filePath = path.join(uploadsDir, finalFilename)
  
  // Write file
  await fs.writeFile(filePath, buffer)
  
  // Return public URL
  const baseUrl = env.APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/uploads/pdfs/${finalFilename}`
  
  return {
    url,
    key: `pdfs/${finalFilename}`
  }
}

export async function deletePDF(key: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const filePath = path.join(process.cwd(), 'public', 'uploads', key)
  
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.warn('Failed to delete PDF file:', error)
  }
}
