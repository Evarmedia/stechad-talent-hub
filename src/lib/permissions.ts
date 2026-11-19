export type PermissionUser = { effective_permissions?: string[]; role?: string; role_details?: { name?: string; is_system?: boolean; role_key?: string } } | null | undefined;
export const normalizePermission = (key: string) => key === "create_project" ? "create_projects" : key;
export const can = (user: PermissionUser, permission: string) => Boolean(user && (user.effective_permissions?.includes("*") || user.effective_permissions?.map(normalizePermission).includes(normalizePermission(permission))));
export const canAny = (user: PermissionUser, permissions: string[]) => permissions.some((key) => can(user, key));
export const managementPermissions = ["manage_staff", "manage_departments", "manage_kpis"];
export const approvalPermissions = ["approve_leave", "approve_expenses", "verify_receipts", "approve_invoices"];
export const workforcePermissions = [...managementPermissions, ...approvalPermissions];

export const approvalPermission = (type: string, action: string) => type === "leave" ? "approve_leave" : type === "invoice" ? "approve_invoices" : ["receipt_verified", "paid"].includes(action) ? "verify_receipts" : "approve_expenses";

export const isAdmin = (user: PermissionUser) => Boolean(user && ["admin", "super_admin"].includes(user.role || ""));
export const approvalDestination = (user: PermissionUser) => isAdmin(user) ? "/admin/workforce?tab=approvals" : "/workforce/manage?tab=approvals";
export const adminRedirectForPath = (user: PermissionUser, pathname: string, search = "") => {
  if (!isAdmin(user)) return null;
  if (pathname === "/settings") return "/admin/settings";
  if (pathname === "/workforce/manage") return `/admin/workforce${search}`;
  if (["/approvals", "/dashboard/staff/approvals", "/dashboard/pm/approvals"].includes(pathname)) return "/admin/workforce?tab=approvals";
  if (["/attendance", "/expenses", "/dashboard/staff/attendance", "/dashboard/pm/attendance", "/dashboard/staff/expenses", "/dashboard/pm/expenses"].includes(pathname)) return "/admin";
  return null;
};

export const isCustomEmployee = (user: PermissionUser) => Boolean(user?.role_details?.is_system === false && !["admin", "super_admin", "project_manager", "staff", "talent"].includes(user?.role || ""));
export const roleName = (user: { role?: string; role_details?: { name?: string } } | null | undefined) => user?.role_details?.name || ({ super_admin: "Super Admin", admin: "Admin", project_manager: "Project Manager", staff: "Staff", talent: "Talent" }[user?.role || ""] || user?.role?.replace(/_/g, " ") || "Team member");
export const personalBasePath = (user: PermissionUser) => isAdmin(user) ? "/admin" : user?.role === "project_manager" ? "/dashboard/pm" : user?.role === "talent" ? "/dashboard/talent" : "/dashboard/staff";
