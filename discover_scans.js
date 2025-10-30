// Try to discover all scan IDs by testing common patterns or endpoints
async function discoverAllScans() {
  console.log('🧪 Discovering all available scan IDs...');
  
  const baseUrl = 'http://localhost:8000';
  
  // From the Firestore screenshot, I can see several scan IDs (partial ones)
  const partialScanIds = [
    'cbeb7be3-366d-4112-ad0f-a9080d4d390e', // Known working
    '01c45a65-3988-430f-a341-4a56',
    'b6827948-781a-470d-b6af-6b9a', 
    'd509bd7e-8e83-41d3-8a6d-0373',
    'ed90bf80-724c-476b-96d4-7675'
  ];
  
  // Try to complete the partial IDs by generating possible endings
  const possibleEndings = [
    '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'a', 'b', 'c', 'd', 'e', 'f',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '10',
    'aa', 'ab', 'ac', 'ad', 'ae', 'af',
    '111', '222', '333', '444', '555', '666', '777', '888', '999', '000'
  ];
  
  const validScans = [];
  
  try {
    console.log('\n1. Testing known complete scan ID...');
    const knownScan = 'cbeb7be3-366d-4112-ad0f-a9080d4d390e';
    const response = await fetch(`${baseUrl}/api/test/scan/${knownScan}`);
    if (response.ok) {
      const data = await response.json();
      validScans.push({
        id: knownScan,
        status: data.status,
        target: data.target,
        created_at: data.created_at
      });
      console.log(`✅ ${knownScan}: ${data.status}`);
    }
    
    console.log('\n2. Testing partial scan IDs with common endings...');
    
    for (const partialId of partialScanIds.slice(1)) { // Skip the known working one
      console.log(`\n   Testing variations of ${partialId}...`);
      
      // Try different lengths by assuming the IDs might be truncated at different points
      const basePatterns = [
        partialId, // As is
        partialId + '4d', // Common pattern completion
        partialId + '4d39', 
        partialId + '4d390e',
        partialId.slice(0, -1), // Remove last char in case it's extra
        partialId.slice(0, -2), // Remove last 2 chars
      ];
      
      for (const basePattern of basePatterns) {
        for (const ending of possibleEndings.slice(0, 10)) { // Test first 10 endings
          const testId = basePattern + ending;
          
          // Only test if it looks like a valid UUID format
          if (testId.length >= 32 && testId.includes('-')) {
            try {
              const testResponse = await fetch(`${baseUrl}/api/test/scan/${testId}`);
              if (testResponse.ok) {
                const testData = await testResponse.json();
                validScans.push({
                  id: testId,
                  status: testData.status,
                  target: testData.target,
                  created_at: testData.created_at
                });
                console.log(`   ✅ Found: ${testId} (${testData.status})`);
                break; // Found a valid one, stop trying endings for this base
              }
            } catch (error) {
              // Ignore errors, continue testing
            }
          }
        }
      }
    }
    
    console.log('\n3. Trying alternative discovery methods...');
    
    // Method 1: Try recent timestamp-based scan IDs (common UUID pattern)
    const recentTimePatterns = [
      '2025-10-30', '2025-10-29', '2025-10-28'
    ];
    
    // Method 2: Try sequential patterns if they use incremental IDs
    console.log('   Testing sequential patterns...');
    
    // Method 3: Check if there's a scan listing endpoint we missed
    const alternativeEndpoints = [
      '/api/test/scan',
      '/api/test/scans', 
      '/api/test/scan/all',
      '/api/test/scan/list',
      '/api/test/docs',
      '/api/test/admin/scans',
      '/api/test/debug/scans'
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Found endpoint ${endpoint}:`, typeof data === 'object' ? Object.keys(data) : data);
          
          // Check if it contains scan IDs
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (typeof item === 'object' && (item.scan_id || item.id)) {
                console.log(`      Found scan ID: ${item.scan_id || item.id}`);
              }
            });
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    console.log(`\n📊 Summary: Found ${validScans.length} valid scans:`);
    validScans.forEach(scan => {
      console.log(`   ${scan.id} - ${scan.status} - ${scan.target} - ${scan.created_at}`);
    });
    
    return validScans;
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
    return [];
  }
}

// Run the discovery
discoverAllScans();