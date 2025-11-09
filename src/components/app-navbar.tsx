
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import STECHADLogo from "@/components/STECHADLogo";

const navRoles = [
  { name: "Engineer", path: "/dashboard/engineer" },
  { name: "PM", path: "/dashboard/pm" },
  { name: "Admin", path: "/admin" },
];

// Helper function to get the route for the profile based on role and current route
function getProfileRoute(pathname: string) {
  if (pathname.startsWith("/dashboard/engineer")) return "/dashboard/engineer/profile";
  if (pathname.startsWith("/dashboard/pm")) return "/dashboard/pm/profile";
  if (pathname.startsWith("/admin")) return "/admin/profile";
  return "/dashboard/engineer/profile"; // default fallback
}

export function AppNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const currentRole =
    navRoles.find((r) => pathname.startsWith(r.path))?.name || "Dashboard";
  const profileRoute = getProfileRoute(pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full shadow-sm sticky top-0 z-40 bg-white flex items-center justify-between h-[56px] px-4 md:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-2" />
        <Link to="/" className="flex items-center gap-2">
          <STECHADLogo size={32} />
          <span className="ml-1 font-bold text-xl text-primary">STECHAD</span>
        </Link>
        <span className="ml-4 text-muted-foreground font-medium text-base hidden md:inline">| {currentRole}</span>
      </div>
      <nav className="flex gap-4 items-center text-sm">
        <span className="text-muted-foreground hidden md:inline">
          Welcome, {user?.first_name}
        </span>
        <Link to={profileRoute} className="text-primary font-medium hover:underline">
          My Account
        </Link>
        <button onClick={handleLogout} className="hover:underline text-muted-foreground">
          Logout
        </button>
      </nav>
    </header>
  );
}
