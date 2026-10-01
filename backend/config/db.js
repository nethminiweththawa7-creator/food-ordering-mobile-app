const mongoose = require('mongoose');

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

const seedFoodItems = async () => {
  try {
    const FoodItem = require('../models/FoodItem');
    // Clear old low USD priced items if present (< 100)
    await FoodItem.deleteMany({ price: { $lt: 100 } });
    const count = await FoodItem.countDocuments();
    if (count === 0) {
      await FoodItem.insertMany(sampleFoodItems);
      console.log('✅ Realistic Sri Lankan Rupee Food Items seeded into MongoDB!');
    }
  } catch (err) {
    console.error(`⚠️ Failed to seed food items: ${err.message}`);
  }
};

const seedDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = 'admin@foodapp.com';
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      await User.create({
        name: 'Default Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Default Admin account created! (Email: admin@foodapp.com, Password: admin123)');
    } else {
      console.log('ℹ️ Default Admin account ready (Email: admin@foodapp.com)');
    }
  } catch (err) {
    console.error(`⚠️ Failed to seed Default Admin: ${err.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_ordering', {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedFoodItems();
    await seedDefaultAdmin();
  } catch (error) {
    console.log(`⚠️ Primary MongoDB unavailable (${error.message}). Attempting In-Memory Database...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: { version: '5.0.14' },
      });
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${mongoUri}`);

      await seedFoodItems();
      await seedDefaultAdmin();
    } catch (memError) {
      console.error(`⚠️ Could not initialize database: ${memError.message}`);
      console.log('Backend will remain online.');
    }
  }
};

module.exports = connectDB;
