# Scan Profiles - Backend Integration

## ✅ All 5 Scan Types Supported

The backend now supports all scan profiles from the UI. The API client automatically maps frontend profile names to backend profile names.

---

## Scan Profile Mapping

| UI Display | Frontend Enum | Backend API Value | Description |
|-----------|---------------|-------------------|-------------|
| **Quick Scan** | `ScanProfile.QUICK` | `quick` | Fast port scan for common services (~30 seconds) |
| **Full Scan** | `ScanProfile.FULL` | `full` | Comprehensive port and service detection (~5 minutes) |
| **Service Detection** | `ScanProfile.SERVICE_DETECTION` | `service-detect` | Detailed service and version identification (~10 minutes) |
| **Vulnerability Scan** | `ScanProfile.VULN_SCAN` | `vulnerability` | ⚠️ Deep security vulnerability assessment (15-30 minutes) |
| **UDP Scan** | `ScanProfile.UDP_SCAN` | `udp` | UDP port and service discovery (2-5 minutes) |

---

## API Endpoint

```
POST http://localhost:8000/api/test/scan/trigger
```

### Request Body
```json
{
  "asset_id": "default-asset",
  "target": "192.168.1.1",
  "profile": "quick" | "full" | "service-detect" | "vulnerability" | "udp"
}
```

### Response
```json
{
  "scan_id": "uuid-string",
  "status": "PENDING",
  "message": "Scan initiated successfully",
  "status_url": "/api/test/scan/{scan_id}"
}
```

---

## Implementation Details

### Profile Mapping (lib/api-client.ts)
```typescript
private _mapScanProfile(profile: ScanProfile): string {
  const profileMap: Record<string, string> = {
    'quick': 'quick',
    'full': 'full',
    'service_detection': 'service-detect',
    'vuln_scan': 'vulnerability',  // ✅ NEW
    'udp_scan': 'udp',              // ✅ NEW
  };
  return profileMap[profile] || 'quick';
}
```

### UI Configuration (types/api.ts)
Each profile includes:
- Display name
- Description
- Estimated duration
- Icon reference
- Color scheme
- Typical port count

### User Warnings
- **Vulnerability Scan**: Shows yellow alert warning users about 15-30 minute scan time
- **All profiles**: Display estimated duration in dropdown
- **Background execution**: Scans run asynchronously, users can navigate away

---

## Testing

```bash
# Quick Scan
curl -X POST http://localhost:8000/api/test/scan/trigger \
  -H "Content-Type: application/json" \
  -d '{"asset_id":"default-asset","target":"192.168.1.1","profile":"quick"}'

# Vulnerability Scan
curl -X POST http://localhost:8000/api/test/scan/trigger \
  -H "Content-Type: application/json" \
  -d '{"asset_id":"default-asset","target":"192.168.1.1","profile":"vulnerability"}'

# UDP Scan
curl -X POST http://localhost:8000/api/test/scan/trigger \
  -H "Content-Type: application/json" \
  -d '{"asset_id":"default-asset","target":"192.168.1.1","profile":"udp"}'
```

---

## User Experience

1. **Scan Creation Dialog**
   - Dropdown shows all 5 profiles with descriptions and estimated times
   - Yellow warning appears when Vulnerability Scan is selected
   - "Create Scan" button disabled during submission

2. **Scan Execution**
   - Scan starts in background (status: PENDING → RUNNING)
   - User can navigate away from page
   - Statistics boxes update automatically

3. **Scan Completion**
   - Status changes to COMPLETED
   - Results appear in Recent Scans and Scan History
   - Click scan card to view detailed results in dialog

---

## Notes

- All scans run asynchronously in the background
- Vulnerability scans may take 15-30 minutes - users are warned before starting
- The frontend automatically polls for scan status updates
- Completed scan results include hosts, ports, services, and risk scores
