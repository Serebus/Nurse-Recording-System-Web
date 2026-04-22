# ACLC Clinic Healthcare Management System

A Vue 3 + Pinia frontend for managing clinic patients, appointments, medical records, follow-ups, and nurse call alarms.

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A running backend API

---

## Project Structure

```
src/
├── assets/           # Global styles (Tailwind)
├── components/       # Reusable components (Sidebar, NurseCallModal)
├── modals/           # Form modals (Patient, Record, Appointment, FollowUp)
├── router/           # Vue Router configuration
├── stores/           # Pinia stores (auth, patients, records, appointments, etc.)
└── views/            # Page-level components
```

---

## Setup

**1. Clone and install**
```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

**2. Set up your environment**
```bash
cp .env.example .env.local
```
Then open `.env.local` and replace the URL with your backend's IP and port:
```
VITE_API_BASE_URL=http://your-backend-ip:port
```

**3. Run the app**
```bash
npm run dev
```

App will be at `http://localhost:5173`. That's it!

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
| Build Tool | Vite |