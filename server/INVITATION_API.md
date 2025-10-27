# Invitation System API Documentation

## Overview

This implementation adds an invitation system that allows admins (clients) to invite managers, recruiters, and employees to their tenant.

## Architecture

### Location of Components

Following industry best practices, the invitation system is organized as:

```
server/src/
├── models/platform/
│   └── invitation.py          # Invitation database model
├── schemas/platform/
│   └── invitation.py          # Request/Response schemas
├── repository/platform/
│   └── invitation.py          # Data access layer
├── services/platform/
│   └── invitation.py          # Business logic for invitations
├── services/tenant/
│   └── auth.py                # Tenant authentication service
├── repository/tenant/
│   └── user.py                # User repository (updated)
└── routes/
    ├── platform/
    │   └── client.py          # Added POST /invite endpoint
    └── tenant/
        └── auth.py            # Added POST /accept-invite endpoint
```

### Database Schema

**Invitation Model** (`public.invitations` schema):
- `id`: UUID primary key
- `client_id`: Foreign key to clients table
- `email`: Email of invitee
- `role`: Enum (EMPLOYEE, MANAGER, RECRUITER)
- `token`: JWT token for invitation
- `status`: Enum (PENDING, ACCEPTED, EXPIRED)
- `expires_at`: Expiration timestamp (7 days from creation)
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

## API Endpoints

### 1. Invite User (Admin/Client)

**Endpoint**: `POST /api/platform/invite`

**Authentication**: Required (Client JWT token)

**Request Body**:
```json
{
  "email": "user@example.com",
  "role": "employee"  // or "manager" or "recruiter"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "employee",
  "status": "pending",
  "expires_at": "2025-11-03T11:29:00Z",
  "created_at": "2025-10-27T11:29:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Client hasn't completed onboarding
- `409 Conflict`: Pending invitation already exists for this email

### 2. Accept Invitation

**Endpoint**: `POST /api/tenant/auth/accept-invite`

**Authentication**: Not required (uses invitation token)

**Request Body**:
```json
{
  "token": "jwt_invitation_token",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response** (201 Created):
```json
{
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "role": "employee"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token
- `404 Not Found`: Invitation not found
- `409 Conflict`: User already exists with this email

## Workflow

1. **Admin Invites User**:
   - Admin calls `POST /api/platform/invite` with email and role
   - System validates client has completed onboarding
   - System checks for existing pending invitations
   - System generates JWT token valid for 7 days
   - System stores invitation in database
   - (TODO: Send email with invitation link)

2. **User Accepts Invitation**:
   - User receives invitation link (with token)
   - User calls `POST /api/tenant/auth/accept-invite` with token, name, and password
   - System validates token and invitation
   - System creates user account in tenant schema with specified role
   - System creates role-specific entry (Employee/Manager/Recruiter)
   - System marks invitation as accepted
   - System returns access and refresh tokens

## Security Features

1. **Token Expiry**: Invitations expire after 7 days
2. **Password Hashing**: User passwords are hashed using bcrypt
3. **JWT Tokens**: Secure token-based authentication
4. **Role-based Access**: Only admins can send invitations
5. **Email Validation**: Pydantic email validation
6. **Status Tracking**: Prevents duplicate invitations and reuse of tokens

## Bug Fixes

### ClientService.update_subscription
- **Issue**: Method in `ClientRepository` used `get_client_by_email(id)` instead of `get_client_by_id(id)`
- **Fix**: Moved subscription update logic to service layer, removed faulty repository method
- **Impact**: Subscription updates now work correctly

## Database Migration

Run the following to apply the migration:
```bash
cd server
alembic upgrade head
```

Migration file: `alembic/versions/b1234567890a_add_invitation_table.py`

## Future Enhancements

1. **Email Notifications**: Integrate email service to send invitation links
2. **Invitation Resend**: Allow resending expired/pending invitations
3. **Bulk Invitations**: Support inviting multiple users at once
4. **Custom Expiry**: Allow setting custom expiration times
5. **Invitation Cancellation**: Allow canceling pending invitations
6. **Audit Trail**: Track who invited whom and when

## Testing

To test the implementation:

1. **Setup**:
   - Ensure database is running
   - Run migrations: `alembic upgrade head`
   - Start server: `uvicorn src.main:app --reload`

2. **Test Invite Flow**:
   ```bash
   # 1. Login as client to get token
   curl -X POST http://localhost:8000/api/platform/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"client@example.com","password":"password"}'
   
   # 2. Invite a user
   curl -X POST http://localhost:8000/api/platform/invite \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <client_token>" \
     -d '{"email":"employee@example.com","role":"employee"}'
   
   # 3. Accept invitation (use token from invite response)
   curl -X POST http://tenant.localhost:8000/api/tenant/auth/accept-invite \
     -H "Content-Type: application/json" \
     -d '{"token":"<invitation_token>","name":"John Doe","password":"password123"}'
   ```

## Code Quality

- ✅ All files pass Python syntax validation
- ✅ Follows existing repository patterns
- ✅ Proper error handling with custom exceptions
- ✅ Type hints throughout
- ✅ Async/await for database operations
- ✅ Dependency injection pattern
- ✅ RESTful API design
