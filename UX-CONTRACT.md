# Organization access UX contract

This contract covers the Phase 1 organization-selection addition. Existing feature workflows retain their current owners. Business source: backend `docs/organization-memberships.md`, the Phase 1 organization-switching issue, and the authenticated `/api/auth/me` response (`user`, `organizations`, `active_organization_id`).

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | OrganizationSwitcher | DESIGN.md and session response | native organization selector; operating-system popup accepted | OrganizationBoundary.test.tsx and browser evidence |
| Scrollbar | src/index.css | Runtime scrollbar variables | global document and owned overflow surfaces | browser computed style |
| Toast | src/components/ui/toaster.tsx and sonner.tsx | Existing application feedback | existing feature variants; selection errors inline | existing ChatAlerts tests |
| Form | Platform login, MfaPanel, GrantDialog and ReasonDialog | Phase 2 API contract | app-owned validation and masked secrets | PlatformApp.test.tsx |
| CRUD | PlatformWorkspace and ReasonDialog | Phase 2 permission and status contract | paginated metadata and reason-required security actions | PlatformApp.test.tsx and browser check |

The backend alone supplies membership-specific HR roles/grants. The session response can infer a single active organization. With multiple memberships and no selection, show a selection state before mounting protected HR features. Selection persists per tab in sessionStorage and travels in `X-Organization-Id` and Socket.IO `auth.organization_id`.

Switching first disconnects sockets, unmounts tenant providers and clears query caches, then loads the selected session projection. The request client rejects responses from an earlier organization revision. Existing route guards use the new role/grants; an incompatible old route redirects to the selected role's home. A membership without HR access receives an explanatory state rather than role escalation.

Membership-specific 403/409 errors request fresh membership selection and preserve global credentials. Permission-only 403 errors remain feature errors. Invalid global authentication uses the existing 401 refresh/sign-in flow. A server socket disconnect revalidates the selected membership through HTTP and reconnects with the current access credential; access-token expiry preserves this tab's explicit organization. Only confirmed membership loss requests a new selection. Payload organization identifiers must match the active transport's organization; global `account_updated` is a signal to refetch the current session, never tenant data.

| Operation | Pending | Success | Recovery | Business source |
|---|---|---|---|---|
| Choose or switch organization | Loading organization status; old HR subtree removed | Fresh selected role dashboard or compatible feature | Inline error and organization choices | session response and switching acceptance criteria |
| Membership removed/suspended | Drop current HR access and refresh memberships | Authorized remaining organization or selection | Empty state explains administrator invitation | organization memberships contract |
| Sign out | Existing logout request | Signed-out state; credentials cleared | Clear credentials even if network fails | existing auth lifecycle |

Public invitation acceptance, password recovery and sign-in remain reachable without HR selection. Tab selection is deliberately absent from URL/localStorage so separate tabs can use different organizations. No creation, member-management or ownership controls are added by this slice.

Existing-account invitations render an acceptance action with no password fields. Signed-out users can sign in and return to the complete invitation URL, including its single-use bearer. New users create their account through the same invitation; after consumption, sign-in continues to their workspace without replaying the invitation. The backend verifies email identity and leaves existing credentials unchanged.

## Phase 2 session and internal administration extension

Business sources: [API_ENDPOINTS.md](API_ENDPOINTS.md#managed-sessions-and-internal-administration-phase-2), backend `docs/platform-administration.md` and the approved Phase 2 session/platform contract. Global identity sessions and explicit platform grants are independent of customer HR roles and organization membership.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | Platform login, MfaPanel, GrantDialog with ReasonDialog | Phase 2 API contract | app-owned noValidate forms, explicit submit, inline error, first-invalid focus in displayed order (Identity ID, Platform role, Reason for grants); secrets masked | PlatformApp.test.tsx |
| Select/Listbox | PlatformWorkspace and GrantDialog native select | DESIGN.md and platform catalog | operating-system status/role popup accepted | rendered and browser checks |
| CRUD | PlatformWorkspace and ReasonDialog | platform permission/status API | server pagination; reason-required pessimistic security actions | PlatformApp.test.tsx and browser check |
| Scrollbar | src/index.css | runtime scrollbar tokens | horizontal native table overflow and bounded modal overflow | browser check |
| Secret reveal | src/platform/SecretField.tsx | security API response contract | masked setup key, authenticator/recovery code, one-time recovery-code list | PlatformApp.test.tsx |
| Session controls | src/components/SessionControls.tsx | own-session API | confirmed device revoke, confirmed logout-all; legacy upgrade guidance | SessionControls.test.tsx |

Customer preferences, role dashboards and per-tab organization switching keep their existing behavior. Account settings adds a device session card. Revoking another device reloads the list and leaves the current identity active; revoking the current device or logout-all clears shared identity. Current logout clears local identity before awaiting server revocation so old in-flight responses cannot restore it. Managed logout submits a revocation-only refresh proof, including during the bounded concurrent-rotation window, without waiting for winning credentials to enter shared storage. Cross-tab storage events remove stale identity projections; rotation alone does not clear HR authority.

Internal administration is a second HTML entry, outside every tenant/HR provider and organization boundary. It can sign in with the existing password/Google identity without HR membership. Its navigation and action controls follow current explicit platform permissions; no automatic customer-admin link is added. Platform data never travels with a tenant header. Both global and tenant HTTP responses retain identity revision guards; tenant responses additionally retain organization revision guards.

MFA setup reveals a manual authenticator key only on request. Pending setup expires after the backend deadline; verification/confirmation failures retain input and explain correction or throttling. Recovery codes remain only in mounted state, are masked until revealed, and must be acknowledged before continuing. Replacement requires fresh assurance and an audit reason; the old factor remains active until confirmation. Session assurance expiry unmounts internal metadata and requests verification again without signing out HR. Grant loss removes the internal views on the next rejected request. Secrets are never added to localStorage, URLs, logs or notification history.

Lists use explicit Search submission and a clear action, server pagination (20/page), stale-response sequence guards, loading/empty/no-results/error/retry states and visible horizontal overflow. View/page persist in URL state. Search text, identity IDs, status and audit filters intentionally remain memory-only because internal identity metadata should not be copied into browser history. No live search request is dispatched while typing. Modal security actions preserve reason and fields after failure, prevent duplicate submits, and wait for server confirmation before closing. Escape/Cancel, focus containment and restoration come from Radix and ReasonDialog; the initial focus is Cancel.

All security mutations explain the target, scope and consequences in a confirmation. Organization suspension affects its workspace only; identity suspension signs out all devices across organizations. Grant operations are explicit and server-protected against self-lockout and removing the last active super admin. The UI offers no hard deletion, impersonation, HR records, billing, products or custom-policy editor.

Static verification scope for `premium-ui.json` is the Phase 2 internal app; customer session controls and the callback also have rendered/transport checks. The whole-repository strict audit has pre-existing date/select ownership and legacy form/native-dialog findings; this addition does not expand a general HR UI migration.
