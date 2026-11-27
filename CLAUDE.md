# HARVESTIQ — Project Engineering Guide (`CLAUDE.md`)

## 1. Project Overview
- **Product Name:** HARVESTIQ
- **Tagline:** From Growing to Knowing.
- **Category:** AgriTech / Smart Agriculture / Vertical Farming / Predictive Crop Intelligence
- **Initial Crop Focus:** Hydroponic Lettuce (Romaine, Butterhead, Crisphead, Lollo Rosso)
- **Initial Validation Context:** Odisha, India (Cuttack & Bhubaneswar pilot context)

## 2. Product Vision & Core Pillars
HARVESTIQ is a software-first, hardware-agnostic ecosystem that unites farm operators, vertical farming infrastructure providers, and existing third-party sensor manufacturers:
1. **Connect:** Discover infrastructure and technically verified compatible IoT sensors without vendor lock-in.
2. **Automate:** Standardize telemetry from heterogeneous sensor adapters (REST, MQTT, Webhooks, LoRaWAN/Modbus gateways) into a unified internal schema.
3. **Intelligently Manage:** Associate zone-level environmental telemetry with crop batch occupancy periods to provide growth insights, anomaly alerts, and illustrative harvest windows.

## 3. Current Development Stage
- **Active Stage:** **Stage 1 — Complete Frontend Development (Authorized)**
- **Pending Future Stages (Do Not Implement Yet):**
  - **Stage 2:** FastAPI backend, PostgreSQL database, RBAC authentication, MQTT broker (Mosquitto) & manufacturer REST adapters.
  - **Stage 3:** Scikit-learn / XGBoost maturity & yield prediction models validated with real labeled harvest records.

## 4. Technology Stack (Stage 1)
- **Framework:** React 19 + Vite 8 + TypeScript
- **Routing:** `react-router-dom` (14 application routes)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **State & Persistence:** Deterministic demonstration dataset + `HarvestIQProvider` + `localStorage` persistence (`harvestiq_state_v1`)

## 5. Folder Structure
- `src/types/domain.ts` — Strict TypeScript interfaces aligned with Stage 2 database entities (`farms`, `growing_zones`, `devices`, `device_assignments`, `sensor_readings`, `crop_batches`, `batch_zone_history`, `growth_observations`, `predictions`, `alerts`, `harvest_records`, `partners`, `partner_products`).
- `src/data/mockData.ts` — Deterministic Odisha pilot farm, rack, zone, batch, device, telemetry, partner, and harvest datasets.
- `src/services/harvestService.ts` — Service abstraction layer separating UI components from data storage and future Stage 2 REST API calls.
- `src/utils/calculations.ts` — Transparent Stage 1 frontend calculations (crop age, days remaining, stage classification, harvest window bounds, yield estimates when supported, CSV export).
- `src/context/HarvestIQContext.tsx` — Centralized state management with `localStorage` persistence and CRUD actions.
- `src/components/layout/` — AppShell (persistent sidebar + compact topbar + mobile drawer) and LandingNavbar.
- `src/components/common/` — Reusable UI primitives (Modal, ConfirmDialog, DemoNotice, StatusIndicator, EmptyState, SafeImage).
- `src/pages/` — All 14 route views (`LandingPage`, `DashboardPage`, `FarmsPage`, `ZonesPage`, `BatchesPage`, `BatchDetailPage`, `PredictionsPage`, `EnvironmentPage`, `DevicesPage`, `PartnersPage`, `HarvestPage`, `AlertsPage`, `AnalyticsPage`, `SettingsPage`).

## 6. Design System & Conventions
- **Palette:** Forest Green `#153F32`, Secondary Meadow `#287A55`, Soft Sage `#E8F0E8`, Background `#F7F9F5`, Ink `#202923`, Muted `#78847D`, Warm Ochre `#D7A65B`.
- **Typography:** `Plus Jakarta Sans` (display), `DM Sans` (body), `IBM Plex Mono` (`tabular-nums` for telemetry/metrics).
- **Transparency Rules:**
  - All Stage 1 predictions carry `"DEMONSTRATION MODEL – NOT VALIDATED WITH REAL FARM DATA"`.
  - Sensor telemetry is clearly labeled as simulated Stage 1 readings.
  - Partner listings are clearly labeled as demonstration profiles; listing is separated from technical compatibility verification.
  - Sensors bind to **Growing Zones** (`Farm -> Rack -> Level -> Zone`), never permanently to individual crop batches.
  - Zero-pill metadata discipline: static metadata uses unboxed inline text with `·` separators.

## 7. Commands
- `npm run dev` — Start Vite development server on port 3000.
- `npm run lint` — Run TypeScript type check (`tsc --noEmit`).
- `npm run build` — Build production bundle into `dist/`.

## 8. Known Limitations (Stage 1)
- Data persistence is local to the browser (`localStorage`).
- Sensor readings are deterministic simulations; no live MQTT or manufacturer cloud polling is active yet.
- Harvest predictions use configurable variety-based maturity rules rather than trained ML models.
