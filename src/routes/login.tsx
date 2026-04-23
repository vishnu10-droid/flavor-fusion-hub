import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, useState } from "react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { loginUserFn, registerUserFn } from "@/lib/backend/server";
import { useAuth } from "@/store/auth";

const DEFAULT_LOGIN_ID = import.meta.env.VITE_DEFAULT_LOGIN_ID ?? "demo@orderx.com";
const DEFAULT_LOGIN_PASSWORD = import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD ?? "demo123";
const DEFAULT_ADMIN_LOGIN_ID = import.meta.env.VITE_ADMIN_LOGIN_ID ?? "admin@orderx.com";
const DEFAULT_ADMIN_LOGIN_PASSWORD = import.meta.env.VITE_ADMIN_LOGIN_PASSWORD ?? "admin123";

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
  const navigate = useNavigate();
  const login = useServerFn(loginUserFn);
  const register = useServerFn(registerUserFn);
  const setAuth = useAuth((s) => s.setAuth);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [loginId, setLoginId] = useState(DEFAULT_LOGIN_ID);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          toast.error("Please enter your full name.");
          return;
        }
        if (!loginId.trim() || !password.trim()) {
          toast.error("Please fill login ID and password.");
          return;
        }

        const response = await register({
          data: {
            name: fullName,
            loginId,
            password,
          },
        });

        if (!response.ok) {
          toast.error(response.message);
          return;
        }

        setAuth(response.user);
        toast.success("Account created successfully.");
        await navigate({ to: "/dashboard" });
        return;
      }

      const response = await login({
        data: {
          loginId,
          password,
        },
      });

      if (!response.ok) {
        toast.error(response.message);
        return;
      }

      setAuth(response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      await navigate({ to: response.user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to login right now.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
              />
            )}
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Login ID"
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
            />
            <button type="submit" className="h-12 w-full rounded-xl bg-brand font-bold text-brand-foreground shadow-card transition hover:shadow-glow">
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
          {mode === "login" && (
            <div className="mt-4 space-y-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
              <p>
                User demo: <span className="font-semibold text-foreground">{DEFAULT_LOGIN_ID}</span> /{" "}
                <span className="font-semibold text-foreground">{DEFAULT_LOGIN_PASSWORD}</span>
              </p>
              <p>
                Admin demo: <span className="font-semibold text-foreground">{DEFAULT_ADMIN_LOGIN_ID}</span> /{" "}
                <span className="font-semibold text-foreground">{DEFAULT_ADMIN_LOGIN_PASSWORD}</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginId(DEFAULT_LOGIN_ID);
                    setPassword(DEFAULT_LOGIN_PASSWORD);
                  }}
                  className="rounded-full border border-border px-3 py-1 font-semibold hover:border-brand hover:text-brand"
                >
                  Use user demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginId(DEFAULT_ADMIN_LOGIN_ID);
                    setPassword(DEFAULT_ADMIN_LOGIN_PASSWORD);
                  }}
                  className="rounded-full border border-border px-3 py-1 font-semibold hover:border-brand hover:text-brand"
                >
                  Use admin demo
                </button>
              </div>
            </div>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/" className="font-semibold text-brand">Terms</Link>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
