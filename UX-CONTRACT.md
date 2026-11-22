# Organization access UX contract

This contract covers the Phase 1 organization-selection addition. Existing feature workflows retain their current owners. Business source: backend `docs/organization-memberships.md`, the Phase 1 organization-switching issue, and the authenticated `/api/auth/me` response (`user`, `organizations`, `active_organization_id`).

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | OrganizationSwitcher | DESIGN.md and session response | native organization selector; operating-system popup accepted | OrganizationBoundary.test.tsx and browser evidence |
| Scrollbar | src/index.css | Runtime scrollbar variables | global document and owned overflow surfaces | browser computed style |
| Toast | src/components/ui/toaster.tsx and sonner.tsx | Existing application feedback | existing feature variants; selection errors inline | existing ChatAlerts tests |

The backend alone supplies membership-specific HR roles/grants. The session response can infer a single active organization. With multiple memberships and no selection, show a selection state before mounting protected HR features. Selection persists per tab in sessionStorage and travels in `X-Organization-Id` and Socket.IO `auth.organization_id`.

Switching first disconnects sockets, unmounts tenant providers and clears query caches, then loads the selected session projection. The request client rejects responses from an earlier organization revision. Existing route guards use the new role/grants; an incompatible old route redirects to the selected role's home. A membership without HR access receives an explanatory state rather than role escalation.

Membership-specific 403/409 errors request fresh membership selection and preserve global credentials. Permission-only 403 errors remain feature errors. Invalid global authentication uses the existing 401 refresh/sign-in flow. A server socket disconnect refreshes membership access; normal reconnect retains this tab's explicit organization. Payload organization identifiers must match the active transport's organization; global `account_updated` is a signal to refetch the current session, never tenant data.

| Operation | Pending | Success | Recovery | Business source |
|---|---|---|---|---|
| Choose or switch organization | Loading organization status; old HR subtree removed | Fresh selected role dashboard or compatible feature | Inline error and organization choices | session response and switching acceptance criteria |
| Membership removed/suspended | Drop current HR access and refresh memberships | Authorized remaining organization or selection | Empty state explains administrator invitation | organization memberships contract |
| Sign out | Existing logout request | Signed-out state; credentials cleared | Clear credentials even if network fails | existing auth lifecycle |

Public invitation acceptance, password recovery and sign-in remain reachable without HR selection. Tab selection is deliberately absent from URL/localStorage so separate tabs can use different organizations. No creation, member-management or ownership controls are added by this slice.

Existing-account invitations render an acceptance action with no password fields. Signed-out users can sign in and return to the complete invitation URL, including its single-use bearer. New users create their account through the same invitation; after consumption, sign-in continues to their workspace without replaying the invitation. The backend verifies email identity and leaves existing credentials unchanged.
