# Frontend API Integration

This document explains how the frontend integrates with the backend API.

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Use mock API (optional, for development without backend)
NEXT_PUBLIC_USE_MOCK_API=false
```

### Switching Between Mock and Real API

The frontend can work with or without the backend:

- **Real API**: Set `NEXT_PUBLIC_USE_MOCK_API=false` (or remove the variable)
- **Mock API**: Set `NEXT_PUBLIC_USE_MOCK_API=true`

## API Client

The API client is located in `lib/api-client.ts` and integrates with the backend endpoints defined in `API_USAGE.md`.

### Usage

```typescript
import { apiClient } from '@/lib/api';

// Create a scan
const response = await apiClient.createScan({
  targets: '192.168.1.1',
  scan_profile: ScanProfile.QUICK,
});

if (response.success) {
  console.log('Scan created:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## Endpoint Mapping

The frontend automatically uses the correct endpoints based on authentication:

| Frontend Method | Authenticated Endpoint | Test Endpoint |
|----------------|----------------------|---------------|
| `createScan()` | `POST /api/scan` | `POST /api/test/scan` |
| `getScans()` | `GET /api/scans` | `GET /api/test/scans` |
| `getScan(id)` | `GET /api/scan/{id}` | `GET /api/test/scan/{id}` |

## Authentication

The frontend uses Clerk for authentication and passes Firebase tokens to the backend:

1. User signs in with Clerk
2. `ApiProvider` obtains Firebase token from Clerk
3. Token is automatically added to API requests via `Authorization: Bearer {token}`
4. Backend validates the token using Firebase Admin SDK

### Test Endpoints (No Auth)

When no authentication token is available, the API client automatically uses test endpoints (`/api/test/*`) which don't require authentication.

## Scan Profile Mapping

Frontend profiles are mapped to backend profiles:

| Frontend Profile | Backend Profile |
|-----------------|----------------|
| `quick` | `quick` |
| `full` | `full` |
| `service_detection` | `service-detect` |
| `vuln_scan` | `quick` |
| `udp_scan` | `quick` |

## Error Handling

The API client includes automatic error handling:

- **401 Unauthorized**: Automatically refreshes token and retries
- **Network Errors**: Returns formatted error messages
- **Validation Errors**: Returns backend error details

## Development

### Testing Without Backend

Set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local` to use mock data without running the backend.

### Testing With Backend

1. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Set `NEXT_PUBLIC_USE_MOCK_API=false` in `.env.local`

3. Start the frontend:
   ```bash
   npm run dev
   ```

## API Response Types

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
```

Check `response.success` before accessing `response.data`.

## See Also

- [Backend API Documentation](./API_USAGE.md)
- [Type Definitions](./types/api.ts)
- [API Client Implementation](./lib/api-client.ts)
