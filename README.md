# HARVESTIQ — From Growing to Knowing

**AI-Enabled Integrated Vertical Farming & Predictive Crop Intelligence Platform (Stage 1 Frontend Prototype)**

HARVESTIQ is a software-first, hardware-agnostic digital ecosystem connecting commercial hydroponic farmers, vertical farming infrastructure providers, and third-party IoT sensor manufacturers. Built with an initial focus on hydroponic lettuce cultivation in Odisha, India.

## Implemented Stage 1 Scope

This repository implements **Stage 1 (Complete Frontend Development)** using structured deterministic demonstration data and browser `localStorage` persistence:

- **Landing Experience (`/`)**: Value proposition, three-pillar strategy (Connect, Automate, Intelligently Manage), workflow overview, and partner/farmer entry points.
- **Farm Operations Dashboard (`/dashboard`)**: Dynamic KPIs, environmental trends, harvest readiness timeline, zone crop distribution, and recent alerts.
- **Farm & Zone Hierarchy (`/farms`, `/zones`)**: Full `Farm -> Rack -> Level -> Growing Zone` management with historical batch occupancy and device assignments.
- **Crop Batch Management (`/batches`, `/batches/:id`)**: Full batch CRUD, search/filter/sort, growth timeline, zone-linked telemetry history, and detailed prediction breakdown.
- **Predictive Harvest Intelligence (`/predictions`)**: Configurable variety maturity windows, readiness grouping, uncertainty bounds, and explicit demonstration model notices.
- **Environmental Monitoring (`/environment`)**: Multi-metric simulated telemetry (°C, % RH, PAR, pH, EC, water temp, CO₂), freshness indicators, missing-data warnings, and zone comparisons.
- **Hardware-Agnostic Device Registry (`/devices`)**: Third-party sensor discovery, zone assignment/reassignment, connection diagnostics, and standardized JSON adapter payload preview.
- **Partner & Product Ecosystem (`/partners`)**: Demonstration infrastructure and sensor catalog with clear separation between product listing and verified compatibility.
- **Harvest Management (`/harvest`)**: Upcoming harvest calendar, actual harvest logging (date, weight, head count, notes) that feeds historical records and updates KPIs, plus CSV export.
- **Alert Center (`/alerts`)**: Distinction between sensor/telemetry faults and environmental/harvest advisories, read/acknowledge workflows.
- **Analytics & Settings (`/analytics`, `/settings`)**: Yield and cycle comparison charts, CSV export, honest model evaluation status, and configurable lettuce variety operating ranges.

## Planned Future Stages (Not Implemented in Stage 1)
- **Stage 2:** FastAPI backend, PostgreSQL relational database, role-based auth, Mosquitto MQTT ingestion, and manufacturer REST/webhook adapters.
- **Stage 3:** Scikit-learn / XGBoost crop maturity and yield prediction engine validated against real harvest records.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To verify TypeScript types and build production assets:

```bash
npm run lint
npm run build
```
