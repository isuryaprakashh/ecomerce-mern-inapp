# 🌹 Rose Bud — Luxury Botanical Skincare E-Commerce

Rose Bud is an editorial-grade, pixel-perfect, and highly responsive MERN stack e-commerce web application designed for a luxury botanical skincare boutique. 

With deep focus on smooth transitions, modern typography, grid alignment, and micro-interactions, it delivers a high-end sensory shopping experience that mirrors premium global retail brands.

---

## ✨ Features & Interactive UX
* **Visual Editorial Design**: Gorgeous, soft-toned, modern typography featuring *Cormorant Garamond* and *Inter*, matching luxury skincare aesthetics.
* **Premium Product Catalog**: Seamless sorting (price, rating, featured) and live, debounced client-side/server-side search overlays.
* **Interactive Cart Drawer**: A slide-out cart menu featuring an animated free-shipping indicator bar.
* **Slide-over Product Details**: Modals containing rich content: description tab grids, full ingredients lists, and immediate check mark animations when adding products to the cart.
* **Dual Payment Gateway Integration (Razorpay & Fallback)**:
  * **Test Mode Razorpay**: Integrates directly with the Razorpay API script and handles payment checks.
  * **Simulated Checkout (Zero-Config)**: Automatically activates if Razorpay keys are not provided. Displays a custom, beautiful mock card checkout panel inside the UI where the user can choose to simulate an approval or decline.
* **Database & Fallback Resiliency**: If MongoDB is unavailable during local development, the backend and frontend automatically engage an in-memory database fallback to ensure 100% functionality out-of-the-box.

---

## 🛠️ Technology Stack
* **Frontend**: React.js, Vite, Vanilla CSS (CSS variables and keyframe transitions), Lucide Icons.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (via Mongoose ODM) with automatic luxury product seeding.
* **Payments**: Razorpay Node SDK & Razorpay checkout script.

---

## 📂 Project Architecture

```
INTERN-ASSESSMENT/
├── package.json              # Workspace root setup (runs concurrently)
├── README.md                 # Project documentation
├── backend/                  # Server-side environment
│   ├── package.json
│   ├── server.js             # Main API server
│   ├── config/
│   │   └── db.js             # MongoDB connector & seeding
│   ├── models/
│   │   ├── Product.js        # Schema for skincare catalog
│   │   └── Order.js          # Schema for payment transactions
│   └── routes/
│       ├── productRoutes.js  # Catalog endpoints
│       └── orderRoutes.js    # Checkout/Payment verification routes
└── frontend/                 # Client-side environment
    ├── package.json
    ├── index.html
    ├── vercel.json           # Vercel deployment mappings & proxies
    └── src/
        ├── main.jsx
        ├── index.css         # Rose Bud design system
        ├── App.jsx           # Global state orchestrator
        ├── utils/
        │   └── api.js        # API bridge with mock DB fallbacks
        └── components/
            ├── Header.jsx    # Nav bar & badge indicators
            ├── Hero.jsx      # Editorial splash & floating widgets
            ├── ProductCatalog.jsx
            ├── ProductCard.jsx
            ├── ProductDetailModal.jsx
            ├── CartDrawer.jsx
            ├── CheckoutModal.jsx
            └── OrderSuccessModal.jsx
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisite Checklist
* Ensure [Node.js](https://nodejs.org/) is installed (v18+ recommended).

### 2. Installation
Clone or navigate to the workspace, then run the root script to install dependencies for the backend, frontend, and concurrently runner:
```bash
# In the workspace root directory:
npm run install-all
```

### 3. Environment Setup (Optional)
If you wish to configure live MongoDB databases and actual Razorpay checkouts, create a `.env` file in the `backend/` directory:
```env
# backend/.env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
* **Note**: If you do not configure a `.env` file, the project automatically runs in **Zero-Config/Resilience mode** (using local simulated payment options and in-memory mock product lists).

### 4. Running the Project
To spin up both the React frontend (Vite) and the Express backend server concurrently:
```bash
npm run dev
```
* **Frontend Local Server**: [http://localhost:3000](http://localhost:3000)
* **Backend Local Server**: [http://localhost:5000](http://localhost:5000)

---

## ☁️ Deployment Strategy

### Backend (Render Deployment)
1. Push the code repository to **GitHub**.
2. Log in to your [Render Dashboard](https://render.com/).
3. Create a new **Web Service** and link your GitHub repository.
4. Set the following settings:
   * **Name**: `rosebud-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Under **Environment Variables**, define your production variables:
   * `PORT`: `5000`
   * `MONGODB_URI`: (Your production MongoDB Atlas URL)
   * `RAZORPAY_KEY_ID`: (Your production/test Razorpay API key)
   * `RAZORPAY_KEY_SECRET`: (Your production/test Razorpay API secret)

### Frontend (Vercel Deployment)
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Create a new project and import your GitHub repository.
3. Set the following settings during import:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Under **Environment Variables**, add the environment pointer:
   * `VITE_API_URL`: (Your deployed Render backend URL, e.g. `https://rosebud-backend.onrender.com`)
5. Click **Deploy**. The `frontend/vercel.json` config ensures that client-side page refreshes don't throw 404s and routes all `/api` calls safely to your Render endpoint.
