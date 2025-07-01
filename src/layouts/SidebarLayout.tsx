import React from "react";
import { useLocation, Link } from "react-router-dom";
import STECHADLogo from "@/components/STECHADLogo";

type Role = "engineer" | "pm" | "admin";

const sidebarMenus: Record<Role, { label: string; to: string; icon: React.ReactNode }[]> = {
  engineer: [
    { label: "View Jobs", to: "/dashboard/engineer/jobs", icon: "💼" },
    { label: "My Applications", to: "/dashboard/engineer/applications", icon: "📝" },
    { label: "Interviews", to: "/dashboard/engineer/interviews", icon: "📅" },
    { label: "Profile", to: "/dashboard/engineer/profile", icon: "👤" },
    { label: "Logout", to: "/logout", icon: "🚪" }
  ],
  pm: [
    { label: "Post Job", to: "/dashboard/pm/post-job", icon: "➕" },
    { label: "Manage Jobs", to: "/dashboard/pm/manage-jobs", icon: "🗂️" },
    { label: "Interviews", to: "/dashboard/pm/interviews", icon: "📅" },
    { label: "Logout", to: "/logout", icon: "🚪" }
  ],
  admin: [
    { label: "Overview", to: "/admin", icon: "🏠" },
    { label: "Engineers", to: "/admin/engineers", icon: "👷" },
    { label: "Jobs", to: "/admin/jobs", icon: "💼" },
    { label: "Applications", to: "/admin/applications", icon: "📩" },
    { label: "Settings", to: "/admin/settings", icon: "⚙️" },
    { label: "Logout", to: "/logout", icon: "🚪" }
  ]
};

interface SidebarLayoutProps {
  role: Role;
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ role, children }) => {
  const location = useLocation();
  const menu = sidebarMenus[role];

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-border shadow-smooth hidden md:flex flex-col">
        <div className="py-6 px-8 flex items-center gap-2 mb-6 border-b border-border">
          <Link to="/" className="flex items-center">
            <STECHADLogo size={32} />
            <span className="ml-3 font-bold text-xl text-primary tracking-wider">STECHAD</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-4">
          {menu.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2 rounded-md font-semibold transition-colors ${
                  isActive 
                    ? "bg-red-700 text-white font-bold" 
                    : "text-text-main hover:bg-red-100 hover:text-red-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 mt-auto text-xs text-text-muted">
          &copy; 2025 STECHAD
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">{children}</div>
    </div>
  );
};

export default SidebarLayout;
