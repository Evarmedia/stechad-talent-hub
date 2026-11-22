import { useAuthContext } from "@/hooks/useAuthContext";

/** Native select: the operating system owns the popup and keyboard interaction. */
export default function OrganizationSwitcher() {
  const { organizations, activeOrganizationId, selectOrganization, organizationLoading } = useAuthContext();
  if (!organizations?.length) return null;
  return <label className="flex min-w-0 flex-col text-xs text-text-muted">
    Organization
    <select aria-label="Organization" value={activeOrganizationId || ""} disabled={organizationLoading}
      onChange={(event) => void selectOrganization(event.target.value)}
      className="h-9 max-w-[128px] sm:max-w-[180px] cursor-pointer border-border bg-background px-2 text-sm text-text-main hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait md:max-w-[240px]">
      <option value="" disabled>Choose an organization</option>
      {organizations.map((org) => <option key={org.organization_id} value={org.organization_id}>{org.name}</option>)}
    </select>
  </label>;
}
