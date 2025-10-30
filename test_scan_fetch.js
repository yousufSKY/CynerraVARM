// Simple test to check if backend is returning scan data
async function testScanFetch() {
  console.log('🧪 Testing scan data fetch...');
  
  try {
    // Test 1: Basic backend health
    console.log('\n1. Testing backend health...');
    const healthResponse = await fetch('http://localhost:8000/docs');
    console.log('Backend docs accessible:', healthResponse.ok);
    
    // Test 2: Test scan history endpoint
    console.log('\n2. Testing scan history endpoint...');
    const historyResponse = await fetch('http://localhost:8000/api/test/scan/history/default-asset');
    console.log('History endpoint status:', historyResponse.status);
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('History data:', JSON.stringify(historyData, null, 2));
    } else {
      const errorText = await historyResponse.text();
      console.log('History error:', errorText);
    }
    
    // Test 3: Test alternative endpoints
    console.log('\n3. Testing alternative endpoints...');
    const altResponse = await fetch('http://localhost:8000/api/test/scan/history/test-asset');
    console.log('Alternative endpoint status:', altResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScanFetch();