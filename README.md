# 📊 Bizit - Business Management & Inventory System
<img width="1040" height="422" alt="image" src="https://github.com/user-attachments/assets/e6afc905-257a-4f4a-81bd-c28ab9302a8d" />

A modern, full-stack business management application designed to help owners effortlessly manage their inventory, track sales, analyze profits and losses, and oversee employees within multiple organizations.

![Bizit](https://img.shields.io/badge/Bizit-Business%20Manager-blue?style=for-the-badge&logo=react)
![Stack](https://img.shields.io/badge/React%20+%20FastAPI-green?style=for-the-badge&logo=python)

## 🌟 Key Features

### 🏢 **Multi-Tenant Architecture & Organization Support**
- <img width="826" height="625" alt="image" src="https://github.com/user-attachments/assets/a8f65e6d-cb5b-4098-bdd5-f5aeb7f499c3" />
- **True Multi-Tenancy**: The application is built from the ground up to support multiple tenants safely within the same database infrastructure.
- **Business Owners**: Create, manage, and seamlessly switch between multiple business organizations from a single account without logging out.
- **Tenant Data Isolation**: Complete data segregation ensures privacy and security between different businesses.

### 👤 **Role-Based Access Control**
- <img width="737" height="502" alt="image" src="https://github.com/user-attachments/assets/a6b95f2e-f676-44d1-a46d-5aa7ef806271" />
- **Owner**: Full access across their multi-organization empire (creating admins, employees, tracking overarching financials).
- **Admin**: Dashboard access configured to manage a specific organization's daily operations.
- **Employee**: Streamlined interface focused on necessary daily tasks (e.g., Stock management, recording sales).

### 𖠿 **Smart Inventory & Stock Management**
- <img width="1445" height="654" alt="image" src="https://github.com/user-attachments/assets/8c60207f-47ed-4629-b4d4-7ef1e0aa29f6" />
- **Real-Time Tracking**: Monitor current stock levels against maximum capacity.
- **Dynamic Pricing & Cost**: Track both cost price and selling price for accurate profit margins.
- **Low Stock Alerts**: Visual indicators and filtering for items that need replenishing.

### 💰 **Sales & Profit/Loss Analytics**
- <img width="1401" height="786" alt="image" src="https://github.com/user-attachments/assets/cbe7cc9d-95c9-4c95-b5f5-d9307585a44a" />
- **Sales Logging**: Record daily sales with automatic stock deduction.
- **Comprehensive P&L Reports**: Advanced dashboards showing Gross Profit, Cost of Goods Sold (COGS), and Net Profit.
- **Vast Analytics**: Interactive charts powered by `Recharts` providing financial breakdowns and tracking loss reasons (e.g., Damaged, Stolen, Expired).

### 🚚 **Supplier & Shipment Tracking**
- <img width="1372" height="704" alt="image" src="https://github.com/user-attachments/assets/e44f50a4-d0fc-4742-a9f2-50bc291b0ec3" />
- Manage pending and incoming shipments dynamically.
- Automatically track and visualize supplier performance scores over time.

### 🎨 **Beautiful, Responsive UI/UX**
- <img width="1375" height="676" alt="image" src="https://github.com/user-attachments/assets/faec7061-5948-49c3-8e49-021772fc2e29" />
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
- Empowering business owners with accessible, professional-grade management software.
