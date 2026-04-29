import { useState } from "react";
import { Outlet } from "react-router-dom";
import { VendorSidebar } from "@/components/dashboard/VendorSidebar";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from 'react-router-dom';
import { useGetVendorDashboardQuery } from "@/features/api/apiSlice";

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

export default function VendorDashboardLayout({ children = <Outlet />, }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: vendor } = useGetVendorDashboardQuery(undefined, { pollingInterval: 30000 });
    const avatar = resolveUrl(vendor?.profile_image_url);
    const initials = (vendor?.business_name || vendor?.name || "Vendor").slice(0, 2).toUpperCase();
    return (<div className="flex min-h-screen bg-background">
      <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} vendor={vendor}/>

      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-foreground"/>
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-muted-foreground"/>
              <input type="text" placeholder="Search bookings..." className="w-48 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground"/>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent"/>
            </Button>
            <Link to="/vendor/dashboard/settings">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {avatar ? <img src={avatar} alt={vendor?.name || "Vendor"} className="h-full w-full object-cover" /> : initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>);
}
