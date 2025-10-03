// Test script for PDF generation with different theme combinations
// Run this in your browser console on the media pack preview page

const testThemes = [
  {
    name: "Classic Light Blue",
    variant: "classic",
    dark: false,
    onePager: false,
    brandColor: "#3b82f6"
  },
  {
    name: "Classic Dark Red",
    variant: "classic", 
    dark: true,
    onePager: false,
    brandColor: "#ef4444"
  },
  {
    name: "Classic One-Pager Green",
    variant: "classic",
    dark: false,
    onePager: true,
    brandColor: "#10b981"
  },
  {
    name: "Bold Light Purple",
    variant: "bold",
    dark: false,
    onePager: false,
    brandColor: "#8b5cf6"
  },
  {
    name: "Editorial Dark Orange",
    variant: "editorial",
    dark: true,
    onePager: false,
    brandColor: "#f59e0b"
  }
];

async function testPDFGeneration() {
  console.log("🧪 Testing PDF generation with React components...");
  
  for (const theme of testThemes) {
    console.log(`\n📋 Testing: ${theme.name}`);
    console.log("Theme:", theme);
    
    try {
      const response = await fetch("/api/media-pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: `test-${theme.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...theme
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log("✅ Success:", result.fileUrl);
        // Open the PDF in a new tab
        window.open(result.fileUrl, '_blank');
      } else {
        console.error("❌ Failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
    
    // Wait 2 seconds between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n🎉 All tests completed!");
}

// Run the tests
testPDFGeneration();
