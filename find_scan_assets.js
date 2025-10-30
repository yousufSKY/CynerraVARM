// Test if we can determine the asset_id for the existing completed scan
async function findCompletedScanAssets() {
  console.log('🧪 Finding asset_id for completed scans...');
  
  const baseUrl = 'http://localhost:8000';
  const completedScanId = 'cbeb7be3-366d-4112-ad0f-a9080d4d390e';
  
  try {
    // Get the completed scan details to see its asset_id
    console.log('\n1. Getting completed scan details...');
    const scanResponse = await fetch(`${baseUrl}/api/test/scan/${completedScanId}`);
    
    if (scanResponse.ok) {
      const scanData = await scanResponse.json();
      console.log('✅ Completed scan details:', JSON.stringify(scanData, null, 2));
      
      const assetId = scanData.asset_id;
      console.log(`\n2. Testing scan history for asset_id: ${assetId}`);
      
      // Try to get scan history for this specific asset_id
      const historyResponse = await fetch(`${baseUrl}/api/test/scan/history/${assetId}`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log(`   History for ${assetId}:`, historyData);
        
        if (historyData.total > 0) {
          console.log('✅ SUCCESS: Found scans in history!');
        } else {
          console.log('❌ Still no scans in history for the correct asset_id');
        }
      }
      
      // Also test some common variations
      console.log('\n3. Testing variations of asset_id...');
      const variations = [
        assetId,
        assetId.toLowerCase(),
        assetId.toUpperCase(),
        encodeURIComponent(assetId),
        assetId.replace(/[^a-zA-Z0-9]/g, '')
      ];
      
      for (const variation of variations) {
        const testResponse = await fetch(`${baseUrl}/api/test/scan/history/${variation}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.total > 0) {
            console.log(`✅ Found scans with variation: "${variation}" (${testData.total} scans)`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
findCompletedScanAssets();