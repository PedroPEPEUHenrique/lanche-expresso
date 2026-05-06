export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  image: string;
  category: string;
  deliveryFee: number;
  rating: number;
  products: Product[];
}

export interface CartItem {
  product: Product;
  restaurant: Restaurant;
  quantity: number;
  observations?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}
