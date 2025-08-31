/**
 * Interpolate template variables in a string with provided values
 * Falls back to default values if not provided
 */
export function interpolate(
  template: string,
  variables: Record<string, string> = {}
): string {
  const defaults: Record<string, string> = {
    first_name: 'there',
    brand_name: 'this opportunity',
    calendly_url: 'https://calendly.com/your-link',
    my_name: 'Your Name',
    base_rate: '$500',
    base_deliverables: 'basic deliverables',
    media_pack_url: 'https://your-media-pack.com'
  }

  // Merge provided variables with defaults
  const allVariables = { ...defaults, ...variables }

  // Replace all {variable} occurrences with their values
  return template.replace(/\{([^}]+)\}/g, (match, variable) => {
    return allVariables[variable] || match
  })
}

/**
 * Get available template variables for a given context
 */
export function getAvailableVariables(context: 'contact' | 'brand' | 'general' = 'general'): string[] {
  const baseVariables = ['first_name', 'my_name']
  
  switch (context) {
    case 'contact':
      return [...baseVariables, 'calendly_url']
    case 'brand':
      return [...baseVariables, 'brand_name', 'base_rate', 'base_deliverables', 'media_pack_url']
    case 'general':
    default:
      return [...baseVariables, 'brand_name', 'calendly_url', 'base_rate', 'base_deliverables', 'media_pack_url']
  }
}

/**
 * Preview template with sample data
 */
export function previewTemplate(template: string, context: 'contact' | 'brand' | 'general' = 'general'): string {
  const sampleData: Record<string, string> = {
    first_name: 'John',
    brand_name: 'Acme Corp',
    calendly_url: 'https://calendly.com/john-doe',
    my_name: 'Jane Smith',
    base_rate: '$750',
    base_deliverables: 'social media posts',
    media_pack_url: 'https://janesmith.com/media-pack'
  }

  return interpolate(template, sampleData)
}
