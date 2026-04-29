import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Users, Store, Calendar, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, XCircle, BarChart3, } from "lucide-react";
const stats = [
    {
        label: "Total Users",
        value: "52,847",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "bg-blue-100 text-blue-600",
    },
    {
        label: "Active Vendors",
        value: "5,234",
        change: "+8.2%",
        trend: "up",
        icon: Store,
        color: "bg-primary/10 text-primary",
    },
    {
        label: "Total Bookings",
        value: "18,392",
        change: "+15.3%",
        trend: "up",
        icon: Calendar,
        color: "bg-green-100 text-green-600",
    },
    {
        label: "Revenue",
        value: "₹2.4Cr",
        change: "+22.1%",
        trend: "up",
        icon: DollarSign,
        color: "bg-accent/20 text-accent",
    },
];
const recentUsers = [
    { id: 1, name: "Priya Sharma", email: "priya@email.com", type: "user", date: "2 min ago" },
    { id: 2, name: "Elite Photography", email: "elite@photo.com", type: "vendor", date: "15 min ago" },
    { id: 3, name: "Rahul Verma", email: "rahul@email.com", type: "user", date: "32 min ago" },
    { id: 4, name: "Royal Caterers", email: "royal@catering.com", type: "vendor", date: "1 hour ago" },
    { id: 5, name: "Anita Desai", email: "anita@email.com", type: "user", date: "2 hours ago" },
];
const pendingVerifications = [
    { id: 1, name: "Dream Decor Studio", category: "Decoration", submitted: "2 days ago" },
    { id: 2, name: "Melody Music", category: "Entertainment", submitted: "3 days ago" },
    { id: 3, name: "Flower Paradise", category: "Florists", submitted: "4 days ago" },
];
const recentBookings = [
    { id: 1, customer: "Vikram Singh", vendor: "Elite Photography", amount: "₹75,000", status: "completed" },
    { id: 2, customer: "Neha Gupta", vendor: "Royal Caterers", amount: "₹1,20,000", status: "confirmed" },
    { id: 3, customer: "Amit Kumar", vendor: "Dream Decor", amount: "₹50,000", status: "pending" },
    { id: 4, customer: "Sneha Patel", vendor: "Rhythm Entertainment", amount: "₹35,000", status: "cancelled" },
];
const alerts = [
    { type: "warning", message: "3 vendor verifications pending for 5+ days" },
    { type: "info", message: "System maintenance scheduled for Sunday 2 AM" },
    { type: "success", message: "Payment gateway integration successful" },
];
export default function AdminDashboardPage() {
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-600"/>;
            case "confirmed":
                return <CheckCircle className="h-4 w-4 text-blue-600"/>;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-600"/>;
            case "cancelled":
                return <XCircle className="h-4 w-4 text-red-600"/>;
            default:
                return null;
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <Link to="/admin/dashboard/analytics">
          <Button className="bg-primary hover:bg-primary/90">
            <BarChart3 className="mr-2 h-4 w-4"/>
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((alert, index) => (<div key={index} className={`flex items-center gap-3 rounded-lg border p-3 ${alert.type === "warning"
                ? "border-yellow-200 bg-yellow-50"
                : alert.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"}`}>
            <AlertTriangle className={`h-4 w-4 ${alert.type === "warning"
                ? "text-yellow-600"
                : alert.type === "success"
                    ? "text-green-600"
                    : "text-blue-600"}`}/>
            <span className="text-sm text-foreground">{alert.message}</span>
          </div>))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (<div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`mt-1 flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend === "up" ? (<TrendingUp className="h-3 w-3"/>) : (<TrendingDown className="h-3 w-3"/>)}
                  {stat.change} from last month
                </p>
              </div>
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6"/>
              </div>
            </div>
          </div>))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Recent Registrations</h2>
            <Link to="/admin/dashboard/users" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.map((user) => (<div key={user.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.type === "vendor"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"}`}>
                    {user.type}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">{user.date}</p>
                </div>
              </div>))}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Pending Verifications</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
              {pendingVerifications.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {pendingVerifications.map((vendor) => (<div key={vendor.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {vendor.submitted}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <CheckCircle className="mr-1 h-3 w-3"/>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>))}
          </div>
          <div className="border-t border-border p-4">
            <Link to="/admin/dashboard/moderation">
              <Button variant="outline" className="w-full">
                View All Pending
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <Link to="/admin/dashboard/bookings" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBookings.map((booking) => (<div key={booking.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {booking.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.vendor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {booking.amount}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      {getStatusIcon(booking.status)}
                      <span className="text-xs capitalize text-muted-foreground">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/dashboard/users">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="h-4 w-4 text-primary"/>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/dashboard/vendors">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Store className="h-4 w-4 text-primary"/>
              Manage Vendors
            </Button>
          </Link>
          <Link to="/admin/dashboard/transactions">
            <Button variant="outline" className="w-full justify-start gap-2">
              <DollarSign className="h-4 w-4 text-primary"/>
              View Transactions
            </Button>
          </Link>
          <Link to="/admin/dashboard/reports">
            <Button variant="outline" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4 text-primary"/>
              Generate Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>);
}
