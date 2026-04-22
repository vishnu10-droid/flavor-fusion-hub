import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Category } from "@/lib/data";

export function CategoryPill({ cat, index = 0 }: { cat: Category; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to="/restaurants"
        search={{ category: cat.id }}
        className="group flex flex-col items-center gap-2.5"
      >
        <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-background bg-brand-soft shadow-card transition-all duration-300 group-hover:scale-110 group-hover:shadow-card-hover sm:h-28 sm:w-28">
          <img src={cat.image} alt={cat.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115" />
          <div className="absolute inset-0 rounded-full ring-0 ring-brand/0 transition-all group-hover:ring-4 group-hover:ring-brand/30" />
        </div>
        <span className="text-sm font-semibold text-foreground/80 transition group-hover:text-brand">{cat.name}</span>
      </Link>
    </motion.div>
  );
}
