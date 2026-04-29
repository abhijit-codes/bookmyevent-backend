import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useApproveVendorMutation, useGetAdminVendorsQuery, useRejectVendorMutation, useSuspendVendorMutation } from "@/features/api/apiSlice"
import { BadgeCheck, CheckCircle, Search, Store, XCircle } from "lucide-react"

const tabs = ["All", "Approved", "Pending", "Rejected", "Suspended"]

export default function AdminVendorsPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const { data: vendors = [], isLoading, isError } = useGetAdminVendorsQuery()
  const [approveVendor] = useApproveVendorMutation()
  const [rejectVendor] = useRejectVendorMutation()
  const [suspendVendor] = useSuspendVendorMutation()

  const filteredVendors = vendors.filter((vendor) => {
    const matchesTab = activeTab === "All" || vendor.status === activeTab.toLowerCase()
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const color = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700"
    if (status === "pending") return "bg-yellow-100 text-yellow-700"
    if (status === "rejected" || status === "suspended") return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Vendors</h1><p className="text-muted-foreground">Approve, reject, and monitor vendor registrations.</p></div>
        <Button className="bg-primary hover:bg-primary/90"><Store className="mr-2 h-4 w-4" />Vendor Approval Queue</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>{tab}</button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading vendors...</p>}
          {isError && <p className="p-5 text-sm text-red-600">Unable to load vendors.</p>}
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{vendor.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">{vendor.business_name || vendor.name}</h3>{vendor.status === "approved" && <BadgeCheck className="h-4 w-4 text-primary" />}</div>
                    <p className="text-sm text-muted-foreground">{vendor.name} · {vendor.email} · {vendor.phone}</p>
                    <p className="text-xs text-muted-foreground">{vendor.address1}, {vendor.city}, {vendor.state} {vendor.pincode}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${color(vendor.status)}`}>{vendor.status}</span>
                  {vendor.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => approveVendor(vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-1 h-3 w-3" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectVendor(vendor.id)}><XCircle className="mr-1 h-3 w-3" />Reject</Button>
                    </>
                  )}
                  {vendor.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => suspendVendor(vendor.id)}><XCircle className="mr-1 h-3 w-3" />Suspend</Button>
                  )}
                  {vendor.status === "suspended" && (
                    <Button size="sm" onClick={() => approveVendor(vendor.id)} className="bg-primary hover:bg-primary/90"><CheckCircle className="mr-1 h-3 w-3" />Reactivate</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!isLoading && filteredVendors.length === 0 && <p className="p-5 text-sm text-muted-foreground">No vendors found.</p>}
        </div>
      </div>
    </div>
  )
}
