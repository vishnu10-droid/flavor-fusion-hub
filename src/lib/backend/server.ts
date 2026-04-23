import { createServerFn } from "@tanstack/react-start";
import { menuItems as seedMenuItems, restaurants as seedRestaurants } from "@/lib/data";
import type {
  AdminDashboardPayload,
  AdminMenuItem,
  AdminRestaurant,
  Order,
  OrderItem,
  OrderStatus,
  PublicUser,
} from "@/lib/backend/types";

type PrivateUser = PublicUser & {
  password: string;
};

type MockDb = {
  users: PrivateUser[];
  restaurants: AdminRestaurant[];
  menuItems: AdminMenuItem[];
  orders: Order[];
};

const runtimeEnv = (
  globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
).process?.env;

const getEnv = (key: string, fallback: string) => {
  return runtimeEnv?.[key] ?? fallback;
};

const DEFAULT_USER_LOGIN_ID = getEnv("VITE_DEFAULT_LOGIN_ID", "demo@orderx.com");
const DEFAULT_USER_PASSWORD = getEnv("VITE_DEFAULT_LOGIN_PASSWORD", "demo123");
const DEFAULT_ADMIN_LOGIN_ID = getEnv("VITE_ADMIN_LOGIN_ID", "admin@orderx.com");
const DEFAULT_ADMIN_PASSWORD = getEnv("VITE_ADMIN_LOGIN_PASSWORD", "admin123");

const genId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

const nowIso = () => new Date().toISOString();

const createSeedDb = (): MockDb => {
  const restaurants: AdminRestaurant[] = seedRestaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    rating: restaurant.rating,
    deliveryFee: restaurant.deliveryFee,
    deliveryTime: restaurant.deliveryTime,
    isActive: true,
  }));

  const menuItems: AdminMenuItem[] = seedMenuItems.map((item) => ({
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    price: item.price,
    popular: item.popular,
  }));

  const users: PrivateUser[] = [
    {
      id: "usr_demo",
      loginId: DEFAULT_USER_LOGIN_ID,
      password: DEFAULT_USER_PASSWORD,
      name: "Demo User",
      role: "user",
      phone: "+91 90000 00000",
      address: "221B Baker Street, London",
      createdAt: nowIso(),
    },
    {
      id: "adm_demo",
      loginId: DEFAULT_ADMIN_LOGIN_ID,
      password: DEFAULT_ADMIN_PASSWORD,
      name: "Admin",
      role: "admin",
      phone: "+91 91111 11111",
      address: "HQ Control Room",
      createdAt: nowIso(),
    },
  ];

  return {
    users,
    restaurants,
    menuItems,
    orders: [],
  };
};

const globalDb = globalThis as typeof globalThis & { __ORDERX_MOCK_DB__?: MockDb };
const db = globalDb.__ORDERX_MOCK_DB__ ?? createSeedDb();
globalDb.__ORDERX_MOCK_DB__ = db;

const toPublicUser = (user: PrivateUser): PublicUser => {
  const { password: _password, ...publicUser } = user;
  return publicUser;
};

const isSameDay = (left: Date, right: Date) => {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
};

const getUserById = (id: string) => db.users.find((user) => user.id === id);

const requireAdmin = (actorUserId: string) => {
  const actor = getUserById(actorUserId);
  if (!actor || actor.role !== "admin") {
    throw new Error("Only admin can perform this action.");
  }
};

export const registerUserFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; loginId: string; password: string; phone?: string; address?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const loginId = data.loginId.trim().toLowerCase();
    const existing = db.users.find((user) => user.loginId.toLowerCase() === loginId);

    if (existing) {
      return { ok: false as const, message: "Account already exists with this login ID." };
    }

    const newUser: PrivateUser = {
      id: genId("usr"),
      loginId,
      password: data.password,
      name: data.name.trim(),
      role: "user",
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      createdAt: nowIso(),
    };

    db.users.push(newUser);
    return {
      ok: true as const,
      user: toPublicUser(newUser),
    };
  });

