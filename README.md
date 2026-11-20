# CodeDock — FTC Java sharing

A small, developer-focused workspace for FIRST Tech Challenge teams to organize Java files, inspect FTC-specific metadata, and share code for review.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the Vite URL printed in your terminal (normally http://localhost:5173). The API runs on port 3001. Production build and serve:

```bash
npm run build
npm start
```

The local API stores shares and mentor notes in `data/shares.json`; keep that file backed up if you need to preserve local shares. In production, serve the app behind HTTPS and put the API behind suitable authentication/rate limiting for your deployment.

## Included

- Monaco Java editor with line numbers, active-line highlight, bracket matching, indentation guides, folding, and a dark theme.
- Upload or drag in multiple `.java` files, ZIPs of Java source, or edit the included FTC examples.
- Detects TeleOp / Autonomous annotations, `hardwareMap.get(Type.class, ...)` device types, and common FTC motion/vision libraries.
- Publish public or unlisted links; the read-only share view includes code-copy, OnBot Java package-line stripping, and Java/ZIP downloads.
- Visitors can click a gutter line number and add a mentor note; notes are stored with the share and visible to other visitors.

Public shares are directly addressable just like unlisted shares; this starter app does not include a public directory or user accounts. OnBot Java copy strips package declarations; Java imports are retained.
