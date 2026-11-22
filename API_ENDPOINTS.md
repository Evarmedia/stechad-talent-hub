# STECHAD API Integration Status

## Organization context and sessions

`VITE_BACKEND_URL` includes the `/api` prefix. Authenticated calls send `Authorization: Bearer <access token>`. HR calls also send `X-Organization-ID: <organization UUID>` from the current tab's selection. The server validates active membership and HR access on each protected request. Conflicting organization IDs in a body or query are rejected; a header never grants access on its own. A single active membership may be inferred when no header is supplied. Multiple active memberships require explicit selection for HR calls.

Global identity endpoints (login, refresh, `/auth/me`, password operations) do not require an HR selection. Organization-management routes use the organization ID in the URL and the caller's active owner/admin membership; HR roles and grants do not confer organization-management authority. Owners alone may alter owner memberships, including through legacy HR lifecycle routes, and the final active owner cannot leave, be suspended, removed or demoted.

Successful `POST /auth/login`, signup and `GET /auth/me` return the session envelope below. Login/signup also include `data.token` and `data.refreshToken`.

```json
{
  "success": true,
  "data": {
    "user": { "user_id": "...", "role": "staff", "role_details": {}, "effective_permissions": [] },
    "organizations": [{ "organization_id": "...", "name": "Example", "slug": "example", "status": "active", "membership_id": "...", "membership_role": "member", "membership_status": "active" }],
    "active_organization_id": "..."
  }
}
```

`data.user` combines global identity with the selected organization's HR role, grants and employment fields. With multiple memberships and no selection, `active_organization_id` and `user.role` are null, `role_details` is null and `effective_permissions` is empty. A member without HR access may still manage an organization if their membership permits it; membership authority must not be inferred from HR role fields.

The API service stores only the selected ID in `sessionStorage.stechad_organization_id`; access/refresh tokens remain in localStorage. `stechad_user` stores only `{user_id}` for cross-tab identity signals. The authenticated server session is the source of HR authority. Switching disconnects sockets, clears tenant providers/query state, selects the ID, then fetches `/auth/me` before rendering HR content. Request revisions reject responses from a prior selection with the client-only `ORGANIZATION_CHANGED` code. Tabs can select different organizations independently. Socket.IO connects with `auth: {token, organization_id}` and accepts tenant events only for that selected organization.

| Status / code | Meaning and client handling |
| --- | --- |
| `400` | Malformed organization UUID or conflicting organization input; correct the request. |
| `409 ORGANIZATION_REQUIRED` | Several active memberships and no selected organization; return to selection. |
| `403 MEMBERSHIP_UNAVAILABLE` | No active membership in an active organization, including suspension/removal; reload the organization session and selection. |
| `403 HR_PROFILE_REQUIRED` | Membership exists but its HR profile/role is unavailable; reload selection without treating this as global logout. |
| `409 LAST_OWNER_REQUIRED` | Membership change would remove/demote the last active owner. |
| `403 ORGANIZATION_CREATION_DISABLED` | Creation is gated by server configuration. |
| `401` | Missing/invalid global authentication; refresh once where applicable, then sign in again. |

The API interceptor dispatches `stechad:organization-unavailable` for the three membership/selection codes above, preserving the global login while reloading selection. Other `403` responses remain ordinary permission denials. Normalized API errors retain `status`, `code`, `message`, and optional `errors`/`blockers`.

### Organization APIs (`/api/organizations`)

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/` | Returns `data.organizations`, the caller's active organizations. |
| POST | `/` | `{name, slug}`; returns `data.organization` and owner `data.membership`. Disabled by default; the creator receives a basic staff HR profile, without wildcard HR grants. |
| GET / PATCH | `/:organizationId` | Returns `data.organization`; PATCH accepts `{name?, settings?}` and requires owner/admin membership. |
| GET | `/:organizationId/members` | Owner/admin membership required; returns `data.members`. |
| PATCH | `/:organizationId/members/:membershipId` | `{status?, membership_role?}`; statuses are `active`, `suspended`, `removed`, roles are `owner`, `admin`, `member`; returns `data.membership`. |
| DELETE | `/:organizationId/members/:membershipId` | Marks membership removed while preserving global identity and history. |
| POST | `/:organizationId/leave` | Leaves own membership, subject to final-owner protection. |
| POST | `/:organizationId/invitations` | `{email, role_id, membership_role?, first_name?, last_name?, department_id?, job_title?}`; returns `201` with safe `data.invitation`, never its bearer token or digest. HR role/department must belong to the addressed organization. |

### Invitation acceptance

The emailed link is `/accept-invite?token=<single-use bearer>`. This query token is an invitation credential, so the page never installs it as the global access token. Submit `POST /api/auth/accept-invite/:token`.

- An existing account must sign in with the matching normalized, verified email, then submit `{}` with its Bearer access token. Acceptance preserves its password and existing organizations. An unauthenticated existing account receives `401`; a wrong or unverified identity receives `403`.
- A new account submits `{new_password, confirm_password, first_name?, last_name?}`. The emailed token verifies the new email and the server validates the password. Existing accounts' passwords cannot be replaced through this path.
- Success returns `201` with `data.organization_id` and `data.membership_id`. The frontend reloads that organization's session; a new user signs in after acceptance. Expired, invalid or consumed tokens return `400`. Tokens expire after one hour and concurrent/repeated acceptance succeeds only once.

Registered uploaded avatars are shared with colleagues only within their owning organization. Other organizations cannot sign those files even if a shared global User references the same avatar path; unregistered legacy references retain validated membership compatibility. CVs/receipts retain owner and HR-permission checks.

## ✅ Completed Integrations

### Authentication (`/api/auth`)
- ✅ POST /signup - User registration with JWT tokens
- ✅ POST /login - User authentication
- ✅ POST /logout - User logout
- ✅ GET /me - Get current user profile
- ✅ Token storage and state management (localStorage)
- ✅ Automatic token refresh handling
- ✅ 401 redirect to login

### Jobs (`/api/jobs` & `/api/pm/jobs`)
- ✅ GET / - List all jobs with filtering
- ✅ GET /:jobs_id - Get job details
- ✅ POST /pm/jobs - Create job (PM)
- ✅ PUT /update/:jobs_id - Update job
- ✅ DELETE /:jobs_id - Delete job
- ✅ Pagination support
- ✅ Advanced filtering (status, location, skills, etc.)

### Applications (`/api/applications` & `/api/talents/jobs`)
- ✅ GET / - List applications with filters
- ✅ GET /:applications_id - Get application details
- ✅ POST /talents/jobs/:job_id/apply - Submit application
- ✅ PUT /:applications_id/status - Update application status
- ✅ DELETE /:applications_id - Delete application
- ✅ GET /jobs/:job_id/applicants - Get job applicants

### Talents (`/api/admin/talents` & `/api/talents`)
- ✅ GET /admin/talents - List all talents
- ✅ GET /admin/talents/:id - Get talent details
- ✅ PUT /admin/talents/:id - Update talent
- ✅ DELETE /admin/talents/:id - Delete talent
- ✅ POST /talents/onboarding - Complete onboarding
- ✅ PUT /talents/profile - Update profile with files
- ✅ GET /talents/dashboard - Get dashboard data

### Project Managers (`/api/admin/project-managers` & `/api/pm`)
- ✅ GET /admin/project-managers - List all PMs
- ✅ GET /admin/project-managers/:id - Get PM details
- ✅ DELETE /admin/project-managers/:id - Delete PM
- ❌ POST /admin/project-managers/invite - Invite PM
- ✅ PUT /pm/profile - Update PM profile
- ✅ GET /pm/dashboard - Get PM dashboard

### Projects (`/api/projects`)
- ✅ GET / - List projects with filters
- ✅ GET /:projects_id - Get project details
- ✅ POST / - Create project
- ✅ PUT /:projects_id - Update project
- ✅ DELETE /:projects_id - Delete project
- ✅ Filtering by status, priority, PM, talent

### Notifications (`/api/notifications`)
- ✅ GET / - Get user notifications
- ✅ PUT /:id/read - Mark as read
- ✅ PUT /read-all - Mark all as read
- ✅ Unread count tracking

### Referrals (`/api/referrals`)
- ✅ GET /dashboard - Get referral dashboard
- ✅ GET /rewards - Get user rewards
- ✅ GET /rewards/claim - Claim rewards
- ✅ GET /leaderboard - Get leaderboard (admin)
- ✅ GET /analytics - Get analytics (admin)

### Chat (`/api/chat` + WebSocket)
- ✅ GET / - List user chats
- ✅ POST / - Create new chat
- ✅ GET /:chat_id - Get chat details
- ✅ GET /:chat_id/messages - Get messages
- ✅ POST /:chat_id/messages - Send message (REST)
- ✅ POST /:chat_id/read - Mark messages as read
- ✅ GET /search - Search messages
- ✅ WebSocket connection with auth
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message read receipts

### File Uploads (`/api/upload`)
- ✅ POST /resume - Upload CV
- ✅ POST /avatar - Upload profile picture
- ✅ DELETE /delete-file - Delete file
- ✅ FormData support in API service

### Admin (`/api/admin`)
- ✅ GET /dashboard - Admin dashboard
- ✅ GET /stats - Platform statistics
- ✅ PUT /profile - Update admin profile
- ✅ GET /talent-vetting - Pending vetting
- ✅ PUT /talents/:id/vet - Vet talent
- ✅ DELETE /talents/:id/vet - Remove vetting
- ✅ GET /settings - Get platform settings
- ✅ PUT /settings - Update settings

### Analytics (`/api/analytics`)
- ✅ GET /users - User analytics
- ✅ GET /jobs - Job analytics
- ✅ GET /applications - Application analytics
- ✅ GET /platform - Platform metrics

### Export (`/api/export`)
- ✅ GET /talents - Export talents data
- ✅ GET /jobs - Export jobs data
- ✅ GET /applications - Export applications data
- ✅ Multiple formats (CSV, Excel, JSON)

## 🔧 Services Created

### Core Services
- ✅ `apiService.js` - Base API client with JWT handling
- ✅ `websocketService.js` - WebSocket client for real-time features
<!-- - ✅ `uploadService.js` - File upload handling -->
<!-- - ✅ `analyticsService.js` - Analytics data fetching -->
- ✅ `exportService.js` - Data export utilities

### Context Providers
- ✅ `useAuthContext.jsx` - Authentication state
- ✅ `JobsContext.jsx` - Job listings management
- ✅ `ApplicationsContext.jsx` - Applications management
- ✅ `TalentsContext.jsx` - Talents data
- ✅ `ProjectManagersContext.jsx` - PM data
- ✅ `ProjectsContext.jsx` - Projects management
- ✅ `NotificationsContext.jsx` - Notifications with unread count
- ✅ `ReferralsContext.jsx` - Referral system
- ✅ `ChatContext.jsx` - Chat with WebSocket integration

## 🔄 Data Flow Updates

### Authentication Flow
1. User logs in → JWT token stored in localStorage
2. Token automatically attached to all API requests
3. Token validation on app load
4. Auto-redirect to login on 401 errors
5. Role-specific profile updates

### File Upload Flow
1. FormData created for multipart requests
2. Files uploaded to backend storage
3. Signed URLs returned for display
4. Object names stored in database

### Real-time Chat Flow
1. WebSocket connects with JWT auth
2. Join/leave chat rooms
3. Real-time message delivery
4. Typing indicators
5. Read receipts
6. Online status tracking

## ⚠️ Missing Endpoints to Implement (if needed)

### Password Reset Flow
- ✅ POST /auth/send-otp - Send OTP (exists but not integrated)
- ✅ POST /auth/verify-email - Verify OTP (exists but not integrated)
- ✅ POST /auth/reset-password - Reset password (exists but not integrated)
- ✅ POST /auth/edit-password - Change password (exists but not integrated)

### Google OAuth
- ✅ GET /auth/google - Initiate Google OAuth
- ✅ GET /auth/google/callback - OAuth callback

### Invite System
- ❌ POST admin/project-managers/invite - Send invitation
- ❌ POST /auth/accept-invite/:token - Accept invitation

### Interview Management
- ⚠️ No interview endpoints found in API spec
  - Interviews table exists in database
  - Need to create CRUD endpoints if required

## 📝 Configuration

### Environment Variables Needed
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

### Backend URL
- Development: `http://localhost:5000/api`
- WebSocket: `ws://localhost:5000`

## 🎯 Next Steps

1. **Test Integration**: Test all endpoints with running backend
2. **Error Handling**: Verify error messages display correctly
3. **Loading States**: Ensure loading indicators work properly
4. **Add Missing Features**: 
   - Password reset flow UI
   - Google OAuth button
   - Interview management (if needed)
5. **Environment Config**: Add environment variables
6. **WebSocket Testing**: Test real-time chat features
7. **File Upload Testing**: Test CV and avatar uploads

## 📚 Usage Examples

### Using WebSocket
```javascript
// Send message
sendMessage(chatId, 'Hello!', 'text');

// Listen for typing
typingStart(chatId);
// ... user stops typing
typingStop(chatId);

// Mark as read
markAsRead(chatId, [messageId1, messageId2]);
```

## ✨ Features Implemented

- ✅ JWT authentication with automatic token refresh
- ✅ Role-based access control (admin, PM, talent)
- ✅ File uploads (CV, avatars) with signed URLs
- ✅ Real-time chat with WebSocket
- ✅ Pagination on all list endpoints
- ✅ Advanced filtering and search
- ✅ Notification system with unread tracking
- ✅ Referral system with rewards
- ✅ Analytics and export functionality
- ✅ Error handling with user-friendly messages
- ✅ Loading states throughout the app
- ✅ Optimistic updates for better UX

## User management and permission-aware workforce features

The integrated contract and migration/rollout notes are documented in the backend's `docs/user-management.md`.

- Admin screens: `/admin/users`, `/admin/users/:id/attendance`, `/admin/audit-logs`, `/admin/notifications`, `/admin/profile`, `/admin/workforce`, and `/admin/settings` (Account and System tabs). Employee IDs are edited in Workforce → People → Edit employment.
- Shared authenticated settings: `/settings` (admins redirect to `/admin/settings`), backed by `GET/PUT /auth/preferences`, `POST /auth/edit-password`, and the existing location-consent endpoint.
- Granted features: `/workforce/manage`, `/projects`, and `/expenses`. Every non-admin approver uses Workforce management's Approvals tab. Admins retain the merged `/admin/workforce` page and cannot use personal attendance or expenses. Navigation, route guards, action controls, and server authorization use the current effective permission set.
- REST: `/admin/users` and lifecycle/attendance/permissions/Employee ID subroutes, `/admin/audit-logs`, `/admin/notifications/broadcast`, and `/workforce/management/{users,departments,kpis}`.
- `account_updated` triggers a profile/permission refresh. Notifications retain `notification_created: { notification }`. Reconnection refreshes durable history without replaying sounds.
- Password changes return replacement access and refresh tokens. Save both and reconnect the socket. Sound and clock-out preferences are saved per user; the fixed automatic cutoff is 5 PM in company attendance time for non-admin roles. Admin automatic clock-out preferences are rejected with 403.
- Run component tests with `npm test` and build with `npm run build`.

- Admin and Super Admin receive 403 from personal `/staff/attendance` (including clock-in/out) and `/staff/expenses` endpoints. Attendance oversight at `/admin/users/:id/attendance` remains available. Cancelled admin sessions retain their clock-in and have no invented clock-out or duration.
- `PUT /workforce/management/users/:user_id` accepts admin-only `employee_id` alongside employment fields in one transaction; requires `manage_staff`. It rejects talent targets and rejects Employee ID writes by delegated non-admin callers. Workforce People includes seeded non-talent and custom roles. The dedicated admin Employee ID endpoint remains for compatibility and also rejects talent targets.

