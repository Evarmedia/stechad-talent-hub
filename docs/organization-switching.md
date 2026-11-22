# Organization selection

The authenticated session response provides `data.user`, `data.organizations`, and `data.active_organization_id`. The user is the selected organization's HR projection; organization ownership does not grant an HR role. A single migrated Stechad membership opens directly. Multiple memberships require a choice; an active membership without an HR profile remains at selection.

`AuthProvider` owns the selection and session refresh. `OrganizationBoundary` sits above all tenant data/chat providers and resets mounted state and React Query caches when the selection changes. `OrganizationSwitcher` uses a native select in the existing navbar. Selection is stored only in the tab's `sessionStorage` key `stechad_organization_id`.

`apiService` snapshots the organization and revision when a public request helper is called. It sends `X-Organization-Id`, rejects a request whose organization changed before dispatch, and discards older successful/error responses before they can update the next organization or log its identity out. Membership/selection errors (`MEMBERSHIP_UNAVAILABLE`, `ORGANIZATION_REQUIRED`, `HR_PROFILE_REQUIRED`) refresh organization access without removing credentials. Ordinary permission errors remain feature errors; invalid global authentication follows the existing 401 refresh/sign-in behavior.

Sockets send `auth.organization_id`. Changing the organization disconnects and removes transport listeners. Incoming tenant events must match the current socket and payload `organization_id`; `online_users` uses `{organization_id, users}`. Global `account_updated` remains a refetch signal. Server disconnect and handshake authentication failure revalidate membership; they do not independently destroy global credentials. Chat focus/deduplication keys include organization identity.

`/accept-invite?token=…` remains public while selection is absent. Signed-in existing identities accept with `{}` and their Bearer token, then load the joined organization's projection. Signed-out users can sign in and return to the full invitation URL, or create a new account using the existing password-policy form. A consumed new-account invitation does not replay after login.

The contract is covered by the rendered `OrganizationBoundary` and `AcceptInvites` tests, role guard tests, API request/response boundary tests, and Socket.IO client boundary tests. Existing dashboard/HR feature suites remain enabled. `DESIGN.md` records runtime token ownership; `UX-CONTRACT.md` records the selection behavior.
