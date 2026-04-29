import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { CameraCapture } from "@/components/CameraCapture"
import {
  useGetMeQuery,
  useGetMyBookingsQuery,
  useGetVendorsQuery,
  useSendUserSupportMessageMutation,
  useUpdateMeMutation,
  useUpdateMyProfileImageMutation,
} from "@/features/api/apiSlice"
import { Bell, Camera, CreditCard, Heart, MapPin, Save, Send, Settings, Star, User, X } from "lucide-react"

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}
const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const favoriteKey = (userId) => `book-my-event:favorites:${userId || "guest"}`

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</div>
}

function EmptyState({ children }) {
  return <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{children}</p>
}

function useFavoriteIds(userId) {
  const [ids, setIds] = useState([])

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(favoriteKey(userId)) || "[]"))
    } catch {
      setIds([])
    }
  }, [userId])

  const removeFavorite = (id) => {
    const next = ids.filter((item) => Number(item) !== Number(id))
    setIds(next)
    localStorage.setItem(favoriteKey(userId), JSON.stringify(next))
  }

  return { ids, removeFavorite }
}

function bookingNotifications(bookings = []) {
  return bookings.flatMap((booking) => {
    const vendor = booking.Vendor?.business_name || booking.Vendor?.name || "Vendor"
    if (booking.status === "vendor_confirmed") return [`${vendor} accepted your booking. Pay ${money(booking.remaining_amount)} before the 48-hour deadline.`]
    if (booking.status === "fully_paid") return [`Your order with ${vendor} is confirmed.`]
    if (booking.status === "expired") return [`Your payment window for ${vendor} expired and the order was cancelled.`]
    if (booking.status === "rejected") return [`${vendor} cancelled your booking request. Refund should be processed within 48 hours.`]
    return [`Booking ${booking.booking_number} is ${String(booking.status).replace(/_/g, " ")}.`]
  })
}

export function UserFavoritesPage() {
  const { data: account } = useGetMeQuery()
  const { data: vendors = [], isLoading } = useGetVendorsQuery()
  const { ids, removeFavorite } = useFavoriteIds(account?.id)
  const favorites = vendors.filter((vendor) => ids.includes(vendor.id) || ids.includes(String(vendor.id)))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Favorites</h1><p className="text-muted-foreground">Vendors you saved for quick booking.</p></div>
      {isLoading && <EmptyState>Loading favorites...</EmptyState>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((vendor) => (
          <Card key={vendor.id}>
            <Link to={`/vendors/${vendor.id}`} className="flex items-start gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-primary/10">
                {vendor.profile_image_url ? <img src={resolveUrl(vendor.profile_image_url)} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold text-primary">{vendor.name.charAt(0)}</div>}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-foreground">{vendor.business_name || vendor.name}</h2>
                <p className="text-sm text-muted-foreground">{vendor.VendorServices?.[0]?.Category?.name || "Vendor"}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{[vendor.city, vendor.state].filter(Boolean).join(", ")}</p>
              </div>
            </Link>
            <Button variant="outline" className="mt-4 w-full" onClick={() => removeFavorite(vendor.id)}><Heart className="mr-2 h-4 w-4 fill-current" />Remove</Button>
          </Card>
        ))}
      </div>
      {!isLoading && favorites.length === 0 && <EmptyState>No favorites yet. Open a vendor and save it from the heart button.</EmptyState>}
    </div>
  )
}

export function UserMessagesPage() {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [sendMessage, sendState] = useSendUserSupportMessageMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")
    try {
      await sendMessage({ message }).unwrap()
      setMessage("")
      setStatus("Message sent to admin.")
    } catch (err) {
      setStatus(err?.data?.message || "Unable to send message.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Messages</h1><p className="text-muted-foreground">Send a support message directly to admin.</p></div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5">
        <Label>Message to admin</Label>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={7} className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm outline-none" placeholder="Write your question or issue..." />
        {status && <p className="mt-3 text-sm text-primary">{status}</p>}
        <Button disabled={sendState.isLoading} className="mt-4 bg-primary hover:bg-primary/90"><Send className="mr-2 h-4 w-4" />{sendState.isLoading ? "Sending..." : "Send Message"}</Button>
      </form>
    </div>
  )
}

export function UserNotificationsPage() {
  const { data: bookings = [], isLoading } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const notifications = bookingNotifications(bookings)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Notifications</h1><p className="text-muted-foreground">Booking and payment updates appear here.</p></div>
      {isLoading && <EmptyState>Loading notifications...</EmptyState>}
      <div className="space-y-3">{notifications.map((item, index) => <Card key={`${item}-${index}`} className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><p className="text-sm text-foreground">{item}</p></Card>)}</div>
      {!isLoading && notifications.length === 0 && <EmptyState>No notifications yet.</EmptyState>}
    </div>
  )
}

