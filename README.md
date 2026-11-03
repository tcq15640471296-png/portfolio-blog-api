# Capstone Project — Full-Stack Portfolio & Blog Application

**Course:** Web Data Management and Application
**Project type:** Cumulative Full-Stack Capstone Project (100 marks)
**Student:** Tian Chengqi (田承琪) — 24998024

A production-ready personal portfolio website with a full-featured blog: a secure RESTful
**Node.js + Express** API backed by **MongoDB Atlas**, consumed by a **React** Single Page
Application with JWT authentication, a protected Admin Dashboard and a contact form.

---

## Table of contents

1. [Live deployment](#1-live-deployment)
2. [Demo credentials](#2-demo-credentials)
3. [Project structure](#3-project-structure)
4. [API reference](#4-api-reference)
5. [Running the project locally](#5-running-the-project-locally)
6. [Environment variables](#6-environment-variables)
7. [Deployment guide](#7-deployment-guide)
8. [Testing](#8-testing)
9. [How the rubric requirements are met](#9-how-the-rubric-requirements-are-met)
10. [Submission checklist](#10-submission-checklist)

---

## 1. Live deployment

| Component | Platform | URL |
| --- | --- | --- |
| Front-end SPA (React) | Netlify — static site | **https://capstone-portfolio-client.netlify.app** |
| Back-end API (Express) | Netlify — serverless function | **https://capstone-portfolio-api.netlify.app** |

> The two URLs above are the ones that must be pasted into Chaoxing (超星学习通).
> Deployment details are in [section 7](#7-deployment-guide).

Verified in production (19 Oct 2026):

| Check | Result |
| --- | --- |
| `GET https://capstone-portfolio-api.netlify.app/api/health` | `200` `{"success":true,"status":"ok",…}` |
| `POST /api/users/login` with the admin account | `200` + JWT |
| `GET /api/users/me` / `POST /api/projects` with the JWT | `200` / `201` (then deleted again) |
| `POST /api/projects` **without** a token | `401` — the protection really is active |
| Front-end `/`, `/projects`, `/blog`, `/login`, `/favicon.svg` | `200` — the SPA fallback works |
| CORS pre-flight from the front-end origin | `204` + `Access-Control-Allow-Origin: https://capstone-portfolio-client.netlify.app` |
| Logging in on the deployed site | redirects to `/admin`; the dashboard shows the live Atlas counts |

---

## 2. Demo credentials

Running `npm run seed` inside `server/` creates the portfolio owner account:

| Field | Value |
| --- | --- |
| Email | `1310708365@qq.com` |
| Password | `tcq20060525` (configurable through `SEED_PASSWORD` in `server/.env`) |
| Username | `admin` |

Log in on `/login`, then open `/admin` to manage projects, blog posts, messages and the
public profile.

> **Note:** writing the password in this file is only for the marker to be able to log in.
> If you would rather not publish it, set `SEED_PASSWORD` in `.env` to a different value before
> seeding and remove it from this table — the code does not hard-code the login anywhere else.

---

## 3. Project structure

```
CapstoneProject/
├── README.md                  ← this file
├── .gitignore
├── docs/
│   └── architecture.html      ← system architecture & data-relationship diagram
├── server/                    ← Back-End API (MVC)
│   ├── app.js                 ← Express app: helmet, cors, json, routes, error handlers
│   ├── server.js              ← entry point: dotenv + connect DB + listen
│   ├── dev-memory.js          ← optional: run the API on an in-memory MongoDB (no Atlas needed)
│   ├── seed.js                ← demo data + admin account
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js              ← Mongoose connection to MongoDB Atlas
│   ├── models/                ← Mongoose schemas & validation
│   │   ├── User.js            ← bcrypt hashing in a pre-save hook
│   │   ├── Project.js
│   │   ├── BlogPost.js
│   │   ├── Comment.js
│   │   └── Message.js
│   ├── controllers/           ← request/response logic
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── blogController.js
│   │   ├── commentController.js
│   │   └── messageController.js
│   ├── routes/                ← URL → controller mapping
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── blogRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js  ← protect() + authorizeOwner() factory
│   │   └── errorMiddleware.js ← notFound() + central errorHandler()
│   ├── utils/
│   │   └── generateToken.js   ← JWT signing
│   ├── netlify.toml           ← Netlify build config (publish=public, functions=netlify/functions)
│   ├── netlify/functions/api.js  ← production entry: Express wrapped with serverless-http
│   ├── public/index.html      ← JSON landing page served at the API root
│   └── tests/
│       └── api.test.js        ← 16 end-to-end API tests (node:test + supertest)
└── client/                    ← Front-End SPA (React + Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── vercel.json            ← SPA rewrites for Vercel
    ├── .env.example
    ├── .env.production        ← production VITE_API_URL used by `npm run build`
    ├── public/_redirects      ← SPA rewrites for Netlify
    └── src/
        ├── main.jsx           ← BrowserRouter + AuthProvider
        ├── App.jsx            ← all routes (public + protected)
        ├── index.css          ← Tailwind v4 theme and reusable component classes
        ├── api/client.js      ← axios instance + JWT interceptor + error normaliser
        ├── context/AuthContext.jsx  ← global auth state (Context API)
        ├── data/site.js       ← personal details used by the header, footer and Home page
        ├── components/
        │   ├── Layout.jsx  Header.jsx  Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ProjectCard.jsx  BlogPostCard.jsx
        │   ├── Loader.jsx  Alert.jsx
        │   └── admin/
        │       ├── ProjectManager.jsx   ← CRUD for projects
        │       ├── PostManager.jsx      ← CRUD for blog posts
        │       ├── MessageInbox.jsx     ← contact messages
        │       └── ProfileManager.jsx   ← public profile / skills
        └── pages/
            ├── Home.jsx  Projects.jsx  ProjectDetail.jsx
            ├── Blog.jsx  BlogDetail.jsx  Contact.jsx
            ├── Login.jsx  Register.jsx
            ├── AdminDashboard.jsx
            └── NotFound.jsx
```

---

## 4. API reference

Base URL (local): `http://localhost:5000/api`
Base URL (deployed): `https://<your-api>.onrender.com/api`

Protected endpoints require the header:

```
Authorization: Bearer <JWT returned by /api/users/login or /api/users/register>
```

### 4.1 Authentication — `/api/users`

| Method | Endpoint | Access | Body | Success |
| --- | --- | --- | --- | --- |
| POST | `/api/users/register` | Public | `{ username, email, password, bio? }` | `201` `{ data: { _id, username, email, bio, createdAt, token } }` |
| POST | `/api/users/login` | Public | `{ email, password }` | `200` `{ data: { …, token } }` |
| GET | `/api/users/me` | Private | — | `200` `{ data: { _id, username, email, bio, createdAt } }` |
| GET | `/api/users/profile` | Public | — | `200` `{ data: { username, headline, bio, skills, social, memberSince } }` |
| PUT | `/api/users/profile` | Private | `{ headline?, bio?, skills?, social? }` (`skills` may be an array or a comma-separated string) | `200` `{ data: { …, skills } }` |

* `password` is hashed with **bcrypt** (`bcryptjs`) in a Mongoose `pre('save')` hook and is never
  returned by any endpoint.
* The JWT payload contains the user id (`{ id }`) and is signed with `JWT_SECRET`.

### 4.2 Portfolio — `/api/projects`

| Method | Endpoint | Access | Body | Success |
| --- | --- | --- | --- | --- |
| GET | `/api/projects` | Public | — | `200` `{ count, data: [ … ] }` (author populated with `username`) |
| GET | `/api/projects/:id` | Public | — | `200` `{ data: { … } }` |
| POST | `/api/projects` | Private | `{ title, description, imageUrl?, repoUrl?, liveUrl?, techStack?, featured? }` | `201` `{ data: { …, user } }` |
| PUT | `/api/projects/:id` | Private | any of the fields above | `200` `{ data: { … } }` |
| DELETE | `/api/projects/:id` | Private | — | `200` `{ data: { _id } }` |

`user` is set automatically from `req.user._id`; it cannot be spoofed through the request body.

### 4.3 Blog — `/api/blog`

| Method | Endpoint | Access | Body | Success |
| --- | --- | --- | --- | --- |
| GET | `/api/blog` | Public | — | `200` `{ count, data: [ { …, author: { username }, commentCount } ] }` |
| GET | `/api/blog/:id` | Public | — | `200` `{ data: { …, author: { username, bio }, comments: [ … ] } }` |
| POST | `/api/blog` | Private | `{ title, content, tags?, coverImageUrl? }` | `201` `{ data: { … } }` |
| PUT | `/api/blog/:id` | Private **+ author only** | `{ title?, content?, tags?, coverImageUrl? }` | `200` `{ data: { … } }` |
| DELETE | `/api/blog/:id` | Private **+ author only** | — | `200` `{ data: { _id } }` (its comments are deleted too) |

A logged-in user who is **not** the author receives `403 Forbidden`
(`Not authorized: you are not the author of this BlogPost`).

### 4.4 Comments — `/api/blog/:postId/comments`

| Method | Endpoint | Access | Body | Success |
| --- | --- | --- | --- | --- |
| GET | `/api/blog/:postId/comments` | Public | — | `200` `{ count, data: [ { body, author: { username }, createdAt } ] }` |
| POST | `/api/blog/:postId/comments` | Private | `{ body }` | `201` `{ data: { body, post, author, createdAt } }` |

### 4.5 Contact form — `/api/contact`

| Method | Endpoint | Access | Body | Success |
| --- | --- | --- | --- | --- |
| POST | `/api/contact` | Public | `{ name, email, message }` | `201` `{ message, data: { _id, name, email, createdAt } }` |
| GET | `/api/contact` | Private | — | `200` `{ count, data: [ … ] }` (Admin Dashboard inbox) |
| DELETE | `/api/contact/:id` | Private | — | `200` `{ data: { _id } }` |

### 4.6 Utility

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | API name and the list of route groups |
| GET | `/api/health` | Public | Uptime probe for the hosting platform |

### 4.7 Response format and error handling

Success:

```json
{ "success": true, "count": 3, "data": [ … ] }
```

Error (produced by the central error-handling middleware for **every** failure):

```json
{ "success": false, "message": "Validation failed",
  "errors": [ { "field": "title", "message": "Project title is required" } ] }
```

| Status | Meaning |
| --- | --- |
| `400` | validation failed / duplicate username or email / missing required fields |
| `401` | missing, malformed or expired JWT (`protect`) |
| `403` | valid JWT but not the owner of the resource (`authorizeOwner`) |
| `404` | unknown document or unknown route |
| `500` | unexpected server error (`message` + `stack` in development only) |

---

## 5. Running the project locally

### Prerequisites

| Tool | Version used |
| --- | --- |
| Node.js | 22.x (18+ works) |
| npm | 10.x |
| MongoDB Atlas | free M0 cluster (or use `npm run dev:memory`, no Atlas account required) |

### Step 1 — clone / unzip and install dependencies

```bash
# Back-end
cd server
npm install

# Front-end (open a second terminal)
cd client
npm install
```

### Step 2 — create the environment files

```bash
# server/.env   (copy from server/.env.example, then edit)
cp server/.env.example server/.env

# client/.env   (copy from client/.env.example, then edit)
cp client/.env.example client/.env
```

`server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/portfolio_blog?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

> In MongoDB Atlas, create a database user and add your IP address under
> **Network Access** (or `0.0.0.0/0` while developing).

### Step 3 — seed the database (optional but recommended)

```bash
cd server
npm run seed
```

This deletes the existing collections and inserts 1 admin user, 3 projects, 2 blog posts,
1 comment and 1 contact message.

### Step 4 — start both servers

```bash
# terminal 1 — API on http://localhost:5000
cd server && npm run dev

# terminal 2 — SPA on http://localhost:5173
cd client && npm run dev
```

Open <http://localhost:5173>.

**No MongoDB Atlas account?** Run the API against a temporary in-memory database instead:

```bash
cd server
npm run dev:memory     # seeds demo data automatically; data disappears on exit
```

### Step 5 — production build of the front-end

```bash
cd client
npm run build      # outputs client/dist
npm run preview    # serves the built bundle on http://localhost:4173
```

---

## 6. Environment variables

### Back-end (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no (default `5000`) | Port the API listens on; Render/Heroku inject their own |
| `NODE_ENV` | no | `development` enables request logging and error stacks |
| `MONGODB_URI` | **yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **yes** | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRE` | no (default `30d`) | Token lifetime |
| `CLIENT_URL` | recommended | Deployed front-end origin allowed by CORS (localhost is always allowed) |
| `SEED_USERNAME` / `SEED_EMAIL` / `SEED_PASSWORD` | no | Override the credentials created by `npm run seed` |

Secrets live only in `.env` (**never committed**); `.env.example` documents the keys.

### Front-end (`client/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, **including `/api`** (e.g. `https://your-api.onrender.com/api`) |

---

## 7. Deployment guide

### 7.1 How the API is actually deployed — Netlify Functions

The Express app runs unchanged as a single serverless function: `serverless-http` adapts the
Netlify (AWS Lambda) event into a Node `http` request, and the Mongoose connection is cached
between invocations so a warm container reuses the connection pool.

| File | Purpose |
| --- | --- |
| `server/netlify/functions/api.js` | function entry point (`exports.handler`) wrapping `app.js` |
| `server/netlify.toml` | `publish = "public"`, `functions = "netlify/functions"`, esbuild bundler with `mongoose`/`mongodb`/`bcryptjs` kept external, and `/*` → `/.netlify/functions/api/:splat` (200) so every path reaches Express |
| `server/public/index.html` | JSON landing page returned by `GET /` |

CLI flow: `netlify login` → `netlify sites:create --name <site> --account-slug <team>` →
set the environment variables → `netlify deploy --prod` from inside `server/`.

Environment variables that must exist on the host:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | your Atlas connection string (*secret*) |
| `JWT_SECRET` | a long random string (*secret*) |
| `JWT_EXPIRE` | `30d` |
| `CLIENT_URL` | `https://capstone-portfolio-client.netlify.app` — the deployed front-end origin, used by CORS |
| `NODE_ENV` | `production` |

Then verify that `https://<site>.netlify.app/api/health` returns `{"success":true,…}`.

> **Note on new Netlify sites:** a freshly created site can ship with *Edge Access* (SSO)
> enabled, which answers `401` to every visitor — including `/api/health`. Set
> `sso_login: false` for the site (Site configuration → Visitor access, or the REST API).

#### Alternative platforms

The same code runs anywhere Node runs — no changes needed:

* **Render / Railway / Heroku:** service root `server/`, build `npm install`, start `npm start`.
* **Vercel:** `server/api/index.js` + `server/vercel.json` provide the serverless variant.
* **No database at all:** `npm run dev:memory` inside `server/`.

### 7.2 How the SPA is actually deployed — Netlify static site

1. Point the build at the deployed API: `client/.env.production` holds
   `VITE_API_URL=https://capstone-portfolio-api.netlify.app/api`
   (every `VITE_*` value is compiled into the bundle at build time, so this must be set
   **before** building).
2. `cd client` → `npm run build` → `client/dist`.
3. `netlify deploy --prod --dir=dist` (the `client/` folder is linked to the second site).
4. `client/public/_redirects` (`/*  /index.html  200`) is copied into `dist`, so React Router
   deep links such as `/blog/<id>` also work on a hard refresh.

Vercel is equally fine: import the repository, set the **root directory** to `client`
(Vite preset — build `npm run build`, output `dist`), set `VITE_API_URL`, and
`client/vercel.json` already rewrites every path to `index.html`.

### 7.3 Closing the loop (already done for this submission)

1. The deployed front-end origin is set as `CLIENT_URL` on the API host, so CORS accepts it
   (verified with an `OPTIONS` pre-flight → `204` + the right `Access-Control-Allow-Origin`).
2. Logging in on the deployed site through `/login` redirects to `/admin`, and the dashboard
   shows the live MongoDB Atlas data (3 projects, 2 posts, 1 comment, 1 message) — proof that the
   deployed SPA is really talking to the deployed API.

---

## 8. Testing

```bash
cd server
npm test
```

`server/tests/api.test.js` boots an **in-memory MongoDB** (no Atlas account needed) and runs
**16 integration tests** with `node:test` + `supertest`:

| # | Test |
| --- | --- |
| 1 | registration creates a user, hashes the password with bcrypt and returns a JWT |
| 2 | registration rejects a password shorter than 6 characters (`400`) |
| 3 | registration rejects a duplicate email (`400`) |
| 4 | login returns a JWT for valid credentials |
| 5 | login rejects a wrong password (`401`) |
| 6 | `GET /api/users/me` returns the logged-in user |
| 7 | the profile endpoint is public to read and protected to write |
| 8 | `protect` rejects missing and malformed tokens (`401`) |
| 9 | projects: full public + protected CRUD lifecycle (create → read → update → delete) |
| 10 | projects: missing title produces a validation error (`400`) |
| 11 | blog: create, list with populated author, detail with populated comments, comment as a second user |
| 12 | blog: a non-author gets `403` on update and delete; the author succeeds; comments cascade on delete |
| 13 | contact: public POST saves a message; the inbox is protected; the admin can list it |
| 14 | contact: missing fields produce `400` |
| 15 | helmet adds the security headers |
| 16 | unknown routes and invalid ObjectIds return consistent JSON errors |

The client can be linted and built with:

```bash
cd client
npm run lint
npm run build
```

---

## 9. How the rubric requirements are met

| Rubric category | Where it is implemented |
| --- | --- |
| **1. Database & Models** | `server/models/*.js` — User, Project, BlogPost, Comment, Message with required fields, `minlength`, unique indexes, enum-free simple validation and `timestamps`; connection in `config/db.js` |
| **2. Auth & Authorization** | bcrypt hashing (`User.js` pre-save hook), `generateToken.js` JWT, `protect` and `authorizeOwner` middleware, register/login/me/profile controllers |
| **3. CRUD Endpoints** | `projectController.js` + `blogController.js`; blog update/delete restricted to the author (`403` otherwise) |
| **4. Relationships & Features** | `populate()` on `Project.user`, `BlogPost.author`, `Comment.author`, `Comment.post`; nested comment routes; the contact form writes `Message` documents |
| **5. Structure & Error Handling** | MVC folders (`models` / `controllers` / `routes` / `middleware`); `middleware/errorMiddleware.js` normalises every error into one JSON shape |
| **6. Security & Deployment** | `helmet`, `cors`, `dotenv`, no secrets in the code, `npm start` ready for Render, health endpoint |
| **7. React Architecture & Design** | 10 pages + 12 reusable components under `client/src`, Tailwind CSS v4 design system (`index.css`), responsive header with a mobile menu, card grids |
| **8. Routing** | `App.jsx` — `/`, `/projects`, `/projects/:id`, `/blog`, `/blog/:id`, `/contact`, `/login`, `/register`; `/admin` guarded by `ProtectedRoute` → redirects to `/login` |
| **9. API Integration (public)** | `useEffect` + axios in `Home`, `Projects`, `ProjectDetail`, `Blog`, `BlogDetail`; the controlled contact form POSTs to `/api/contact`; "Loading…"/error states everywhere (`Loader`, `Alert`) |
| **10. Auth flow & global state** | `context/AuthContext.jsx` (token + user + login/register/logout + session restore), JWT attached by the axios interceptor, auth-aware `Header` (Login/Register ⇄ Admin Dashboard/Logout) |
| **11. Protected API integration** | `components/admin/*` — create/update/delete projects and posts, comment posting, message inbox, profile editor, each sending `Authorization: Bearer <token>` |
| **12. Deployment** | Live: `capstone-portfolio-client.netlify.app` (static site) + `capstone-portfolio-api.netlify.app` (Netlify Function). Config: `server/netlify.toml`, `server/netlify/functions/api.js`, `client/public/_redirects`, `client/.env.production`; README section 7 |

---

## 10. Submission checklist

| Item | Status |
| --- | --- |
| Live **front-end** URL submitted to Chaoxing | `https://capstone-portfolio-client.netlify.app` |
| Live **back-end** URL submitted to Chaoxing (`/api/health` responding) | `https://capstone-portfolio-api.netlify.app` |
| Source ZIP named `24998024_田承琪_CapstoneProject.zip`, containing `server/`, `client/`, `docs/` and this `README.md` | yes |
| **`node_modules` (and build output) removed from the ZIP** | yes — 0 `node_modules` folders, 0 `dist` folders |
| `README.md` at the root of the ZIP | yes (this file) |
| Demo and viva | Wednesday 04 November 2026, 10:10 – 11:45 |

Packaging command (PowerShell, from the project root) — it stages the files in a temporary
folder, drops the heavy/secret folders and zips what is left:

```powershell
robocopy . _pkg_stage /E /XD node_modules dist .git .netlify /XF .env .env.local test-output.txt
Compress-Archive -Path _pkg_stage\* -DestinationPath ..\24998024_田承琪_CapstoneProject.zip -Force
```

After packaging, the ZIP was unpacked into a clean folder and `npm install` + `npm test` were run
inside `server/`: **16 / 16 tests passed**, so the submitted source is self-contained.
