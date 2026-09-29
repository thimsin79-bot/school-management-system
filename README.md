# School Management System

A comprehensive school management system built with Next.js (App Router), React and TypeScript. Features include student management, attendance tracking, exam results, scheduling, and more.

## Features

- Student, Teacher, and Parent management
- Class room and Subject management
- Timetable/Schedule management
- Attendance tracking
- Exam and Exam Results management
- User management with roles
- Notice board
- ID card generation and printing (CODE128 barcode, no external CDN)
- Responsive design with light/dark theme support
- Data persistence using localStorage

## Getting Started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build                     |
| `npm start`     | Serve the production build           |
| `npm run lint`  | ESLint                               |
| `npm run typecheck` | TypeScript, no emit              |

## Project structure

```
app/
  layout.tsx        Root layout — fonts, globals.css, AppProvider
  page.tsx          Client-side view switcher over all views
  globals.css       Design tokens and component styles
components/
  Shell.tsx         Header + sidebar navigation
  Barcode.tsx       JsBarcode-backed CODE128 SVG
  ui.tsx            Shared primitives (Avatar, Pill, RowActions, …)
  icons.tsx         Inline SVG icon set
  views/            One component per sidebar view
lib/
  store.tsx         AppState context backed by useSyncExternalStore
  types.ts          Domain types and label maps
  lookups.ts        Memoized id → entity resolution
  nav.ts            Sidebar definition
  printIdCards.ts   Opens the printable ID card window
  utils.ts          Formatting and helpers
public/             Legacy vanilla HTML/CSS/JS build, kept for reference
```

## Usage

All data is stored locally in your browser's localStorage under the key `sms_full_app_v1`. There is no backend and no bundled sample data — a fresh browser starts completely empty, so add a subject, a class room and a student to get started. Open multiple tabs and edits sync between them via the `storage` event.

## Legacy build

`public/index.html`, `public/css/styles.css` and `public/js/app.js` are the original vanilla version. They are no longer used by the app and are kept only for reference.
