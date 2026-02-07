
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Briefcase, Calendar, ClipboardList, FileText, FolderKanban, Home, Pickaxe, Settings, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const engineerMenu = [
  { icon: Home,    label: "Dashboard", to: "/dashboard/engineer" },
  { icon: Briefcase, label: "Jobs",     to: "/dashboard/engineer/jobs" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/engineer/projects" },
  { icon: ClipboardList, label: "Applications", to: "/dashboard/engineer/applications" },
  { icon: Calendar, label: "Interviews", to: "/dashboard/engineer/interviews" },
  // { icon: MessageSquare, label: "Messages", to: "/dashboard/engineer/messages" },
  { icon: User,    label: "Profile",   to: "/dashboard/engineer/profile" },
];

const pmMenu = [
  { icon: Home, label: "Dashboard", to: "/dashboard/pm" },
  { icon: FileText, label: "Post Job", to: "/dashboard/pm/post-job" },
  { icon: Briefcase, label: "Manage Jobs", to: "/dashboard/pm/manage-jobs" },
  { icon: Pickaxe, label: "Engineers", to: "dashboard/pm/engineers" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/pm/projects" },
  // { icon: Users, label: "Applicants", to: "/dashboard/pm/applicants/1" },
  { icon: Users, label: "Applications", to: "/dashboard/pm/applications" },
  { icon: Calendar, label: "Interviews", to: "/dashboard/pm/interviews" },
  // { icon: MessageSquare, label: "Messages", to: "/dashboard/pm/messages" },
];

const adminMenu = [
  { icon: Home, label: "Overview", to: "/admin" },
  { icon: Pickaxe, label: "Engineers", to: "/admin/engineers" },
  { icon: User, label: "Project Managers", to: "/admin/project-managers" },
  { icon: Briefcase, label: "Jobs", to: "/admin/jobs" },
  { icon: ClipboardList, label: "Applications", to: "/admin/applications" },
  { icon: ClipboardList, label: "Engineer Vetting", to: "/admin/engineer-vetting" },
  // { icon: MessageSquare, label: "Messages", to: "/admin/messages" },
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
              {menu.map((item) => {
                const isActive = pathname === item.to;
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
