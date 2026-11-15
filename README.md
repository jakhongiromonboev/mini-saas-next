# Mini SaaS Next

Next.js Pages Router frontend using TypeScript and Tailwind CSS. The folder
organization follows Fairway Next: `pages/` contains routes and `libs/` holds
shared frontend code.

This first step includes the project configuration, a styled home page, and
folders for the upcoming authentication and project dashboard features.
The empty folders are reserved for later steps; they do not create routes yet.

## Start developing

Use Node.js 22.22.3 and Yarn Classic 1.22.22. The Node version is recorded
in `.nvmrc` for developers using nvm (`nvm use`). The supported Node ranges
are listed in `package.json`.

```bash
yarn install
yarn dev
```

Open **http://localhost:3000**. Edit `pages/index.tsx` to see your changes update
in the browser. Stop the development server with `Ctrl+C`.

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
  _app.tsx                 Global styles and shared app setup
  _document.tsx            Base HTML document
  index.tsx                Home page at /
  account/                 Future login/signup page
  _admin/                  Future admin dashboard
  projects/                Future member project page
libs/
  components/
    layout/                Shared page layouts
    common/                Reusable interface components
    project/               Project table, filters, and modal
  auth/                    Future authentication state
  hooks/                   Reusable React hooks
  services/                Future calls to the Express API
  enums/                   Shared frontend enums
  types/                   Shared TypeScript interfaces
  config.ts                Public API base URL
styles/
  globals.css              Tailwind import and global CSS
public/
  img/                     Static images
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
base URL is configured in `libs/config.ts`; API calls will be added in the
next steps.

To override the address, create an ignored local `.env.local` file:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`NEXT_PUBLIC_` values are visible to the browser. Only the public API address
belongs here. Keep MongoDB credentials, JWT secrets, and seed passwords in
the backend's private environment. All `.env*` files are ignored by Git.
The upcoming API client will send the backend's HttpOnly cookie with
`credentials: 'include'`.
