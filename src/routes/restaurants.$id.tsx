import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, MapPin, Plus, Minus, ShoppingBag, Phone, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { restaurants, menuItems } from "@/lib/data";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$id")({
  loader: ({ params }) => {
    const r = restaurants.find((x) => x.id === params.id);
    if (!r) throw notFound();
    return { restaurant: r };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.restaurant.name} — OrderX` },
          { name: "description", content: `Order ${loaderData.restaurant.cuisine} from ${loaderData.restaurant.name}. ${loaderData.restaurant.deliveryTime} delivery.` },
          { property: "og:title", content: `${loaderData.restaurant.name} — OrderX` },
          { property: "og:description", content: `Order ${loaderData.restaurant.cuisine} from ${loaderData.restaurant.name}.` },
          { property: "og:image", content: loaderData.restaurant.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="container-app py-24 text-center">
        <h1 className="font-display text-3xl font-black">Restaurant not found</h1>
        <Link to="/restaurants" className="mt-4 inline-block text-brand hover:underline">Back to restaurants</Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error }) => (
    <Layout>
      <div className="container-app py-24 text-center">
        <h1 className="font-display text-3xl font-black">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  component: RestaurantDetail,
});

function RestaurantDetail() {
  const { restaurant } = Route.useLoaderData();
  const [tab, setTab] = useState<"menu" | "reviews" | "info">("menu");
  const items = useMemo(() => menuItems.filter((m) => m.restaurantId === restaurant.id), [restaurant.id]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const it of items) (g[it.category] ||= []).push(it);
    return g;
  }, [items]);

  return (
    <Layout>
      {/* Banner */}
      <section className="relative h-72 overflow-hidden md:h-96">
        <img src={restaurant.image} alt={restaurant.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="container-app relative flex h-full flex-col justify-end pb-8 text-ink-foreground">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">{restaurant.cuisine}</p>
          <h1 className="mt-1 font-display text-4xl font-black md:text-6xl">{restaurant.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 backdrop-blur">
              <Star className="h-4 w-4 fill-warning text-warning" /> {restaurant.rating} · {restaurant.reviews} reviews
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand" /> {restaurant.deliveryTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" /> {restaurant.address}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-app flex gap-1">
          {(["menu", "reviews", "info"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-4 text-sm font-bold capitalize transition ${tab === t ? "text-brand" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
              {tab === t && <motion.span layoutId="tab" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <AnimatePresence mode="wait">
            {tab === "menu" && (
              <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat} className="mb-10">
                    <h2 className="font-display text-2xl font-black">{cat}</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {list.map((it) => (
                        <MenuRow key={it.id} item={it} restaurantId={restaurant.id} restaurantName={restaurant.name} />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {tab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-center gap-4">
                    <div className="font-display text-5xl font-black text-brand">{restaurant.rating}</div>
                    <div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < Math.round(restaurant.rating) ? "fill-warning text-warning" : "text-border"}`} />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{restaurant.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-5">
                    {[
                      { name: "Sarah M.", text: "Always fresh, hot, and on time. My go-to place!", rating: 5 },
                      { name: "James L.", text: "Quality has been consistent for months. Big fan.", rating: 4 },
                      { name: "Priya K.", text: "Loved the new menu items. Delivery was lightning fast.", rating: 5 },
                    ].map((r) => (
                      <div key={r.name} className="border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{r.name}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {tab === "info" && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: MapPin, title: "Address", content: restaurant.address },
                  { icon: Phone, title: "Contact", content: "+44 20 7946 0000" },
                  { icon: Clock, title: "Operational hours", content: "Mon–Sun · 11:00 – 23:00" },
                  { icon: Info, title: "Min. order", content: "$10.00" },
                ].map((b) => (
                  <div key={b.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                      <b.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.content}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky cart */}
        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <CartSidebar />
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function MenuRow({ item, restaurantId, restaurantName }: { item: typeof menuItems[number]; restaurantId: string; restaurantName: string }) {
  const add = useCart((s) => s.add);
  return (
    <motion.div whileHover={{ y: -3 }} className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-bold">{item.name}</h3>
          {item.popular && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">Popular</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-black text-foreground">${item.price.toFixed(2)}</span>
          <button
            onClick={() => {
              add({ id: item.id, name: item.name, price: item.price, image: item.image, restaurantId, restaurantName });
              toast.success(`${item.name} added to cart`);
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground shadow-card transition hover:scale-110 hover:shadow-glow"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
    </motion.div>
  );
}

function CartSidebar() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-brand" />
        <h3 className="font-display text-lg font-bold">Your order</h3>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 rounded-xl bg-secondary p-6 text-center text-sm text-muted-foreground">Your cart is empty. Add a dish to get started.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-3 max-h-80 overflow-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold">{i.name}</p>
                  <p className="text-xs text-muted-foreground">${i.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border">
                  <button onClick={() => setQty(i.id, i.quantity - 1)} className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-brand">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold">{i.quantity}</span>
                  <button onClick={() => setQty(i.id, i.quantity + 1)} className="grid h-7 w-7 place-items-center text-brand">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/cart"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground shadow-card transition hover:shadow-glow"
            >
              Checkout · ${subtotal.toFixed(2)}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
