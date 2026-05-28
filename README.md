# 🏛️ E-Service — Barangay Talolong Electronic Services Portal

A full-stack web-based Information Management System for Barangay Talolong, Tayabas, Quezon Province.

---

## 📁 Project Structure

```
eservice/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── adminController.js    # All admin operations
│   │   └── residentController.js # Resident requests & appointments
│   ├── middleware/auth.js        # JWT + role guards
│   ├── models/
│   │   ├── User.js               # User schema (resident/admin)
│   │   ├── DocumentRequest.js    # Document request schema
│   │   └── Appointment.js        # Appointment schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── resident.js
│   └── server.js                 # Express entry point
├── frontend/
│   ├── src/
│   │   ├── styles/global.css     # Design system
│   │   ├── js/utils.js           # Shared utilities
│   │   └── pages/
│   │       ├── index.html/js/css     # Login page
│   │       ├── register.html/js/css  # Registration
│   │       ├── resident.html/js/css  # Resident dashboard
│   │       └── admin.html/js/css     # Admin dashboard
│   ├── dist/                     # Built output (after npm run build)
│   └── webpack.config.js
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account

### 2. Clone & Install
```bash
git clone <your-repo>
cd eservice
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eservice_talolong
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/eservice_talolong
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Build Frontend
```bash
npm run build
```

### 5. Start Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Open: **http://localhost:5000**

---

## 🔐 Default Credentials

The server **auto-seeds an admin account** on first startup:

| Role  | Email                       | Password  |
|-------|-----------------------------|-----------|
| Admin | admin@talolong.gov.ph       | admin123  |

> ⚠️ Change the admin password after first login in production.

---

## 🗺️ Pages & Routes

| Page        | URL                 | Access        |
|-------------|---------------------|---------------|
| Login       | `/`                 | Public        |
| Register    | `/register.html`    | Public        |
| Resident    | `/resident.html`    | Approved Residents |
| Admin       | `/admin.html`       | Admin Only    |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register resident   |
| POST   | /api/auth/login     | Login               |
| GET    | /api/auth/me        | Get current user    |

### Resident (requires approved JWT)
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/resident/documents     | Submit document request  |
| GET    | /api/resident/documents     | Get my document requests |
| POST   | /api/resident/appointments  | Schedule appointment     |
| GET    | /api/resident/appointments  | Get my appointments      |

### Admin (requires admin JWT)
| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| GET    | /api/admin/stats                | Dashboard statistics         |
| GET    | /api/admin/users                | Get all users                |
| PATCH  | /api/admin/users/:id/approve    | Approve registration         |
| PATCH  | /api/admin/users/:id/reject     | Reject registration          |
| GET    | /api/admin/documents            | All document requests        |
| PATCH  | /api/admin/documents/:id        | Update document request      |
| GET    | /api/admin/appointments         | All appointments             |
| PATCH  | /api/admin/appointments/:id     | Update appointment           |

---

## 📋 Features Summary

### Resident Portal
- ✅ Register with personal information
- ✅ Pending approval notice after registration
- ✅ Dashboard with request stats
- ✅ Request 5 document types (Clearance, Residency, Certification, Indigency, Cedula)
- ✅ Schedule appointments for 5 services
- ✅ Track status: pending / processing / approved / rejected
- ✅ View admin remarks and rescheduled details

### Admin Panel
- ✅ Dashboard with live statistics + notification badges
- ✅ Approve / reject registrations (with rejection reason)
- ✅ View all approved residents
- ✅ Manage document requests (pending → processing → approved/rejected)
- ✅ Manage appointments (approve / reschedule / cancel / complete)
- ✅ Filter by status in all sections

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| Frontend  | Vanilla HTML, CSS, JavaScript       |
| Bundler   | Webpack 5                           |
| Fonts     | Google Fonts (Playfair Display + Source Sans 3) |

---

## 🎨 Design System

- **Color palette:** Navy (#0d1b2a) + Gold (#c9a84c) — official civic aesthetic
- **Typography:** Playfair Display (headings) + Source Sans 3 (body)
- **Components:** Cards, modals, badges, toast notifications, sidebar navigation

---

*Built for Barangay Talolong, Tayabas, Quezon Province. 2024.*
