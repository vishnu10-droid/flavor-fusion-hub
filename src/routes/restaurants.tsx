import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants, cuisines } from "@/lib/data";

type Search = { category?: string };

export const Route = createFileRoute("/restaurants")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Restaurants — OrderX" },
      { name: "description", content: "Browse top restaurants near you. Filter by cuisine, rating, price and delivery time." },
      { property: "og:title", content: "Restaurants — OrderX" },
      { property: "og:description", content: "Browse top restaurants near you on OrderX." },
    ],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  const [cuisine, setCuisine] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating" | "delivery" | "price">("rating");

  const filtered = useMemo(() => {
    let list = [...restaurants];
    if (cuisine !== "All") {
      list = list.filter((r) => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
    }
    if (minRating > 0) list = list.filter((r) => r.rating >= minRating);
    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "delivery") return a.deliveryFee - b.deliveryFee;
      return a.priceLevel - b.priceLevel;
    });
    return list;
  }, [cuisine, minRating, sort]);

  return (
    <Layout>
      <section className="border-b border-border bg-brand-soft/40">
        <div className="container-app py-10">
          <h1 className="font-display text-4xl font-black md:text-5xl">All Restaurants</h1>
          <p className="mt-2 text-muted-foreground">{filtered.length} places ready to deliver near you</p>
        </div>
      </section>

      <section className="container-app py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cuisine === c ? "bg-brand text-brand-foreground shadow-card" : "border border-border bg-background hover:border-brand"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="bg-transparent font-semibold outline-none">
                <option value={0}>Any</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="rating">Top rated</option>
              <option value="delivery">Cheapest delivery</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border bg-secondary p-12 text-center">
            <p className="text-lg font-semibold">No restaurants match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing some options.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, i) => (
              <RestaurantCard key={r.id} r={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
