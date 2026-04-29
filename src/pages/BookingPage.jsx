import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useCreateUpiAdvanceBookingMutation, useGetVendorQuery } from "@/features/api/apiSlice"
import { BadgeCheck, CheckCircle, ChevronLeft, CreditCard, Shield, Star } from "lucide-react"

const ADMIN_UPI_ID = "8144273014-2@ybl"
const QR_SECONDS = 120
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1").replace("/api/v1", "")
const resolveUrl = (url) => {
  if (!url) return ""
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`
}

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: vendor, isLoading } = useGetVendorQuery(id)
  const [selectedService, setSelectedService] = useState(null)
  const [form, setForm] = useState({ eventDate: "", eventTime: "", eventAddress: "", eventCity: "", eventState: "", eventPincode: "", notes: "" })
  const [upiReference, setUpiReference] = useState("")
  const [showUpi, setShowUpi] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(QR_SECONDS)
  const [message, setMessage] = useState("")
  const [createUpiAdvanceBooking, upiState] = useCreateUpiAdvanceBookingMutation()
  const services = vendor?.VendorServices ?? []
  const avatar = resolveUrl(vendor?.profile_image_url)

  useEffect(() => {
    if (!selectedService && services.length) setSelectedService(services[0])
  }, [services, selectedService])

  useEffect(() => {
    if (!showUpi) return undefined
    setSecondsLeft(QR_SECONDS)
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setShowUpi(false)
          setMessage("Payment time expired. Please open the scanner again.")
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [showUpi])

  const serviceAmount = Number(selectedService?.price || 0)
  const advanceAmount = 1000
  const remainingAmount = Math.max(serviceAmount - advanceAmount, 0)
  const upiUrl = `upi://pay?pa=${encodeURIComponent(ADMIN_UPI_ID)}&pn=${encodeURIComponent("BookMyEvent Admin")}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(`${selectedService?.title || "Booking"} advance`)}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handlePayAdvance = () => {
    setMessage("")
    if (!selectedService || !form.eventDate || !form.eventAddress) {
      setMessage("Please select a service, date, and event location.")
      return
    }
    setShowUpi(true)
  }

  const handleConfirmUpiPayment = async () => {
    try {
      const booking = await createUpiAdvanceBooking({ vendorServiceId: selectedService.id, upiReference, ...form }).unwrap()
      navigate(`/booking/success/${booking.data.id}`)
    } catch (err) {
      setMessage(err?.data?.message || "Unable to confirm UPI payment.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <Link to={`/vendors/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to Vendor</Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading || !vendor ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading booking details...</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold text-foreground">Book vendor with Rs.1,000 advance</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pay the advance to admin UPI. Vendor must accept or cancel within 24 hours. If accepted, pay the remaining amount within 48 hours.</p>

                  <div className="mt-6 space-y-3">
                    {services.map((service) => (
                      <button key={service.id} type="button" onClick={() => setSelectedService(service)} className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div><h3 className="font-medium text-foreground">{service.title}</h3><p className="text-sm text-muted-foreground">{service.description || service.city}</p></div>
                        <p className="font-semibold text-foreground">Rs.{Number(service.price).toLocaleString("en-IN")}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div><Label>Event Date</Label><Input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className="mt-2" /></div>
                    <div><Label>Preferred Time</Label><Input type="time" value={form.eventTime} onChange={(e) => update("eventTime", e.target.value)} className="mt-2" /></div>
                    <div className="sm:col-span-2"><Label>Event Location</Label><Input value={form.eventAddress} onChange={(e) => update("eventAddress", e.target.value)} placeholder="Full event address" className="mt-2" /></div>
                    <div><Label>City</Label><Input value={form.eventCity} onChange={(e) => update("eventCity", e.target.value)} className="mt-2" /></div>
                    <div><Label>State</Label><Input value={form.eventState} onChange={(e) => update("eventState", e.target.value)} className="mt-2" /></div>
                    <div><Label>Pincode</Label><Input value={form.eventPincode} onChange={(e) => update("eventPincode", e.target.value)} className="mt-2" /></div>
                    <div className="sm:col-span-2"><Label>Special Requests</Label><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /></div>
                  </div>

                  {message && <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{message}</p>}
                  <Button onClick={handlePayAdvance} className="mt-6 w-full bg-primary hover:bg-primary/90" disabled={upiState.isLoading}>
                    <CreditCard className="mr-2 h-4 w-4" /> Pay Rs.1,000 Advance by UPI
                  </Button>

                  {showUpi && (
                    <div className="mt-6 rounded-xl border border-border bg-background p-5 text-center">
                      <p className="font-semibold text-foreground">Scan and pay Rs.1,000 to admin</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ADMIN_UPI_ID}</p>
                      <img src={qrUrl} alt="Admin UPI payment QR code" className="mx-auto mt-4 h-64 w-64 rounded-lg border border-border bg-white p-3" />
                      <a href={upiUrl} className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">Open UPI app</a>
                      <p className="mt-3 text-sm text-muted-foreground">QR expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
                      <Input value={upiReference} onChange={(event) => setUpiReference(event.target.value)} placeholder="UPI reference ID optional" className="mt-4" />
                      <Button onClick={handleConfirmUpiPayment} className="mt-4 w-full bg-primary hover:bg-primary/90" disabled={upiState.isLoading}>
                        <CheckCircle className="mr-2 h-4 w-4" /> I have paid
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground">Booking Summary</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-primary/10">
                      {avatar ? <img src={avatar} alt={vendor.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">{vendor.name.charAt(0)}</div>}
                    </div>
                    <div><div className="flex items-center gap-1"><p className="font-medium text-foreground">{vendor.name}</p><BadgeCheck className="h-4 w-4 text-primary" /></div><div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3 w-3 fill-accent text-accent" /><span>Verified</span></div></div>
                  </div>
                  <div className="my-4 h-px bg-border" />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium text-foreground">{selectedService?.title || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service Price</span><span>Rs.{serviceAmount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Advance now</span><span>Rs.{advanceAmount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Remaining after confirm</span><span>Rs.{remainingAmount.toLocaleString("en-IN")}</span></div>
                  </div>
                  <div className="mt-4 rounded-lg bg-muted/50 p-3"><div className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">If vendor cancels, advance refund should be processed within 48 hours. If vendor accepts, remaining payment is due within 48 hours.</p></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
