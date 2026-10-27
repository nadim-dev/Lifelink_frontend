<p align="center">
  <img src="src/assets/image.png" alt="LifeLink logo" width="110" />
</p>

<h1 align="center">LifeLink Frontend</h1>

<p align="center">
  A role-based healthcare coordination experience for blood donors, blood banks, hospitals, delivery partners, and administrators.
</p>

<p align="center">
  <strong>React 19</strong> · <strong>Vite 8</strong> · <strong>React Router 7</strong> · <strong>Tailwind CSS 4</strong>
</p>

---

## Contents

- [What this application does](#what-this-application-does)
- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Application architecture](#application-architecture)
- [Route guide](#route-guide)
- [API and authentication](#api-and-authentication)
- [Build and quality commands](#build-and-quality-commands)
- [Deploy to Netlify](#deploy-to-netlify)
- [Troubleshooting](#troubleshooting)

## What this application does

LifeLink is the browser application for the LifeLink healthcare coordination platform. It gives users and partner organizations a shared interface for blood requests, inventory, appointments, deliveries, notifications, support, and operational administration.

After authentication, the interface selects a dashboard from the signed-in user's role. Public registration and account recovery pages remain available outside the protected dashboard shell.

This directory contains the frontend only. The API, database, session store, and server-side integrations are maintained in [`../backend`](../backend).

## Features

### For users and donors

- Register, sign in, recover an account, and manage profile details.
- Browse nearby blood banks, hospitals, and donors.
- Submit and follow blood requests, including delivery progress where available.
- Book and review hospital appointments.
- Receive notifications and manage support tickets.
- Register as a donor and share donor availability details.

### For partner organizations

- **Blood banks:** manage incoming requests, blood inventory, profile information, and the demand-prediction interface.
- **Hospitals:** manage hospital details, doctors, services, facilities, capacity, and appointments.
- **Delivery partners:** review delivery work and update request progress.

### For administrators

- Review platform dashboards, enquiries, support tickets, users, blood banks, hospitals, and delivery partners.
- Review registration and account status information exposed by the API.

Available screens and actions depend on the signed-in role and the backend data returned for that account.

## Technology

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Development server and production bundler | Vite 8 |
| Routing | React Router 7 with browser history |
| Styling | Tailwind CSS 4 and project CSS |
| API requests | Axios |
| Live notifications and updates | Socket.IO client |
| Maps | Leaflet and React Leaflet |
| Icons | Lucide React |
| Motion | Framer Motion |
| Google sign-in UI | Google OAuth library for React |

## Project structure

```text
frontend/
├── public/
│   ├── _redirects           # Netlify single-page-app route fallback
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/                  # Axios clients and feature API functions
│   ├── assets/               # Images and other bundled assets
│   ├── components/           # Shared UI and dashboard components
│   ├── context/              # Shared authentication state
│   ├── hooks/                # Authentication and role-specific navigation
│   ├── layouts/              # Protected dashboard shell and navigation
│   ├── pages/                # Public, user, partner, and admin pages
│   ├── utils/                # Shared helpers
│   ├── App.jsx               # Browser router and route declarations
│   ├── index.css             # Global styles and Tailwind entry point
│   └── main.jsx              # React and provider bootstrap
├── index.html                # HTML entry point and tab icon
├── package.json
├── vite.config.js
└── README.md
```

Feature API modules are grouped by area, for example `authApi.js`, `bloodBankApi.js`, `hospitalApi.js`, `appointmentApi.js`, `deliveryApi.js`, and `supportTicketApi.js`.

## Run locally

### Requirements

- Node.js compatible with the installed Vite version.
- npm.
- A running backend and any backend services required for the feature being used.

### Install and start

From this directory:

```bash
npm install
npm run dev
```

Vite prints the local address in the terminal, usually `http://localhost:5173`.

For a production-mode local preview:

```bash
npm run build
npm run preview
```

## Environment configuration

Create a local `.env` file in `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Backend origin used by Axios and the Socket.IO client. | `http://localhost:4000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID passed to the Google sign-in provider. | `1234567890-example.apps.googleusercontent.com` |

For production, set `VITE_BACKEND_URL` to the deployed backend origin, such as `https://your-backend.onrender.com`. Use the origin only, without `/api` or a trailing route. Set these variables in the frontend host's build environment and rebuild/redeploy after changing them; Vite embeds `VITE_*` values into the generated client bundle.

`VITE_*` values are visible to users in the browser. Do not put passwords, private API keys, database URLs, or other server secrets in the frontend environment. Keep backend-only settings in the backend host's environment.

## Application architecture

### Startup and providers

`src/main.jsx` mounts the application with React Strict Mode, the Google OAuth provider, and the shared `AuthProvider`. The provider requests the current user during startup and exposes the user, loading state, refresh function, and setter through `useAuth()`.

### Routing and access

`src/App.jsx` defines browser-history routes with React Router. Public pages handle sign-in, registration, and account recovery. Protected pages sit behind `ProtectedLayout`, which waits for authentication and redirects unauthenticated users. `DashboardLayout` supplies the shared navigation and dashboard frame.

The `/dashboard` route redirects to the dashboard associated with the current role. Role-to-route mapping is maintained in `src/utils/dashboardRoutes.js`; navigation items are selected in `src/hooks/useDashboard.js`.

### Backend communication

`src/api/axiosInstances.js` builds the backend origin from `VITE_BACKEND_URL` and provides two clients:

- `axiosWithCreds` sends browser credentials for session-protected requests.
- `axiosWithoutCreds` is used for endpoints that do not need the session cookie.

Feature modules in `src/api/` keep endpoint calls close to their domain. The dashboard also opens a Socket.IO connection to the backend for live events.

For deployed cookie-based authentication, the backend must allow the deployed frontend origin through CORS and issue a cookie compatible with the cross-site deployment. See the backend README for the corresponding server configuration.

### Asset handling

Images referenced by React components should be imported from `src/assets` so Vite can fingerprint and bundle them for production. Files placed in `public/` are served from the site root with their original names. The HTML favicon is configured in `index.html`.

## Route guide

The router includes these main route groups. Protected pages require an authenticated session.

| Area | Routes |
| --- | --- |
| Public and account | `/`, `/register`, `/login`, `/forgot-password`, `/reset-password/:token` |
| Registration | `/register/blood-bank`, `/register/delivery-partner`, `/delivery-partner/register`, `/register/hospital` |
| User | `/user/dashboard`, `/become-donor`, `/my-requests`, `/my-requests/:bloodrequestId`, `/appointments`, `/nearby-donors`, `/nearby-blood-banks`, `/nearby-hospitals` |
| Blood bank | `/blood-bank/dashboard`, `/blood-bank/requests`, `/blood-bank/inventory`, `/blood-bank/profile`, `/blood-bank/ai-demand-prediction` |
| Hospital | `/hospital/dashboard`, `/hospital/profile`, `/hospital/doctors`, `/hospital/doctors/add`, `/hospital/services`, `/hospital/appointments`, `/capacity-availability` |
| Delivery partner | `/delivery-partner/dashboard`, `/delivery-partner/request`, `/my-deliveries` |
| Administration | `/admin/dashboard`, `/admin/enquiries`, `/admin/tickets`, `/admin/blood-banks`, `/admin/hospitals`, `/admin/delivery-partner`, `/users` |
| Shared | `/profile`, `/notifications`, `/my-tickets`, `/my-tickets/:ticketId`, `/support`, `/support/create-ticket` |

Dynamic detail routes include `/admin/hospitals/:hospitalId`, `/admin/blood-bank/:bloodBankId`, `/admin/delivery-partners/:partnerId`, `/blood-bank/:bloodBankId/dashboard`, and `/hospitals/:hospitalId/dashboard`.

## API and authentication

The frontend expects the backend to provide the API routes used by the modules in `src/api/`. It does not contain a local API mock or database. Authentication uses a server-managed signed session cookie; the frontend does not store the session ID in local storage.

Credentialed browser requests require all of the following to agree:

1. `VITE_BACKEND_URL` points to the intended backend.
2. The backend CORS allowlist contains the exact frontend origin and enables credentials.
3. The backend cookie settings support the deployment topology and HTTPS requirements.

If one of these values changes, restart the local dev server or rebuild/redeploy the frontend as appropriate.

## Build and quality commands

Run from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite's development server. |
| `npm run build` | Create the optimized production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for review. |
| `npm run lint` | Run ESLint across the frontend project. |

## Deploy to Netlify

When Netlify is connected to the repository root, configure:

| Setting | Value |
| --- | --- |
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |

If the Netlify site is connected directly to the `frontend` directory/repository, use `.` as the base directory and keep the same build and publish commands.

The `public/_redirects` rule forwards unknown paths to `index.html`, allowing React Router routes such as `/blood-bank/dashboard` to load on a direct visit or browser refresh. Keep this file in the deployed frontend build.

Set `VITE_BACKEND_URL` and `VITE_GOOGLE_CLIENT_ID` in Netlify's environment settings before building. A frontend deployment does not configure backend CORS or cookies; configure those separately in the backend hosting environment.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API calls go to localhost in production | Set `VITE_BACKEND_URL` in the frontend host and trigger a fresh build. |
| Browser reports a CORS error | Confirm the backend allowlist includes the exact deployed frontend origin and credentials are enabled. |
| Login succeeds but a later request appears signed out | Check that the backend sets a cross-site compatible secure cookie and that credentialed Axios requests are used. |
| A nested URL returns Netlify's 404 page on refresh | Confirm `public/_redirects` was included in the deploy and the publish directory is `dist`. |
| Google sign-in is unavailable | Check `VITE_GOOGLE_CLIENT_ID` and the OAuth client's allowed JavaScript origins. |
| An image works locally but is missing after deploy | Import it from `src/assets`, or place it in `public/` and reference it from the site root. |

---

For backend setup, API routes, and server-side environment variables, see [`../backend/README.md`](../backend/README.md). For repository overview and project setup, see [`../README.md`](../README.md).
