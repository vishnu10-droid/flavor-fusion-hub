export type UserRole = "user" | "admin";

export type PublicUser = {
  id: string;
  loginId: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
};

export type Order = {
  id: string;
  userId: string;
  userName: string;
  userLoginId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cod" | "card" | "upi";
  deliveryAddress: string;
  note?: string;
  restaurantIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryFee: number;
  deliveryTime: string;
  isActive: boolean;
};

export type AdminMenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  popular?: boolean;
};

export type DashboardKpis = {
  totalOrders: number;
  pendingOrders: number;
  activeRestaurants: number;
  totalRevenue: number;
  todayRevenue: number;
  totalUsers: number;
};

export type AdminDashboardPayload = {
  kpis: DashboardKpis;
  users: PublicUser[];
  orders: Order[];
  restaurants: AdminRestaurant[];
  menuItems: AdminMenuItem[];
};
