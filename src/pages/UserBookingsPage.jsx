import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useConfirmUpiRemainingPaymentMutation, useGetMyBookingsQuery } from "@/features/api/apiSlice"
import { Calendar, CheckCircle, CreditCard, Mail, MapPin, Phone } from "lucide-react"

const ADMIN_UPI_ID = "8144273014-2@ybl"
const QR_SECONDS = 120
const money = (value) => `Rs.${Number(value || 0).toLocaleString("en-IN")}`
const dueCountdown = (dueAt, now) => {
  if (!dueAt) return ""
  const diff = new Date(dueAt).getTime() - now
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
}

export default function UserBookingsPage() {
  const { data: bookings = [], isLoading, isError, refetch } = useGetMyBookingsQuery(undefined, { pollingInterval: 30000 })
  const [confirmUpiRemainingPayment] = useConfirmUpiRemainingPaymentMutation()
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [upiReference, setUpiReference] = useState("")
  const [secondsLeft, setSecondsLeft] = useState(QR_SECONDS)
  const [now, setNow] = useState(Date.now())
  const [message, setMessage] = useState("")

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (bookings.some((booking) => booking.status === "vendor_confirmed" && booking.remaining_due_at && new Date(booking.remaining_due_at).getTime() <= now)) {
      refetch()
    }
  }, [bookings, now, refetch])

  useEffect(() => {
    if (!activeBookingId) return undefined
    setSecondsLeft(QR_SECONDS)
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setActiveBookingId(null)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [activeBookingId])

  const upiForBooking = (booking) => {
    const amount = Number(booking.remaining_amount || 0)
    const url = `upi://pay?pa=${encodeURIComponent(ADMIN_UPI_ID)}&pn=${encodeURIComponent("BookMyEvent Admin")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Remaining payment ${booking.booking_number}`)}`
    return {
      url,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`,
    }
  }

  const confirmRemaining = async (booking) => {
    setMessage("")
    try {
      await confirmUpiRemainingPayment({ bookingId: booking.id, upiReference }).unwrap()
      setActiveBookingId(null)
      setUpiReference("")
      setMessage("Remaining payment recorded. Your order is confirmed.")
    } catch (err) {
      setMessage(err?.data?.message || "Unable to confirm remaining payment.")
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">My Orders</h1><p className="text-muted-foreground">Track booking requests, confirmations, and remaining payments.</p></div>
      {message && <p className="rounded-xl border border-border bg-card p-3 text-sm text-primary">{message}</p>}
      <div className="space-y-4">
        {isLoading && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">Loading orders...</p>}
        {isError && <p className="rounded-xl border border-border bg-card p-5 text-red-600">Unable to load orders.</p>}
        {bookings.map((booking) => {
          const upi = upiForBooking(booking)
          return (
            <div key={booking.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{booking.Vendor?.name}</h2>
                  <p className="text-sm text-muted-foreground">{booking.VendorService?.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{booking.event_date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{booking.event_address}</span>
                  </div>
                  {["advance_paid", "vendor_confirmed", "fully_paid", "completed"].includes(booking.status) && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Vendor contact shared after advance payment</p>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{booking.Vendor?.phone || "N/A"}</span>
                        <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{booking.Vendor?.email || "N/A"}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{money(booking.service_amount)}</p>
                  <span className="mt-1 inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">{booking.status}</span>
                </div>
              </div>
              {booking.status === "vendor_confirmed" && (
                <div className="mt-4">
                  <div className="mb-3 rounded-lg bg-primary/10 p-3 text-sm text-foreground">
                    <p className="font-semibold">Remaining due: {money(booking.remaining_amount)}</p>
                    <p className="text-muted-foreground">Pay within 48 hours. Time left: <span className="font-medium text-foreground">{dueCountdown(booking.remaining_due_at, now)}</span></p>
                  </div>
                  <Button disabled={dueCountdown(booking.remaining_due_at, now) === "Expired"} onClick={() => setActiveBookingId(booking.id)} className="bg-primary hover:bg-primary/90"><CreditCard className="mr-2 h-4 w-4" />Pay Remaining {money(booking.remaining_amount)}</Button>
                  {activeBookingId === booking.id && (
                    <div className="mt-4 rounded-xl border border-border bg-background p-5 text-center">
                      <p className="font-semibold text-foreground">Scan and pay remaining amount to admin</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ADMIN_UPI_ID}</p>
                      <img src={upi.qrUrl} alt="Remaining UPI payment QR code" className="mx-auto mt-4 h-60 w-60 rounded-lg border border-border bg-white p-3" />
                      <a href={upi.url} className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">Open UPI app</a>
                      <p className="mt-3 text-sm text-muted-foreground">QR expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
                      <Input value={upiReference} onChange={(event) => setUpiReference(event.target.value)} placeholder="UPI reference ID optional" className="mt-4" />
                      <Button onClick={() => confirmRemaining(booking)} className="mt-4 w-full bg-primary hover:bg-primary/90"><CheckCircle className="mr-2 h-4 w-4" />I have paid</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {!isLoading && bookings.length === 0 && <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  )
}
