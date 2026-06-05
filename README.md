# ✈️ Wandr — AI-Powered Travel Itinerary Generator

A full-stack MERN application that lets users upload travel booking documents (flights, hotels, train tickets) and automatically generates a structured day-by-day itinerary using AI.

![Wandr](https://img.shields.io/badge/Stack-MERN-blue) ![AI](https://img.shields.io/badge/AI-GPT--4o-green) ![Storage](https://img.shields.io/badge/Storage-Cloudinary-orange)

---

## ✨ Features

- **JWT Authentication** — Secure register/login with token-based sessions
- **Document Upload** — Drag-and-drop PDFs and images (Cloudinary storage)
- **AI Extraction** — OpenRouter (Llama/Gemini) Vision extracts text from images; pdf-parse for PDFs
- **AI Itinerary Generation** — OpenRouter (Llama/Gemini) generates a complete day-by-day plan with activities, tips, and timing
- **Itinerary History** — All generated itineraries saved per user with pagination
- **Share Links** — One-click public share URLs with view counters; revokable anytime
- **Responsive UI** — Dark-themed, mobile-first React frontend

---

## 🗂️ Project Structure

```
travel-itinerary/
├── backend/
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary + multer config
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── itineraryController.js
│   │   ├── uploadController.js # File upload + async AI processing
│   │   └── shareController.js  # Share link generation/revocation
│   ├── middleware/
│   │   └── auth.js             # JWT protect middleware
│   ├── models/
│   │   ├── User.js             # Mongoose user schema
│   │   └── Itinerary.js        # Itinerary schema with flights, hotels, activities
│   ├── routes/
│   │   ├── auth.js
│   │   ├── itinerary.js
│   │   ├── upload.js
│   │   └── share.js
│   ├── utils/
│   │   └── aiService.js        # OpenRouter OpenRouter (Llama/Gemini) text extraction + itinerary generation
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   └── layout/         # Sidebar layout
        ├── context/
        │   └── AuthContext.jsx # Auth state + JWT management
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── UploadPage.jsx        # Drag-and-drop upload
        │   ├── ItineraryPage.jsx     # Full itinerary view + share
        │   └── SharedItineraryPage.jsx # Public shared view
        └── utils/
            └── api.js          # Axios instance with JWT interceptor
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- OpenRouter API key (free tier available — https://openrouter.ai/keys)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd travel-itinerary
npm run install:all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel_itinerary
JWT_SECRET=your_very_secure_random_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

OPENROUTER_API_KEY=sk-...

FRONTEND_URL=http://localhost:3000
APP_BASE_URL=http://localhost:5000
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
# Default: REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# From root directory (runs both servers concurrently)
npm run dev

# Or individually:
npm run start:backend   # http://localhost:5000
npm run start:frontend  # http://localhost:3000
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Itineraries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/itineraries` | List user's itineraries (paginated) |
| GET | `/api/itineraries/:id` | Get single itinerary |
| GET | `/api/itineraries/:id/status` | Poll processing status |
| PATCH | `/api/itineraries/:id` | Update title/tags |
| DELETE | `/api/itineraries/:id` | Delete itinerary |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/process` | Upload documents, trigger async AI processing |

### Share
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/share/:id/generate` | Generate public share token |
| DELETE | `/api/share/:id/revoke` | Revoke share link |
| GET | `/api/share/:token` | View shared itinerary (public) |

---

## 🗃️ Database Schema

### User
```js
{ name, email, password (hashed), avatar, timestamps }
```

### Itinerary
```js
{
  user,           // ref to User
  title,
  destination,
  startDate, endDate, totalDays,
  summary, highlights[],
  flights[],      // airline, flightNumber, from, to, times, PNR
  hotels[],       // name, address, checkIn/Out, nights
  activities[],   // day, date, time, title, description, location, category, tips
  documents[],    // cloudinaryUrl, fileType
  shareToken,     // UUID for public sharing
  isPublic,
  shareViewCount,
  status,         // 'processing' | 'ready' | 'failed'
  tags[]
}
```

---

## 🏗️ Architecture Notes

- **Async Processing**: Upload endpoint returns immediately with `202 Accepted` + itinerary ID. Processing (extraction + AI generation) happens in the background. Frontend polls `/status` until `ready`.
- **Security**: JWT middleware on all protected routes, rate limiting (100 req/15min global, stricter per-user), input validation via express-validator, password hashing with bcryptjs (salt rounds: 12).
- **Cloudinary**: PDFs stored as raw files; images auto-optimized. OpenRouter (Llama/Gemini) Vision receives Cloudinary URLs directly (no base64 transfer needed).

---

## 🚢 Deployment

### Backend (Railway / Render / Fly.io)
1. Set all environment variables
2. `npm start` entrypoint
3. Set `FRONTEND_URL` to your frontend domain

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to backend URL
2. `npm run build` → deploy `/build` folder

---

## 🔑 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary dashboard |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter platform key |
| `FRONTEND_URL` | ✅ | For CORS |
| `APP_BASE_URL` | ⚪ | For share link generation |

---

## 💡 Bonus Features Implemented

- ✅ Cloudinary for document storage (replaces AWS S3)
- ✅ Drag-and-drop file upload with preview
- ✅ Processing status polling
- ✅ Public share links with view counters
- ✅ Revokable share links
- ✅ Dark-themed, responsive UI with custom design system
- ✅ Rate limiting on all routes
- ✅ Input validation and error handling
