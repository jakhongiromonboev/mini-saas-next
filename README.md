# Mini SaaS Frontend

A project-management dashboard with separate admin and member workspaces. Admins manage projects and assignments; members see the work assigned to them.

**Next.js Pages Router · React · TypeScript · Tailwind CSS · REST · HttpOnly cookies**

This repository contains the frontend. The separate [Mini SaaS API](https://github.com/jakhongiromonboev/mini-saas-api) provides authentication, authorization, and MongoDB persistence.

## Features

- **Authentication:** signup, login, session restoration after refresh, and logout using a JWT in an HttpOnly cookie.
- **Admin workspace:** view all projects, create projects, edit all project fields, assign one member, and permanently delete a project after confirmation.
- **Member workspace:** view only assigned projects, with no management controls.
- **Project discovery:** case-insensitive project-name search and status filtering. Admins can also search by the assigned member’s name.
- **Live summaries:** totals update after confirmed API changes. Admins see project count, active count, and total budget; members see assigned count, active count, and the earliest unfinished deadline, including overdue work.
- **Responsive interface:** navy navigation, blue accents, separate summary cards, and a table that scrolls horizontally on smaller screens. Dialogs support keyboard navigation and restore focus when closed.
- **Startup recovery:** a branded connection screen and retry button when the API takes longer to start.
- **Request feedback:** validation messages, pending states, duplicate-submission protection, and a list-refresh option when a write result cannot be confirmed.
- **Authentication illustration:** a desktop Three.js scene with a static fallback and reduced-motion support.

## Technology

| Area        | Implementation                                                              |
| ----------- | --------------------------------------------------------------------------- |
| Framework   | Next.js 16 with the Pages Router, React 19                                  |
| Language    | TypeScript                                                                  |
| Styling     | Tailwind CSS 4                                                              |
| HTTP client | Native `fetch` with `credentials: 'include'`                                |
| State       | React context for authentication; hooks for project data and local UI state |
| Tooling     | Yarn Classic, ESLint, Prettier                                              |

## Local setup

### 1. Start the backend

Follow the [backend setup instructions](https://github.com/jakhongiromonboev/mini-saas-api#getting-started) to install its dependencies and configure MongoDB and authentication. Then run these commands from the **backend** repository:

```bash
npm run seed
npm run start:dev
```

Seeding requires the backend configuration described in its README. The seed creates one admin, three members, and six projects on a fresh database. Existing demo records retain their passwords and edits on subsequent runs.

The default API address is `http://localhost:4000`. Confirm it is running:

```bash
curl http://localhost:4000/health
```

The expected response is `{"status":"ok","service":"mini-saas-api"}`. The backend's `CLIENT_ORIGIN` must match the frontend origin, which is `http://localhost:3000` locally.

### 2. Install and run the frontend

Use **Node.js 22.22.3** and **Yarn Classic 1.22.22**. The Node version is recorded in `.nvmrc`; run `nvm use` if you use nvm.

From the **frontend** repository:

```bash
yarn install --frozen-lockfile
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the backend running in a separate terminal. Use Yarn for dependency changes so that `yarn.lock` stays consistent.

### 3. Configure the API address when needed

The frontend defaults to `http://localhost:4000` in `libs/config.ts`, so no frontend environment file is required for the default local setup.

To use another API address, create a local `.env.local` file in the frontend root with this public setting:

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com
```

Restart the development server after changing it. This value is included in the browser bundle; set it **before `yarn build`** for production and rebuild when it changes.

All `.env*` files, including `.env.example`, are intentionally ignored by Git. Keep database credentials, JWT secrets, and demo passwords in the backend's private configuration. The browser only needs the public API base URL; the optional proxy target is configured on the frontend server.

## Demo accounts

These accounts are created by the backend seed script:

| Role   | Name        | Email                      |
| ------ | ----------- | -------------------------- |
| Admin  | Demo Admin  | `admin@mini-saas.example`  |
| Member | Alex Kim    | `alex@mini-saas.example`   |
| Member | Sara Lee    | `sara@mini-saas.example`   |
| Member | Daniel Park | `daniel@mini-saas.example` |

New demo accounts use the backend's configured `SEED_PASSWORD`. There is no password embedded in this frontend. Rerunning the seed does not reset existing passwords. Public signup creates a regular member (`USER`), not an admin; new members have no projects until an admin assigns work to them.

## Pages and access

| Route           | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `/`             | Authentication entry point; signed-in users are redirected to their workspace |
| `/account/join` | Combined login and signup page                                                |
| `/_admin`       | Admin project dashboard (`ADMIN`)                                             |
| `/projects`     | Assigned-project dashboard (`USER`)                                           |

`AuthProvider` first checks `GET /health`, then restores the current member through `GET /member/detail`. A connection taking more than one second shows the startup screen. Health requests have a 10-second timeout and retry after two seconds, with a 90-second overall limit. If the API is still unavailable, **Try again** starts a new check. Leaving the page cancels pending work. This runs on a fresh page load; it does not continuously poll or keep the hosted API awake. The `doLogin` and `doSignUp` handlers call the functions in `libs/auth/index.ts`, update shared authentication state, and redirect to the appropriate workspace.

Dashboard pages wait for the session check before rendering. Signed-out visitors return to login; signed-in users visiting the other role's page are redirected to their own workspace. The backend independently enforces authorization on every protected API route.

Requests include the browser-managed HttpOnly cookie. JWTs are not stored in localStorage. Logout calls the backend to clear the cookie and clears the frontend's current member.

## Project workflow

A project has five editable fields: name, status, deadline, budget in USD, and **one assigned member** (`memberId`). Status values are `ACTIVE`, `ON_HOLD`, and `COMPLETED`. Budgets may be zero or a positive number; deadlines are submitted as `YYYY-MM-DD` and displayed without timezone shifts.

- **Create:** select an active assignee and submit the form. The confirmed project is added to the list.
- **Edit:** the same form opens with the selected project's values. The confirmed API response replaces that row.
- **Delete:** a separate dialog names the project and focuses Cancel first. The row is removed only after the API confirms deletion.

Search and status filtering operate on the fetched project list. For admins, search matches the project name or assigned member’s name using the already-loaded member list. Members search project names within their assigned projects only. If member names cannot be loaded, project-name search remains available. Summary cards always describe the full set the current account can access, rather than just the filtered rows. Successful creation and editing clear filters to reveal the saved project; deletion preserves the current filters.

The frontend does not automatically retry writes. If a response is lost or a project is no longer available, the modal offers **Check project list** to reload current data before continuing.

## REST integration

Authentication functions live in `libs/auth/index.ts`. Project and member requests live in `libs/services/`.

| Method | Endpoint              | Purpose / access                                       |
| ------ | --------------------- | ------------------------------------------------------ |
| GET    | `/health`             | Check API readiness; public                            |
| POST   | `/member/signup`      | Create a regular member and start a session            |
| POST   | `/member/login`       | Start a session                                        |
| POST   | `/member/logout`      | Clear the session cookie                               |
| GET    | `/member/detail`      | Read the signed-in member                              |
| GET    | `/member/all`         | List active accounts for assignment; admin only        |
| GET    | `/project/all`        | All projects for admins; assigned projects for members |
| POST   | `/project/create`     | Create a project; admin only                           |
| PUT    | `/project/:id`        | Update a project; admin only                           |
| PUT    | `/project/:id/delete` | Permanently delete a project; admin only               |

Project updates and deletion both use **PUT**, following the existing API contract. API responses are checked before updating the interface. A `401` from a protected data request clears the frontend session; errors remain visible in the relevant form or workspace.

## Code organization

```text
pages/
  _app.tsx                         Global styles and AuthProvider
  _document.tsx                    Base HTML document
  index.tsx                        Root authentication entry point
  account/join.tsx                 Login, signup, and role navigation
  _admin/index.tsx                 Admin dashboard page
  projects/index.tsx               Member dashboard page
libs/
  auth/
    index.ts                      Authentication API functions
    AuthProvider.tsx              Shared member state and session restoration
    navigation.ts                 Role-to-workspace mapping
  components/
    auth/                         Authentication form support and illustration
    common/                       Shared icons
    layout/                       Authentication and dashboard layouts
    project/
      ProjectWorkspace.tsx        Filters, summaries, and modal coordination
      ProjectTable.tsx            Rows and admin actions
      ProjectModal.tsx            Shared Add/Edit form and validation
      DeleteProjectModal.tsx      Delete confirmation and request feedback
  hooks/
    useAuth.ts                    Shared authentication access
    useProjectWorkspace.ts        Project/member loading and confirmed changes
  services/                       Health, project, and member REST requests
  enums/                          Member roles, member status, project status
  types/                          Request and response interfaces
  utils/project.ts                Summaries, dates, budgets, and status labels
  config.ts                       Public API base URL
styles/globals.css                Tailwind and global styles
public/                           Static assets
```

The `@/` import alias points to the repository root.

## Commands and verification

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `yarn dev`          | Start the development server on port 3000 |
| `yarn build`        | Create the production build               |
| `yarn start`        | Serve the production build on port 3000   |
| `yarn typecheck`    | Check TypeScript types                    |
| `yarn lint`         | Run ESLint                                |
| `yarn format:check` | Check formatting                          |
| `yarn format`       | Apply formatting                          |

Before submitting changes:

```bash
yarn typecheck
yarn lint
yarn format:check
yarn build
```

There is no automated test command included in this repository. To review the application with the real backend:

1. Sign in as the demo admin and confirm that all projects and summary cards load.
2. Create a clearly named test project assigned to a demo member. Refresh and confirm it persists.
3. Edit its name, status, deadline, budget, and assignment. Refresh again and check the row and totals.
4. Sign out, then sign in as the assigned member. Confirm that only assigned projects appear and no management actions are available. Visiting `/_admin` should return to `/projects`.
5. Try name search and status filters. The summary cards should continue to describe the account's full project list.
6. Sign back in as admin. Cancel the test project's delete dialog once, then confirm deletion. Refresh and check that the project remains deleted and totals are restored.
7. Sign out and revisit a protected page. It should return to login.

## Production configuration

### Vercel frontend and Render API

Import this repository into Vercel using the **Next.js** preset and the **master** production branch. Use the repository root, Node.js **22.x**, and Yarn. Keep the default build command (`yarn build`) and output directory.

Set these environment variables in Vercel before building:

| Variable              | Value                                                                           |
| --------------------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `/api`                                                                          |
| `API_PROXY_TARGET`    | The HTTPS origin of the Render API, for example `https://your-api.onrender.com` |

Use the backend origin without an `/api` suffix. `next.config.ts` forwards `/api/:path*` to the corresponding backend route. For example, `/api/member/login` becomes `/member/login` on Render. The browser calls the frontend origin, so the existing HttpOnly cookie remains first-party even though the two services use different hosting domains.

These values are applied during the build. Redeploy after changing either variable. Without `API_PROXY_TARGET`, no proxy is configured and the default local setup continues to call `http://localhost:4000` directly.

On Render, set `NODE_ENV=production` and `CLIENT_ORIGIN` to the exact HTTPS frontend origin. Database credentials and the JWT signing secret stay in Render's private configuration; do not copy them into Vercel or Git.

After deployment, check `/api/health` on the frontend URL, then verify login, refresh, admin/member access, project changes, and logout. Successful builds alone do not verify deployed cookies or database access.

Render's free service may sleep while idle. The current frontend request timeout is 10 seconds, so the first request can time out while the API starts. Allow it to start before trying again; project writes are never automatically retried.

### Running a production build locally

```bash
yarn build
yarn start
```

For a locally hosted production setup, use HTTPS when the backend runs with `NODE_ENV=production`, which enables secure cookies.
