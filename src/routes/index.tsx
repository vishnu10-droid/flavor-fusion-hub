import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Search, Sparkles, Clock, Star } from "lucide-react";
import heroImg from "@/assets/hero-burger.jpg";
import promo1 from "@/assets/promo-1.jpg";
import promo2 from "@/assets/promo-2.jpg";
import { Layout } from "@/components/Layout";
import { CategoryPill } from "@/components/CategoryPill";
import { RestaurantCard } from "@/components/RestaurantCard";
import { categories, restaurants } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrderX — Feast Your Senses. Fast and Fresh Delivery." },
      { name: "description", content: "Order food online from top restaurants near you. Burgers, pizza, sushi, and more — delivered fast and fresh by OrderX." },
      { property: "og:title", content: "OrderX — Feast Your Senses" },
      { property: "og:description", content: "Order food online from top restaurants near you. Fast & fresh delivery." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const popular = restaurants.slice(0, 6);

  return (
    <Layout>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-brand-soft via-background to-brand-soft">
        <div className="container-app grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
          <div className="relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-background px-3 py-1.5 text-xs font-semibold text-brand shadow-card"
            >
              <Sparkles className="h-3.5 w-3.5" /> Up to 40% off your first order
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground text-balance md:text-7xl"
            >
              Feast Your Senses.
              <br />
              <span className="bg-gradient-to-r from-brand to-warning bg-clip-text text-transparent">Fast and Fresh.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-md text-base text-muted-foreground md:text-lg"
            >
              From sizzling burgers to sushi platters, discover thousands of restaurants delivered hot to your door in under 30 minutes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Enter your delivery address…"
                  className="h-14 w-full rounded-full border border-border bg-background pl-12 pr-4 text-sm shadow-card outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <Link
                to="/restaurants"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-7 font-bold text-brand-foreground shadow-card-hover transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                Find Food <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {[
                { icon: Star, label: "4.9 rated", value: "by 50k+ users" },
                { icon: Clock, label: "30 min", value: "average delivery" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-bold text-foreground">{label}</div>
                    <div className="text-xs">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div style={{ y: yImg, opacity }} className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-brand/30 to-warning/20 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-card-hover">
              <img src={heroImg} alt="Delicious gourmet burger" width={1024} height={1024} className="h-full w-full object-cover" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-background p-3 pr-5 shadow-card-hover"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-2xl">🔥</span>
              <div>
                <div className="text-xs text-muted-foreground">Trending today</div>
                <div className="font-bold">1.2M orders</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 flex items-center gap-3 rounded-2xl bg-ink p-3 pr-5 text-ink-foreground shadow-card-hover"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-xl">⚡</span>
              <div>
                <div className="text-xs text-ink-foreground/60">Free delivery</div>
                <div className="font-bold">on orders $20+</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-app py-16">
        <SectionHeading eyebrow="Browse" title="Order By Popular Categories" />
        <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
          {categories.map((c, i) => (
            <CategoryPill key={c.id} cat={c} index={i} />
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="container-app py-12">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Top picks" title="Popular Restaurants" />
          <Link to="/restaurants" className="hidden text-sm font-semibold text-brand hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((r, i) => (
            <RestaurantCard key={r.id} r={r} index={i} />
          ))}
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="container-app py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <PromoBanner image={promo1} eyebrow="Family time" title="Ordering is the new cooking" cta="Discover deals" tone="dark" />
          <PromoBanner image={promo2} eyebrow="Speedy delivery" title="Hot food, fast riders, every time" cta="Order now" tone="brand" />
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="container-app pb-16">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-ink p-8 text-ink-foreground sm:grid-cols-4 md:p-12">
          {[
            ["540+", "Restaurants"],
            ["780,000+", "Orders served"],
            ["8,000+", "Daily customers"],
            ["4.9★", "Avg. rating"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl font-black text-brand md:text-5xl">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-ink-foreground/60 md:text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
    </div>
  );
}

function PromoBanner({ image, eyebrow, title, cta, tone }: { image: string; eyebrow: string; title: string; cta: string; tone: "dark" | "brand" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl shadow-card"
    >
      <img src={image} alt={title} loading="lazy" className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${tone === "dark" ? "bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" : "bg-gradient-to-r from-brand/90 via-brand/50 to-transparent"}`} />
      <div className="absolute inset-0 flex flex-col justify-center p-8 text-ink-foreground md:p-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-foreground/80">{eyebrow}</span>
        <h3 className="mt-2 max-w-xs font-display text-2xl font-black md:text-3xl">{title}</h3>
        <Link
          to="/restaurants"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-foreground shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
