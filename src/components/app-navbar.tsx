
import STECHADLogo from "@/components/STECHADLogo";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDataContext } from "@/hooks/useDataContext";
import { AlertTriangle, Bell, CheckCircle2, Info, LogOut, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const navRoles = [
  { name: "Engineer", path: "/dashboard/engineer" },
  { name: "Staff", path: "/dashboard/staff" },
  { name: "PM", path: "/dashboard/pm" },
  { name: "Admin", path: "/admin" },
];

// Helper function to get the route for the profile based on role and current route
function getProfileRoute(pathname: string) {
  if (pathname.startsWith("/dashboard/engineer")) return "/dashboard/engineer/profile";
  if (pathname.startsWith("/dashboard/staff")) return "/dashboard/staff/profile";
  if (pathname.startsWith("/dashboard/pm")) return "/dashboard/pm/profile";
  if (pathname.startsWith("/admin")) return "/admin/profile";
  return "/dashboard/engineer/profile"; // default fallback
}

export function AppNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthContext();
  const {
    resetEngineerState,
    resetJobsState,
    resetApplicationState,
    resetPMsState,
    resetInterviewState,
    resetNotificationState,
    resetProjectsState,
    notifications,
    unreadCount,
    getNotifications,
    markAllAsRead,
    notificationsEligible,
  } = useDataContext();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  
  const currentRole =
    navRoles.find((r) => pathname.startsWith(r.path))?.name || "Dashboard";
  const profileRoute = getProfileRoute(pathname);
  const showNotifications =
    notificationsEligible &&
    (user?.role === "engineer" || user?.role === "project_manager" || user?.role === "staff");
  const notificationsToShow = useMemo(
    () => (notifications || []).slice(0, 10),
    [notifications]
  );

  const typeConfig = (type?: string) => {
    switch (type) {
      case "success":
        return {
          label: "Success",
          className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
          Icon: CheckCircle2,
        };
      case "warning":
      case "error":
        return {
          label: "Alert",
          className: "bg-amber-100 text-amber-800 border border-amber-200",
          Icon: AlertTriangle,
        };
      default:
        return {
          label: "Info",
          className: "bg-sky-100 text-sky-700 border border-sky-200",
          Icon: Info,
        };
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationsToggle = async (open: boolean) => {
    setNotifOpen(open);
    if (!open) return;
    setNotifLoading(true);
    try {
      await markAllAsRead();
      await getNotifications();
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    resetEngineerState();
    resetJobsState();
    resetApplicationState();
    resetPMsState();
    resetProjectsState();
    resetInterviewState();
    resetNotificationState();
    navigate("/login");
  };

  // if (!user) return handleLogout();

  return (
    <header className="w-full shadow-sm sticky top-0 z-40 bg-white flex items-center justify-between h-[56px] px-4 md:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-2" />
        <Link to="/" className="flex items-center gap-2">
          <STECHADLogo size={32} />
          <span className="ml-1 font-bold text-xl text-primary hidden md:inline lg:inline">STECHAD</span>
        </Link>
        <span className="ml-4 text-muted-foreground font-medium text-base hidden md:inline">| {currentRole}</span>
      </div>
      <nav className="flex gap-4 items-center text-sm">
        <span className="text-muted-foreground hidden md:inline">
          Welcome, {user?.first_name}
        </span>
        {showNotifications && (
          <DropdownMenu open={notifOpen} onOpenChange={handleNotificationsToggle}>
            <DropdownMenuTrigger asChild>
              <button
                className="relative rounded-full p-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-red-500 px-1 py-0.5 text-[11px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[360px] p-0 border-slate-100 shadow-xl"
              sideOffset={12}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">
                    {notifLoading ? "Refreshing..." : "Latest activity"}
                  </p>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto bg-white">
                {notifLoading && notificationsToShow.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : notificationsToShow.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notificationsToShow.map((n) => {
                    const key = n.notifications_id || n.id;
                    const { label, className, Icon } = typeConfig(n.type);
                    return (
                      <DropdownMenuItem
                        key={key}
                        onSelect={(e) => e.preventDefault()}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-blue-200 focus:bg-slate-50"
                      >
                        <span
                          className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ${n.is_read ? "" : "ring-2 ring-primary/40"}`}
                        >
                          <Icon className="h-4 w-4 text-slate-700" />
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {n.title || "Notification"}
                            </p>
                            <Badge className={className}>{label}</Badge>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{formatTimeAgo(n.created_at || n.createdAt)}</span>
                            {!n.is_read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>

              <DropdownMenuSeparator className="my-0" />
              {/* <DropdownMenuLabel className="text-xs text-slate-500 py-2 text-center bg-white">
                Clicking the bell marks all as read for you.
              </DropdownMenuLabel> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link to={profileRoute} className="text-primary font-medium hover:underline">
          <User />
        </Link>
        
        { user ? (<button onClick={handleLogout} className="hover:underline text-muted-foreground hidden md:inline-block">
          Logout
        </button>) : (<></>)}
        {user ? (<button onClick={handleLogout} className="hover:underline text-muted-foreground md:hidden">
          <LogOut className="h-5 w-5 text-slate-700" />
        </button>) : (<></>)}
        
      </nav>
    </header>
  );
}
