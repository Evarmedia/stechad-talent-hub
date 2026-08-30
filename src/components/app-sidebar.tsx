
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Briefcase, Calendar, CalendarDays, ClipboardList, Clock3, DollarSign, FileText, FolderKanban, Home, Pickaxe, ReceiptText, Settings, TrendingUp, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
const engineerMenu = [
  { icon: Home, label: "Dashboard", to: "/dashboard/engineer" },
  { icon: Briefcase, label: "Jobs", to: "/dashboard/engineer/jobs" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/engineer/projects" },
  { icon: ClipboardList, label: "Applications", to: "/dashboard/engineer/applications" },
  { icon: Calendar, label: "Interviews", to: "/dashboard/engineer/interviews" },
  { icon: DollarSign, label: "Invoices", to: "/dashboard/engineer/invoices" },
  { icon: User, label: "Profile", to: "/dashboard/engineer/profile" },
];

const staffMenu = [
  { icon: Home, label: "Dashboard", to: "/dashboard/staff" },
  { icon: Clock3, label: "Attendance", to: "/dashboard/staff/attendance" },
  { icon: CalendarDays, label: "Leave", to: "/dashboard/staff/leave" },
  { icon: ReceiptText, label: "Expenses", to: "/dashboard/staff/expenses" },
  { icon: ClipboardList, label: "Approvals", to: "/dashboard/staff/approvals", permission: "approvals" },
  { icon: DollarSign, label: "Invoices", to: "/dashboard/staff/invoices" },
  { icon: TrendingUp, label: "KPIs", to: "/dashboard/staff/kpis" },
  { icon: Calendar, label: "Holidays & Birthdays", to: "/dashboard/staff/holidays" },
  { icon: User, label: "Profile", to: "/dashboard/staff/profile" },
];

const pmMenu = [
  { icon: Home, label: "Dashboard", to: "/dashboard/pm" },
  { icon: FileText, label: "Post Job", to: "/dashboard/pm/post-job" },
  { icon: Briefcase, label: "Manage Jobs", to: "/dashboard/pm/manage-jobs" },
  { icon: Pickaxe, label: "Engineers", to: "/dashboard/pm/engineers" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/pm/projects" },
  { icon: DollarSign, label: "Project Invoices", to: "/dashboard/pm/project-invoices" },
  { icon: Clock3, label: "Attendance", to: "/dashboard/pm/attendance" },
  { icon: CalendarDays, label: "Leave", to: "/dashboard/pm/leave" },
  { icon: ReceiptText, label: "Expenses", to: "/dashboard/pm/expenses" },
  { icon: TrendingUp, label: "KPIs", to: "/dashboard/pm/kpis" },
  { icon: Calendar, label: "Holidays & Birthdays", to: "/dashboard/pm/holidays" },
  { icon: ClipboardList, label: "Approvals", to: "/dashboard/pm/approvals", permission: "approvals" },
  { icon: Users, label: "Applications", to: "/dashboard/pm/applications" },
  { icon: Calendar, label: "Interviews", to: "/dashboard/pm/interviews" },
];

const adminMenu = [
  { icon: Home, label: "Overview", to: "/admin" },
  { icon: Pickaxe, label: "Engineers", to: "/admin/engineers" },
  { icon: User, label: "Project Managers", to: "/admin/project-managers" },
  { icon: FolderKanban, label: "Projects", to: "/admin/projects" },
  { icon: ClipboardList, label: "Workforce", to: "/admin/workforce" },
  { icon: Briefcase, label: "Jobs", to: "/admin/jobs" },
  { icon: ClipboardList, label: "Applications", to: "/admin/applications" },
  { icon: ClipboardList, label: "Engineer Vetting", to: "/admin/engineer-vetting" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];

function getRoleMenu(pathname: string) {
  if (pathname.startsWith("/dashboard/engineer")) return engineerMenu;
  if (pathname.startsWith("/dashboard/staff")) return staffMenu;
  if (pathname.startsWith("/dashboard/pm")) return pmMenu;
  if (pathname.startsWith("/admin")) return adminMenu;
  return [];
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuthContext();
  const approvalPermissions = ["approve_leave", "approve_expenses", "verify_receipts", "approve_invoices"];
  const canApprove = user?.effective_permissions?.includes("*") || approvalPermissions.some((permission) => user?.effective_permissions?.includes(permission));
  const menu = getRoleMenu(pathname).filter((item: any) => item.permission !== "approvals" || canApprove);
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {pathname.includes("/engineer")
              ? "Engineer"
              : pathname.includes("/staff")
              ? "Staff"
              : pathname.includes("/pm")
              ? "Project Manager"
              : pathname.includes("/admin")
              ? "Admin"
              : "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-2 transition-colors ${
                          isActive 
                            ? 'bg-red-700 text-white hover:bg-red-800' 
                            : 'hover:bg-red-100 hover:text-red-800'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
