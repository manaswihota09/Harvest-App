import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Menu,
  Sprout,
  TrendingUp,
  X,
} from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { Modal, SafeImage } from '../components/common/UIPrimitives';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { partnerProducts, setActiveRole } = useHarvestIQ();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingModal, setOnboardingModal] = useState<'farmer' | 'partner' | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    company: '',
    category: 'Sensor & IoT',
    email: '',
    notes: '',
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const featuredProducts = partnerProducts.slice(0, 3);

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.company.trim() || !partnerForm.email.includes('@')) return;
    setPartnerSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] text-[#202923]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8E0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single text wordmark */}
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-[#153F32] whitespace-nowrap shrink-0"
          >
            HARVESTIQ
          </Link>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#525E57]" aria-label="Landing navigation">
            <a
              href="#solution"
              className="transition-colors hover:text-[#153F32] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Platform
            </a>
            <a
              href="#capabilities"
              className="transition-colors hover:text-[#153F32] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              className="transition-colors hover:text-[#153F32] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#ecosystem"
              className="transition-colors hover:text-[#153F32] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Ecosystem
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA + mobile drawer button */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2E24] whitespace-nowrap shrink-0"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-lg border border-[#DCE3DB] p-2 text-[#202923] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E2E8E0] bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-[#202923]">
              <a href="#solution" onClick={() => setMobileMenuOpen(false)}>Platform</a>
              <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#ecosystem" onClick={() => setMobileMenuOpen(false)}>Ecosystem</a>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#153F32] px-4 py-2.5 text-sm font-medium text-white"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-[1280px] px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-14 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-medium tracking-wide text-[#287A55]">
              From Growing to Knowing · Hydroponic Lettuce Intelligence · Odisha Pilot
            </p>
            <h1
              className="mt-3 font-display font-bold tracking-tight text-[#153F32]"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', lineHeight: 1.08, textWrap: 'balance' }}
            >
              Grow Smarter. Harvest Better.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4E5A53] sm:text-lg">
              Predictive intelligence for the next generation of vertical farming. Connect existing
              farm technologies, monitor crop growth, forecast harvest readiness and make
              data-driven farming decisions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[#153F32] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F2E24] whitespace-nowrap"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 rounded-lg border border-[#C9D5C8] bg-white px-5 py-3 text-sm font-semibold text-[#153F32] transition-colors hover:bg-[#E8F0E8] whitespace-nowrap"
              >
                Discover How It Works
              </a>
            </div>

            {/* Grounded Stage 1 context strip */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#DDE4DC] pt-6">
              <div>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#153F32]">Hardware-Agnostic</p>
                <p className="mt-0.5 text-xs text-[#606C65]">Works with existing third-party sensors</p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#153F32]">Zone-First Mapping</p>
                <p className="mt-0.5 text-xs text-[#606C65]">Farm → Rack → Level → Growing Zone</p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#153F32]">Stage 1 Demo</p>
                <p className="mt-0.5 text-xs text-[#606C65]">Interactive frontend with simulated data</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-xl border border-[#DCE3DB] bg-[#E8F0E8]">
              <SafeImage
                src="/src/assets/images/hero_vertical_farm_1795755918093.jpg"
                alt="Indoor multi-tier vertical hydroponic lettuce farm with white LED grow racks"
                className="h-full w-full object-cover"
                fallbackTitle="Indoor Vertical Hydroponic Lettuce Facility"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D231B]/90 via-[#0D231B]/45 to-transparent p-5 text-white">
                <p className="text-xs font-medium text-[#D7A65B]">
                  Demonstration Pilot View · Cuttack &amp; Bhubaneswar
                </p>
                <p className="mt-1 text-sm font-medium">
                  Multi-tier NFT lettuce production unified with automated zone telemetry and
                  illustrative harvest windows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="solution" className="border-y border-[#E2E8E0] bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-wide text-[#287A55]">
                Why HARVESTIQ Exists
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#202923] sm:text-3xl">
                Vertical farms have sensors, yet growers still fly blind on harvest timing.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#525E57]">
                Commercial hydroponic operators frequently juggle disconnected manufacturer apps,
                manual EC/pH logs, and spreadsheet guesswork. Without tying environmental history to
                specific crop cycles, farms struggle to anticipate maturity shifts or spot rack-level
                thermal drift early.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              <div className="rounded-xl border border-[#E2E8E0] bg-[#F7F9F5] p-6">
                <h3 className="font-display text-base font-semibold text-[#202923]">
                  Current Operational Friction
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm text-[#525E57]">
                  <li>Separate dashboards for temperature, water probes, and dosing pumps.</li>
                  <li>Vendor lock-in forcing farmers to replace functional existing sensors.</li>
                  <li>Sensor readings isolated from which crop batch occupied a rack.</li>
                  <li>Harvest scheduling based only on calendar days after transplant.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-[#C9DBC9] bg-[#E8F0E8]/60 p-6">
                <h3 className="font-display text-base font-semibold text-[#153F32]">
                  The HARVESTIQ Ecosystem
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm text-[#202923]">
                  <li>One unified interface integrating third-party REST, MQTT, and gateway probes.</li>
                  <li>Sensors stay anchored to physical growing zones across successive batches.</li>
                  <li>Transparent deviation alerts separating hardware faults from crop stress.</li>
                  <li>Window-based harvest forecasts and actual yield logging for ML validation.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="mt-14 grid gap-6 border-t border-[#E6ECE5] pt-12 md:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8E0] bg-white p-6">
              <p className="font-mono text-xs font-semibold text-[#287A55]">01. Connect</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#202923]">
                Open Infrastructure &amp; Sensor Discovery
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#525E57]">
                Discover vertical racks, circulation manifolds, and third-party sensors with clear
                technical compatibility verification—never tied to proprietary HARVESTIQ hardware.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8E0] bg-white p-6">
              <p className="font-mono text-xs font-semibold text-[#287A55]">02. Automate</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#202923]">
                Standardized Zone Telemetry
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#525E57]">
                Manufacturer adapters normalize °C, % RH, PAR, pH, EC, and water temperature into a
                single schema, associating readings automatically with the occupying crop batch.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8E0] bg-white p-6">
              <p className="font-mono text-xs font-semibold text-[#287A55]">
                03. Intelligently Manage
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#202923]">
                Predictive Harvest Windows
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#525E57]">
                Monitor batch progression, spot rack-level anomalies early, plan harvests around
                uncertainty-aware windows, and preserve actual harvest weights for model training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Asymmetric Bento Grid */}
      <section id="capabilities" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#287A55]">
            Core Intelligence Capabilities
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#202923] sm:text-3xl">
            Built for commercial lettuce operators and technical hardware partners.
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#DCE3DB] bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2.5 text-[#153F32]">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">
                Harvest Readiness &amp; Uncertainty-Aware Windows
              </h3>
            </div>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#525E57]">
              Instead of promising an artificial single harvest date, HARVESTIQ tracks variety
              baselines (Romaine, Butterhead, Crisphead, Lollo Rosso), sensor data completeness,
              and sustained thermal shifts to present realistic harvest windows and readiness stages.
            </p>
            <div className="mt-5 grid gap-4 border-t border-[#EAEFEA] pt-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#606C65]">Stage 1 Demo Baseline</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#153F32]">
                  Configurable Rules
                </p>
              </div>
              <div>
                <p className="text-xs text-[#606C65]">Yield Estimation</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#153F32]">
                  Only When Labelled
                </p>
              </div>
              <div>
                <p className="text-xs text-[#606C65]">Stage 3 Target</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#153F32]">
                  Scikit-learn / XGBoost
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DCE3DB] bg-white p-6">
            <div className="flex items-center gap-2.5 text-[#153F32]">
              <Cpu className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">
                Fault vs. Crop Distinction
              </h3>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-[#525E57]">
              An offline flow sensor or stale MQTT packet is flagged strictly as a telemetry fault—not
              misreported as plant disease or irrigation failure without confirmation.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE3DB] bg-white p-6">
            <div className="flex items-center gap-2.5 text-[#153F32]">
              <Layers className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">
                Historical Zone Occupancy
              </h3>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-[#525E57]">
              Sensors bind to physical racks and levels. When Batch L-001 finishes and L-002 takes
              its place in Rack A · Level 2, telemetry maps cleanly to each batch’s occupancy window.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE3DB] bg-[#153F32] p-6 text-white lg:col-span-2">
            <div className="flex items-center gap-2.5 text-[#D7A65B]">
              <Sprout className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-white">
                Grounded in Real Harvest Feedback Loops
              </h3>
            </div>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/85">
              Growers log actual harvest dates, harvested head counts, and net weights in kilograms.
              Those ground-truth records power Stage 3 model evaluation (MAE in days and kg) rather
              than fabricating accuracy from synthetic numbers.
            </p>
            <div className="mt-5">
              <Link
                to="/predictions"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#D7A65B] hover:underline"
              >
                <span>Inspect Harvest Predictions Interface</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="border-y border-[#E2E8E0] bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#287A55]">How It Works</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#202923] sm:text-3xl">
              Four steps from physical rack setup to predictive harvest planning.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Configure Farm & Zones',
                desc: 'Structure your facility into Racks, Levels, and Growing Zones with lighting and circulation specs.',
              },
              {
                step: '02',
                title: 'Assign Compatible Sensors',
                desc: 'Register supported third-party REST, MQTT, or gateway probes and anchor them to physical zones.',
              },
              {
                step: '03',
                title: 'Launch Lettuce Batches',
                desc: 'Place Romaine, Butterhead, Crisphead, or Lollo Rosso batches into zones and track environmental trends.',
              },
              {
                step: '04',
                title: 'Forecast & Log Harvests',
                desc: 'Review readiness windows, inspect anomaly advisories, and record actual harvest weights.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-[#E2E8E0] bg-[#F7F9F5] p-5">
                <span className="font-mono text-sm font-semibold text-[#287A55]">{item.step}</span>
                <h3 className="mt-2 font-display text-base font-semibold text-[#202923]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525E57]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Ecosystem Preview */}
      <section id="ecosystem" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#287A55]">
              Hardware &amp; Sensor Ecosystem (Demonstration Listings)
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#202923] sm:text-3xl">
              Product listing and technical compatibility stay strictly separate.
            </h2>
          </div>
          <Link
            to="/partners"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#153F32] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#DCE3DB] bg-white"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F0F4EF]">
                <SafeImage
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-full w-full object-cover"
                  fallbackTitle={prod.name}
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs text-[#606C65]">
                    {prod.partnerName} · {prod.subCategory}
                  </p>
                  <h3 className="mt-1.5 font-display text-base font-semibold text-[#202923]">
                    {prod.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#525E57]">{prod.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#EAEFEA] pt-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#1E6B47]">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {prod.compatibilityStatus}
                  </span>
                  <span className="font-mono text-[#606C65]">
                    {prod.connectivityMethods.join(' / ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Farmer & Partner Entry Points */}
      <section className="border-t border-[#E2E8E0] bg-[#153F32] py-16 text-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/5 p-7">
              <p className="text-xs font-medium text-[#D7A65B]">For Commercial Growers &amp; Operators</p>
              <h3 className="mt-2 font-display text-2xl font-bold">
                Start with the interactive Odisha farm demonstration.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Explore Mahanadi HydroGreens Facility, configure racks and growing zones, assign
                simulated sensors, create lettuce batches, and log actual harvest weights.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('farmer');
                    navigate('/dashboard');
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D7A65B] px-5 py-2.5 text-sm font-semibold text-[#153F32] transition-colors hover:bg-[#E2B670] whitespace-nowrap"
                >
                  <span>Open Farmer Workspace</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingModal('farmer')}
                  className="rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 whitespace-nowrap"
                >
                  Farmer Sign-In Preview
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-7">
              <p className="text-xs font-medium text-[#D7A65B]">
                For Infrastructure &amp; Sensor Manufacturers
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold">
                Showcase hardware and verify telemetry compatibility.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                List vertical racks, dosing systems, or IoT probes in the ecosystem catalog and
                submit REST, MQTT, or gateway integration specs for technical verification.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPartnerSubmitted(false);
                    setOnboardingModal('partner');
                  }}
                  className="rounded-lg border border-white/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#153F32] transition-colors hover:bg-[#E8F0E8] whitespace-nowrap"
                >
                  Register Partner Interest
                </button>
                <Link
                  to="/partners"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 whitespace-nowrap"
                >
                  View Ecosystem Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#DCE3DB] bg-white py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-base font-bold text-[#153F32]">HARVESTIQ</p>
            <p className="mt-1 text-xs text-[#606C65]">
              From Growing to Knowing · Stage 1 Interactive Prototype · Odisha Validation Context
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs font-medium text-[#525E57]">
            <Link to="/dashboard" className="hover:text-[#153F32]">Dashboard</Link>
            <Link to="/zones" className="hover:text-[#153F32]">Racks &amp; Zones</Link>
            <Link to="/batches" className="hover:text-[#153F32]">Crop Batches</Link>
            <Link to="/predictions" className="hover:text-[#153F32]">Predictions</Link>
            <Link to="/partners" className="hover:text-[#153F32]">Partners</Link>
          </div>
        </div>
      </footer>

      {/* Farmer Sign-In Preview Modal */}
      <Modal
        open={onboardingModal === 'farmer'}
        onClose={() => setOnboardingModal(null)}
        title="Farmer Account Entry (Stage 1 Preview)"
        subtitle="Role-based PostgreSQL authentication is scheduled for Stage 2."
      >
        <p className="text-sm text-[#4E5A53]">
          In Stage 1, you can immediately explore the full interactive workspace using the Odisha
          pilot demonstration dataset with browser-local persistence.
        </p>
        <div className="mt-5 rounded-lg border border-[#E2E8E0] bg-[#F7F9F5] p-4 text-xs text-[#4E5A53]">
          <p className="font-semibold text-[#202923]">Demo Operator Profile</p>
          <p className="mt-1">Subham Mohanty · Mahanadi HydroGreens Facility, Cuttack</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setOnboardingModal(null)}
            className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium text-[#202923]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('farmer');
              setOnboardingModal(null);
              navigate('/dashboard');
            }}
            className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
          >
            Continue to Dashboard
          </button>
        </div>
      </Modal>

      {/* Partner Registration Modal */}
      <Modal
        open={onboardingModal === 'partner'}
        onClose={() => setOnboardingModal(null)}
        title="Partner Integration Request (Stage 1 Demo)"
        subtitle="Listing a product and verifying technical compatibility are separate steps."
      >
        {partnerSubmitted ? (
          <div className="py-2">
            <p className="text-sm font-semibold text-[#153F32]">
              Demonstration request recorded locally.
            </p>
            <p className="mt-2 text-sm text-[#525E57]">
              In Stage 2, partner organizations will receive sandbox credentials to submit API/MQTT
              adapter schemas for technical compatibility verification.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOnboardingModal(null);
                  navigate('/partners');
                }}
                className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white"
              >
                Open Partner Catalog
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePartnerSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#202923]">
                Organization Name
              </label>
              <input
                required
                type="text"
                value={partnerForm.company}
                onChange={(e) => setPartnerForm((p) => ({ ...p, company: e.target.value }))}
                placeholder="e.g. Kalinga HydroSystems"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Partner Category</label>
              <select
                value={partnerForm.category}
                onChange={(e) => setPartnerForm((p) => ({ ...p, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                <option value="Sensor & IoT">Sensor &amp; IoT Manufacturer</option>
                <option value="Infrastructure">Infrastructure / Rack Manufacturer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Technical Contact Email</label>
              <input
                required
                type="email"
                value={partnerForm.email}
                onChange={(e) => setPartnerForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="engineering@partner-example.org"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">
                Supported Connectivity / API Notes
              </label>
              <textarea
                rows={3}
                value={partnerForm.notes}
                onChange={(e) => setPartnerForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="REST API, MQTT JSON topics, Modbus TCP registers..."
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOnboardingModal(null)}
                className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium text-[#202923]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
              >
                Submit Demo Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
