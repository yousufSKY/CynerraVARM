// Enhanced scan discovery - let's test if there are any endpoints that might give us scan IDs
async function enhancedScanDiscovery() {
  console.log('🔍 Enhanced scan discovery...');
  
  const baseUrl = 'http://localhost:8000';
  const foundScanIds = [];
  
  try {
    // Method 1: Try to find any endpoints that might list scans
    console.log('\n1. Testing various list endpoints...');
    
    const possibleListEndpoints = [
      '/api/test/scans',
      '/api/test/scan/list', 
      '/api/test/port_scans',
      '/api/test/web_scans',
      '/api/test/scan_results',
      '/api/test/port_scan_results',
      '/api/test/web_scan_results',
      '/api/test/scan/all',
      '/api/test/assets',
      '/api/test/status',
      '/api/test/health',
      '/api/test',
      '/status',
      '/health'
    ];
    
    for (const endpoint of possibleListEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}:`, typeof data === 'object' ? Object.keys(data) : 'Success');
          
          // Check if the response contains scan IDs
          const dataStr = JSON.stringify(data);
          const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
          const matches = dataStr.match(uuidRegex);
          
          if (matches) {
            console.log(`   Found UUIDs in response: ${matches.length}`);
            foundScanIds.push(...matches);
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Method 2: Try the OpenAPI spec to see available endpoints
    console.log('\n2. Checking OpenAPI spec for available endpoints...');
    try {
      const openApiResponse = await fetch(`${baseUrl}/openapi.json`);
      if (openApiResponse.ok) {
        const openApiData = await openApiResponse.json();
        console.log('Available paths:', Object.keys(openApiData.paths || {}));
        
        // Look for any scan-related endpoints we might have missed
        const paths = Object.keys(openApiData.paths || {});
        const scanEndpoints = paths.filter(path => 
          path.includes('scan') || path.includes('port') || path.includes('web')
        );
        
        console.log('Scan-related endpoints:', scanEndpoints);
        
        // Try any new scan endpoints we find
        for (const endpoint of scanEndpoints) {
          if (!possibleListEndpoints.includes(endpoint)) {
            try {
              const response = await fetch(`${baseUrl}${endpoint}`);
              if (response.ok) {
                console.log(`✅ New endpoint ${endpoint}: ${response.status}`);
              }
            } catch (error) {
              // Ignore
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get OpenAPI spec:', error.message);
    }
    
    // Method 3: Try to guess scan IDs based on timestamp patterns
    console.log('\n3. Trying to discover scans by timestamp patterns...');
    
    // Since scans have timestamps, try to find scans created around the current time
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Try some UUID patterns (this is a long shot, but worth trying)
    const commonPrefixes = ['cbeb7be3', '01c45a65', 'b6827948', 'd509bd7e', 'ed90bf80'];
    
    for (const prefix of commonPrefixes) {
      // Try to complete the UUID with different endings
      for (let i = 0; i < 10; i++) {
        const testId = `${prefix}-366d-4112-ad0f-a9080d4d390${i}`;
        
        try {
          const response = await fetch(`${baseUrl}/api/test/scan/${testId}`);
          if (response.ok) {
            foundScanIds.push(testId);
            console.log(`✅ Found scan by pattern: ${testId}`);
          }
        } catch (error) {
          // Ignore
        }
      }
    }
    
    // Remove duplicates
    const uniqueScanIds = [...new Set(foundScanIds)];
    
    console.log(`\n📊 Discovery Summary:`);
    console.log(`   Total unique scan IDs found: ${uniqueScanIds.length}`);
    
    if (uniqueScanIds.length > 0) {
      console.log('\n🎯 Found scan IDs:');
      for (const scanId of uniqueScanIds) {
        try {
          const scanResponse = await fetch(`${baseUrl}/api/test/scan/${scanId}`);
          if (scanResponse.ok) {
            const scanData = await scanResponse.json();
            console.log(`   ${scanId}: ${scanData.status} - ${scanData.target} (${scanData.created_at})`);
          }
        } catch (error) {
          console.log(`   ${scanId}: Failed to get details`);
        }
      }
    }
    
    return uniqueScanIds;
    
  } catch (error) {
    console.error('❌ Enhanced discovery failed:', error.message);
    return [];
  }
}

// Run the enhanced discovery
enhancedScanDiscovery();