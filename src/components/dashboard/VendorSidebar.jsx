import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/authSlice";
import { LayoutDashboard, Calendar, Settings, HelpCircle, LogOut, Bell, MessageSquare, Star, User, Briefcase, BarChart3, X, Wallet, } from "lucide-react";
import logoUrl from "../../ChatGPT Image Apr 28, 2026, 01_10_24 AM.png";
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

const vendorNavItems = [
    { href: "/vendor/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/vendor/dashboard/bookings", icon: Calendar, label: "Bookings" },
    { href: "/vendor/dashboard/services", icon: Briefcase, label: "Services" },
    { href: "/vendor/dashboard/profile", icon: User, label: "Profile" },
    { href: "/vendor/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/vendor/dashboard/reviews", icon: Star, label: "Reviews" },
    { href: "/vendor/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/vendor/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/vendor/dashboard/notifications", icon: Bell, label: "Notifications" },
    { href: "/vendor/dashboard/settings", icon: Settings, label: "Settings" },
];
export function VendorSidebar({ isOpen, onClose, vendor }) {
    const pathname = useLocation().pathname;
    const dispatch = useDispatch();
    const avatar = resolveUrl(vendor?.profile_image_url);
    const displayName = vendor?.business_name || vendor?.name || "Vendor Account";
    return (<>
      {/* Mobile overlay */}
      {isOpen && (<div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose}/>)}

      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="BookMyEvent logo" className="h-10 w-10 rounded-md object-cover shadow-sm"/>
            <span className="text-lg font-bold text-sidebar-foreground">
              Book<span className="text-sidebar-primary">My</span>Event
            </span>
          </Link>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-sidebar-foreground"/>
          </button>
        </div>

        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{displayName.charAt(0)}</div>}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground/70">Vendor Account</p>
              <p className="truncate font-medium text-sidebar-foreground">{displayName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {vendorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (<li key={item.href}>
                  <Link to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")} onClick={onClose}>
                    <item.icon className="h-5 w-5"/>
                    {item.label}
                  </Link>
                </li>);
        })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link to="/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <HelpCircle className="h-5 w-5"/>
            Help & Support
          </Link>
          <button onClick={() => dispatch(logout())} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
            <LogOut className="h-5 w-5"/>
            Log Out
          </button>
        </div>
      </aside>
    </>);
}
