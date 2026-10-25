# SportsBharat — India Sports Hub

A responsive React + Express + MongoDB starter app for discovering sports events, marathons/runs, and Indian sports initiatives. Event registration submissions are validated by the Express API and saved in MongoDB.

## Account and admin features added
- Account creation and sign-in with passwords hashed using bcrypt.
- Signed JWT sessions and role-based authorization for admin-only endpoints.
- My Registrations view for registrations submitted while signed in.
- Admin dashboard with total/pending/confirmed/cancelled counts and participant registration list.
- Admin can change registration status to pending, confirmed, or cancelled.
- Admin account is created/promoted at server startup only when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured in `server/.env`.
- Registration records are linked to the signed-in user when their account email matches the registration email.

## What's improved
- Refined dark UI with orange accents, responsive event and initiative cards, hover/focus states, and reduced-motion support.
- Search events by name, sport type, or location.
- Filter events by category and sort by soonest date or event name.
- Save/bookmark events; saved items persist in the current browser and can be filtered in the event list.
- Event details modal with date, location, format, organiser-verification reminder, and one-click registration.
- Export an event to your device calendar as an `.ics` file.
- Friendly empty state with a one-click reset for search and filters.
- Lightweight CSS animations, reduced-motion support, and responsive detail views.
- Registration form with client-side required fields and API-side validation.
- Configurable API base URL using `client/.env` (`VITE_API_URL`).
- Responsive layout for mobile, tablet, and desktop.
- SEO/social metadata and accessible labels for key controls.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Setup
1. Extract the project and open the `india-sports-hub` folder in VS Code.
2. Install root helper: `npm install`
3. Install the frontend and backend dependencies: `npm install --prefix client` and `npm install --prefix server`
4. Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI`, a long random `JWT_SECRET`, and a strong `ADMIN_EMAIL` + `ADMIN_PASSWORD` for your initial administrator. Keep this `.env` private; do not commit it.
5. Optional: copy `client/.env.example` to `client/.env` and update `VITE_API_URL` if the API is not at `http://localhost:5000`.
6. Start both apps from the project root: `npm run dev`
7. Frontend: http://localhost:5173 | API health: http://localhost:5000/api/health

## Database
Users are stored in the `users` collection and registrations in the `registrations` collection. The API validates required fields and prevents duplicate email + event registrations. Passwords are bcrypt-hashed. Saved event bookmarks currently live in browser local storage, not in MongoDB. Demo events and initiatives still live in frontend seed data; this admin dashboard currently manages registrations, not event listings.

## Before production
- Replace sample events with verified, current event data from organisers or official feeds.
- Add rate limiting, email verification/confirmation, password reset, monitoring, and deployment secrets. Use HTTPS and a secure session strategy for production; review JWT storage and privacy requirements.
- Add a clear privacy notice and data-retention process for registration information.
- Configure production CORS and HTTPS, and test mobile layouts, database failures, and form validation.

This is an independent demo project, not an official Government of India service. Check official portals and organisers for current dates, eligibility, fees, and announcements.
# sportsIndia
