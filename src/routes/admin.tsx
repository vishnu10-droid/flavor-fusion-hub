import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
} from "@/components/dashboard/OrderStatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  addMenuItemFn,
  getAdminDashboardFn,
  toggleRestaurantStatusFn,
  updateOrderStatusFn,
} from "@/lib/backend/server";
import type { AdminDashboardPayload, OrderStatus } from "@/lib/backend/types";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard - OrderX" },
      {
        name: "description",
        content:
          "Manage orders, restaurants, menu and users from your OrderX admin dashboard.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const user = useAuth((s) => s.user);
  const getDashboard = useServerFn(getAdminDashboardFn);
  const updateOrderStatus = useServerFn(updateOrderStatusFn);
  const toggleRestaurant = useServerFn(toggleRestaurantStatusFn);
  const addMenuItem = useServerFn(addMenuItemFn);

  const [tab, setTab] = useState<"orders" | "restaurants" | "menu" | "users">("orders");
  const [loading, setLoading] = useState(true);
  const [savingMenu, setSavingMenu] = useState(false);
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);

  const [menuRestaurantId, setMenuRestaurantId] = useState("");
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuCategory, setMenuCategory] = useState("Special");
  const [menuPrice, setMenuPrice] = useState("9.99");
  const [menuPopular, setMenuPopular] = useState(false);

  const refreshDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getDashboard({ data: { actorUserId: user.id } });
      if (response.ok) {
        setPayload(response.data);
        if (!menuRestaurantId && response.data.restaurants.length > 0) {
          setMenuRestaurantId(response.data.restaurants[0].id);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }
    void refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const menuItemsByRestaurant = useMemo(() => {
    if (!payload) return [];
    return payload.menuItems.filter((item) => item.restaurantId === menuRestaurantId);
  }, [menuRestaurantId, payload]);

  if (!user) {
    return (
      <Layout>
        <section className="container-app py-20">
          <EmptyState
            title="Login required"
            description="Please login with admin credentials to continue."
          />
        </section>
      </Layout>
    );
  }

  if (user.role !== "admin") {
    return (
      <Layout>
        <section className="container-app py-20">
          <EmptyState
            title="Admin access only"
            description="Your account does not have admin permissions."
          />
        </section>
      </Layout>
    );
  }

  if (loading || !payload) {
    return (
      <Layout>
        <section className="container-app py-20">
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-app py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-black md:text-5xl">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Monitor live business metrics and manage platform operations.
            </p>
          </div>
          <button
            onClick={() => void refreshDashboard()}
            className="rounded-full border border-brand bg-brand/10 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-brand-foreground"
          >
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Orders" value={String(payload.kpis.totalOrders)} />
          <StatCard label="Pending Orders" value={String(payload.kpis.pendingOrders)} />
          <StatCard label="Active Restaurants" value={String(payload.kpis.activeRestaurants)} />
          <StatCard label="Total Revenue" value={`$${payload.kpis.totalRevenue.toFixed(2)}`} />
          <StatCard label="Today Revenue" value={`$${payload.kpis.todayRevenue.toFixed(2)}`} />
          <StatCard label="Total Users" value={String(payload.kpis.totalUsers)} />
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["orders", "restaurants", "menu", "users"] as const).map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                tab === name
                  ? "bg-brand text-brand-foreground shadow-card"
                  : "border border-border bg-background hover:border-brand hover:text-brand"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === "orders" ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-2xl font-black">Order Management</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="py-3">Order</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/60">
                      <td className="py-3">
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3">{order.userName}</td>
                      <td className="py-3 font-semibold">${order.total.toFixed(2)}</td>
                      <td className="py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const nextStatus = e.target.value as OrderStatus;
                            try {
                              const response = await updateOrderStatus({
                                data: {
                                  actorUserId: user.id,
                                  orderId: order.id,
                                  status: nextStatus,
                                },
                              });
                              if (response.ok) {
                                toast.success(`Order ${order.id} updated.`);
                                await refreshDashboard();
                              }
                            } catch (error) {
                              toast.error(
                                error instanceof Error ? error.message : "Unable to update order.",
                              );
                            }
                          }}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold outline-none focus:border-brand"
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "restaurants" ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-2xl font-black">Restaurant Management</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {payload.restaurants.map((restaurant) => (
                <div key={restaurant.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await toggleRestaurant({
                            data: {
                              actorUserId: user.id,
                              restaurantId: restaurant.id,
                              isActive: !restaurant.isActive,
                            },
                          });
                          if (response.ok) {
                            toast.success(
                              `${restaurant.name} is now ${
                                response.restaurant.isActive ? "active" : "inactive"
                              }.`,
                            );
                            await refreshDashboard();
                          }
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to update restaurant status.",
                          );
                        }
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        restaurant.isActive
                          ? "bg-success/15 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>Rating: {restaurant.rating}</span>
                    <span>Fee: ${restaurant.deliveryFee.toFixed(2)}</span>
                    <span>ETA: {restaurant.deliveryTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "menu" ? (
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-2xl font-black">Add Menu Item</h2>
              <div className="mt-4 space-y-3">
                <select
                  value={menuRestaurantId}
                  onChange={(e) => setMenuRestaurantId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                >
                  {payload.restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <input
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Item name"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value)}
                  placeholder="Category"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                  placeholder="Price"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                />
                <textarea
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  placeholder="Description"
                  className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={menuPopular}
                    onChange={(e) => setMenuPopular(e.target.checked)}
                  />
                  Mark as popular
                </label>
                <button
                  onClick={async () => {
                    if (!menuName.trim() || !menuDescription.trim()) {
                      toast.error("Please fill menu item name and description.");
                      return;
                    }
                    const price = Number(menuPrice);
                    if (!Number.isFinite(price) || price <= 0) {
                      toast.error("Please enter a valid price.");
                      return;
                    }

                    setSavingMenu(true);
                    try {
                      const response = await addMenuItem({
                        data: {
                          actorUserId: user.id,
                          restaurantId: menuRestaurantId,
                          name: menuName,
                          description: menuDescription,
                          category: menuCategory,
                          price,
                          popular: menuPopular,
                        },
                      });
                      if (response.ok) {
                        toast.success("Menu item added successfully.");
                        setMenuName("");
                        setMenuDescription("");
                        setMenuCategory("Special");
                        setMenuPrice("9.99");
                        setMenuPopular(false);
                        await refreshDashboard();
                      }
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : "Unable to add menu item.",
                      );
                    } finally {
                      setSavingMenu(false);
                    }
                  }}
                  className="w-full rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground shadow-card"
                >
                  {savingMenu ? "Saving..." : "Add Item"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-2xl font-black">Menu List</h3>
              {menuItemsByRestaurant.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title="No menu items"
                    description="Add your first item from the left panel."
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {menuItemsByRestaurant.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                      <p className="font-display text-lg font-bold">{item.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold uppercase">
                          {item.category}
                        </span>
                        <span className="font-display text-lg font-black text-brand">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-2xl font-black">Registered Users</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="py-3">Name</th>
                    <th className="py-3">Login ID</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.users.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/60">
                      <td className="py-3">{entry.name}</td>
                      <td className="py-3">{entry.loginId}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold uppercase">
                          {entry.role}
                        </span>
                      </td>
                      <td className="py-3">{entry.phone || "-"}</td>
                      <td className="py-3">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </Layout>
  );
}
