import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, MoreVertical, Mail, Ban, Trash2, Eye, Download, Filter, UserPlus, } from "lucide-react";
const users = [
    {
        id: 1,
        name: "Priya Sharma",
        email: "priya@email.com",
        phone: "+91 98765 43210",
        type: "user",
        status: "active",
        bookings: 5,
        spent: "₹2,45,000",
        joined: "Jan 15, 2026",
    },
    {
        id: 2,
        name: "Rahul Verma",
        email: "rahul@email.com",
        phone: "+91 98765 43211",
        type: "user",
        status: "active",
        bookings: 3,
        spent: "₹1,20,000",
        joined: "Feb 20, 2026",
    },
    {
        id: 3,
        name: "Anita Desai",
        email: "anita@email.com",
        phone: "+91 98765 43212",
        type: "user",
        status: "active",
        bookings: 8,
        spent: "₹4,50,000",
        joined: "Dec 5, 2025",
    },
    {
        id: 4,
        name: "Vikram Singh",
        email: "vikram@email.com",
        phone: "+91 98765 43213",
        type: "user",
        status: "suspended",
        bookings: 2,
        spent: "₹85,000",
        joined: "Mar 10, 2026",
    },
    {
        id: 5,
        name: "Neha Gupta",
        email: "neha@email.com",
        phone: "+91 98765 43214",
        type: "user",
        status: "active",
        bookings: 1,
        spent: "₹75,000",
        joined: "Apr 1, 2026",
    },
    {
        id: 6,
        name: "Amit Kumar",
        email: "amit@email.com",
        phone: "+91 98765 43215",
        type: "user",
        status: "inactive",
        bookings: 0,
        spent: "₹0",
        joined: "Apr 10, 2026",
    },
];
export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "suspended":
                return "bg-red-100 text-red-700";
            case "inactive":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        }
        else {
            setSelectedUsers(filteredUsers.map((u) => u.id));
        }
    };
    const toggleSelectUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
        }
        else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };
    return (<div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">
            Manage platform users and their accounts
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4"/>
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4"/>
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4"/>
            Export
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (<div className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            {selectedUsers.length} selected
          </span>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4"/>
            Email
          </Button>
          <Button variant="outline" size="sm">
            <Ban className="mr-2 h-4 w-4"/>
            Suspend
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4"/>
            Delete
          </Button>
        </div>)}

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedUsers.length === filteredUsers.length} onChange={toggleSelectAll} className="rounded border-border"/>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Bookings
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (<tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded border-border"/>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {user.phone}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {user.bookings}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-foreground">
                    {user.spent}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {user.joined}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-muted-foreground"/>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                      </Button>
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>);
}
