// Test creating a scan and immediately checking if it appears in scan history
async function testScanWorkflow() {
  console.log('🧪 Testing complete scan workflow...');
  
  const baseUrl = 'http://localhost:8000';
  
  try {
    // Step 1: Create a scan
    console.log('\n1. Creating a test scan...');
    const scanRequest = {
      asset_id: 'test-frontend-asset',
      target: '192.168.1.100',
      profile: 'quick'
    };
    
    const createResponse = await fetch(`${baseUrl}/api/test/scan/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanRequest)
    });
    
    if (!createResponse.ok) {
      console.log('❌ Failed to create scan:', createResponse.status);
      const errorText = await createResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const scanData = await createResponse.json();
    console.log('✅ Scan created:', scanData);
    
    // Step 2: Wait a moment and check history
    console.log('\n2. Waiting 2 seconds and checking scan history...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const historyResponse = await fetch(`${baseUrl}/api/test/scan/history/test-frontend-asset`);
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('📊 Scan history for test-frontend-asset:', historyData);
      
      if (historyData.total > 0) {
        console.log('✅ SUCCESS: Scan appears in history!');
        console.log('Latest scan:', JSON.stringify(historyData.scans[0], null, 2));
      } else {
        console.log('❌ Scan created but not appearing in history');
      }
    }
    
    // Step 3: Also check if it appears under default-asset
    console.log('\n3. Checking if scan appears under default-asset...');
    const defaultHistoryResponse = await fetch(`${baseUrl}/api/test/scan/history/default-asset`);
    if (defaultHistoryResponse.ok) {
      const defaultHistoryData = await defaultHistoryResponse.json();
      console.log('📊 Scan history for default-asset:', defaultHistoryData);
    }
    
    // Step 4: Check the specific scan ID
    if (scanData.scan_id) {
      console.log(`\n4. Getting specific scan details for ${scanData.scan_id}...`);
      const scanDetailResponse = await fetch(`${baseUrl}/api/test/scan/${scanData.scan_id}`);
      if (scanDetailResponse.ok) {
        const scanDetail = await scanDetailResponse.json();
        console.log('📋 Scan details:', JSON.stringify(scanDetail, null, 2));
      } else {
        console.log('❌ Failed to get scan details:', scanDetailResponse.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScanWorkflow();