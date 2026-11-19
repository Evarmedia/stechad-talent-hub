# STECHAD API Integration Status

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
