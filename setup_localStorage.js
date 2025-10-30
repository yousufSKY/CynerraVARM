// Pre-populate localStorage with the known scan ID to test the workaround
console.log('🔧 Pre-populating localStorage with known scan IDs...');

// Add the known working scan ID
const knownScanIds = [
  'cbeb7be3-366d-4112-ad0f-a9080d4d390e'
];

try {
  localStorage.setItem('recent_scan_ids', JSON.stringify(knownScanIds));
  console.log('✅ Successfully added scan IDs to localStorage');
  console.log('Stored IDs:', knownScanIds);
} catch (error) {
  console.error('❌ Failed to set localStorage:', error);
}

// Now test fetching the scans
console.log('\n🧪 Testing scan fetch after populating localStorage...');

// Import and test the API client (this would work in the browser)
console.log('Note: Full test needs to be run in browser context with proper module imports');
console.log('localStorage is now populated with known scan IDs');