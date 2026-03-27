# 💸 Xpensio – Full-Stack Expense Tracker

A production-ready expense tracking app built with **React 18**, **Node.js / Express**, and **MongoDB Atlas**. Features JWT authentication, rich analytics charts, CSV export, dark/light theme, and a fully responsive UI.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | React Context + custom hooks |
| HTTP Client | Axios (with token refresh interceptor) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (HTTP-only cookies, access + refresh tokens) |
| Validation | express-validator |
| Security | Helmet, CORS, rate-limiting |
| Dates | date-fns |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## ✨ Features

### 🔐 Authentication
- Signup & login with bcrypt password hashing
- JWT access tokens (15min) + refresh tokens (7d) in HTTP-only cookies
- Auto token refresh with Axios interceptor
- Protected routes with React Router

### 💰 Expense Management
- Add, edit, delete expenses
- 10 categories: Food, Travel, Bills, Shopping, Health, Entertainment, Education, Housing, Transportation, Other
- Optional notes & recurring expense support (daily / weekly / monthly)
- Pagination (15 per page)
- Search by title + filter by category and date range

### 📊 Dashboard
- Today / This Week / This Month stat cards
- Monthly budget tracker with visual progress bar + alert
- Recent 5 transactions
- Category breakdown with progress bars

### 📈 Analytics
- Area chart – spending trend
- Bar chart – distribution
- Pie chart – category breakdown
- Top 5 expenses for the period
- Toggle: Daily (30d) / Weekly (12w) / Monthly (6m)

### 📤 Export
- Export all (or filtered) expenses as CSV

### 🎨 UI/UX
- Dark / Light theme (persisted in localStorage)
- Fully responsive (mobile drawer sidebar)
- Animated modals, toasts, page transitions
- Password strength indicator on signup

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Extract / Clone

```bash
cd xpensio
```

### 2. Install all dependencies

```bash
npm run install:all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/xpensio
JWT_SECRET=your-long-random-secret-key-32chars
JWT_REFRESH_SECRET=another-long-random-secret-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Run in development

From the root:
```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173 (proxies `/api` to port 5000)

Open http://localhost:5173 to use the app.

---

## 📁 Project Structure

```
xpensio/
├── package.json               # Root: concurrent dev scripts
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── index.js           # Entry point
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Expense.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── expensesController.js
│   │   │   ├── dashboardController.js
│   │   │   └── analyticsController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── expenses.js
│   │   │   ├── dashboard.js
│   │   │   └── analytics.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT protect middleware
│   │   │   ├── validate.js    # express-validator schemas
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       └── jwt.js
│   ├── .env                   # ← update this
│   └── package.json
│
└── client/                    # React + Vite frontend
    ├── index.html
    ├── vite.config.js         # Proxy /api → :5000
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx            # Routes + providers
    │   ├── index.css          # Tailwind + custom classes
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/
    │   │   └── index.js       # useExpenses, useDashboard, useAnalytics
    │   ├── utils/
    │   │   ├── api.js         # Axios instance + refresh interceptor
    │   │   └── helpers.js     # formatCurrency, formatDate, etc.
    │   ├── types/
    │   │   └── index.js       # CATEGORIES, COLORS, ICONS
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ExpensesPage.jsx
    │   │   ├── AnalyticsPage.jsx
    │   │   └── SettingsPage.jsx
    │   └── components/
    │       ├── layout/
    │       │   ├── AuthLayout.jsx
    │       │   ├── DashboardLayout.jsx
    │       │   ├── Sidebar.jsx
    │       │   └── TopBar.jsx
    │       ├── expenses/
    │       │   └── ExpenseModal.jsx
    │       └── ui/
    │           └── Spinner.jsx
    └── package.json
```

---

## 🔌 API Reference

### Auth  `POST /api/auth/...`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/refresh` | cookie | Refresh access token |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/me` | ✅ | Update name / budget |

### Expenses  `/api/expenses`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | List (page, limit, search, category, startDate, endDate) |
| POST | `/api/expenses` | Create |
| GET | `/api/expenses/:id` | Get one |
| PUT | `/api/expenses/:id` | Update |
| DELETE | `/api/expenses/:id` | Delete |
| GET | `/api/expenses/export` | CSV download |

### Data
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Summary stats |
| GET | `/api/analytics?period=day\|week\|month` | Chart data |

---

## 🚢 Deployment

### Backend (e.g. Railway / Render)
```bash
cd server
# Set env vars in dashboard, then:
npm start
```

### Frontend (e.g. Vercel / Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL if not using a proxy
```

For production, update `vite.config.js` proxy target or use `VITE_API_BASE_URL` env variable.

---

## 📝 License

MIT
