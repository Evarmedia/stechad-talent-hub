import { useLocation } from "react-router-dom";
import { Fragment, useEffect, useLayoutEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";

export default function OrganizationBoundary({ children }: { children: ReactNode }) {
  const { user, loading, organizations, activeOrganizationId, organizationLoading, organizationError, tenantVersion, selectOrganization, logout } = useAuthContext();
  const cache = useQueryClient();
  const { pathname } = useLocation();
  useEffect(() => {
    if (organizationLoading || loading) document.title = "Loading organization | STECHAD";
    else if (user && organizations !== null && (!activeOrganizationId || !user.role)) document.title = "Choose an organization | STECHAD";
  }, [loading, organizationLoading, user, organizations, activeOrganizationId]);
  useLayoutEffect(() => { void cache.cancelQueries(); cache.clear(); }, [cache, tenantVersion, activeOrganizationId, user?.user_id]);
  if (loading || organizationLoading) return <main className="flex min-h-screen items-center justify-center p-6" role="status">Loading organization…</main>;
  // Invitation and account recovery remain available before choosing HR access.
  const publicPath = /^\/(accept-invite|forgot-password|reset-password|verify-otp|google-auth|talent-signup|login|landing)(\/|$)/.test(pathname);
  if (user && organizations !== null && (!activeOrganizationId || !user.role) && !publicPath) return <main className="flex min-h-screen items-center justify-center bg-muted p-4">
    <section className="w-full max-w-md space-y-5 rounded-xl border border-border bg-background p-6 shadow-smooth">
      <div><h1 className="text-xl font-semibold">Choose an organization</h1><p className="mt-2 text-sm text-text-muted">{activeOrganizationId ? "HR access is unavailable in this organization. Choose another organization or contact your organization administrator." : "Choose where you want to work. Your access is specific to each organization."}</p></div>
      {organizationError && <p role="alert" className="text-sm text-destructive">{organizationError}</p>}
      {organizations.length ? <div className="flex flex-col gap-3">{organizations.map((org) => <Button key={org.organization_id} variant="outline" className="h-auto min-h-11 cursor-pointer active:bg-accent justify-start whitespace-normal text-left" onClick={() => void selectOrganization(org.organization_id)}>{org.name}</Button>)}</div>
        : <p className="text-sm text-text-muted">You do not have an active organization membership. Ask your organization administrator for an invitation.</p>}
      <div className="flex flex-wrap gap-3"><Button variant="ghost" className="cursor-pointer active:bg-accent" onClick={() => void selectOrganization(null)}>Refresh organizations</Button><Button variant="ghost" className="cursor-pointer active:bg-accent" onClick={() => void logout()}>Sign out</Button></div>
    </section>
  </main>;
  return <Fragment key={`${user?.user_id || "signed-out"}:${activeOrganizationId || "global"}:${tenantVersion}`}>{children}</Fragment>;
}
