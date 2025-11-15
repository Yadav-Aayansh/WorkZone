# OpenAPI Specification Summary

**Generated**: 2025-11-15T18:54:58.955918+00:00

**OpenAPI Version**: 3.1.0

**API Version**: ca2ba82

**Title**: WorkZone API

## Statistics

- **Total Endpoints**: 27
- **Total Schemas**: 24
- **Security Schemes**: 1
- **Tags**: 11

## Endpoints

| Method | Path | Summary | Success Code | Auth Required | Role |
|--------|------|---------|--------------|---------------|------|
| POST | `/api/platform/auth/signup` | Register new client | 201 | No | Client |
| POST | `/api/platform/auth/login` | Client login | 200 | No | Client |
| POST | `/api/platform/auth/refresh` | Refresh access token | 200 | No | Client |
| POST | `/api/platform/onboarding` | Complete client onboarding | 200 | Yes | Client |
| GET | `/api/platform/tenant-availability` | Check tenant ID availability | 200 | No | Client |
| GET | `/api/platform/subscription` | Create subscription order | 200 | Yes | Client |
| POST | `/api/platform/subscription` | Update subscription order | 200 | No | Client |
| POST | `/api/platform/invite` | Invite user to workspace | 200 | Yes | Client |
| POST | `/api/tenant/auth/signup` | Tenant user signup | 201 | No | Tenant User |
| POST | `/api/tenant/auth/signup/invited` | Complete invited signup | 201 | No | Tenant User |
| POST | `/api/tenant/auth/login` | Tenant user login | 200 | No | Tenant User |
| POST | `/api/tenant/auth/refresh` | Refresh tenant token | 200 | No | Tenant User |
| GET | `/api/tenant/config` | Get tenant configuration | 200 | No | Any |
| POST | `/api/tenant/jobs` | Create job posting | 201 | Yes | Tenant User |
| GET | `/api/tenant/jobs` | List job postings | 200 | No | Tenant User |
| GET | `/api/tenant/jobs/{job_id}` | Get job details | 200 | No | Tenant User |
| PATCH | `/api/tenant/jobs/{job_id}` | Update job posting | 200 | Yes | Tenant User |
| DELETE | `/api/tenant/jobs/{job_id}` | Delete job posting | 204 | Yes | Tenant User |
| POST | `/api/tenant/jobs/{job_id}/close` | Close job posting | 200 | Yes | Tenant User |
| POST | `/api/tenant/jobs/ai/enhance-description` | AI-enhance job description | 200 | No | Tenant User |
| POST | `/api/tenant/jobs/{job_id}/apply` | Apply to job | 200 | Yes | Tenant User |
| GET | `/api/tenant/jobs/{job_id}/applications` | List job applications | 200 | Yes | Tenant User |
| GET | `/api/tenant/applications` | Get my applications | 200 | Yes | Tenant User |
| GET | `/api/tenant/applications/{application_id}` | Get application details | 200 | Yes | Tenant User |
| DELETE | `/api/tenant/applications/{application_id}/withdraw` | Withdraw application | 200 | Yes | Tenant User |
| GET | `/api/tenant/recruiter/me` | Get recruiter profile | 200 | Yes | Recruiter |
| GET | `/api/tenant/manager/me` | Get manager profile | 200 | Yes | Manager |
| GET | `/api/tenant/employee/me` | Get employee profile | 200 | Yes | Employee |
| GET | `/api/tenant/applicant/me` | Get applicant profile | 200 | Yes | Applicant |
| POST | `/api/tenant/ai-interview` | Create AI interview session | 200 | No | Tenant User |
| GET | `/api/tenant/test` | Test endpoint | 200 | No | Any |

## Inferred Items

The following response schemas were inferred from service method returns and may require manual review:

- `POST /api/platform/onboarding` - Response structure inferred from service method
- `GET /api/platform/tenant-availability` - Availability check response inferred
- `GET /api/platform/subscription` - Order creation response inferred
- `POST /api/platform/subscription` - Order update response inferred
- `POST /api/platform/invite` - Invitation response inferred
- `GET /api/tenant/config` - Configuration response inferred from service
- `GET /api/tenant/recruiter/me` - Profile structure inferred (no explicit schema)
- `GET /api/tenant/manager/me` - Profile structure inferred (no explicit schema)
- `GET /api/tenant/employee/me` - Profile structure inferred (no explicit schema)
- `GET /api/tenant/applicant/me` - Profile structure inferred (no explicit schema)
- `POST /api/tenant/ai-interview` - AI interview session response inferred

## Notes

- All inferred schemas are marked with `x-inferred: true` in the OpenAPI specification
- Profile endpoints (`/me`) return similar structures but may have role-specific additional fields
- The AI interview endpoint includes a WebSocket endpoint at `/api/tenant/ai-interview/ws/{ai_interview_id}` (not included in OpenAPI spec as WebSocket endpoints are not fully supported in OpenAPI 3.x)
- Tenant-scoped endpoints require the `X-Tenant-Id` header for tenant resolution
- All authenticated endpoints use JWT Bearer token authentication

## Review Recommendations

1. **Verify inferred response schemas** - Compare with actual service responses
2. **Add response examples** - Provide realistic examples for all inferred responses
3. **Document WebSocket protocol** - Add external documentation for AI interview WebSocket communication
4. **Validate error responses** - Ensure all error codes match actual API behavior
5. **Add rate limiting documentation** - If rate limiting is implemented, document it