export function UserPaymentsPage() {
  const { data: bookings = [], isLoading } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const payments = bookings.flatMap((booking) => (booking.Payments || []).map((payment) => ({ ...payment, booking })))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Payments</h1><p className="text-muted-foreground">Advance, remaining, and refund records.</p></div>
      {isLoading && <EmptyState>Loading payments...</EmptyState>}
      <div className="space-y-3">
        {payments.map((payment) => (
          <Card key={payment.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><CreditCard className="h-5 w-5" /></div>
              <div><p className="font-semibold capitalize text-foreground">{payment.type} payment</p><p className="text-sm text-muted-foreground">{payment.booking?.Vendor?.name} - {payment.booking?.VendorService?.title}</p></div>
            </div>
            <div className="text-left sm:text-right"><p className="font-bold text-foreground">{money(payment.amount)}</p><p className="text-xs capitalize text-muted-foreground">{payment.status} via {payment.provider}</p></div>
          </Card>
        ))}
      </div>
      {!isLoading && payments.length === 0 && <EmptyState>No payments yet.</EmptyState>}
    </div>
  )
}

export function UserProfilePage() {
  const { data: account, isLoading } = useGetMeQuery()
  const [message, setMessage] = useState("")
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraSession, setCameraSession] = useState(0)
  const [capturedImage, setCapturedImage] = useState(null)
  const [updateMe, updateState] = useUpdateMeMutation()
  const [updateImage, imageState] = useUpdateMyProfileImageMutation()
  const avatar = resolveUrl(account?.profile_image_url)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      await updateMe(Object.fromEntries(form.entries())).unwrap()
      setMessage("Profile saved successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to save profile.")
    }
  }

  const handleSaveImage = async () => {
    if (!capturedImage) return
    setMessage("")
    try {
      await updateImage({ profileImage: capturedImage }).unwrap()
      setCapturedImage(null)
      setCameraOpen(false)
      setMessage("Profile photo updated successfully.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to update profile photo.")
    }
  }

  if (isLoading) return <EmptyState>Loading profile...</EmptyState>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => { setCapturedImage(null); setCameraSession((current) => current + 1); setCameraOpen(true) }} className="group relative h-20 w-20 overflow-hidden rounded-full border border-border bg-primary/10">
          {avatar ? <img src={avatar} alt={account?.name || "Customer"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">{(account?.name || "C").charAt(0)}</div>}
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"><Camera className="h-6 w-6" /></span>
        </button>
        <div><h1 className="text-2xl font-bold text-foreground">Profile</h1><p className="text-muted-foreground">Update customer details and profile photo.</p></div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Update DP</h2><p className="text-sm text-muted-foreground">Capture and save a live profile photo.</p></div><Button type="button" variant="ghost" size="icon" onClick={() => setCameraOpen(false)}><X className="h-5 w-5" /></Button></div>
            <CameraCapture key={cameraSession} label="Live photo" name="profileImage" facingMode="user" onCapture={(_name, file) => setCapturedImage(file)} />
            <div className="mt-4 flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={() => { setCapturedImage(null); setCameraSession((current) => current + 1) }}>Retake</Button><Button type="button" disabled={!capturedImage || imageState.isLoading} className="flex-[2] bg-primary hover:bg-primary/90" onClick={handleSaveImage}>{imageState.isLoading ? "Saving..." : "Save Photo"}</Button></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div><Label>Name</Label><Input name="name" required className="mt-2" defaultValue={account?.name || ""} /></div>
        <div><Label>Email</Label><Input disabled className="mt-2" value={account?.email || ""} /></div>
        <div><Label>Phone</Label><Input name="phone" className="mt-2" defaultValue={account?.phone || ""} /></div>
        {message && <p className="sm:col-span-2 text-sm text-primary">{message}</p>}
        <Button disabled={updateState.isLoading} className="sm:col-span-2 bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4" />{updateState.isLoading ? "Saving..." : "Save Profile"}</Button>
      </form>
    </div>
  )
}

export function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground">Manage profile, payments, and support from one place.</p></div>
      <Card><div className="flex items-center gap-3"><User className="h-6 w-6 text-primary" /><div><h2 className="font-semibold">Profile settings</h2><p className="text-sm text-muted-foreground">Use Profile to update customer details and DP.</p></div></div></Card>
      <Card><div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-primary" /><div><h2 className="font-semibold">Payment settings</h2><p className="text-sm text-muted-foreground">Use Payments to review advance and remaining payments.</p></div></div></Card>
      <Card><div className="flex items-center gap-3"><Settings className="h-6 w-6 text-primary" /><div><h2 className="font-semibold">Account access</h2><p className="text-sm text-muted-foreground">Use the sidebar Log Out button to end your session.</p></div></div></Card>
    </div>
  )
}
