# 🚀 AEROSPACE 3D — Full-Stack 3D MERN TypeScript E-Commerce Platform

A production-grade, mobile-first, and fully animated E-Commerce web application built on the **MERN** stack (MongoDB, Express, React, Node.js) with end-to-end **TypeScript**. Featuring real-time **Three.js / React Three Fiber 3D product previews**, **interactive 3D review inspection**, **Framer Motion fluid micro-interactions**, and a **Dynamic Admin Control Center** for products, 3D assets, blog posts, and order management.

---

## 🌟 Key Architectural Features

### 1. 🎨 Spatial 3D WebGL Engine (`@react-three/fiber` & `@react-three/drei`)
- **360° Real-time Orbit Control**: Rotate, pan, and smooth-zoom with realistic physics and contact shadows.
- **Dynamic 3D Material/Color Customizer**: Switch product colorways and materials on the live 3D mesh.
- **Interactive 3D Feature Hotspots**: Clickable 3D pins on the product model displaying engineering callouts.
- **3D Customer Review Hotspots**: Reviewers and shoppers can inspect specific physical points on the 3D model tied to verified buyer comments.
- **Adaptive Fallback Geometry**: Smooth floating procedural geometry fallback for low-power or offline devices.

### 2. 📱 Fully Animated, Mobile-First Customer Storefront
- **Responsive Layout**: Designed for seamless one-thumb smartphone usage with a sleek bottom navigation bar, filter drawers, and slide-out cart drawer.
- **Framer Motion Micro-Interactions**: Smooth card hover lifts, page transitions, stagger animations, and confetti on purchase.
- **Live Search & Filter Engine**: Debounced keyword search, category selector, 3D-only toggle switch, and price/rating sorting.
- **Wishlist & Cart Persistence**: Local storage synced Zustand stores with real-time tax and free shipping threshold calculations.

### 3. 🛠️ Dynamic Admin Control Center
- **Role-Based Access Control (RBAC)**: Protected admin routes gated by JWT authentication and middleware.
- **Dynamic Product Manager**:
  - Add / Edit / Delete products.
  - Multi-image uploader + `.glb` / `.gltf` 3D model asset uploader.
  - Dynamic specifications builder (key-value specs) and stock management with low-stock warnings.
