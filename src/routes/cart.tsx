import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — OrderX" },
      { name: "description", content: "Review your order and check out securely on OrderX." },
      { property: "og:title", content: "Your Cart — OrderX" },
      { property: "og:description", content: "Review your order and check out securely on OrderX." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const deliveryFee = items.length > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "FRESH10") {
      setDiscount(subtotal * 0.1);
      toast.success("Coupon applied — 10% off!");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon code");
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-app py-24 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand/10 text-brand">
            <ShoppingBag className="h-9 w-9" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-black">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Link to="/restaurants" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-brand-foreground shadow-card hover:shadow-glow">
            Browse restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-app py-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">Your Cart</h1>
        <p className="mt-2 text-muted-foreground">{items.length} items · review before checkout</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Items */}
          <div className="space-y-3">
            {items.map((it, idx) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <img src={it.image} alt={it.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{it.restaurantName}</p>
                  <h3 className="font-display text-lg font-bold">{it.name}</h3>
                  <p className="mt-1 font-display text-base font-black text-brand">${it.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => remove(it.id)} className="text-muted-foreground transition hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1 rounded-full border border-border">
                    <button onClick={() => setQty(it.id, it.quantity - 1)} className="grid h-8 w-8 place-items-center hover:text-brand">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold">{it.quantity}</span>
                    <button onClick={() => setQty(it.id, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-brand">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            <button onClick={clear} className="text-sm font-semibold text-muted-foreground hover:text-destructive">
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-bold">Order summary</h2>
              <div className="mt-5 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Promo code (try FRESH10)"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand"
                  />
                </div>
                <button onClick={applyCoupon} className="rounded-xl border border-brand bg-brand/10 px-4 text-sm font-bold text-brand hover:bg-brand hover:text-brand-foreground">
                  Apply
                </button>
              </div>

              <dl className="mt-6 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">${subtotal.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="font-semibold">${deliveryFee.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Tax (8%)</dt><dd className="font-semibold">${tax.toFixed(2)}</dd></div>
                {discount > 0 && (
                  <div className="flex justify-between text-success"><dt>Discount</dt><dd className="font-semibold">−${discount.toFixed(2)}</dd></div>
                )}
              </dl>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display text-base font-bold">Total</span>
                <span className="font-display text-2xl font-black text-brand">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => toast.success("Order placed! 🎉 (demo)")}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-bold text-brand-foreground shadow-card-hover transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                Checkout securely <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Free delivery on orders over $20</p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
