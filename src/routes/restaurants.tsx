import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";
import { getRestaurantCatalogFn } from "@/lib/backend/server";

type Search = { category?: string };

const categoryToCuisine: Record<string, string> = {
  burgers: "Burgers",
  pizza: "Pizza",
  sushi: "Sushi",
  mexican: "Mexican",
  italian: "Italian",
};

export const Route = createFileRoute("/restaurants")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Restaurants - OrderX" },
      {
        name: "description",
        content:
          "Browse top restaurants near you. Filter by cuisine, rating, price and delivery time.",
      },
      { property: "og:title", content: "Restaurants - OrderX" },
      { property: "og:description", content: "Browse top restaurants near you on OrderX." },
    ],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  const search = Route.useSearch();
  const getCatalog = useServerFn(getRestaurantCatalogFn);

  const initialCuisine =
    (search.category ? categoryToCuisine[search.category.toLowerCase()] : undefined) ?? "All";

  const [cuisine, setCuisine] = useState(initialCuisine);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating" | "delivery" | "price">("rating");
  const [activeRestaurantIds, setActiveRestaurantIds] = useState<string[] | null>(null);

  useEffect(() => {
    setCuisine(initialCuisine);
  }, [initialCuisine]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await getCatalog();
        if (!response.ok) return;
        setActiveRestaurantIds(
          response.restaurants.filter((restaurant) => restaurant.isActive).map((restaurant) => restaurant.id),
        );
      } catch {
        setActiveRestaurantIds(null);
      }
    };

    void fetchCatalog();
  }, [getCatalog]);

  const cuisineOptions = useMemo(() => {
    return ["All", "Pizza", "Burgers", "Sushi", "Mexican", "Italian"];
  }, []);

  const filtered = useMemo(() => {
    let list = [...restaurants];

    if (activeRestaurantIds) {
      list = list.filter((restaurant) => activeRestaurantIds.includes(restaurant.id));
    }

    if (cuisine !== "All") {
      list = list.filter((restaurant) =>
        restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase()),
      );
    }

    if (minRating > 0) {
      list = list.filter((restaurant) => restaurant.rating >= minRating);
    }

    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "delivery") return a.deliveryFee - b.deliveryFee;
      return a.priceLevel - b.priceLevel;
    });

    return list;
  }, [activeRestaurantIds, cuisine, minRating, sort]);

  return (
    <Layout>
      <section className="border-b border-border bg-brand-soft/40">
        <div className="container-app py-10">
          <h1 className="font-display text-4xl font-black md:text-5xl">All Restaurants</h1>
          <p className="mt-2 text-muted-foreground">
            {filtered.length} places ready to deliver near you
          </p>
        </div>
      </section>

      <section className="container-app py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((option) => (
              <button
                key={option}
                onClick={() => setCuisine(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cuisine === option
                    ? "bg-brand text-brand-foreground shadow-card"
                    : "border border-border bg-background hover:border-brand"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="bg-transparent font-semibold outline-none"
              >
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
            {filtered.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} r={restaurant} index={index} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
