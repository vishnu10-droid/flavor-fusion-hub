import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { getOrdersByUserFn, updateProfileFn } from "@/lib/backend/server";
import type { Order } from "@/lib/backend/types";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - OrderX" },
      {
        name: "description",
        content: "Track your orders, update profile and manage your account from dashboard.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const getOrders = useServerFn(getOrdersByUserFn);
  const updateProfile = useServerFn(updateProfileFn);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? "");
  const [profileAddress, setProfileAddress] = useState(user?.address ?? "");

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfilePhone(user?.phone ?? "");
    setProfileAddress(user?.address ?? "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await getOrders({ data: { userId: user.id } });
        if (response.ok) {
          setOrders(response.orders);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to fetch orders.");
      } finally {
        setLoadingOrders(false);
      }
    };

    void fetchOrders();
  }, [getOrders, user]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = orders.filter(
      (order) =>
        order.status === "pending" ||
        order.status === "confirmed" ||
        order.status === "preparing" ||
        order.status === "out_for_delivery",
    ).length;

    return {
      totalOrders: orders.length,
      totalSpent,
      activeOrders,
      lastOrderAt: orders[0]?.createdAt,
    };
  }, [orders]);

  if (!user) {
    return (
      <Layout>
        <section className="container-app py-20">
          <EmptyState
            title="Please login to open dashboard"
            description="Track your orders and manage profile after login."
          />
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-card"
            >
              Go to Login
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-app py-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">Welcome, {user.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your orders, account details and delivery preferences.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Orders" value={String(stats.totalOrders)} />
          <StatCard label="Active Orders" value={String(stats.activeOrders)} />
          <StatCard label="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} />
          <StatCard
            label="Last Order"
            value={stats.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleDateString() : "N/A"}
          />
        </div>
      </section>

      <section className="container-app grid gap-8 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-black">Your Orders</h2>
              <Link to="/restaurants" className="text-sm font-semibold text-brand hover:underline">
                Order more
              </Link>
            </div>

            {loadingOrders ? (
              <p className="mt-6 text-sm text-muted-foreground">Loading your orders...</p>
            ) : orders.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No orders yet"
                  description="Place your first order and it will appear here."
                />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {orders.map((order) => {
                  const expanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <OrderStatusBadge status={order.status} />
                          <span className="font-display text-lg font-black text-brand">
                            ${order.total.toFixed(2)}
                          </span>
                          <button
                            onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                            className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:border-brand hover:text-brand"
                          >
                            {expanded ? "Hide" : "Details"}
                          </button>
                        </div>
                      </div>
                      {expanded ? (
                        <div className="mt-4 space-y-2 border-t border-border pt-3">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.itemId}`} className="flex justify-between text-sm">
                              <span>
                                {item.name} x {item.quantity}
                              </span>
                              <span className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <p className="pt-2 text-xs text-muted-foreground">
                            Address: {order.deliveryAddress}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-2xl font-black">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your details for faster checkout.
            </p>
            <div className="mt-5 space-y-3">
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Full name"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              />
              <input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="Phone number"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              />
              <textarea
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="Default delivery address"
                className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                onClick={async () => {
                  setSavingProfile(true);
                  try {
                    const response = await updateProfile({
                      data: {
                        userId: user.id,
                        name: profileName,
                        phone: profilePhone,
                        address: profileAddress,
                      },
                    });
                    if (response.ok) {
                      updateUser(response.user);
                      toast.success("Profile updated successfully.");
                    }
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to update profile.");
                  } finally {
                    setSavingProfile(false);
                  }
                }}
                className="w-full rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground shadow-card"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-xl font-black">Quick Actions</h3>
            <div className="mt-4 grid gap-2">
              <Link
                to="/restaurants"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:border-brand hover:text-brand"
              >
                Browse Restaurants
              </Link>
              <Link
                to="/cart"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:border-brand hover:text-brand"
              >
                Open Cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
