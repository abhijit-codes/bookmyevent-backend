import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/Button";
import { logout } from "@/features/auth/authSlice";
import { ChevronDown, Menu, X, Search, User } from "lucide-react";
import logoUrl from "../ChatGPT Image Apr 28, 2026, 01_10_24 AM.png";
const navLinkClass = "rounded-full px-3 py-2 text-sm font-semibold text-[#26364f] transition-colors hover:bg-white/70 hover:text-primary";
const districts = ["Khurda", "Cuttack", "Puri", "Bhubaneswar", "Balasore", "Sambalpur", "Berhampur"];

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const account = useSelector((state) => state.auth.account);
    const profilePath = account?.role === "vendor" ? "/vendor/dashboard" : account?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    const submitSearch = (event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      navigate(`/vendors${params.toString() ? `?${params.toString()}` : ""}`);
      setIsMenuOpen(false);
    };
    const selectDistrict = (event) => {
      const city = event.target.value;
      if (city) navigate(`/vendors?city=${encodeURIComponent(city)}`);
    };
    return (<header className="sticky top-0 z-50 w-full border-b border-[#efc8d2] bg-gradient-to-r from-white via-[#fff4f7] to-[#eef4ff] shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex min-h-24 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logoUrl} alt="BookMyEvent logo" className="h-20 w-20 rounded-md object-cover shadow-sm"/>
            <span className="hidden whitespace-nowrap text-xl font-bold text-[#24324a] xl:inline">
              Book<span className="text-primary">My</span>Event
            </span>
          </Link>
        </div>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link to="/vendors" className={navLinkClass}>Vendors</Link>
          <Link to="/vendors?event=wedding" className={navLinkClass}>Weddings</Link>
          <Link to="/vendors?event=party" className={navLinkClass}>Parties</Link>
        </nav>

        <form onSubmit={submitSearch} className="hidden min-w-40 flex-1 items-center gap-2 rounded-full border border-[#efc8d2] bg-white/85 px-4 py-2 shadow-sm md:flex">
            <Search className="h-4 w-4 text-muted-foreground"/>
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendors..." className="w-40 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:ring-0"/>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative hidden xl:block">
            <select onChange={selectDistrict} defaultValue="" className="h-10 appearance-none rounded-full border border-[#efc8d2] bg-white/90 pl-4 pr-10 text-sm font-semibold text-[#26364f] shadow-sm outline-none transition-colors hover:border-primary/60 hover:text-primary">
              <option value="">Select District</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#26364f]" />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {account ? (<>
              <Link to={profilePath}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4"/>
                  {account.name || "Profile"}
                </Button>
              </Link>
              <button onClick={() => dispatch(logout())} className="text-sm font-medium text-muted-foreground hover:text-primary">Logout</button>
            </>) : (<>
              <Link to="/login"><Button variant="ghost" size="sm" className="rounded-full px-4 text-[#26364f] hover:text-primary">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-full bg-primary px-5 hover:bg-primary/90">Sign up</Button></Link>
              <Link to="/vendor/login"><Button size="sm" variant="outline" className="rounded-full border-primary/25 bg-white/80 px-5 text-primary hover:bg-primary/10">Login as Vendor</Button></Link>
            </>)}
          </div>

          <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (<X className="h-6 w-6 text-foreground"/>) : (<Menu className="h-6 w-6 text-foreground"/>)}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (<div className="border-t border-[#efc8d2] bg-white/95 lg:hidden">
          <div className="space-y-1 px-4 py-4">
            <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground"/>
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendors..." className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
            </form>
            <Link to="/vendors" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Vendors
            </Link>
            <Link to="/vendors?event=wedding" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Weddings
            </Link>
            <Link to="/vendors?event=party" className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Parties
            </Link>
            <select onChange={selectDistrict} defaultValue="" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none">
              <option value="">Select District</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <div className="flex gap-2 pt-4">
              {account ? (<Link to={profilePath} className="flex-1"><Button className="w-full bg-primary hover:bg-primary/90">Profile</Button></Link>) : (<>
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
                <Link to="/signup" className="flex-1"><Button className="w-full bg-primary hover:bg-primary/90">Sign up</Button></Link>
              </>)}
            </div>
            {!account && (
              <Link to="/vendor/login" className="block pt-2">
                <Button variant="outline" className="w-full border-primary/25 text-primary">Login as Vendor</Button>
              </Link>
            )}
          </div>
        </div>)}
    </header>);
}
