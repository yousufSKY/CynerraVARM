// Test scan creation to populate the backend with data
async function testScanCreation() {
  console.log('🧪 Testing scan creation...');
  
  try {
    // Test creating a scan
    console.log('\n1. Creating a test scan...');
    const scanRequest = {
      asset_id: 'default-asset',
      target: '192.168.1.1',
      profile: 'quick'
    };
    
    const createResponse = await fetch('http://localhost:8000/api/test/scan/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scanRequest)
    });
    
    console.log('Scan creation status:', createResponse.status);
    
    if (createResponse.ok) {
      const scanData = await createResponse.json();
      console.log('Created scan:', JSON.stringify(scanData, null, 2));
      
      // Wait a moment for the scan to process
      console.log('\n2. Waiting 3 seconds for scan to process...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check scan history again
      console.log('\n3. Checking scan history after creation...');
      const historyResponse = await fetch('http://localhost:8000/api/test/scan/history/default-asset');
      const historyData = await historyResponse.json();
      console.log('Updated history:', JSON.stringify(historyData, null, 2));
      
    } else {
      const errorText = await createResponse.text();
      console.log('Creation error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScanCreation();