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

export const categories = [
  { id: '1', name: 'BURGUER', emoji: '🍔' },
  { id: '2', name: 'PIZZA', emoji: '🍕' },
  { id: '3', name: 'FRITAS', emoji: '🍟' },
  { id: '4', name: 'DOCES', emoji: '🍬' },
  { id: '5', name: 'SORVETE', emoji: '🍦' },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Suxi Kei Maboka',
    address: 'Av. T4 - Serrinha',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    category: 'Sushi',
    deliveryFee: 8.0,
    rating: 4.8,
    products: [
      { id: 'p1', name: 'Combo Sushi 20 peças', description: 'Variedade de sushis frescos', price: 59.9, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300' },
      { id: 'p2', name: 'Temaki Salmão', description: 'Temaki recheado de salmão', price: 24.9, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300' },
      { id: 'p3', name: 'Uramaki Especial', description: '8 peças com cream cheese', price: 32.9, image: 'https://images.unsplash.com/photo-1617196034234-ac2ef8ccd7d1?w=300' },
    ],
  },
  {
    id: '2',
    name: 'Comida da Mamãe Gansa',
    address: 'Av. T63 - Setor Bueno',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    category: 'Caseira',
    deliveryFee: 6.0,
    rating: 4.9,
    products: [
      { id: 'p4', name: 'Prato do Dia', description: 'Arroz, feijão, bife e salada', price: 28.9, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300' },
      { id: 'p5', name: 'Frango Assado', description: 'Frango temperado na hora', price: 34.9, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300' },
    ],
  },
  {
    id: '3',
    name: 'Chicorito',
    address: 'Avenida 110 - Morada do Sol',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    category: 'Mexicano',
    deliveryFee: 7.0,
    rating: 4.6,
    products: [
      { id: 'p6', name: 'Burrito Frango', description: 'Tortilla recheada com frango', price: 29.9, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300' },
      { id: 'p7', name: 'Nachos Especial', description: 'Com guacamole e cheddar', price: 22.9, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300' },
    ],
  },
  {
    id: '4',
    name: 'Subway',
    address: 'Av. Rio Verde - Vera Cruz',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400',
    category: 'Sanduíches',
    deliveryFee: 5.0,
    rating: 4.3,
    products: [
      { id: 'p8', name: 'Footlong 30 cm', description: 'Sub de 30 no preço de 15', price: 22.9, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300' },
      { id: 'p9', name: 'Dobro de Queijo', description: 'Sub com dobro de queijo', price: 26.9, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300' },
      { id: 'p10', name: '2 por 27,90', description: '2 subs clássicos', price: 27.9, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300' },
    ],
  },
  {
    id: '5',
    name: "McDonald's",
    address: 'Av. Rio Verde - Jardim Américas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Fast Food',
    deliveryFee: 4.0,
    rating: 4.1,
    products: [
      { id: 'p11', name: 'Big Mac', description: 'O clássico hambúrguer duplo', price: 29.9, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
      { id: 'p12', name: 'McFritas Grande', description: 'Batata frita crocante', price: 12.9, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300' },
      { id: 'p13', name: 'McFlurry Oreo', description: 'Sorvete com pedaços de Oreo', price: 14.9, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300' },
    ],
  },
  {
    id: '6',
    name: 'Burger King',
    address: 'Av. Olinda - Jardim Goiás',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
    category: 'Fast Food',
    deliveryFee: 4.0,
    rating: 4.2,
    products: [
      { id: 'p14', name: 'Whopper', description: 'O famoso hambúrguer grelhado', price: 32.9, image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=300' },
      { id: 'p15', name: 'Onion Rings', description: 'Anéis de cebola crocantes', price: 14.9, image: 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=300' },
    ],
  },
];
