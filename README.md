# ACLC Clinic Healthcare Management System

A Vue 3 + Pinia frontend for managing clinic patients, appointments, medical records, follow-ups, and nurse call alarms.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup (Keep Your IP Private)](#environment-setup-keep-your-ip-private)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Running the Mock API](#running-the-mock-api)
- [Building for Production](#building-for-production)
- [Features](#features)
- [Tech Stack](#tech-stack)

---

## Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v18 or higher
- **npm** v9 or higher
- A running backend API **or** the included mock JSON server

---

## Project Structure

```
src/
├── assets/           # Global styles (Tailwind)
├── components/       # Reusable components (Sidebar, NurseCallModal)
├── modals/           # Form modals (Patient, Record, Appointment, FollowUp)
├── mockdata/         # Mock JSON server (for development without a real backend)
├── router/           # Vue Router configuration
├── stores/           # Pinia stores (auth, patients, records, appointments, etc.)
└── views/            # Page-level components
```

---

## Environment Setup (Keep Your IP Private)

This is the most important step. Never hardcode your backend URL or IP address directly in your code. Use a `.env` file instead.

### Step 1 — Create your `.env` file

In the **root** of the project (same level as `package.json`), create a file called `.env.local`:

```
VITE_API_BASE_URL=http://192.168.1.100:5000
```

Replace `192.168.1.100:5000` with your actual backend IP and port.

> **Why `.env.local` and not `.env`?**
> `.env.local` is listed in `.gitignore` by default in Vite projects, so it is **never committed to Git**. Your IP stays off GitHub and out of your repository history.

### Step 2 — Add `.env.local` to `.gitignore`

Open `.gitignore` and confirm these lines exist (Vite adds them automatically, but double-check):

```
.env.local
.env.*.local
```

### Step 3 — Update `vite.config.js` to use the env variable

Open `vite.config.js` and set up a proxy so your frontend calls `/api/...` and Vite forwards them to your real backend:

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
```

With this setup, every `fetch('/api/patients')` call in the code is automatically proxied to your backend. **Your IP never appears in the built JavaScript bundle** that ships to the browser.

### Step 4 — Reference the variable in code (if ever needed directly)

If you ever need the base URL in your JavaScript (not recommended for API calls — use the proxy instead), access it like this:

```js
const baseUrl = import.meta.env.VITE_API_BASE_URL
```

> **Important:** Only variables prefixed with `VITE_` are exposed to the browser. Variables without that prefix stay server-side only.

### Environment File Reference

| File | Committed to Git? | Purpose |
|---|---|---|
| `.env` | Yes | Shared defaults (no secrets) |
| `.env.local` | **No** | Your local IP / secrets |
| `.env.production` | Yes | Production defaults (no secrets) |
| `.env.production.local` | **No** | Production secrets |

---

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <project-folder>

# 2. Install frontend dependencies
npm install
```

---

## Running the App

### Development (with proxy to your backend)

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

All `/api/...` requests are proxied to `VITE_API_BASE_URL` defined in your `.env.local`.

---

## Running the Mock API

If you don't have the real backend running yet, you can use the included JSON server mock.

```bash
# Navigate to the mock data folder
cd src/mockdata

# Install mock server dependencies (first time only)
npm install

# Start the mock server
npm start
```

The mock API runs at `http://localhost:3000`.

Then update your `.env.local` to point at it:

```
VITE_API_BASE_URL=http://localhost:3000
```

### Available Mock Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Nurse login |
| GET/POST | `/patients` | List or add patients |
| GET/PUT/DELETE | `/patients/:id` | Single patient operations |
| GET/POST | `/patientRecords` | List or add records |
| GET/PUT/DELETE | `/patientRecords/:id` | Single record operations |
| GET/POST | `/appointments` | List or add appointments |
| GET/PUT/DELETE | `/appointments/:id` | Single appointment operations |
| GET/POST | `/followups` | List or add follow-ups |

**Default mock credentials:**

```
Email:    aclcnurse@gmail.com
Password: aclcnurse123
```

---

## Building for Production

```bash
npm run build
```

The output goes to the `dist/` folder. The proxy only works in development — for production, configure your web server (Nginx, Apache, etc.) to forward `/api` requests to your backend instead.

Example Nginx config snippet:

```nginx
location /api/ {
    proxy_pass http://YOUR_BACKEND_IP:PORT/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Features

- **Authentication** — JWT-based login with automatic token expiry detection
- **Patient Management** — Add, edit, delete, and search patients
- **Medical Records** — Create and manage records per patient; open/close records
- **Follow-ups** — Timeline of follow-up visits linked to each record
- **Appointments** — Schedule and track patient appointments
- **Nurse Call Alarm** — Real-time polling for Arduino-triggered nurse call buttons
- **Print View** — Print patient records and transfer recommendation letters
- **Dashboard** — Overview of patients, appointments, and recent records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| State Management | Pinia |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS |
| Icons | Font Awesome 6 |
| HTTP | Native `fetch` API |
| Mock API | JSON Server 0.17 |
| Build Tool | Vite |