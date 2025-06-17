
import React from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, User, ClipboardList, Settings, Briefcase, FileText, Users, FolderKanban } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const engineerMenu = [
  { icon: Home,    label: "Dashboard", to: "/dashboard/engineer" },
  { icon: Briefcase, label: "Jobs",     to: "/dashboard/engineer/jobs" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/engineer/projects" },
  { icon: ClipboardList, label: "Applications", to: "/dashboard/engineer/applications" },
  { icon: User,    label: "Profile",   to: "/dashboard/engineer/profile" },
];

const pmMenu = [
  { icon: Home, label: "Dashboard", to: "/dashboard/pm" },
  { icon: FileText, label: "Post Job", to: "/dashboard/pm/post-job" },
  { icon: Briefcase, label: "Manage Jobs", to: "/dashboard/pm/manage-jobs" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/pm/projects" },
  { icon: Users, label: "Applicants", to: "/dashboard/pm/applicants/1" },
];

const adminMenu = [
  { icon: Home, label: "Overview", to: "/admin" },
  { icon: Users, label: "Engineers", to: "/admin/engineers" },
  { icon: User, label: "Project Managers", to: "/admin/project-managers" },
  { icon: Briefcase, label: "Jobs", to: "/admin/jobs" },
  { icon: ClipboardList, label: "Applications", to: "/admin/applications" },
  { icon: ClipboardList, label: "Engineer Vetting", to: "/admin/engineer-vetting" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];

function getRoleMenu(pathname: string) {
  if (pathname.startsWith("/dashboard/engineer")) return engineerMenu;
  if (pathname.startsWith("/dashboard/pm")) return pmMenu;
  if (pathname.startsWith("/admin")) return adminMenu;
  return [];
}
export function AppSidebar() {
  const { pathname } = useLocation();
  const menu = getRoleMenu(pathname);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {pathname.includes("/engineer")
              ? "Engineer"
              : pathname.includes("/pm")
              ? "Project Manager"
              : pathname.includes("/admin")
              ? "Admin"
              : "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.to)}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
