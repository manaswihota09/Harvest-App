import React, { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Cpu,
  Grid3X3,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  Sprout,
  TrendingUp,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useHarvestIQ } from '../../context/HarvestIQContext';
import { DEMO_REFERENCE_DATE, formatDateShort } from '../../utils/calculations';
import { resolveAssetUrl } from '../common/UIPrimitives';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    farms,
    selectedFarmId,
    setSelectedFarmId,
    batches,
    zones,
    devices,
    alerts,
    unreadAlertCount,
    markAlertRead,
    activeRole,
  } = useHarvestIQ();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/farms', label: 'Farms', icon: Building2 },
    { to: '/zones', label: 'Racks & Zones', icon: Grid3X3 },
    { to: '/batches', label: 'Crop Batches', icon: Sprout },
    { to: '/predictions', label: 'Harvest Predictions', icon: TrendingUp },
    { to: '/environment', label: 'Environment', icon: Activity },
    { to: '/devices', label: 'Device Registry', icon: Cpu },
    { to: '/partners', label: 'Partner Products', icon: Package },
    { to: '/harvest', label: 'Harvest Management', icon: CalendarCheck },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const quickResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { label: string; meta: string; to: string }[] = [];

    for (const b of batches) {
      if (
        b.batchCode.toLowerCase().includes(q) ||
        b.variety.toLowerCase().includes(q)
      ) {
        results.push({
          label: `Batch ${b.batchCode} · ${b.variety}`,
          meta: 'Crop Batch',
          to: `/batches/${b.id}`,
        });
      }
    }
    for (const z of zones) {
      if (z.name.toLowerCase().includes(q) || z.id.toLowerCase().includes(q)) {
        results.push({
          label: z.name,
          meta: 'Growing Zone',
          to: '/zones',
        });
      }
    }
    for (const d of devices) {
      if (
        d.id.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.sensorType.toLowerCase().includes(q)
      ) {
        results.push({
          label: `${d.id} · ${d.model}`,
          meta: 'Sensor Device',
          to: '/devices',
        });
      }
    }
    return results.slice(0, 6);
  }, [searchQuery, batches, zones, devices]);

  const recentAlerts = useMemo(
    () => alerts.filter((a) => !a.isResolved).slice(0, 4),
    [alerts]
  );

  const roleDisplay =
    activeRole === 'farmer'
      ? 'Farm Operator'
      : activeRole === 'infrastructure_partner'
      ? 'Infrastructure Partner'
      : 'Sensor Partner';

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#153F32] text-white">
      <div>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
          >
            HARVESTIQ
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-0.5 px-3 py-4" aria-label="Primary Sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#287A55] text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span className="ml-2 font-mono text-xs font-semibold tabular-nums text-[#F4D08B]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/70">Stage 1 Frontend Prototype</p>
        <p className="mt-0.5 text-[11px] text-white/55">Odisha Vertical Farm Pilot</p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#D7A65B] hover:underline whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Public Overview</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9F5] text-[#202923] lg:flex">
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{SidebarContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw]">{SidebarContent}</div>
        </div>
      )}

      {/* Main workspace column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#E3E9E2] bg-white px-4 sm:h-16 sm:px-6">
          {/* Left: Mobile toggle + Farm selector + Date */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[#202923] hover:bg-[#F2F5F0] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <label htmlFor="global-farm-select" className="sr-only">
                Active Farm
              </label>
              <select
                id="global-farm-select"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="max-w-[200px] truncate rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-2.5 py-1.5 text-xs font-medium text-[#202923] focus:border-[#153F32] focus:outline-none sm:max-w-[260px] sm:text-sm"
              >
                <option value="ALL">All Pilot Farms ({farms.length})</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <span className="hidden text-xs text-[#78847D] md:inline whitespace-nowrap tabular-nums">
                {formatDateShort(DEMO_REFERENCE_DATE)}
              </span>
            </div>
          </div>

          {/* Right: Quick search + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative hidden md:block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78847D]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches, zones, sensors..."
                aria-label="Quick navigation search"
                className="w-56 rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] py-1.5 pl-8 pr-3 text-xs text-[#202923] placeholder:text-[#78847D] focus:border-[#153F32] focus:bg-white focus:outline-none lg:w-64"
              />
              {searchFocused && quickResults.length > 0 && (
                <div className="absolute right-0 mt-1.5 w-72 rounded-xl border border-[#DCE3DB] bg-white p-1.5 shadow-lg">
                  {quickResults.map((res, idx) => (
                    <button
                      key={`${res.to}-${idx}`}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery('');
                        navigate(res.to);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-[#F2F5F0]"
                    >
                      <span className="font-medium text-[#202923] truncate">{res.label}</span>
                      <span className="ml-2 text-[11px] text-[#78847D] shrink-0">{res.meta}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                aria-label="Open notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E9E2] bg-white text-[#202923] hover:bg-[#F7F9F5]"
              >
                <Bell className="h-4 w-4" />
                {unreadAlertCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C82333] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                    {unreadAlertCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#DCE3DB] bg-white p-3 shadow-lg z-40">
                  <div className="flex items-center justify-between border-b border-[#E8EDE7] pb-2">
                    <span className="font-display text-sm font-semibold text-[#202923]">
                      Active Alerts
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/alerts');
                      }}
                      className="text-xs font-medium text-[#287A55] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {recentAlerts.length === 0 ? (
                      <p className="py-4 text-center text-xs text-[#78847D]">
                        No unresolved alerts.
                      </p>
                    ) : (
                      recentAlerts.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-lg border border-[#E8EDE7] p-2.5 text-xs hover:bg-[#F7F9F5]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-[#202923]">{a.title}</p>
                            {!a.isRead && (
                              <button
                                type="button"
                                onClick={() => markAlertRead(a.id, true)}
                                className="text-[11px] font-medium text-[#287A55] shrink-0 hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-[#606C65]">
                            {a.severity} · {a.zoneId ?? 'Facility'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile link to Settings */}
            <Link
              to="/settings"
              className="flex items-center gap-2.5 rounded-lg border border-[#E3E9E2] bg-white px-2.5 py-1.5 hover:bg-[#F7F9F5]"
              title="Account and Stage 1 settings"
            >
              <img
                src={resolveAssetUrl('/src/assets/images/avatar_farmer_profile_1795755919713.jpg')}
                alt="Subham Mohanty"
                referrerPolicy="no-referrer"
                className="h-6 w-6 rounded-full object-cover"
              />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-none text-[#202923] whitespace-nowrap">
                  Subham Mohanty
                </p>
                <p className="mt-0.5 text-[11px] leading-none text-[#78847D] whitespace-nowrap">
                  {roleDisplay}
                </p>
              </div>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
