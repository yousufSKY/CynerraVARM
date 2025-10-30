// Test the frontend API client workaround
const { apiClient } = require('./lib/api-client.ts');

async function testWorkaround() {
  console.log('🧪 Testing frontend API client workaround...');
  
  try {
    console.log('\n1. Testing getScans with workaround...');
    const response = await apiClient.getScans();
    
    console.log('Response:', {
      success: response.success,
      error: response.error,
      dataLength: response.data?.length || 0
    });
    
    if (response.data && response.data.length > 0) {
      console.log('\n✅ SUCCESS: Scans returned!');
      response.data.forEach((scan, index) => {
        console.log(`\nScan ${index + 1}:`, {
          id: scan.id,
          status: scan.status,
          targets: scan.targets,
          created_at: scan.created_at,
          hosts_found: scan.hosts_found,
          open_ports: scan.open_ports,
          risk_score: scan.risk_score
        });
      });
    } else {
      console.log('❌ No scans returned');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWorkaround();