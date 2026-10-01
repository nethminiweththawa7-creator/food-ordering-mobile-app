const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodItem = require('./models/FoodItem');
const connectDB = require('./config/db');

dotenv.config();

const sampleFoodItems = [
  {
    name: 'Classic Cheeseburger',
    price: 1500,
    description: 'Juicy beef patty topped with melted cheddar cheese, fresh lettuce, tomatoes, and special house sauce on a toasted brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 25,
    category: 'Main Course',
    isAvailable: true,
  },
  {
    name: 'Pepperoni Supreme Pizza',
    price: 3500,
    description: 'Crispy crust loaded with rich tomato sauce, premium mozzarella cheese, and generous slices of smoky pepperoni.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 15,
    category: 'Main Course',
    isAvailable: true,
  },
  {
    name: 'Crispy Chicken Tender Bucket',
    price: 2850,
    description: 'Golden crispy fried chicken tenders served with honey mustard and garlic mayo dip.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 30,
    category: 'Starters',
    isAvailable: true,
  },
  {
    name: 'Garlic Butter Fries',
    price: 950,
    description: 'Crispy French fries tossed in aromatic garlic butter and freshly chopped parsley.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 40,
    category: 'Starters',
    isAvailable: true,
  },
  {
    name: 'Chocolate Lava Cake',
    price: 1400,
    description: 'Warm chocolate cake with a rich liquid chocolate molten center, served with vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 20,
    category: 'Desserts',
    isAvailable: true,
  },
  {
    name: 'Iced Caramel Macchiato',
    price: 1100,
    description: 'Espresso combined with milk and vanilla syrup, poured over ice and drizzled with sweet caramel sauce.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 50,
    category: 'Beverages',
    isAvailable: true,
  },
  {
    name: 'Fresh Mango Smoothie',
    price: 900,
    description: 'Blended real tropical mangoes with creamy yogurt and a hint of honey.',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 35,
    category: 'Beverages',
    isAvailable: true,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing food items...');
    await FoodItem.deleteMany({});

    console.log('Inserting sample food items...');
    await FoodItem.insertMany(sampleFoodItems);

    console.log('✅ Sample Food Items successfully seeded into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
