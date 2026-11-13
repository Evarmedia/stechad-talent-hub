# STECHAD frontend

## Messages

Messages is available from the Admin, Project Manager, Talent, and Staff dashboards. The shared inbox supports direct and group conversations, unread filters, message search, older history, replies, edit/delete, read receipts, typing, and online presence. Drafts and failed sends are retained when switching conversations during the session. Logout clears chat state.

Set `VITE_BACKEND_URL` to the backend API base, for example `http://localhost:5000/api`. Socket.IO connects to that URL's origin using the current access token. Set `VITE_SOCKET_URL` only when the realtime server has a different origin. Production URLs should use HTTPS; Socket.IO will use the corresponding secure connection.

Sending uses REST and receives live updates over Socket.IO. While realtime reconnects, visible conversations refresh every 15 seconds. Send failures show a retry action; the same message UUID is reused so a lost response does not create duplicates.

For a local check, run the backend and `npm run dev`, sign in as two users in separate browser profiles, and open Messages. Verify delivery and read receipts in both directions, then try a reply, edit, delete, group conversation, and mobile back navigation. `npm run build` verifies the production bundle.