- **Dynamic Editorial / Blog Manager**: Publish store announcements, feature updates, and guides.
- **Real-Time Order Fulfillment**: Track customer shipments and update status (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`) with carrier tracking numbers.
- **Analytics Overview**: Live revenue calculations, total orders, product counts, and low-inventory alerts.

---

## 📁 Repository Structure

```text
E-commerce/
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/           # MongoDB connector with auto in-memory fallback
│   │   ├── controllers/      # Auth, Products, Reviews, Orders, Posts, Analytics, Uploads
│   │   ├── middleware/       # JWT Auth, Admin RBAC, Error Handler, Multer File Upload
│   │   ├── models/           # User, Product, Category, Review, Order, Post Mongoose schemas
│   │   ├── routes/           # Typed REST API endpoints
│   │   ├── types/            # Backend TypeScript interfaces
│   │   ├── utils/            # Seed script with realistic 3D products & demo users
│   │   └── server.ts         # Express server entrypoint
│   ├── uploads/              # Static uploads folder for images & .glb 3D models
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/           # Three.js ProductCanvas & ReviewAnnotationViewer
│   │   │   ├── admin/        # AdminSidebar, AdminNavbar, ProductModal, PostModal, OrderStatusModal
│   │   │   ├── common/       # Navbar, Footer, MobileNav, CartDrawer, RatingStars, Toast
│   │   │   ├── product/      # ProductCard, ProductFilter, Quick3DModal
│   │   │   └── review/       # ReviewList, ReviewModal
│   │   ├── pages/
│   │   │   ├── HomePage.tsx            # Hero with 3D canvas, categories & featured items
│   │   │   ├── ShopPage.tsx            # Catalog with filters, search, and 3D quick view
│   │   │   ├── ProductDetailsPage.tsx  # Switchable 3D/2D gallery, color customizer, 3D reviews
│   │   │   ├── CheckoutPage.tsx        # Multi-step responsive checkout
│   │   │   ├── OrderSuccessPage.tsx    # Celebratory confetti confirmation
│   │   │   ├── OrdersHistoryPage.tsx   # Order tracking visual timeline
│   │   │   ├── WishlistPage.tsx        # Saved items
│   │   │   ├── ProfilePage.tsx         # User settings & delivery address book
│   │   │   ├── BlogPage.tsx            # Editorial stories & announcements
│   │   │   ├── BlogPostPage.tsx        # Single article view
│   │   │   ├── LoginPage.tsx           # Sign in with 1-click Demo auto-fill
│   │   │   ├── RegisterPage.tsx        # Customer registration
│   │   │   └── admin/                  # Admin Dashboard, Products, Orders, Posts, Users
│   │   ├── services/         # Axios client with JWT interceptor
│   │   ├── store/            # Zustand stores (useAuthStore, useCartStore, useToastStore)
│   │   ├── types/            # Frontend TypeScript models
│   │   ├── App.tsx           # Routing and protected layout wrappers
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── package.json              # Root script runner for concurrent dev
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Installation
Run `npm install` in both `/backend` and `/frontend`:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Run the Development Servers
You can start both backend and frontend concurrently from the root directory:
```bash
# From the root /E-commerce directory:
npm run dev
```

Or run them individually in separate terminals:
- **Backend API**: `cd backend && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend App**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

> **Note**: The backend is configured to automatically initialize an in-memory MongoDB database and seed realistic 3D products and accounts if no external `MONGODB_URI` is specified in `backend/.env`.

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Buttons** on the Login Page (`/login`) or use the following credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@ecommerce.com` | `adminpassword123` | Full access to Admin Panel (`/admin`), Product CRUD, 3D Uploads, Blog Posts, Orders |
| **🛍️ Verified Customer** | `customer@ecommerce.com` | `customerpassword123` | Storefront, Wishlist, 3D Reviews, Orders, Profile |

---

## 🔌 Key API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current authenticated user profile
- `PUT /api/auth/profile` — Update address book & details
- `POST /api/auth/wishlist/:productId` — Toggle product in wishlist
- `GET /api/auth/users` — Get all users (*Admin only*)

### Products (`/api/products`)
- `GET /api/products` — Filter, search, paginate, and sort products
- `GET /api/products/featured` — Get featured, trending, and 3D products
- `GET /api/products/categories` — Get category listing
- `GET /api/products/:identifier` — Get single product by slug or ID
- `POST /api/products` — Create new product with 3D model (*Admin only*)
- `PUT /api/products/:id` — Update product details (*Admin only*)
- `DELETE /api/products/:id` — Delete product (*Admin only*)

### 3D Reviews (`/api/reviews`)
- `GET /api/reviews/product/:productId` — List reviews for product
- `POST /api/reviews` — Submit verified review with optional 3D spatial annotation coordinates
- `DELETE /api/reviews/:id` — Delete review (*Admin or Owner*)

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` — Create new order with inventory decrement
- `GET /api/orders/myorders` — List logged in user order history
- `GET /api/orders/:id` — Get single order tracking details
- `GET /api/orders` — List all customer orders (*Admin only*)
- `PUT /api/orders/:id/status` — Update fulfillment & tracking number (*Admin only*)

### Dynamic Posts & News (`/api/posts`)
- `GET /api/posts` — Get published blog articles
- `GET /api/posts/:identifier` — Get article by slug
- `POST /api/posts` — Create new post (*Admin only*)
- `PUT /api/posts/:id` — Update post (*Admin only*)
- `DELETE /api/posts/:id` — Delete post (*Admin only*)

### Admin Analytics (`/api/analytics`)
- `GET /api/analytics` — Revenue summaries, order status breakdown, low-stock alerts (*Admin only*)

### File & 3D Asset Upload (`/api/upload`)
- `POST /api/upload` — Upload images or `.glb` / `.gltf` 3D model assets (*Admin only*)
