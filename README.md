# Mini SaaS Next

Next.js Pages Router frontend using TypeScript and Tailwind CSS. The folder
organization follows Fairway Next: `pages/` contains routes and `libs/` holds
shared frontend code.

The authentication page includes login, signup, session restoration, and sign-out.
Its responsive Tailwind layout uses a softly animated Three.js illustration.
Admin and member project dashboards are reserved for the next step.

## Start developing

Use Node.js 22.22.3 and Yarn Classic 1.22.22. The Node version is recorded
in `.nvmrc` for developers using nvm (`nvm use`). The supported Node ranges
are listed in `package.json`.

```bash
yarn install
yarn dev
```

Open **http://localhost:3000/account/join** (the home page also opens this form).
Edit `pages/account/join.tsx` to see your changes update in the browser. Stop the development server with `Ctrl+C`.

Dependencies use `yarn.lock`; use Yarn when adding or updating packages.
For repeatable installation from the existing lockfile:

```bash
yarn install --frozen-lockfile
```

## Commands

| Command             | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `yarn dev`          | Start the development server on port 3000 with live updates   |
| `yarn build`        | Build the application for production                          |
| `yarn start`        | Run the production build on port 3000; run `yarn build` first |
| `yarn typecheck`    | Check TypeScript types                                        |
| `yarn lint`         | Run ESLint                                                    |
| `yarn format:check` | Check formatting                                              |
| `yarn format`       | Apply formatting                                              |

## Folder structure

```text
pages/
  _app.tsx                        Global styles and shared app setup
  _document.tsx                   Base HTML document
  index.tsx                       Authentication page at /
  account/join.tsx                Combined login/signup and account confirmation
  _admin/                         Future admin dashboard
  projects/                       Future member project page
libs/
  components/
    layout/AuthLayout.tsx         Shared authentication page layout
    auth/AccountCard.tsx          Signed-in account and sign-out button
    auth/AuthScene.tsx            React wrapper and static 3D fallback
    auth/createAuthScene.ts       Three.js scene, animation, and cleanup
    common/                       Reusable interface components
    project/                      Project table, filters, and modal
  auth/index.ts                   Cookie-based authentication functions
  auth/AuthProvider.tsx           Current member and session restoration
  hooks/useAuth.ts                Access shared authentication state
  enums/                          Shared frontend enums
  types/                          Shared TypeScript interfaces
  config.ts                       Public API base URL
styles/
  globals.css                     Tailwind import and global CSS
public/
  img/                            Static images
```

The `@/` import alias points to the project root. For example,
`@/libs/config` refers to `libs/config.ts`.

## Tailwind, one small example

Tailwind provides utility classes, each responsible for a small styling rule.
You combine them in React's `className`:

```tsx
<div className="rounded-xl bg-white p-6 shadow-sm">
  <h1 className="text-2xl font-bold text-indigo-600">Mini SaaS</h1>
</div>
```

| Class             | Effect with the default theme               |
| ----------------- | ------------------------------------------- |
| `rounded-xl`      | Rounded corners                             |
| `bg-white`        | White background                            |
| `p-6`             | Padding on every side: 1.5rem, usually 24px |
| `shadow-sm`       | A small shadow                              |
| `text-2xl`        | A larger font size                          |
| `font-bold`       | Bold text                                   |
| `text-indigo-600` | Indigo text color                           |

Responsive prefixes apply styles from a breakpoint upward. For example,
`p-6 md:p-8` uses `p-6` on smaller screens and `p-8` at the default `md`
breakpoint, 48rem, and above.

Tailwind v4 is loaded with `@import 'tailwindcss';` in `styles/globals.css`.
The `@tailwindcss/postcss` plugin in `postcss.config.mjs` generates the CSS
used by the classes in your source files. A `tailwind.config.js` file is not
required for this basic setup.

## Backend connection

The Express backend runs separately on **http://localhost:4000**. Its public
base URL is configured in `libs/config.ts`. Run the backend while using the
authentication page; it accepts the frontend origin `http://localhost:3000` by default.

To override the address, create an ignored local `.env.local` file:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`NEXT_PUBLIC_` values are visible to the browser. Only the public API address
belongs here. Keep MongoDB credentials, JWT secrets, and seed passwords in
the backend's private environment. All `.env*` files are ignored by Git.
The API client sends the backend's HttpOnly cookie with
`credentials: 'include'`. Tokens are managed by the browser; they are not stored
in localStorage.

## Authentication flow

The page follows Fairway Next's handler style:

- `doLogin` calls `logIn` from `libs/auth/index.ts`.
- `doSignUp` calls `signUp` from the same file.
- Both update the current member through `useAuth().updateMember`.
- `AuthProvider` restores the session on startup and shares the current member.

The auth functions use the existing REST endpoints and browser cookies:

- **Login:** email and password are sent to `POST /member/login`.
- **Signup:** name, email, and password are sent to `POST /member/signup`.
  The backend creates a regular member and starts the session.
- **Refresh:** `GET /member/detail` restores the current member.
- **Sign out:** `POST /member/logout` clears the session cookie.

After authentication, the page confirms the signed-in account and provides
sign-out. Dashboard navigation will be connected when those pages are built.
Backend errors appear in the form, and pending requests disable repeat submissions.

The Three.js scene loads only in the browser on desktop-sized screens and starts
a slow 360° rotation automatically, completing one turn every 28 seconds. It stays
still for reduced-motion preferences, pauses while offscreen or in a hidden tab,
and releases GPU resources when removed.
The static illustration remains available if 3D rendering fails. The mobile
layout prioritizes the form and does not load the scene.
