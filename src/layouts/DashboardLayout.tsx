
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { Outlet } from "react-router-dom";
import LocationPermissionManager from "@/components/LocationPermissionManager";

const DashboardLayout: React.FC = () => (
  <SidebarProvider>
    <LocationPermissionManager />
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <SidebarInset>
        <AppNavbar />
        <div className="p-0 pb-16 md:pb-8">
          <Outlet />
        </div>
      </SidebarInset>
    </div>
  </SidebarProvider>
);

export default DashboardLayout;
