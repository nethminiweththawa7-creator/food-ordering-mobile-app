# Food Ordering Mobile App & Node.js Backend

A full-stack Food Ordering solution featuring a **React Native (Expo)** mobile frontend with a sleek **Crimson Red theme**, paired with a robust **Node.js, Express & MongoDB** backend API.

---

## 🌟 Key Features

### 📱 Customer Mobile App
- **Modern UI Design**: Premium Crimson Red palette (`#E53935`) with clean off-white canvas and interactive category tiles.
- **Food Catalog**: Real-time menu fetching with category filters (*Pizzas, Burgers, Drinks, Desserts*).
- **Cart & Checkout**: Real-time quantity adjustment, integer LKR formatting (`Rs. 3500`), flat delivery fee calculation (`Rs. 350`), and seamless order placement.
- **Order Tracking**: Real-time status badges for orders (*Pending, Preparing, Out for Delivery, Delivered*).
- **Customer Authentication**: Secure JWT-based registration and login.

### 🛡️ Admin Management System
- **Universal Default Admin**: Pre-seeded default admin account (`admin@foodapp.com` / `admin123`).
- **Food Menu CRUD**: Add, edit, and delete food items with custom images, prices, and categories.
- **Order Processing**: Update order statuses directly from the Admin Dashboard.

### ⚙️ Backend API & Database
- **Automatic Database Seeding**: Auto-seeds sample food items with realistic LKR prices upon server start.
- **Role-Based Access Control**: Middleware protecting admin routes from customer access.
- **In-Memory & MongoDB Support**: Connects seamlessly to MongoDB or fallback in-memory database instance.

---

## 💰 Currency & Pricing Standard

All prices across the backend database and mobile user interface are formatted in **Sri Lankan Rupees (Rs.)** rounded to whole numbers without decimal cents:
- **Pizzas**: ~Rs. 3,500
- **Burgers**: ~Rs. 1,500
- **Drinks**: ~Rs. 450
- **Desserts**: ~Rs. 850
- **Delivery Fee**: Rs. 350

---

## 🔑 Default Credentials

| User Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foodapp.com` | `admin123` | Full Menu & Order Management |
| **Customer** | *(Register via App)* | *(User Choice)* | Browsing & Ordering |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (Port 5001)
npm run dev
```

The backend server will automatically connect to the database and seed the default admin account and menu items.

---

### 2. Mobile App Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Run Expo Web / Mobile app (Port 8081)
npx expo start --web
```

---

## 📁 Project Structure

```text
Food_Ordering/
├── backend/
│   ├── config/          # Database configuration & seeding
│   ├── controllers/     # Auth, FoodItem & Order controllers
│   ├── middleware/      # JWT auth & image upload middleware
│   ├── models/          # User, FoodItem & Order Mongoose schemas
│   ├── routes/          # API route definitions
│   └── server.js        # Express app entrypoint
├── mobile/
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   ├── context/     # Auth & Cart Context providers
│   │   ├── navigation/  # React Navigation stacks
│   │   └── screens/     # Home, FoodDetails, Cart, AdminDashboard, etc.
│   └── App.js           # Expo App root
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, React Navigation, Axios
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Mongoose
- **Database**: MongoDB / Mongo-in-memory

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
