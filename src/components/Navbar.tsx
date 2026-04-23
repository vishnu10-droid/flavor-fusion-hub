import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, MapPin, User, Menu, LogOut, ShieldCheck } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export function Navbar() {
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-app flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground font-display text-lg font-black shadow-glow">
            O
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Order<span className="text-brand">X</span>
          </span>
        </Link>

        <button className="ml-2 hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-brand hover:text-brand md:inline-flex">
          <MapPin className="h-4 w-4 text-brand" />
          London, UK
        </button>

        <div className="ml-auto hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search restaurants or dishes…"
              className="h-10 w-full rounded-full border border-border bg-secondary pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:bg-background focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/restaurants"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-foreground/70 transition hover:text-brand md:inline-flex"
          >
            Restaurants
          </Link>
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                  {user.role === "admin" ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => {
                  logout();
                  toast.success("Logged out successfully.");
                }}
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/login">
                <User className="h-4 w-4" /> Log in
              </Link>
            </Button>
          )}
          <Link
            to="/cart"
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-card transition hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-bold text-ink-foreground">
                {count}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-app flex flex-col gap-2 py-3">
            <Link to="/restaurants" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
              Restaurants
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    toast.success("Logged out successfully.");
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
