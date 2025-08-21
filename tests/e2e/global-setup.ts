import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Check if we need to set up the database
  if (process.env.CI) {
    console.log('Setting up database for CI...');
    
    // In CI, database setup is handled by the workflow
    // This is just a placeholder for any global setup needed
  }
  
  // Launch browser to check if app is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(baseURL || 'http://localhost:3000');
    console.log('✅ Application is accessible at:', baseURL || 'http://localhost:3000');
  } catch (error) {
    console.error('❌ Application is not accessible:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
