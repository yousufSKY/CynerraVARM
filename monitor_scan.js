// Monitor scan until completion and check if it appears in history
async function monitorScanCompletion() {
  console.log('🧪 Monitoring scan completion...');
  
  const baseUrl = 'http://localhost:8000';
  const scanId = '9eea4c03-0eb4-4afa-8980-029ace64a27d'; // From previous test
  const assetId = 'test-frontend-asset';
  
  try {
    console.log(`\n📊 Monitoring scan ${scanId}...`);
    
    // Check scan status every 5 seconds for up to 2 minutes
    for (let i = 0; i < 24; i++) { // 24 * 5 = 120 seconds
      console.log(`\n⏰ Check ${i + 1}/24 (${(i + 1) * 5} seconds):`);
      
      // Get scan details
      const scanResponse = await fetch(`${baseUrl}/api/test/scan/${scanId}`);
      if (scanResponse.ok) {
        const scanData = await scanResponse.json();
        console.log(`   Status: ${scanData.status}`);
        console.log(`   Started: ${scanData.started_at}`);
        console.log(`   Finished: ${scanData.finished_at || 'Not finished'}`);
        
        // If scan is completed, check if it appears in history
        if (scanData.status === 'COMPLETED' || scanData.status === 'FAILED') {
          console.log(`\n🎯 Scan ${scanData.status}! Checking scan history...`);
          
          const historyResponse = await fetch(`${baseUrl}/api/test/scan/history/${assetId}`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log(`   History total: ${historyData.total}`);
            
            if (historyData.total > 0) {
              console.log('✅ SUCCESS: Completed scan appears in history!');
              console.log('   Scan in history:', JSON.stringify(historyData.scans[0], null, 2));
              return;
            } else {
              console.log('❌ ISSUE: Completed scan still not in history');
              
              // Try checking under default-asset
              const defaultHistoryResponse = await fetch(`${baseUrl}/api/test/scan/history/default-asset`);
              if (defaultHistoryResponse.ok) {
                const defaultHistoryData = await defaultHistoryResponse.json();
                console.log(`   Default asset history total: ${defaultHistoryData.total}`);
                
                if (defaultHistoryData.total > 0) {
                  console.log('   Found in default asset!');
                  return;
                }
              }
            }
            return;
          }
        }
        
        // If still running, wait and continue
        if (scanData.status === 'RUNNING' || scanData.status === 'PENDING') {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // If failed or cancelled, stop monitoring
        console.log(`   Scan ended with status: ${scanData.status}`);
        break;
      } else {
        console.log(`   Failed to get scan details: ${scanResponse.status}`);
        break;
      }
    }
    
    console.log('\n⏰ Monitoring timeout reached');
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
  }
}

// Run the monitor
monitorScanCompletion();