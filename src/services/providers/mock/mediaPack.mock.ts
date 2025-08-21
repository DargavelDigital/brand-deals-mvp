export const mediaPack = {
  generate: async ({ brandId, creatorId, variant }: { brandId: string; creatorId: string; variant: 'default' | 'brand' }) => {
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simple deterministic URLs for demo
    const htmlUrl = `/demo/media-packs/${brandId}-${variant}.html`;
    const pdfUrl = `/demo/media-packs/${brandId}-${variant}.pdf`;
    
    return { 
      htmlUrl, 
      pdfUrl,
      generatedAt: new Date().toISOString(),
      variant,
      demo: true
    };
  }
};
