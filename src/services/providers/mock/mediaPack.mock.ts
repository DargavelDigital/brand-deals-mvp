export const mockMediaPackService = {
  async generateMediaPack(workspaceId: string, brandData: any, template: string = 'default') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📄 Mock Media Pack Generated:', {
      workspaceId,
      brand: brandData.name,
      template,
      timestamp: new Date().toISOString()
    });
    
    return {
      mediaPackId: `mock-pack-${Date.now()}`,
      filename: `${brandData.name.toLowerCase().replace(/\s+/g, '-')}-media-pack.pdf`,
      downloadUrl: `https://mock-cdn.hyper.com/media-packs/${Date.now()}.pdf`,
      size: '2.4 MB',
      pages: 8,
      generatedAt: new Date().toISOString(),
      brand: brandData.name,
      template: template,
      status: 'completed'
    };
  },

  async generateCustomMediaPack(workspaceId: string, brandData: any, customTemplate: any) {
    // Simulate custom media pack generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    console.log('📄 Mock Custom Media Pack Generated:', {
      workspaceId,
      brand: brandData.name,
      customTemplate: customTemplate.name,
      timestamp: new Date().toISOString()
    });
    
    return {
      mediaPackId: `mock-custom-${Date.now()}`,
      filename: `${brandData.name.toLowerCase().replace(/\s+/g, '-')}-custom-pack.pdf`,
      downloadUrl: `https://mock-cdn.hyper.com/custom-packs/${Date.now()}.pdf`,
      size: '3.1 MB',
      pages: 12,
      generatedAt: new Date().toISOString(),
      brand: brandData.name,
      template: 'custom',
      customizations: customTemplate,
      status: 'completed'
    };
  },

  // New method to handle the updated API call
  async generate(params: any) {
    const { workspaceId, brandId, creatorId, variant, customizations, brands } = params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📄 Mock Media Pack Generated:', {
      workspaceId,
      variant,
      brands: brands?.length || 0,
      customizations,
      timestamp: new Date().toISOString()
    });
    
    const brandName = brands?.[0]?.name || 'Demo Brand';
    const mediaPackId = `mock-pack-${Date.now()}`;
    
    return {
      id: mediaPackId,
      variant: variant || 'default',
      htmlUrl: `/media-packs/${mediaPackId}.html`,
      pdfUrl: `/media-packs/${mediaPackId}.pdf`,
      workspaceId,
      creatorId,
      demo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional mock data for the UI
      filename: `${brandName.toLowerCase().replace(/\s+/g, '-')}-media-pack.pdf`,
      size: '2.4 MB',
      pages: 8,
      brand: brandName,
      template: variant,
      status: 'completed',
      customizations
    };
  }
};
