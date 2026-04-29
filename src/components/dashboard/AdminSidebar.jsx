import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Store, Calendar, DollarSign, BarChart3, Settings, Shield, FileText, Bell, HelpCircle, LogOut, X, } from "lucide-react";
import logoUrl from "../../ChatGPT Image Apr 28, 2026, 01_10_24 AM.png";
const adminNavItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/dashboard/users", icon: Users, label: "Users" },
    { href: "/admin/dashboard/vendors", icon: Store, label: "Vendors" },
    { href: "/admin/dashboard/bookings", icon: Calendar, label: "Bookings" },
    { href: "/admin/dashboard/transactions", icon: DollarSign, label: "Transactions" },
    { href: "/admin/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/dashboard/reports", icon: FileText, label: "Reports" },
    { href: "/admin/dashboard/moderation", icon: Shield, label: "Moderation" },
    { href: "/admin/dashboard/notifications", icon: Bell, label: "Notifications" },
    { href: "/admin/dashboard/settings", icon: Settings, label: "Settings" },
];
export function AdminSidebar({ isOpen, onClose }) {
    const pathname = useLocation().pathname;
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
          <div className="rounded-lg bg-red-500/20 px-3 py-2">
            <p className="text-xs text-red-300">Admin Panel</p>
            <p className="font-medium text-sidebar-foreground">System Administrator</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
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
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
            <LogOut className="h-5 w-5"/>
            Log Out
          </button>
        </div>
      </aside>
    </>);
}
