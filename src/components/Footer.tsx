import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-app grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display text-lg font-black">O</span>
            <span className="font-display text-xl font-extrabold">
              Order<span className="text-brand">X</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/60">
            Feast your senses. Fast, fresh delivery from your favourite local restaurants.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-brand">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Company", links: [["About", "/"], ["Careers", "/"], ["Blog", "/"], ["Press", "/"]] },
          { title: "For You", links: [["Restaurants", "/restaurants"], ["Cuisines", "/restaurants"], ["Cart", "/cart"], ["Help", "/"]] },
          { title: "Legal", links: [["Terms", "/"], ["Privacy", "/"], ["Cookies", "/"], ["Refunds", "/"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink-foreground/70">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-ink-foreground/70 transition hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} OrderX. All rights reserved.</p>
          <p>Crafted with care for hungry humans.</p>
        </div>
      </div>
    </footer>
  );
}