### Workforce approval navigation

- **Manage workforce** and `/workforce/manage` require any of `manage_staff`, `manage_departments`, `manage_kpis`, `approve_leave`, `approve_expenses`, `verify_receipts`, or `approve_invoices`. The Approvals tab requires any of the four approval permissions. Approval-only users see only Approvals and request no people, department or KPI lookups; other tabs retain their existing management requirements.
- `/workforce/manage?tab=approvals` opens the shared queue. The queue fetches only while this permitted tab is active. If permissions change, an unavailable selected tab switches to the first permitted tab; removing all relevant permissions denies access.
- `/approvals`, `/dashboard/pm/approvals` and `/dashboard/staff/approvals` are redirect-only aliases for every authenticated role: admins go to `/admin/workforce?tab=approvals`, others to `/workforce/manage?tab=approvals`. There is no standalone Approvals sidebar link. New approval notifications/emails use `/approvals`.
- The tab reuses `GET /staff/approvals` (server-filtered queue) and `PUT /staff/approvals/:type/:request_id` with `{ action, notes }`. Leave actions require `approve_leave`, expense approval/rejection requires `approve_expenses`, receipt verification requires `verify_receipts`, and invoice/accounts actions require `approve_invoices`. Backend action checks and existing workflow state validation remain authoritative. Confirmation dialogs, notes, receipts and error/retry behavior are preserved.
- This change adds no endpoints, permission keys, default grants or migrations. Existing configured role entitlements and individual grants remain effective.

### Directory, creator and custom-role contract

- User directory `/admin/users` omits Talent and Super Admin accounts across all filters and statuses. Counts and pagination describe that eligible population. Workforce/employee/birthday/assignment candidates omit Super Admin. Account-management and directory attendance requests targeting Super Admin return 404; existing chat, audit and reporting identities remain unchanged.
- `GET /projects?created_by_me=true` requests only recorded own creations. Creator `PUT /projects/:id` accepts title, description, priority and deadline. Creator deletion requires a current `create_projects` grant and planning/on-hold/cancelled status. Ownership/assignments remain protected; other creators' projects are forbidden. Existing Admin/PM/assigned-talent rights persist.
- Role records add `permission_keys: string[]`; Super Admin-only role POST/PUT validates these against the existing catalog (including alias normalization). GET `/admin/roles` preserves its `data` array and adds `permission_catalog`. GET `/admin/workforce` adds eligible `roles` for dynamic assignment/invitation controls and custom permission columns. Admins assign roles but cannot edit custom role definitions.
- Effective permissions combine built-in switches or custom-role permissions with individual grants. `account_updated` refreshes affected sessions after role changes. Display names come from `role_details.name`, while canonical keys/IDs remain authoritative for access.
- Custom employees use staff personal routes, navigation and login destinations, plus permitted shared management modules. Custom roles retain staff-level direct chat rules and existing group restrictions. Their KPI/birthday/holiday eligibility and notification destinations match employee workflows.
- Deploy `20261119110000-custom-role-permissions.js` and the backend before the frontend. Existing switches/grants remain intact; rollback removes custom-role configuration and requires the matching application version.

## Managed sessions and internal administration (Phase 2)

`src/services/apiService.js` retains `stechad_token`, `stechad_refresh_token` and `stechad_user`. Access tokens are short lived; the shared transport rotates opaque refresh credentials using `POST /auth/refresh-token` with `{refresh_token}`. Responses retain `{data:{token,refreshToken,session}}`. Same-instance singleflight and same-origin Web Locks coordinate refreshes. A bounded `409 REFRESH_ALREADY_ROTATED` wait adopts credentials saved by the winning tab; at most one bounded retry follows. Network failures preserve refresh credentials. Identity revisions reject stale HTTP and refresh completions after logout or a new sign-in, independently of tab-local organization revisions.

