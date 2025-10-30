# Backend API Usage Guide

## **Backend API Base URL**
```
http://localhost:8000
```

## **Available Endpoints**

### **Test Endpoints (No Authentication Required)**
- **Create Scan**: `POST http://localhost:8000/api/test/scan`
- **Get Scan Status**: `GET http://localhost:8000/api/test/scan/{scan_id}`
- **List Scans**: `GET http://localhost:8000/api/test/scans?asset_id={asset_id}`

### **Production Endpoints (Require Firebase Authentication)**
- **Create Scan**: `POST http://localhost:8000/api/scan`
- **Get Scan Status**: `GET http://localhost:8000/api/scan/{scan_id}`
- **List Scans**: `GET http://localhost:8000/api/scans?asset_id={asset_id}`

## **API Documentation**
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## **For Your Frontend/Mobile App**

### **Base URL**
```
http://localhost:8000
```

### **Example API Calls**

#### **Test Endpoint (No Auth Required)**
```javascript
fetch('http://localhost:8000/api/test/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asset_id: 'test-localhost',
    target: '192.168.1.1',
    profile: 'quick'
  })
})
.then(res => res.json())
.then(data => console.log('Scan created:', data))
.catch(err => console.error('Error:', err));
```

#### **Production Endpoint (Requires Firebase Token)**
```javascript
fetch('http://localhost:8000/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_FIREBASE_ID_TOKEN'
  },
  body: JSON.stringify({
    asset_id: 'test-localhost',
    target: '192.168.1.1',
    profile: 'quick'
  })
})
.then(res => res.json())
.then(data => console.log('Scan created:', data))
.catch(err => console.error('Error:', err));
```

#### **Get Scan Status**
```javascript
fetch('http://localhost:8000/api/test/scan/{scan_id}')
  .then(res => res.json())
  .then(data => console.log('Scan status:', data))
  .catch(err => console.error('Error:', err));
```

#### **List All Scans for an Asset**
```javascript
fetch('http://localhost:8000/api/test/scans?asset_id=test-localhost')
  .then(res => res.json())
  .then(data => console.log('Scans:', data))
  .catch(err => console.error('Error:', err));
```

---

## **Request/Response Examples**

### **Create Scan Request**
```json
{
  "asset_id": "test-localhost",
  "target": "192.168.1.1",
  "profile": "quick"
}
```

**Available Profiles:**
- `quick` - Fast scan (ports 1-1024)
- `full` - Complete scan (all ports)
- `service-detect` - Service version detection

### **Create Scan Response**
```json
{
  "scan_id": "abc123def456",
  "status": "queued",
  "message": "Scan queued successfully"
}
```

### **Get Scan Status Response**
```json
{
  "scan_id": "abc123def456",
  "asset_id": "test-localhost",
  "target": "192.168.1.1",
  "profile": "quick",
  "status": "completed",
  "created_at": "2025-10-28T10:30:00Z",
  "started_at": "2025-10-28T10:30:05Z",
  "completed_at": "2025-10-28T10:32:15Z",
  "scan_results": [
    {
      "port": 80,
      "protocol": "tcp",
      "state": "open",
      "service": "http",
      "product": "Apache",
      "version": "2.4.41",
      "risk_score": 5,
      "recommendations": ["Update to latest version"]
    }
  ],
  "summary": {
    "total_ports": 1024,
    "open_ports": 3,
    "closed_ports": 1021,
    "filtered_ports": 0,
    "avg_risk_score": 4.5,
    "scan_duration_seconds": 130
  }
}
```

---

## **Python Example**

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000"

# Create a scan (test endpoint)
response = requests.post(
    f"{BASE_URL}/api/test/scan",
    json={
        "asset_id": "test-localhost",
        "target": "192.168.1.1",
        "profile": "quick"
    }
)
scan = response.json()
scan_id = scan['scan_id']
print(f"Scan created: {scan_id}")

# Check scan status
import time
while True:
    response = requests.get(f"{BASE_URL}/api/test/scan/{scan_id}")
    status = response.json()
    print(f"Status: {status['status']}")
    
    if status['status'] in ['completed', 'failed']:
        print("Scan finished!")
        print(f"Results: {status.get('scan_results', [])}")
        break
    
    time.sleep(5)  # Wait 5 seconds before checking again
```

---

## **Flutter/Dart Example**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ScanAPI {
  static const String baseUrl = 'http://localhost:8000';
  
  // Create scan
  Future<Map<String, dynamic>> createScan({
    required String assetId,
    required String target,
    required String profile,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/test/scan'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'asset_id': assetId,
        'target': target,
        'profile': profile,
      }),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create scan');
    }
  }
  
  // Get scan status
  Future<Map<String, dynamic>> getScanStatus(String scanId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/test/scan/$scanId'),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get scan status');
    }
  }
}
```

---

## **Production Deployment Notes**

When deploying to production:

1. **Change Base URL**: Replace `http://localhost:8000` with your production domain
   - Example: `https://api.cynerra.com`

2. **Enable CORS**: Update `app/main.py` to allow your frontend domain
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Use HTTPS**: Always use HTTPS in production for security

4. **Environment Variables**: Set production environment variables
   - Firebase credentials
   - Allowed IP ranges
   - API rate limits

5. **Authentication**: Use the production endpoints (`/api/scan`) with Firebase tokens
