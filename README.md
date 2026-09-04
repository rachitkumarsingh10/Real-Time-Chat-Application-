# 💬 QuickChat — Full-Stack Real-Time Chat Application

A modern, high-performance, real-time messaging web application built with the **MERN** stack (MongoDB, Express, React, Node.js), **Socket.io**, **Tailwind CSS v4**, and **Cloudinary**. QuickChat offers seamless 1-on-1 real-time messaging, live user presence tracking, instant media sharing, unread message badges, profile personalization, and a sleek, glassmorphic UI.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack & Dependencies](#-tech-stack--dependencies)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database & Cloud Services](#database--cloud-services)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Directory & Folder Structure](#-directory--folder-structure)
- [Prerequisites & System Requirements](#-prerequisites--system-requirements)
- [Environment Variables Setup](#-environment-variables-setup)
- [Installation & Setup Guide](#-installation--setup-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Running Both Concurrently](#3-running-both-concurrently)
  - [4. Verification & Testing](#4-verification--testing)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Messaging Routes](#messaging-routes)
  - [System Status Route](#system-status-route)
- [Socket.io Real-Time Events](#-socketio-real-time-events)
- [Database Schema Design](#-database-schema-design)
  - [User Schema](#user-schema)
  - [Message Schema](#message-schema)
- [Production Build & Deployment](#-production-build--deployment)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 Features Overview

- ⚡ **Instant Real-Time Messaging**: Bidirectional, low-latency messaging powered by **Socket.io**.
- 🟢 **Live Online Presence**: Real-time status indicator showing who is currently online or offline.
- 📬 **Unread Message Indicators**: Dynamic badges highlighting unread message counts per contact in the sidebar.
- 🖼️ **Rich Image Sharing**: Attach and send images in conversations, securely hosted in the cloud via **Cloudinary**.
- 📂 **Shared Media Gallery**: A dedicated media panel in the sidebar showcasing all exchanged photos in the current chat.
- 👤 **Custom User Profiles**: Update your avatar image (auto-converted to Base64 and stored on Cloudinary), full name, and bio.
- 🔐 **Secure Authentication**: User sign-up and login secured with **bcryptjs** password hashing and **JSON Web Tokens (JWT)**.
- 🎨 **Glassmorphism Aesthetic**: Beautiful backdrop-blur glass panels, custom scrollbars, and modern typography using Google Fonts (*Outfit*) styled with **Tailwind CSS v4**.
- 📱 **Adaptive Multi-Panel Layout**:
  - **Sidebar**: Search users, view online statuses, and preview unread counts.
  - **Chat Container**: Scrollable message timeline with timestamps, avatar previews, and inline attachments.
  - **Right Sidebar**: Quick profile card, bio overview, media gallery, and one-click logout.
- 🔔 **Interactive Toast Notifications**: Instant visual feedback on auth, image uploads, and system events via `react-hot-toast`.

---

## 🛠️ Tech Stack & Dependencies

### Frontend

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.0.0` | Core UI library with modern hooks and state management |
| **React DOM** | `^19.0.0` | DOM bindings for React 19 |
| **Vite** | `^6.3.1` | Ultra-fast next-generation frontend tooling and bundler |
| **Tailwind CSS** | `^4.1.4` | Utility-first CSS framework with native `@tailwindcss/vite` plugin |
| **React Router DOM** | `^7.5.3` | Client-side routing and protected view redirection |
| **Socket.io Client** | `^4.8.1` | WebSocket client for live event listener subscriptions |
| **Axios** | `^1.9.0` | Promise-based HTTP client with global base URL & token headers |
| **React Hot Toast** | `^2.5.2` | Clean, customizable UI toast alerts |

### Backend

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18+` / `v20+` | JavaScript runtime environment (configured with ES Modules `"type": "module"`) |
| **Express** | `^5.1.0` | Fast, minimalist web framework for REST API routing and middleware |
| **Socket.io** | `^4.8.1` | Real-time WebSocket server handling connection states and rooms |
| **Mongoose** | `^8.14.1` | Elegant MongoDB object modeling and schema validation |
| **bcryptjs** | `^3.0.2` | Robust password salt generation and hashing |
| **jsonwebtoken** | `^9.0.2` | Stateless user authentication via signed JWT tokens |
| **Cloudinary** | `^2.6.0` | Cloud-based media storage and image transformation API |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing middleware |
| **Dotenv** | `^16.5.0` | Environment variable management from `.env` files |
| **Nodemon** | `^3.1.10` | Development utility to automatically reload server on file changes |

### Database & Cloud Services

- **MongoDB / MongoDB Atlas**: NoSQL database for persistence of user records and message history.
- **Cloudinary**: Cloud asset management for storing avatars and shared chat images.

---

## 🔄 System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    QuickChat Client (React)                 │
│  - AuthContext (Session, Socket Handshake, Online Tracking) │
│  - ChatContext (User List, Message History, Send Messages)  │
└──────────────┬───────────────────────────────▲──────────────┘
               │                               │
       HTTP REST Requests               WebSocket Events
       (Headers: { token })             (newMessage, getOnlineUsers)
               │                               │
               ▼                               │
┌──────────────────────────────────────────────┴──────────────┐
│                  Express.js & Socket.io Server              │
│  - /api/auth/     : Signup, Login, Profile Updates, Verify  │
│  - /api/messages/ : Fetch Users, Messages, Mark Seen, Send  │
│  - Socket Handler : Map active socketId <-> userId          │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Mongoose Queries               Upload Base64 Media
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│     MongoDB Database        │ │      Cloudinary Cloud       │
│  - Users Collection         │ │  - User Avatars             │
│  - Messages Collection      │ │  - Chat Attachments         │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 📂 Directory & Folder Structure

```text
QuickChat-Full-Stack/
├── How to Run Project.pdf          # Quick reference documentation guide
├── README.md                       # Comprehensive project documentation
│
├── client/                         # FRONTEND (React 19 + Vite + Tailwind v4)
│   ├── public/                     # Static public assets
│   │   ├── bgImage.svg             # Background wallpaper SVG
│   │   ├── favicon.svg             # App favicon
│   │   └── vite.svg                # Vite brand asset
│   ├── src/
│   │   ├── assets/                 # Icons, illustrations, and bundled avatar samples
│   │   │   ├── assets.js           # Central asset bundle export helper
│   │   │   └── ... (svg/png files) # Icons (arrow, menu, search, send, gallery, etc.)
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ChatContainer.jsx   # Message thread, message sender, image upload input
│   │   │   ├── RightSidebar.jsx    # User details panel, media gallery, logout button
│   │   │   └── Sidebar.jsx         # User list, search bar, online status, unread count
│   │   ├── context/                # Global Context API providers
│   │   │   ├── AuthContext.jsx     # Auth state, token handling, Socket.io connection
│   │   │   └── ChatContext.jsx     # Active chat selection, message stream, live listeners
│   │   ├── lib/
│   │   │   └── utils.js            # Time formatting helper (HH:MM 24h clock)
│   │   ├── pages/                  # Page-level route views
│   │   │   ├── HomePage.jsx        # Main 3-panel chat view
│   │   │   ├── LoginPage.jsx       # Multi-step Sign-up & Login form
│   │   │   └── ProfilePage.jsx     # Profile editor (avatar upload, name, bio)
│   │   ├── App.jsx                 # Application entry point with React Router & Toaster
│   │   ├── index.css               # Outfit font import, Tailwind v4 directives, scrollbar styling
│   │   └── main.jsx                # DOM root mounting wrapped in AuthProvider & ChatProvider
│   ├── .env                        # Local client environment variables (Vite)
│   ├── .env.example                # Client environment variables template
│   ├── .gitignore                  # Frontend git ignore configuration
│   ├── eslint.config.js            # ESLint flat configuration
│   ├── index.html                  # HTML5 entry template
│   ├── package.json                # Frontend dependencies and npm scripts
│   ├── vercel.json                 # Vercel SPA rewrite rule configuration
│   └── vite.config.js              # Vite configuration with React and Tailwind plugins
│
└── server/                         # BACKEND (Node.js + Express + Socket.io + Mongoose)
    ├── controllers/                # Business logic controllers
    │   ├── messageController.js    # Send message, fetch messages, list sidebar users, mark seen
    │   └── userController.js       # Signup, login, auth check, profile update (Cloudinary upload)
    ├── lib/                        # Shared libraries and utility services
    │   ├── cloudinary.js           # Cloudinary v2 SDK configuration
    │   ├── db.js                   # Mongoose MongoDB connection initializer
    │   └── utils.js                # JWT token generator helper
    ├── middleware/                 # Express middleware
    │   └── auth.js                 # `protectRoute`: Extracts & verifies JWT token from request header
    ├── models/                     # Mongoose data schemas
    │   ├── Message.js              # Message schema (sender, receiver, text, image, seen)
    │   └── User.js                 # User schema (name, email, hashed password, avatar, bio)
    ├── routes/                     # Express REST route endpoints
    │   ├── messageRoutes.js        # Routes for `/api/messages/*`
    │   └── userRoutes.js          # Routes for `/api/auth/*`
    ├── .env                        # Local backend environment variables (secrets)
    ├── .env.example                # Backend environment variables template
    ├── package.json                # Backend dependencies and npm scripts
    ├── server.js                   # HTTP server creation, Socket.io integration, route mounting
    └── vercel.json                 # Serverless deployment configuration for Vercel
```

---

## 📋 Prerequisites & System Requirements

Before running the application, make sure you have the following installed and set up:

1. **Node.js**: `v18.0.0` or higher (recommended: `v20.x` or latest LTS).
   ```bash
   node -v
   npm -v
   ```
2. **MongoDB Database**:
   - A free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database), OR
   - A locally running MongoDB instance (`mongodb://localhost:27017`).
3. **Cloudinary Account**:
   - A free account on [Cloudinary](https://cloudinary.com/).
   - Obtain your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Console Dashboard.

---

## ⚙️ Environment Variables Setup

Both the `server` and `client` directories require their own `.env` configuration files.

### 1. Server Environment Variables (`server/.env`)

In the `server` directory, create a `.env` file (you can copy from `server/.env.example`):

```env
# Port on which the backend server runs
PORT=5000

# Secret key used for signing and verifying JWT tokens
JWT_SECRET=your_jwt_secret_key_here

# MongoDB Connection String (Atlas URI or local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net

# Cloudinary credentials for media upload
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> [!NOTE]
> In `server/lib/db.js`, the app connects to `${process.env.MONGODB_URI}/chat-app`. Ensure your `MONGODB_URI` does not have a trailing slash or trailing database name if you want it to use the default `chat-app` database name.

### 2. Client Environment Variables (`client/.env`)

In the `client` directory, create a `.env` file (you can copy from `client/.env.example`):

```env
# Backend server URL consumed by Vite and Axios
VITE_BACKEND_URL=http://localhost:5000
```

---

## 📥 Installation & Setup Guide

### 1. Backend Setup

Open a terminal and navigate to the `server` directory:

```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your favorite editor and paste your credentials

# Start development server with hot-reloading (nodemon)
npm run server
```

The server should start and log:
```text
Server is running on PORT: 5000
Database Connected
```

*(Alternatively, use `npm start` to run with standard `node server.js`)*

---

### 2. Frontend Setup

Open a **new terminal window** and navigate to the `client` directory:

```bash
# Navigate to the client folder
cd client

# Install frontend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and verify VITE_BACKEND_URL=http://localhost:5000

# Launch Vite development server
npm run dev
```

The Vite dev server will start (typically at `http://localhost:5173`).

---

### 3. Running Both Concurrently

For convenience, you can run both servers simultaneously using two terminal windows:

| Terminal | Path | Command | URL |
| :--- | :--- | :--- | :--- |
| **Terminal 1 (Backend)** | `QuickChat-Full-Stack/server` | `npm run server` | `http://localhost:5000` |
| **Terminal 2 (Frontend)** | `QuickChat-Full-Stack/client` | `npm run dev` | `http://localhost:5173` |

---

### 4. Verification & Testing

1. Open your browser and go to `http://localhost:5173`.
2. You will be redirected to `/login`.
3. Switch to **Sign up**, enter your Full Name, Email, Password, click continue, and enter a short Bio to create User A.
4. Open an **Incognito / Private Window** (or a second browser) and register User B.
5. In User A's sidebar, User B will appear automatically with an **Online** status badge.
6. Click on User B to open the chat container and send a message or an image. User B will immediately receive it in real time!

---

## 📡 API Reference & Endpoints

Base URL: `http://localhost:5000/api`

All protected endpoints require an authentication token sent in the custom HTTP header:
`token: <JWT_TOKEN>`

### Authentication Routes

| Method | Endpoint | Protection | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register a new user | `{ fullName, email, password, bio }` | `{ success: true, userData, token, message }` |
| `POST` | `/api/auth/login` | Public | Authenticate existing user | `{ email, password }` | `{ success: true, userData, token, message }` |
| `GET` | `/api/auth/check` | Protected | Validate JWT & fetch logged-in user | *None* | `{ success: true, user }` |
| `PUT` | `/api/auth/update-profile` | Protected | Update profile pic, name, bio | `{ fullName, bio, profilePic? }` *(base64 string)* | `{ success: true, user }` |

### Messaging Routes

| Method | Endpoint | Protection | Description | Request Body / Params | Response Payload |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/messages/users` | Protected | Fetch all other users with unread counts | *None* | `{ success: true, users: [...], unseenMessages: { [userId]: count } }` |
| `GET` | `/api/messages/:id` | Protected | Fetch all messages between user & contact; marks them seen | `id`: Contact User ID | `{ success: true, messages: [...] }` |
| `PUT` | `/api/messages/mark/:id` | Protected | Mark a single message as seen | `id`: Message ID | `{ success: true }` |
| `POST` | `/api/messages/send/:id` | Protected | Send message (text and/or image) | `id`: Receiver ID<br>`{ text?: string, image?: base64 }` | `{ success: true, newMessage }` |

### System Status Route

| Method | Endpoint | Protection | Description | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | Public | Health check | `"Server is live"` |

---

## ⚡ Socket.io Real-Time Events

The server initializes Socket.io on the shared HTTP server with CORS enabled:

### Connection Handshake
- **Client Handshake**: When the user authenticates, the client initiates a socket connection with the query parameter `userId`:
  ```javascript
  io("http://localhost:5000", { query: { userId: userData._id } });
  ```
- **Socket Map Tracking**: The server stores active connections in memory:
  ```javascript
  userSocketMap[userId] = socket.id;
  ```

### Emitted Events

| Event Name | Emitter | Listener | Data | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `getOnlineUsers` | Server | Client | `Array<userId>` | Broadcasts the list of currently connected user IDs whenever any user connects or disconnects. |
| `newMessage` | Server | Specific Client Socket | `Message` object | Directly delivers a new message in real time to the recipient's active socket without page reload. |

---

## 🗄️ Database Schema Design

The application uses MongoDB with Mongoose object modeling:

### User Schema (`server/models/User.js`)

```javascript
{
  email:       { type: String, required: true, unique: true },
  fullName:    { type: String, required: true },
  password:    { type: String, required: true, minlength: 6 },
  profilePic:  { type: String, default: "" }, // Cloudinary URL
  bio:         { type: String },
  createdAt:   { type: Date },                // Auto-generated by { timestamps: true }
  updatedAt:   { type: Date }                 // Auto-generated by { timestamps: true }
}
```

### Message Schema (`server/models/Message.js`)

```javascript
{
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:        { type: String },
  image:       { type: String },              // Cloudinary URL for attachments
  seen:        { type: Boolean, default: false },
  createdAt:   { type: Date },                // Auto-generated by { timestamps: true }
  updatedAt:   { type: Date }                 // Auto-generated by { timestamps: true }
}
```

---

## 🚢 Production Build & Deployment

### 1. Building the Frontend

In the `client` directory:
```bash
npm run build
```
This produces an optimized production bundle inside `client/dist`. You can test the build locally using:
```bash
npm run preview
```

### 2. Deploying to Vercel

Both `client/vercel.json` and `server/vercel.json` configurations are pre-configured in the repository:

- **Client (`client/vercel.json`)**: Configured with SPA URL rewrites so client-side routes (`/login`, `/profile`) resolve to `/index.html`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
- **Server (`server/vercel.json`)**: Configured for `@vercel/node` serverless functions.
  *(Note: For persistent Socket.io WebSocket connections in production, a dedicated persistent hosting environment such as **Render**, **Railway**, **Fly.io**, or **DigitalOcean** is recommended over serverless lambdas).*

---

## ❓ Troubleshooting & FAQs

### 1. `Database Connected` doesn't show up / MongoServerError
- **Check MongoDB URI**: Verify your MongoDB Atlas connection string in `server/.env`.
- **Network Access**: Make sure your IP address is whitelisted in MongoDB Atlas under **Network Access** (`0.0.0.0/0` for all or your specific IP).
- **Credentials**: Ensure password special characters are URL-encoded if applicable.

### 2. Image upload fails or returns `413 Payload Too Large`
- In `server/server.js`, `express.json({ limit: "4mb" })` is set to accept Base64 images up to 4MB. Avoid uploading extremely large raw camera photos (> 4MB) or increase the payload limit in `server/server.js`.
- Confirm your Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are valid in `server/.env`.

### 3. Real-time messages not arriving instantly
- Verify `VITE_BACKEND_URL` in `client/.env` points to the exact server address and port (e.g. `http://localhost:5000`).
- Ensure no browser extension or firewall is blocking WebSocket traffic on port 5000.
- Check the backend console to confirm the message `"User Connected <userId>"` was logged.

### 4. CORS errors in browser console
- Ensure your backend `server.js` has `app.use(cors())` enabled (default configuration allows requests from any origin).

---

## 📄 License & Attribution

This project is open-source and available under the **ISC License**. Developed as a modern full-stack real-time communication showcase.
