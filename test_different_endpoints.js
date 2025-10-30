// Test different asset IDs and endpoints to find where the scan data is stored
async function testDifferentEndpoints() {
  console.log('🧪 Testing different API endpoints to find scan data...');
  
  const baseUrl = 'http://localhost:8000';
  const assetIds = ['default-asset', 'test-asset', 'localhost', '127.0.0.1', 'current-user'];
  
  try {
    // Test 1: Try different asset IDs
    console.log('\n1. Testing different asset IDs...');
    for (const assetId of assetIds) {
      console.log(`\n   Testing asset ID: ${assetId}`);
      const response = await fetch(`${baseUrl}/api/test/scan/history/${assetId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Result for ${assetId}:`, data.total > 0 ? `${data.total} scans found!` : 'No scans');
        
        if (data.total > 0) {
          console.log(`   First scan:`, JSON.stringify(data.scans[0], null, 2));
        }
      } else {
        console.log(`   Error for ${assetId}:`, response.status);
      }
    }
    
    // Test 2: Try production endpoints
    console.log('\n2. Testing production endpoints...');
    for (const assetId of ['default-asset', 'test-asset']) {
      console.log(`\n   Testing production endpoint for: ${assetId}`);
      const response = await fetch(`${baseUrl}/api/scan/history/${assetId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Production result for ${assetId}:`, data.total > 0 ? `${data.total} scans found!` : 'No scans');
      } else {
        console.log(`   Production error for ${assetId}:`, response.status);
      }
    }
    
    // Test 3: Check if there are any available endpoints
    console.log('\n3. Testing various scan endpoints...');
    const endpoints = [
      '/api/test/scans',
      '/api/test/scan/list',
      '/api/test/port_scans',
      '/api/test/web_scans',
      '/api/scans',
      '/scan/history',
      '/scans'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        console.log(`   ${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`     Data preview:`, typeof data === 'object' ? Object.keys(data) : data);
        }
      } catch (error) {
        console.log(`   ${endpoint}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDifferentEndpoints();