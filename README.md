# FiSalesNav (Field Sales Navigation Planner) - v0.3.1

A high-performance, responsive full-stack web application designed for industrial field sales engineers (specifically optimized for automation reps such as Pepperl+Fuchs agents) to plan itineraries, navigate route stops geographically, and capture formatted client debrief logs with live Google Gemini AI support.

---

## 🚀 Key Features & Capabilities

### 1. Unified Navigation Tabs (5 Core views)
- **OGGI (Today)**: Optimized for mobile/in-car usage, showing a timeline starting from settings. Lists stops sorted chronologically, displaying step-by-step OSRM driving leg calculations (km and minutes). Tap cards expand to launch Google Maps routing, read pre-visit commercial context briefs, or invoke the **Debriefing Popup** form.
- **CALENDARIO (Calendar)**: 5-Day working template (Monday-Friday) to manage upcoming schedules. Scrolling buttons let you cycle back and forth **up to ±4 weeks** out. Includes quick-addition slots for specific days and triggers the unstructured mass import.
- **RIEPILOGO (Summary)**: A clean business metric overview designed strictly for CRM uploads. Houses the **CRM .XLSX Excel Export** generator (leveraging `xlsx`) to instantly assemble reports ready for file injection into ERP networks.
- **SANDBOX (Scratchpad)**: Free planning area. Draft customer requirements, items, and contacts without scheduling a day. Drag or select a day later via localized planning dropdowns.
- **BACKLOG**: Unscheduled, rescheduled, or cancelled visits have their histories preserved here, so sales reps never lose pre-visit notes and can reschedule them dynamically.

### 2. Embedded server-side Google Gemini AI Integration
All AI features run strictly on our secure Node/Express backend (`/server.ts`) via the modern `@google/genai` TypeScript SDK:
- **CRM Report generator (`/api/ai/debrief`)**: Automatically structures messy post-visit appunts/quickNotes into professional business briefs in Italian, correcting spelling/punctuation according to templates defined in the Settings menu.
- **Mass planner (`/api/ai/import`)**: Processes raw pasted emails, text lists, or transcripts, automatically assigning targets to optimal sequential workdays based on contextual parameters.
- **Single visit parser (`/api/ai/parse-single`)**: Interprets single statements (e.g., *"tetrapak monza mercoledì alle 14 con ing. rossi per sensori laser"*) and instantly populates appropriate form inputs.
- **Operational Summary (`/api/ai/weekly-summary`)**: Synthesizes the week's completed activities into an elegant e-mail report ready to copy and send to sales management.

### 3. Smart Resilient Geocoding & Routing Leg Calculation
To bypass OpenStreetMap or OSRM rate-limiting, `/src/utils/geo.ts` implements a dual strategy:
1. **Memory & Cache lookup**: Standard coordinates for Northern Italian industrial hubs are packed as instant lookup constants.
2. **Interactive Routing fetch**: Contacts over-the-air API endpoints to query real-time OSRM routes.
3. **Resilient Spherical Fallback**: If the browser is offline or the APIs are throttling, uses the **Haversine formula** with a highway winding multiplier of `1.25x` and variable speed factors to present reasonable stimes.

---

## 📁 Directory Architecture

```
/
├── server.ts                 # Full-stack Node/Express server setup (+ Vite SPA mounting)
├── metadata.json             # Applet descriptor (Geolocation permissions declared)
├── package.json              # Builds, dev scripts, and external dependencies (Vite, Esbuild, xlsx, etc)
├── tsconfig.json             # TypeScript configuration targeting ES2022
├── vite.config.ts            # Vite bundler alias rules and watcher controls
└── src/
    ├── main.tsx              # App main wrapper entrypoint
    ├── index.css             # Global Tailwind stylesheets + Google Fonts (Inter, JetBrains Mono)
    ├── App.tsx               # Main SPA routing coordinator & global local database state
    ├── types.ts              # Declarations of SalesVisit, AppSettings, and WeekData structures
    ├── utils/
    │   ├── ai.ts             # Wrapped client fetch controllers hitting /api/ai/* endpoints
    │   ├── geo.ts            # Geographic coordinates geocoder and OSRM leg resolver
    │   └── demo.ts           # Demo factory to seed exactly 30 visits under 25 real Italian clients
    └── components/
        ├── Header.tsx        # Common master page header with snapshot upload/download
        ├── SettingsModal.tsx # Profile configs, custom prompts, and demo load button
        ├── DebriefModal.tsx  # Interactive outcome form with AI refinement trigger
        ├── AddVisitModal.tsx # Add/Edit form with manual or free-text AI slots
        ├── ImportVisitsModal.tsx # Bulk list AI importer with formatted schedule preview
        ├── TodayTab.tsx      # Chronological mileage and driving timeline (OGGI)
        ├── CalendarTab.tsx   # 5-Day working blocks (CALENDARIO)
        ├── SummaryTab.tsx    # Clipboard tools and .XLSX Excel generator (RIEPILOGO)
        ├── SandboxTab.tsx    # draft-board workspace (SANDBOX)
        └── BacklogTab.tsx    # Canceled or postponed items list (BACKLOG)
```

---

## 🛠️ Build and Development Guideline

### 1. Local Development
Start the dev server mounting the API endpoints. In this mode, Vite serves the frontend spa dynamically:
```bash
npm run dev
```

### 2. Production Compilation Build
Compiles frontend assets using Vite inside `/dist`, and bundles `server.ts` into a self-contained, high-performance Node file `dist/server.cjs` using `esbuild` structure checks:
```bash
npm run build
```

### 3. Run Production Build
Launches the standalone bundled server on port `3000`:
```bash
npm run start
```
