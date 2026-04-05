# CCTV System API Architecture

## Problem You Had
Your frontend and backend were using **incompatible authentication approaches**:

1. **Frontend** (`templates/js/config.js`):
   - Uses modern SPA pattern
   - Calls `/api/v1/auth/login` (REST API expecting JSON)
   - Stores JWT tokens in localStorage
   - Tries to make subsequent API calls with Bearer tokens

2. **Backend** (original):
   - Traditional Django form-based login at `/login/`
   - Uses Django sessions
   - Returns HTML redirects, not JSON
   - URL at `/api/token/` existed but wasn't being used

3. **Result**:
   - Frontend call to `/api/v1/auth/login` returned 404
   - Frontend's fallback logic kicked in
   - Page redirected immediately (appeared to "disappear")

---

## Solution Implemented

### New API Endpoint
**Location**: [dashboard/views.py](dashboard/views.py#L24-L47)

```python
@api_view(['POST'])
def api_login(request):
    """REST API endpoint for user login"""
    # Accepts: {"username": "user@email.com", "password": "pass123"}
    # Returns: {"access_token": "...", "refresh_token": "...", "user": {...}}
```

### URL Mapping
**Location**: [dashboard/urls.py](dashboard/urls.py#L4-L5)

```python
path('api/v1/auth/login', views.api_login, name='api_login'),
```

---

## API Endpoints Now Available

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/auth/login` | User login (new REST endpoint) |
| `POST` | `/api/token/` | JWT token obtain (from simplejwt) |
| `POST` | `/api/token/refresh/` | Refresh JWT token (from simplejwt) |

### Legacy Routes (still work)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/login/` | Form-based login (Django session) |
| `GET` | `/admin-dashboard/` | Admin interface |
| `GET` | `/officer-dashboard/` | Officer interface |

---

## How Frontend Now Works

1. User submits login form in `index.html`
2. `auth.js` calls: `POST /api/v1/auth/login` with JSON credentials
3. Backend returns JWT tokens + user data
4. Frontend stores tokens in localStorage
5. Frontend navigates to appropriate dashboard
6. Page no longer disappears!

---

## Testing the Login

### Test with cURL:
```bash
curl -X POST http://10.251.83.27:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

### Expected Response:
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@cctv.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

---

## Summary of Changes

| File | Change |
|------|--------|
| [dashboard/views.py](dashboard/views.py#L14-L47) | Added DRF imports + new `api_login()` function |
| [dashboard/urls.py](dashboard/urls.py#L4-L5) | Added route `api/v1/auth/login/` → `api_login view` |

## No Breaking Changes
- Existing form-based login still works
- Django admin untouched
- JWT endpoints untouched
- All session-based views still functional
