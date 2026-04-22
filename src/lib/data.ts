import catBurger from "@/assets/cat-burger.jpg";
import catPizza from "@/assets/cat-pizza.jpg";
import catFries from "@/assets/cat-fries.jpg";
import catSushi from "@/assets/cat-sushi.jpg";
import catDessert from "@/assets/cat-dessert.jpg";
import catDrinks from "@/assets/cat-drinks.jpg";
import rest1 from "@/assets/rest-1.jpg";
import rest2 from "@/assets/rest-2.jpg";
import rest3 from "@/assets/rest-3.jpg";
import rest4 from "@/assets/rest-4.jpg";
import rest5 from "@/assets/rest-5.jpg";
import rest6 from "@/assets/rest-6.jpg";
import itemBurger from "@/assets/item-burger.jpg";
import itemPizza from "@/assets/item-pizza.jpg";
import itemWings from "@/assets/item-wings.jpg";
import itemSalad from "@/assets/item-salad.jpg";

export type Category = { id: string; name: string; image: string };
export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  address: string;
};
export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
};

export const categories: Category[] = [
  { id: "burgers", name: "Burgers", image: catBurger },
  { id: "pizza", name: "Pizza", image: catPizza },
  { id: "fries", name: "Sides", image: catFries },
  { id: "sushi", name: "Sushi", image: catSushi },
  { id: "drinks", name: "Drinks", image: catDrinks },
  { id: "dessert", name: "Dessert", image: catDessert },
];

export const restaurants: Restaurant[] = [
  { id: "papa-johns", name: "Papa Johns Pizza", cuisine: "Pizza · Italian", image: rest2, rating: 4.6, reviews: 1240, deliveryTime: "25–35 min", deliveryFee: 2.99, priceLevel: 2, tags: ["pizza", "italian"], address: "12 Baker St, London" },
  { id: "mcdonalds", name: "McDonald's East London", cuisine: "Burgers · Fast Food", image: rest1, rating: 4.3, reviews: 3210, deliveryTime: "15–25 min", deliveryFee: 1.99, priceLevel: 1, tags: ["burgers", "fries"], address: "88 Mile End Rd, London" },
  { id: "burger-burrs", name: "Burrs Burger Bar", cuisine: "Burgers · American", image: rest3, rating: 4.8, reviews: 870, deliveryTime: "20–30 min", deliveryFee: 3.49, priceLevel: 2, tags: ["burgers"], address: "5 Soho Sq, London" },
  { id: "tanaka-sushi", name: "Tanaka Sushi", cuisine: "Sushi · Japanese", image: rest4, rating: 4.7, reviews: 540, deliveryTime: "30–40 min", deliveryFee: 4.99, priceLevel: 3, tags: ["sushi", "japanese"], address: "21 Brick Lane, London" },
  { id: "el-taco", name: "El Taco Loco", cuisine: "Mexican · Tacos", image: rest5, rating: 4.5, reviews: 612, deliveryTime: "25–35 min", deliveryFee: 2.49, priceLevel: 2, tags: ["mexican"], address: "9 Camden High St" },
  { id: "bella-italia", name: "Bella Italia", cuisine: "Italian · Pasta", image: rest6, rating: 4.4, reviews: 980, deliveryTime: "30–45 min", deliveryFee: 3.99, priceLevel: 3, tags: ["italian", "pasta"], address: "44 Covent Garden" },
];

export const menuItems: MenuItem[] = [
  // Papa Johns
  { id: "pj-1", restaurantId: "papa-johns", name: "Margherita Pizza", description: "Fresh mozzarella, tomato sauce, basil", price: 12.99, image: itemPizza, category: "Pizza", popular: true },
  { id: "pj-2", restaurantId: "papa-johns", name: "Pepperoni Classic", description: "Loaded with pepperoni and mozzarella", price: 14.99, image: catPizza, category: "Pizza", popular: true },
  { id: "pj-3", restaurantId: "papa-johns", name: "Garlic Knots", description: "Hand-twisted, brushed with garlic butter", price: 5.49, image: itemSalad, category: "Sides" },
  { id: "pj-4", restaurantId: "papa-johns", name: "Coca-Cola", description: "Chilled 330ml", price: 2.49, image: catDrinks, category: "Drinks" },
  // McDonald's
  { id: "mc-1", restaurantId: "mcdonalds", name: "Big Mac", description: "Two beef patties, lettuce, special sauce", price: 6.49, image: itemBurger, category: "Burgers", popular: true },
  { id: "mc-2", restaurantId: "mcdonalds", name: "Double Cheeseburger", description: "Two beef patties, two slices of cheese", price: 5.29, image: catBurger, category: "Burgers" },
  { id: "mc-3", restaurantId: "mcdonalds", name: "Large Fries", description: "Golden, crispy and lightly salted", price: 3.19, image: catFries, category: "Sides", popular: true },
  { id: "mc-4", restaurantId: "mcdonalds", name: "McFlurry", description: "Vanilla soft serve with toppings", price: 3.99, image: catDessert, category: "Dessert" },
  // Burrs Burger
  { id: "bb-1", restaurantId: "burger-burrs", name: "Smash Burger", description: "Double smashed patties, American cheese", price: 9.5, image: itemBurger, category: "Burgers", popular: true },
  { id: "bb-2", restaurantId: "burger-burrs", name: "Buffalo Wings", description: "8 wings tossed in buffalo sauce", price: 8.99, image: itemWings, category: "Sides" },
  { id: "bb-3", restaurantId: "burger-burrs", name: "Loaded Fries", description: "Cheese, bacon and jalapeños", price: 6.5, image: catFries, category: "Sides" },
  // Tanaka Sushi
  { id: "ts-1", restaurantId: "tanaka-sushi", name: "Salmon Nigiri (8 pcs)", description: "Fresh Atlantic salmon over rice", price: 14.0, image: catSushi, category: "Sushi", popular: true },
  { id: "ts-2", restaurantId: "tanaka-sushi", name: "Dragon Roll", description: "Eel, avocado, cucumber", price: 16.5, image: catSushi, category: "Rolls" },
  // El Taco
  { id: "et-1", restaurantId: "el-taco", name: "Beef Tacos (3)", description: "Soft corn tortillas, salsa verde", price: 9.99, image: itemSalad, category: "Tacos", popular: true },
  // Bella Italia
  { id: "bi-1", restaurantId: "bella-italia", name: "Spaghetti Carbonara", description: "Pancetta, egg, pecorino", price: 13.5, image: itemSalad, category: "Pasta", popular: true },
];

export const cuisines = ["All", "Pizza", "Burgers", "Sushi", "Mexican", "Italian"];
