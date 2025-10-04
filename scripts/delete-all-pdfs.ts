import { db } from '@/lib/prisma'

async function deleteAllPDFs() {
  try {
    console.log('🗑️  Starting PDF deletion...')
    
    // Delete all MediaPackFile records (these contain the PDF data)
    const deletedFiles = await db().mediaPackFile.deleteMany({})
    console.log(`✅ Deleted ${deletedFiles.count} PDF files from database`)
    
    // Optionally delete MediaPack records too (uncomment if needed)
    // const deletedPacks = await db().mediaPack.deleteMany({})
    // console.log(`✅ Deleted ${deletedPacks.count} media pack records`)
    
    console.log('🎉 All PDFs deleted successfully!')
    console.log('📝 You can now generate fresh PDFs with the new data structure')
    
  } catch (error) {
    console.error('❌ Error deleting PDFs:', error)
    throw error
  } finally {
    await db().$disconnect()
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
