import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@/lib/data";

export function RestaurantCard({ r, index = 0 }: { r: Restaurant; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05, ease: "easeOut" }}
    >
      <Link
        to="/restaurants/$id"
        params={{ id: r.id }}
        className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <img
            src={r.image}
            alt={r.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-bold shadow-card">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {r.rating}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground shadow-glow">
            {"$".repeat(r.priceLevel)}
          </span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-background px-4 py-2 text-xs font-bold text-foreground opacity-0 shadow-card-hover transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View Menu →
          </span>
        </div>
        <div className="p-4">
          <h3 className="truncate font-display text-base font-bold">{r.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.cuisine}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand" />
              {r.deliveryTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-brand" />${r.deliveryFee.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
