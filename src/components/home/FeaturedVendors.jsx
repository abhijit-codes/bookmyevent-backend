import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Star, MapPin, Heart, ArrowRight, BadgeCheck } from "lucide-react";
const featuredVendors = [
    {
        id: 1,
        name: "Elite Photography Studio",
        category: "Photography",
        rating: 4.9,
        reviews: 234,
        location: "Mumbai, Maharashtra",
        price: "₹25,000",
        priceUnit: "per day",
        image: "/vendors/photography-1.jpg",
        verified: true,
        featured: true,
    },
    {
        id: 2,
        name: "Royal Caterers",
        category: "Catering",
        rating: 4.8,
        reviews: 189,
        location: "Delhi, NCR",
        price: "₹800",
        priceUnit: "per plate",
        image: "/vendors/catering-1.jpg",
        verified: true,
        featured: true,
    },
    {
        id: 3,
        name: "Dream Decor Studio",
        category: "Decoration",
        rating: 4.9,
        reviews: 156,
        location: "Bangalore, Karnataka",
        price: "₹50,000",
        priceUnit: "starting",
        image: "/vendors/decor-1.jpg",
        verified: true,
        featured: false,
    },
    {
        id: 4,
        name: "Rhythm Entertainment",
        category: "Entertainment",
        rating: 4.7,
        reviews: 98,
        location: "Pune, Maharashtra",
        price: "₹35,000",
        priceUnit: "per event",
        image: "/vendors/entertainment-1.jpg",
        verified: true,
        featured: true,
    },
    {
        id: 5,
        name: "Blossom Florals",
        category: "Florists",
        rating: 4.8,
        reviews: 145,
        location: "Hyderabad, Telangana",
        price: "₹15,000",
        priceUnit: "starting",
        image: "/vendors/florist-1.jpg",
        verified: true,
        featured: false,
    },
    {
        id: 6,
        name: "Grand Palace Venue",
        category: "Venues",
        rating: 4.9,
        reviews: 267,
        location: "Jaipur, Rajasthan",
        price: "₹2,00,000",
        priceUnit: "per day",
        image: "/vendors/venue-1.jpg",
        verified: true,
        featured: true,
    },
];
export function FeaturedVendors() {
    return (<section className="bg-muted/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Vendors
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Top-rated professionals loved by our customers
            </p>
          </div>
          <Link to="/vendors">
            <Button variant="outline" className="group">
              View All Vendors
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVendors.map((vendor) => (<Link key={vendor.id} to={`/vendors/${vendor.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">{vendor.name.charAt(0)}</span>
                </div>
                {vendor.featured && (<div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">
                    Featured
                  </div>)}
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-muted-foreground transition-colors hover:text-red-500">
                  <Heart className="h-4 w-4"/>
                </button>
                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-sm">
                  {vendor.price}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {vendor.priceUnit}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {vendor.name}
                      </h3>
                      {vendor.verified && (<BadgeCheck className="h-4 w-4 text-primary"/>)}
                    </div>
                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent"/>
                    <span className="font-medium text-foreground">{vendor.rating}</span>
                    <span className="text-muted-foreground">({vendor.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4"/>
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </div>
            </Link>))}
        </div>
      </div>
    </section>);
}
