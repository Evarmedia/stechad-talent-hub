import LocationPermissionManager from "@/components/LocationPermissionManager";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { Outlet, useLocation } from "react-router-dom";


const DashboardLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isMessages = pathname.endsWith("/messages");
  return (
    <SidebarProvider>
      <LocationPermissionManager />

      <div className="min-h-screen flex min-w-0 w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppNavbar />
          <div className={isMessages ? "min-h-0 p-0" : "p-0 pb-16 md:pb-8"}>
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
