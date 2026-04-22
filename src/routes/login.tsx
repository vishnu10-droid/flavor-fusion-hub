import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — OrderX" },
      { name: "description", content: "Sign in to your OrderX account to track orders, manage favourites and check out faster." },
      { property: "og:title", content: "Log in — OrderX" },
      { property: "og:description", content: "Sign in to your OrderX account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  return (
    <Layout>
      <section className="container-app grid min-h-[80vh] items-center py-16 md:grid-cols-2">
        <div className="hidden md:block">
          <h1 className="font-display text-5xl font-black text-balance">
            Hungry? <span className="text-brand">We've got you.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to save your favourite spots, track orders in real-time, and unlock member-only deals.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card-hover">
          <div className="flex rounded-full bg-secondary p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 text-sm font-bold capitalize transition ${
                  mode === m ? "bg-brand text-brand-foreground shadow-card" : "text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(mode === "login" ? "Welcome back!" : "Account created (demo)");
            }}
            className="mt-6 space-y-4"
          >
            {mode === "signup" && (
              <input placeholder="Full name" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand" />
            )}
            <input type="email" placeholder="Email address" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand" />
            <input type="password" placeholder="Password" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand" />
            <button type="submit" className="h-12 w-full rounded-xl bg-brand font-bold text-brand-foreground shadow-card transition hover:shadow-glow">
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/" className="font-semibold text-brand">Terms</Link>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
