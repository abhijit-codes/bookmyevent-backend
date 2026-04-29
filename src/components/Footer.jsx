import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logoUrl from "../ChatGPT Image Apr 28, 2026, 01_10_24 AM.png";
export function Footer() {
    return (<footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="BookMyEvent logo" className="h-10 w-10 rounded-md object-cover shadow-sm"/>
              <span className="text-xl font-bold">
                Book<span className="text-primary">My</span>Event
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop platform for booking premium event vendors.
            </p>
            <div className="mt-6 flex gap-4">
              <a to="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5"/>
              </a>
              <a to="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5"/>
              </a>
              <a to="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5"/>
              </a>
              <a to="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Linkedin className="h-5 w-5"/>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/vendors?category=photography" className="text-sm text-muted-foreground hover:text-primary">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=catering" className="text-sm text-muted-foreground hover:text-primary">
                  Catering
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=decoration" className="text-sm text-muted-foreground hover:text-primary">
                  Decoration
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=entertainment" className="text-sm text-muted-foreground hover:text-primary">
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">For Vendors</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/vendor/login" className="text-sm text-muted-foreground hover:text-primary">
                  Partner Login
                </Link>
              </li>
              <li>
                <Link to="/vendor/register" className="text-sm text-muted-foreground hover:text-primary">
                  Register as Vendor
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/resources" className="text-sm text-muted-foreground hover:text-primary">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/vendor/pricing" className="text-sm text-muted-foreground hover:text-primary">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/20 pt-8">
          <div className="mb-4 text-center">
            <Link to="/admin/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Admin Login
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BookMyEvent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>);
}
