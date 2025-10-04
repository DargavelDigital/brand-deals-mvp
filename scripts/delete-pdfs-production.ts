import { PrismaClient } from '@prisma/client'

// Use production database URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/brand_deals_mvp'
    }
  }
})

async function deleteAllPDFs() {
  try {
    console.log('🗑️  Starting PDF deletion...')
    
    // Delete all MediaPackFile records (these contain the PDF data)
    const deletedFiles = await prisma.mediaPackFile.deleteMany({})
    console.log(`✅ Deleted ${deletedFiles.count} PDF files from database`)
    
    // Optionally delete MediaPack records too (uncomment if needed)
    // const deletedPacks = await prisma.mediaPack.deleteMany({})
    // console.log(`✅ Deleted ${deletedPacks.count} media pack records`)
    
    console.log('🎉 All PDFs deleted successfully!')
    console.log('📝 You can now generate fresh PDFs with the new data structure')
    
  } catch (error) {
    console.error('❌ Error deleting PDFs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllPDFs()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
