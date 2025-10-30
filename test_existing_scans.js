// Test accessing the existing scan data that we can see in Firestore
async function testExistingScans() {
  console.log('🧪 Testing access to existing scan data from Firestore...');
  
  const baseUrl = 'http://localhost:8000';
  
  // Scan IDs visible in the Firestore screenshot
  const existingScans = [
    'cbeb7be3-366d-4112-ad0f-a9080d4d390e',
    '01c45a65-3988-430f-a341-4a56',  // partial ID from screenshot
    'b6827948-781a-470d-b6af-6b9a',  // partial ID from screenshot
    'd509bd7e-8e83-41d3-8a6d-0373',  // partial ID from screenshot
    'ed90bf80-724c-476b-96d4-7675'   // partial ID from screenshot
  ];
  
  try {
    console.log('\n1. Testing direct access to existing scans...');
    
    for (const scanId of existingScans) {
      console.log(`\n   Testing scan ID: ${scanId}`);
      
      // Try test endpoint
      const testResponse = await fetch(`${baseUrl}/api/test/scan/${scanId}`);
      console.log(`   Test endpoint: ${testResponse.status} ${testResponse.ok ? '✅' : '❌'}`);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`   Test data:`, {
          status: testData.status,
          target: testData.target,
          created_at: testData.created_at,
          finished_at: testData.finished_at
        });
      }
      
      // Try production endpoint (might require auth)
      const prodResponse = await fetch(`${baseUrl}/api/scan/${scanId}`);
      console.log(`   Prod endpoint: ${prodResponse.status} ${prodResponse.ok ? '✅' : '❌'}`);
    }
    
    console.log('\n2. Testing various asset ID combinations with history endpoint...');
    
    const possibleAssetIds = [
      'localhost',
      '127.0.0.1',
      'test-asset',
      'default-asset',
      'current-user',
      'admin',
      'user',
      '',
      'null'
    ];
    
    for (const assetId of possibleAssetIds) {
      const historyResponse = await fetch(`${baseUrl}/api/test/scan/history/${assetId}`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.total > 0) {
          console.log(`✅ FOUND DATA for asset ID: ${assetId}`);
          console.log(`   Total scans: ${historyData.total}`);
          console.log(`   First scan:`, historyData.scans[0]);
          return;
        }
      }
    }
    
    console.log('\n3. Testing if the backend is connected to a different database...');
    
    // Try to see if there are any endpoints that return scan lists
    const possibleEndpoints = [
      '/api/test/scan/all',
      '/api/test/scans/all', 
      '/api/test/scan/list',
      '/api/test/scan/history',
      '/api/test/port_scans',
      '/api/test/web_scans',
      '/api/test/scan_results'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}:`, typeof data === 'object' ? Object.keys(data) : data);
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testExistingScans();