| Method | Endpoint | Frontend behavior |
|---|---|---|
| GET | `/auth/sessions` | Account settings lists safe own-session metadata and identifies the current session; older sign-ins receive upgrade guidance. |
| DELETE | `/auth/sessions/:sessionId` | Confirm before revocation; `{data:{revoked,current_session}}` determines whether to clear this browser's identity. |
| POST | `/auth/logout` | Immediately clear local identity and submit current-session revocation using the captured Bearer token, without tenant headers. An expired access token uses one private captured-refresh rotation and revoke retry; those credentials never return to storage. |
| POST | `/auth/logout-all` | Confirm and revoke every device, then clear the shared identity. |
| GET | `/auth/google?code_challenge=…&return_to=…` | Create a random per-tab PKCE verifier and SHA-256 base64url challenge. Only `/google-auth` and `/platform-admin.html` are callback paths. |
| POST | `/auth/oauth/exchange` | Submit `{code,code_verifier}` once, remove the per-tab verifier and clean the callback URL before continuing. New redirect URLs contain no access or refresh tokens. |

The built `/platform-admin.html` entry mounts its own shell and only the shared identity transport/design primitives. It mounts no customer AuthProvider, OrganizationBoundary, DataProvider, ChatProvider or HR sockets. All `/platform/*` requests omit `X-Organization-Id` and ignore organization revisions while retaining identity revision checks. No customer HR role causes a platform navigation link to appear.

| Method | Endpoint | Contract |
|---|---|---|
| GET | `/platform/me` | Safe identity, explicit platform roles/permissions and session MFA status; does not require HR membership. |
| POST | `/platform/mfa/enroll` | `{}` for first setup, `{replace:true,reason}` for replacement; returns ephemeral `secret`, `otpauth_url`, `expires_at`. The UI offers masked manual setup, expires pending setup and retains no secrets in storage. |
| POST | `/platform/mfa/confirm` | `{code}`; recovery codes are returned once and shown behind a reveal control until the user acknowledges saving them. |
| POST | `/platform/mfa/verify` | Exactly one of `{code}` or `{recovery_code}`; session assurance expires after 15 minutes and refresh does not extend it. |
| GET / PATCH | `/platform/organizations[/:organizationId]` | Paginated metadata; PATCH `{status:'active'|'suspended',reason}`. |
| GET / PATCH | `/platform/users[/:userId]` | Paginated safe global identity metadata; PATCH `{is_active,reason}`. No HR profile, password write or deletion. |
| GET | `/platform/roles` | Explicit roles and permission catalog; requested only with `platform.grants.read`. |
| GET / POST | `/platform/grants` | Paginated grants; POST `{user_id,role_id,reason}` is offered only with `platform.grants.manage`. |
| DELETE | `/platform/grants/:grantId` | `{reason}`; preserves revoked grant history. |
| GET | `/platform/audit-log` | Paginated sanitized platform audit entries, optionally filtered by action. |

Pagination is `{page,limit,total,total_pages}`. List query parameters are `page`, `limit`, organization/user `search` and `status`, grant `user_id`, and audit `action`. Platform lists retain view/page in URL state; identity searches and audit filters remain memory-only to avoid placing personal metadata in browser history.

MFA failures (`MFA_SETUP_REQUIRED`, `MFA_REQUIRED`, `MFA_EXPIRED`) return the internal shell to setup or verification while retaining the HR identity. Grant loss/upgrade/email errors refresh platform eligibility. Ordinary 403, 409, MFA throttling and validation errors remain visible with safe retry controls. Only a genuine global 401 after unsuccessful authentication recovery clears the shared identity. The server enforces all permissions, privileged-target, self-lockout and last-super-admin protections; frontend visibility is a convenience.

Managed `POST /auth/logout` and `/auth/logout-all` also accept `{refresh_token}` as a **revocation-only proof** when access has expired or refresh rotation is in flight. Only opaque managed refresh credentials are supported: the owning identity/version, session and credential must be live and unexpired, and consumed credentials are accepted only within the existing maximum five-second rotation race window. No credentials or authority data are returned. Bearer logout remains supported; legacy refresh uses the finite one-use exchange before private bearer revocation. Local sign-out clears storage immediately and discards old rotation responses.