export const loginUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: { loginId: string; password: string }) => data)
  .handler(async ({ data }) => {
    const loginId = data.loginId.trim().toLowerCase();
    const user = db.users.find((entry) => entry.loginId.toLowerCase() === loginId);

    if (!user || user.password !== data.password) {
      return { ok: false as const, message: "Invalid login ID or password." };
    }

    return {
      ok: true as const,
      user: toPublicUser(user),
    };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; name: string; phone?: string; address?: string }) => data)
  .handler(async ({ data }) => {
    const user = db.users.find((entry) => entry.id === data.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    user.name = data.name.trim();
    user.phone = data.phone?.trim();
    user.address = data.address?.trim();

    return {
      ok: true as const,
      user: toPublicUser(user),
    };
  });

export const placeOrderFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      items: OrderItem[];
      paymentMethod: "cod" | "card" | "upi";
      deliveryAddress: string;
      note?: string;
      discount?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = db.users.find((entry) => entry.id === data.userId);
    if (!user) {
      throw new Error("Please login before placing an order.");
    }
    if (!data.items.length) {
      throw new Error("Cart is empty.");
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 20 ? 0 : 2.99;
    const tax = subtotal * 0.08;
    const discount = data.discount ?? 0;
    const total = Math.max(0, subtotal + deliveryFee + tax - discount);
    const timestamp = nowIso();

    const order: Order = {
      id: genId("ord"),
      userId: user.id,
      userName: user.name,
      userLoginId: user.loginId,
      items: data.items,
      status: "pending",
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      deliveryAddress: data.deliveryAddress,
      note: data.note?.trim(),
      restaurantIds: Array.from(new Set(data.items.map((item) => item.restaurantId))),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.orders.unshift(order);
    return {
      ok: true as const,
      order,
    };
  });

export const getOrdersByUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const list = db.orders.filter((order) => order.userId === data.userId);
    return {
      ok: true as const,
      orders: list,
    };
  });

export const getRestaurantCatalogFn = createServerFn({ method: "GET" }).handler(async () => {
  return {
    ok: true as const,
    restaurants: db.restaurants,
    menuItems: db.menuItems,
  };
});

export const getAdminDashboardFn = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string }) => data)
  .handler(async ({ data }) => {
    requireAdmin(data.actorUserId);

    const today = new Date();
    const deliveredStatuses: OrderStatus[] = ["delivered"];

    const totalRevenue = db.orders
      .filter((order) => deliveredStatuses.includes(order.status))
      .reduce((sum, order) => sum + order.total, 0);

    const todayRevenue = db.orders
      .filter(
        (order) =>
          deliveredStatuses.includes(order.status) &&
          isSameDay(new Date(order.updatedAt), today),
      )
      .reduce((sum, order) => sum + order.total, 0);

    const payload: AdminDashboardPayload = {
      kpis: {
        totalOrders: db.orders.length,
        pendingOrders: db.orders.filter(
          (order) =>
            order.status === "pending" ||
            order.status === "confirmed" ||
            order.status === "preparing" ||
            order.status === "out_for_delivery",
        ).length,
        activeRestaurants: db.restaurants.filter((restaurant) => restaurant.isActive).length,
        totalRevenue,
        todayRevenue,
        totalUsers: db.users.length,
      },
      users: db.users.map(toPublicUser),
      orders: db.orders,
      restaurants: db.restaurants,
      menuItems: db.menuItems,
    };

    return {
      ok: true as const,
      data: payload,
    };
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string; orderId: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    requireAdmin(data.actorUserId);
    const order = db.orders.find((entry) => entry.id === data.orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    order.status = data.status;
    order.updatedAt = nowIso();
    return {
      ok: true as const,
      order,
    };
  });

export const toggleRestaurantStatusFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { actorUserId: string; restaurantId: string; isActive: boolean }) => data,
  )
  .handler(async ({ data }) => {
    requireAdmin(data.actorUserId);
    const restaurant = db.restaurants.find((entry) => entry.id === data.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found.");
    }
    restaurant.isActive = data.isActive;
    return {
      ok: true as const,
      restaurant,
    };
  });

export const addMenuItemFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      actorUserId: string;
      restaurantId: string;
      name: string;
      description: string;
      category: string;
      price: number;
      image?: string;
      popular?: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    requireAdmin(data.actorUserId);

    const restaurant = db.restaurants.find((entry) => entry.id === data.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found.");
    }

    const menuItem: AdminMenuItem = {
      id: genId("menu"),
      restaurantId: data.restaurantId,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      image: data.image?.trim() || seedMenuItems[0]?.image || "",
      price: Number(data.price.toFixed(2)),
      popular: data.popular ?? false,
    };

    db.menuItems.unshift(menuItem);
    return {
      ok: true as const,
      menuItem,
    };
  });
