
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import STECHADLogo from "@/components/STECHADLogo";

const navRoles = [
  { name: "Engineer", path: "/dashboard/engineer" },
  { name: "PM", path: "/dashboard/pm" },
  { name: "Admin", path: "/admin" },
];

export function AppNavbar() {
  const { pathname } = useLocation();
  const currentRole =
    navRoles.find((r) => pathname.startsWith(r.path))?.name || "Dashboard";
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
        <Link to="/dashboard/engineer/profile" className="text-primary font-medium hover:underline">My Account</Link>
        <Link to="/login" className="hover:underline text-muted-foreground">Logout</Link>
      </nav>
    </header>
  );
}
