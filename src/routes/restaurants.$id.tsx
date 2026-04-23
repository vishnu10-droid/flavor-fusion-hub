import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
  Phone,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { restaurants, menuItems as staticMenuItems } from "@/lib/data";
import { getRestaurantCatalogFn } from "@/lib/backend/server";
import type { AdminMenuItem } from "@/lib/backend/types";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$id")({
  loader: ({ params }) => {
    const restaurant = restaurants.find((candidate) => candidate.id === params.id);
    if (!restaurant) throw notFound();
    return { restaurant };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.restaurant.name} - OrderX` },
          {
            name: "description",
            content: `Order ${loaderData.restaurant.cuisine} from ${loaderData.restaurant.name}. ${loaderData.restaurant.deliveryTime} delivery.`,
          },
          { property: "og:title", content: `${loaderData.restaurant.name} - OrderX` },
          {
            property: "og:description",
            content: `Order ${loaderData.restaurant.cuisine} from ${loaderData.restaurant.name}.`,
          },
          { property: "og:image", content: loaderData.restaurant.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="container-app py-24 text-center">
        <h1 className="font-display text-3xl font-black">Restaurant not found</h1>
        <Link to="/restaurants" className="mt-4 inline-block text-brand hover:underline">
          Back to restaurants
        </Link>
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
  const getCatalog = useServerFn(getRestaurantCatalogFn);

  const [tab, setTab] = useState<"menu" | "reviews" | "info">("menu");
  const [serverMenuItems, setServerMenuItems] = useState<AdminMenuItem[] | null>(null);
  const [isRestaurantActive, setIsRestaurantActive] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await getCatalog();
        if (!response.ok) return;

        setServerMenuItems(response.menuItems);
        const serverRestaurant = response.restaurants.find((entry) => entry.id === restaurant.id);
        setIsRestaurantActive(serverRestaurant ? serverRestaurant.isActive : true);
      } catch {
        setServerMenuItems(null);
      }
    };

    void fetchCatalog();
  }, [getCatalog, restaurant.id]);

  const items = useMemo(() => {
    const source =
      serverMenuItems?.map((item) => ({
        ...item,
        image: item.image || restaurant.image,
      })) ?? staticMenuItems;

    return source.filter((item) => item.restaurantId === restaurant.id);
  }, [restaurant.id, restaurant.image, serverMenuItems]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    for (const item of items) {
      (groups[item.category] ||= []).push(item);
    }
    return groups;
  }, [items]);

  return (
    <Layout>
      <section className="relative h-72 overflow-hidden md:h-96">
        <img src={restaurant.image} alt={restaurant.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="container-app relative flex h-full flex-col justify-end pb-8 text-ink-foreground">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">{restaurant.cuisine}</p>
          <h1 className="mt-1 font-display text-4xl font-black md:text-6xl">{restaurant.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 backdrop-blur">
              <Star className="h-4 w-4 fill-warning text-warning" /> {restaurant.rating} - {restaurant.reviews} reviews
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

      {!isRestaurantActive ? (
        <section className="container-app py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-semibold">
              This restaurant is temporarily inactive. You can browse menu but ordering is disabled.
            </p>
          </div>
        </section>
      ) : null}

      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-app flex gap-1">
          {(["menu", "reviews", "info"] as const).map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`relative px-5 py-4 text-sm font-bold capitalize transition ${
                tab === name ? "text-brand" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {name}
              {tab === name ? (
                <motion.span layoutId="tab" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <section className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <AnimatePresence mode="wait">
            {tab === "menu" ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {Object.entries(grouped).map(([category, list]) => (
                  <div key={category} className="mb-10">
                    <h2 className="font-display text-2xl font-black">{category}</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {list.map((item) => (
                        <MenuRow
                          key={item.id}
                          item={item}
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                          disabled={!isRestaurantActive}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null}

            {tab === "reviews" ? (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-center gap-4">
                    <div className="font-display text-5xl font-black text-brand">{restaurant.rating}</div>
                    <div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-5 w-5 ${
                              index < Math.round(restaurant.rating)
                                ? "fill-warning text-warning"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{restaurant.reviews} reviews</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {tab === "info" ? (
              <motion.div
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {[
                  { icon: MapPin, title: "Address", content: restaurant.address },
                  { icon: Phone, title: "Contact", content: "+44 20 7946 0000" },
                  { icon: Clock, title: "Operational hours", content: "Mon-Sun | 11:00 - 23:00" },
                  { icon: Info, title: "Min. order", content: "$10.00" },
                ].map((block) => (
                  <div key={block.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                      <block.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold">{block.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{block.content}</p>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <CartSidebar />
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function MenuRow({
  item,
  restaurantId,
  restaurantName,
  disabled,
}: {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    popular?: boolean;
  };
  restaurantId: string;
  restaurantName: string;
  disabled: boolean;
}) {
  const add = useCart((s) => s.add);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-bold">{item.name}</h3>
          {item.popular ? (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
              Popular
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-black text-foreground">${item.price.toFixed(2)}</span>
          <button
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              add({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                restaurantId,
                restaurantName,
              });
              toast.success(`${item.name} added to cart`);
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground shadow-card transition hover:scale-110 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
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
        <p className="mt-6 rounded-xl bg-secondary p-6 text-center text-sm text-muted-foreground">
          Your cart is empty. Add a dish to get started.
        </p>
      ) : (
        <>
          <ul className="mt-4 max-h-80 space-y-3 overflow-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border">
                  <button
                    onClick={() => setQty(item.id, item.quantity - 1)}
                    className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-brand"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => setQty(item.id, item.quantity + 1)}
                    className="grid h-7 w-7 place-items-center text-brand"
                  >
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
              Checkout - ${subtotal.toFixed(2)}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
