# 📊 Bizit - Business Management & Inventory System

A modern, full-stack business management application designed to help owners effortlessly manage their inventory, track sales, analyze profits and losses, and oversee employees within multiple organizations.

![Bizit](https://img.shields.io/badge/Bizit-Business%20Manager-blue?style=for-the-badge&logo=react)
![Stack](https://img.shields.io/badge/React%20+%20FastAPI-green?style=for-the-badge&logo=python)

## 🌟 Key Features

### 🏢 **Multi-Tenant Architecture & Organization Support**
- **True Multi-Tenancy**: The application is built from the ground up to support multiple tenants safely within the same database infrastructure.
- **Business Owners**: Create, manage, and seamlessly switch between multiple business organizations from a single account without logging out.
- **Tenant Data Isolation**: Complete data segregation ensures privacy and security between different businesses.

### 👤 **Role-Based Access Control**
- **Owner**: Full access across their multi-organization empire (creating admins, employees, tracking overarching financials).
- **Admin**: Dashboard access configured to manage a specific organization's daily operations.
- **Employee**: Streamlined interface focused on necessary daily tasks (e.g., Stock management, recording sales).

### 𖠿 **Smart Inventory & Stock Management**
- **Real-Time Tracking**: Monitor current stock levels against maximum capacity.
- **Dynamic Pricing & Cost**: Track both cost price and selling price for accurate profit margins.
- **Low Stock Alerts**: Visual indicators and filtering for items that need replenishing.

### 💰 **Sales & Profit/Loss Analytics**
- **Sales Logging**: Record daily sales with automatic stock deduction.
- **Comprehensive P&L Reports**: Advanced dashboards showing Gross Profit, Cost of Goods Sold (COGS), and Net Profit.
- **Vast Analytics**: Interactive charts powered by `Recharts` providing financial breakdowns and tracking loss reasons (e.g., Damaged, Stolen, Expired).

### 🚚 **Supplier & Shipment Tracking**
- Manage pending and incoming shipments dynamically.
- Automatically track and visualize supplier performance scores over time.

### 🎨 **Beautiful, Responsive UI/UX**
- **Dark/Light Mode**: Full theme customizability built directly into the app.
- **Responsive Layout**: Works flawlessly on desktops, tablets, and mobile devices—featuring optimized grid layouts and off-canvas modals.
- **Rich Dashboard Visuals**: Gorgeous gradient elements, glassmorphism features, and custom micro-animations.

## 🛠 Technology Stack

### **Frontend**
- **React.js 18+** - Built with Vite for rapid development and optimized builds
- **React Router DOM** - Client-side SPA routing
- **Recharts** - Dynamic, responsive data visualization and analytics
- **Lucide-React** - Beautiful, consistent SVG iconography
- **Vanilla CSS** - Completely custom, deeply polished stylesheet foundation avoiding heavy frameworks

### **Backend**
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Relational database (served via Neon)
- **Psycopg2 / SQL** - Direct database interaction and querying
- **Pydantic & Python-jose** - Data validation, settings management, and JWT Authentication
- **Bcrypt** - Secure password hashing

## 🚀 Deployment Architecture
- **Frontend**: Vercel (Optimized SPA fallback routing)
- **Backend**: Render (Python Web Service)
- **Database**: Neon (Serverless Postgres)

## 💻 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- Python 3.9+
- PostgreSQL (Local or managed like Neon)

### **Installation & Local Setup**

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd Bizit
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   *Create a `.env` file in the `backend` directory with `DATABASE_URL` and `SECRET_KEY` variables.*

3. **Initialize Database Schema**
   ```bash
   python init_prod_db.py
   python app/main.py
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory with `VITE_API_URL=http://localhost:8000/api`.*

5. **Start the application**
   ```bash
   # Terminal 1 - Start backend (Uvicorn)
   cd backend
   uvicorn app.main:app --reload

   # Terminal 2 - Start client (Vite)
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/docs`

## 👨‍💻 Author

**Mostofa Hasin Mahdi**
- **Established**: 2026
- **Purpose**: Empowering business owners with accessible, professional-grade management software.
